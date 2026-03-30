import {
	AGGREGATION_LAG_MS,
	LATE_CLICK_EVENT_THRESHOLD_MS,
	STATS_BUCKET_MS,
	URL_DIMENSION_TYPE,
} from "@urlshortener/common/constants";
import type {
	StatsRange,
	StatsValue,
	UrlClickMessage,
	UrlDimensionType,
} from "@urlshortener/common/types";
import { Prisma, type PrismaClient } from "@urlshortener/db";
import { getLoggerStore } from "@urlshortener/infra/libs";
import type { RedisService } from "../redis/redis.service.js";
import { RANGE_CONFIG } from "./stats.constant.js";
import type { GetStatsParams, StatsGranularity } from "./stats.type.js";
import { toDayWindow, toHourWindow, toMinuteWindow } from "./stats.util.js";
export class StatsService {
	private prisma: PrismaClient;
	private redisService: RedisService;

	constructor(prisma: PrismaClient, redisService: RedisService) {
		this.prisma = prisma;
		this.redisService = redisService;
	}

	async createUrlWindowCountsFromShorts(
		entries: Array<[string, string]>,
		window: Date,
	) {
		if (entries.length === 0) {
			return { created: 0, missing: 0 };
		}

		const shorts = entries.map(([short]) => short);
		const urls = await this.prisma.url.findMany({
			where: { short: { in: shorts }, deletedAt: null },
			select: { id: true, short: true },
		});

		const idByShort = new Map(urls.map((url) => [url.short, url.id]));

		const rows = entries.flatMap(([short, count]) => {
			const urlId = idByShort.get(short);
			if (!urlId) {
				return [];
			}
			return [{ urlId, window, count: Number(count) }];
		});

		if (rows.length > 0) {
			try {
				await this.prisma.urlWindowCount.createMany({ data: rows });
			} catch (err) {
				const logger = getLoggerStore();
				if (err instanceof Prisma.PrismaClientValidationError) {
					logger.warn(
						{ err, window: window.toISOString(), rows: rows.length },
						"Duplicate (urlId, window) detected. Skipping duplicates.",
					);
					await this.prisma.urlWindowCount.createMany({
						data: rows,
						skipDuplicates: true,
					});
				} else {
					logger.error({ err }, "Failed to create url window counts");
					throw err;
				}
			}
		}

		return { created: rows.length, missing: entries.length - rows.length };
	}

	async createUrlDimensionWindowCountsFromShorts(params: {
		type: UrlDimensionType;
		window: Date;
		rowsByShort: Record<string, Record<string, string>>;
	}) {
		const shorts = Object.keys(params.rowsByShort);
		if (shorts.length === 0) {
			return { created: 0, missing: 0 };
		}

		const urls = await this.prisma.url.findMany({
			where: { short: { in: shorts }, deletedAt: null },
			select: { id: true, short: true },
		});
		const idByShort = new Map(urls.map((url) => [url.short, url.id]));

		const rows: Array<{
			urlId: string;
			window: Date;
			type: UrlDimensionType;
			value: string;
			count: number;
		}> = [];
		let missing = 0;

		for (const [short, valuesByDimension] of Object.entries(
			params.rowsByShort,
		)) {
			const urlId = idByShort.get(short);
			if (!urlId) {
				missing += Object.keys(valuesByDimension).length;
				continue;
			}

			for (const [value, count] of Object.entries(valuesByDimension)) {
				rows.push({
					urlId,
					window: params.window,
					type: params.type,
					value,
					count: Number(count),
				});
			}
		}
		if (rows.length > 0) {
			try {
				await this.prisma.urlDimensionWindowCount.createMany({ data: rows });
			} catch (err) {
				const logger = getLoggerStore();
				if (err instanceof Prisma.PrismaClientValidationError) {
					logger.warn(
						{ err, window: params.window.toISOString(), rows: rows.length },
						"Duplicate (urlId, window, type, value) detected. Skipping duplicates.",
					);
					await this.prisma.urlDimensionWindowCount.createMany({
						data: rows,
						skipDuplicates: true,
					});
				} else {
					logger.error({ err }, "Failed to create url dimension window counts");
					throw err;
				}
			}
		}

		return { created: rows.length, missing };
	}

	async getClickCountsByUrlIds(urlIds: string[]) {
		if (urlIds.length === 0) {
			return new Map<string, number>();
		}
		const grouped = await this.prisma.urlWindowCount.groupBy({
			by: ["urlId"],
			where: { urlId: { in: urlIds } },
			_sum: { count: true },
		});
		return new Map(grouped.map((row) => [row.urlId, row._sum.count ?? 0]));
	}

	getRangeConfig(range: StatsRange) {
		return RANGE_CONFIG[range];
	}

	truncateToGranularity(date: Date, granularity: StatsGranularity) {
		if (granularity === "minute") {
			return toMinuteWindow(date);
		}
		if (granularity === "hour") {
			return toHourWindow(date);
		}
		return toDayWindow(date);
	}

	private getLatestClosedHourWindow(now = new Date()) {
		return new Date(toHourWindow(now).getTime() - 60 * 60 * 1000);
	}

	private getLatestClosedDayWindow(now = new Date()) {
		return new Date(toDayWindow(now).getTime() - 24 * 60 * 60 * 1000);
	}

	private buildWindowRange(start: Date, end: Date, stepMs: number) {
		const windows: Date[] = [];
		for (
			let current = start.getTime();
			current <= end.getTime();
			current += stepMs
		) {
			windows.push(new Date(current));
		}
		return windows;
	}

	private async getNextHourlyWindow() {
		const latest = await this.prisma.urlHourCount.findFirst({
			orderBy: { window: "desc" },
			select: { window: true },
		});
		if (latest) {
			return new Date(latest.window.getTime() + 60 * 60 * 1000);
		}

		const earliestMinute = await this.prisma.urlWindowCount.findFirst({
			orderBy: { window: "asc" },
			select: { window: true },
		});
		return earliestMinute ? toHourWindow(earliestMinute.window) : null;
	}

	private async getNextDailyWindow() {
		const latest = await this.prisma.urlDayCount.findFirst({
			orderBy: { window: "desc" },
			select: { window: true },
		});
		if (latest) {
			return new Date(latest.window.getTime() + 24 * 60 * 60 * 1000);
		}

		const earliestHour = await this.prisma.urlHourCount.findFirst({
			orderBy: { window: "asc" },
			select: { window: true },
		});
		return earliestHour ? toDayWindow(earliestHour.window) : null;
	}

	private async aggregateClickWindows(params: {
		start: Date;
		end: Date;
		stepMs: number;
		source: "minute" | "hour";
		target: "hour" | "day";
	}) {
		const windows = this.buildWindowRange(
			params.start,
			params.end,
			params.stepMs,
		);
		let created = 0;

		for (const window of windows) {
			const nextWindow = new Date(window.getTime() + params.stepMs);
			const grouped =
				params.source === "minute"
					? await this.prisma.urlWindowCount.groupBy({
							by: ["urlId"],
							where: { window: { gte: window, lt: nextWindow } },
							_sum: { count: true },
						})
					: await this.prisma.urlHourCount.groupBy({
							by: ["urlId"],
							where: { window: { gte: window, lt: nextWindow } },
							_sum: { count: true },
						});

			if (grouped.length === 0) {
				continue;
			}

			const rows = grouped.map(
				(row: { urlId: string; _sum: { count: number | null } }) => ({
					urlId: row.urlId,
					window,
					count: row._sum.count ?? 0,
				}),
			);

			if (params.target === "hour") {
				await this.prisma.urlHourCount.createMany({
					data: rows,
					skipDuplicates: true,
				});
			} else {
				await this.prisma.urlDayCount.createMany({
					data: rows,
					skipDuplicates: true,
				});
			}

			created += rows.length;
		}

		return { windows: windows.length, created };
	}

	private async aggregateDimensionWindows(params: {
		start: Date;
		end: Date;
		stepMs: number;
		source: "minute" | "hour";
		target: "hour" | "day";
	}) {
		const windows = this.buildWindowRange(
			params.start,
			params.end,
			params.stepMs,
		);
		let created = 0;

		for (const window of windows) {
			const nextWindow = new Date(window.getTime() + params.stepMs);
			const grouped =
				params.source === "minute"
					? await this.prisma.urlDimensionWindowCount.groupBy({
							by: ["urlId", "type", "value"],
							where: { window: { gte: window, lt: nextWindow } },
							_sum: { count: true },
						})
					: await this.prisma.urlDimensionHourCount.groupBy({
							by: ["urlId", "type", "value"],
							where: { window: { gte: window, lt: nextWindow } },
							_sum: { count: true },
						});

			if (grouped.length === 0) {
				continue;
			}

			const rows = grouped.map(
				(row: {
					urlId: string;
					type: string;
					value: string;
					_sum: { count: number | null };
				}) => ({
					urlId: row.urlId,
					window,
					type: row.type,
					value: row.value,
					count: row._sum.count ?? 0,
				}),
			);

			if (params.target === "hour") {
				await this.prisma.urlDimensionHourCount.createMany({
					data: rows,
					skipDuplicates: true,
				});
			} else {
				await this.prisma.urlDimensionDayCount.createMany({
					data: rows,
					skipDuplicates: true,
				});
			}

			created += rows.length;
		}

		return { windows: windows.length, created };
	}

	buildWindowSeries(
		since: Date,
		now: Date,
		stepMs: number,
		countsByWindow: Map<number, number>,
	) {
		const slots = Math.max(
			0,
			Math.round((now.getTime() - since.getTime()) / stepMs),
		);
		return Array.from({ length: slots }, (_, index) => {
			const window = new Date(since.getTime() + index * stepMs);
			const count = countsByWindow.get(window.getTime()) ?? 0;
			return { window, count };
		});
	}

	private async getMinuteStatsByValueGrouped(where: {
		window: { gte: Date; lt: Date };
		type: UrlDimensionType;
		url: {
			deletedAt: null;
			groupId: { in: string[] };
			id?: string;
		};
	}) {
		const grouped = await this.prisma.urlDimensionWindowCount.groupBy({
			by: ["value"],
			where,
			_sum: { count: true },
			orderBy: {
				_sum: {
					count: "desc",
				},
			},
		});

		return grouped.map((row) => ({
			value: row.value,
			count: row._sum.count ?? 0,
		}));
	}

	private async getHourStatsByValueGrouped(where: {
		window: { gte: Date; lt: Date };
		type: UrlDimensionType;
		url: {
			deletedAt: null;
			groupId: { in: string[] };
			id?: string;
		};
	}) {
		const grouped = await this.prisma.urlDimensionHourCount.groupBy({
			by: ["value"],
			where,
			_sum: { count: true },
			orderBy: {
				_sum: {
					count: "desc",
				},
			},
		});

		return grouped.map((row) => ({
			value: row.value,
			count: row._sum.count ?? 0,
		}));
	}

	private async getDayStatsByValueGrouped(where: {
		window: { gte: Date; lt: Date };
		type: UrlDimensionType;
		url: {
			deletedAt: null;
			groupId: { in: string[] };
			id?: string;
		};
	}) {
		const grouped = await this.prisma.urlDimensionDayCount.groupBy({
			by: ["value"],
			where,
			_sum: { count: true },
			orderBy: {
				_sum: {
					count: "desc",
				},
			},
		});

		return grouped.map((row) => ({
			value: row.value,
			count: row._sum.count ?? 0,
		}));
	}

	async getStatsByRange(groups: string[], range: StatsRange, urlId?: string) {
		const { granularity, stepMs, durationMs } = this.getRangeConfig(range);
		const now = this.truncateToGranularity(new Date(), granularity);
		const since = new Date(now.getTime() - durationMs);
		if (groups.length === 0) {
			return this.buildWindowSeries(since, now, stepMs, new Map());
		}

		const where = {
			window: { gte: since, lt: now },
			url: {
				deletedAt: null,
				groupId: { in: groups },
				...(urlId ? { id: urlId } : {}),
			},
		};

		let rows: Array<{ window: Date; count: number }>;
		switch (range) {
			case "1h":
				rows = await this.prisma.urlWindowCount.findMany({
					where,
					select: {
						window: true,
						count: true,
					},
				});
				break;
			case "24h":
				rows = await this.prisma.urlHourCount.findMany({
					where,
					select: {
						window: true,
						count: true,
					},
				});
				break;
			case "7d":
			case "30d":
				rows = await this.prisma.urlDayCount.findMany({
					where,
					select: {
						window: true,
						count: true,
					},
				});
				break;
		}

		const countsByWindow = new Map<number, number>();
		for (const row of rows) {
			const bucket = this.truncateToGranularity(
				row.window,
				granularity,
			).getTime();
			countsByWindow.set(bucket, (countsByWindow.get(bucket) ?? 0) + row.count);
		}

		return this.buildWindowSeries(since, now, stepMs, countsByWindow);
	}

	async getStatsByValue(
		event: Exclude<StatsValue, "CLICK">,
		groups: string[],
		range: StatsRange,
		urlId?: string,
	) {
		const { granularity, durationMs } = this.getRangeConfig(range);
		const now = this.truncateToGranularity(new Date(), granularity);
		const since = new Date(now.getTime() - durationMs);
		if (groups.length === 0) {
			return [];
		}

		const dimensionTypeByEvent: Record<
			Exclude<StatsValue, "CLICK">,
			UrlDimensionType
		> = {
			BROWSER: URL_DIMENSION_TYPE.BROWSER,
			OS: URL_DIMENSION_TYPE.OS,
			DEVICE: URL_DIMENSION_TYPE.DEVICE,
			REFERRER: URL_DIMENSION_TYPE.REFERRER,
		};
		const type = dimensionTypeByEvent[event];

		const where = {
			window: { gte: since, lt: now },
			type,
			url: {
				deletedAt: null,
				groupId: { in: groups },
				...(urlId ? { id: urlId } : {}),
			},
		};
		switch (range) {
			case "1h":
				return await this.getMinuteStatsByValueGrouped(where);
			case "24h":
				return await this.getHourStatsByValueGrouped(where);
			case "7d":
			case "30d":
				return await this.getDayStatsByValueGrouped(where);
		}
	}

	async getStats(
		groups: string[],
		{
			limit = 10,
			offset = 0,
			order = "desc",
			sort = "createdAt",
			search,
		}: GetStatsParams,
	) {
		const where = {
			deletedAt: null,
			url: { groups: { hasSome: groups } },
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{
								description: { contains: search, mode: "insensitive" as const },
							},
						],
					}
				: {}),
		};

		const [total, urls] = await this.prisma.$transaction([
			this.prisma.url.count({ where }),
			this.prisma.url.findMany({
				where,
				orderBy: { [sort]: order },
				skip: offset,
				take: limit,
				select: {
					id: true,
					name: true,
					description: true,
					original: true,
					short: true,
					createdAt: true,
				},
			}),
		]);

		if (urls.length === 0) {
			return { data: [], total };
		}

		const urlIds = urls.map((url) => url.id);
		const clicksById = await this.getClickCountsByUrlIds(urlIds);

		const data = urls.map((url) => ({
			...url,
			totalClicks: clicksById.get(url.id) ?? 0,
		}));

		return { data, total };
	}

	async aggregateClicks() {
		const bucket = Math.floor(
			(Date.now() - AGGREGATION_LAG_MS) / STATS_BUCKET_MS,
		);
		const bucketKey = bucket.toString();
		const lock = await this.redisService.acquireClickCountLock(bucketKey);
		if (!lock) {
			return;
		}

		const data = await this.redisService.getClickCountEntries(bucketKey);

		const entries = Object.entries(data);
		if (entries.length === 0) {
			await this.redisService.releaseClickCountLock(bucketKey);
			return;
		}

		const shorts = entries.map(([short]) => short);
		const { browserHashes, osHashes, deviceHashes, referrerHashes } =
			await this.redisService.getDimensionHashesForShorts(shorts, bucketKey);

		const rowsByShortFromHashes = (
			values: Array<Record<string, string>>,
		): Record<string, Record<string, string>> => {
			const rows: Record<string, Record<string, string>> = {};
			for (let index = 0; index < shorts.length; index += 1) {
				if (Object.keys(values[index]).length === 0) {
					continue;
				}
				rows[shorts[index]] = values[index];
			}
			return rows;
		};

		const browserRowsByShort = rowsByShortFromHashes(browserHashes);
		const osRowsByShort = rowsByShortFromHashes(osHashes);
		const deviceRowsByShort = rowsByShortFromHashes(deviceHashes);
		const referrerRowsByShort = rowsByShortFromHashes(referrerHashes);
		const window = new Date(bucket * STATS_BUCKET_MS);

		const clicksResult = await this.createUrlWindowCountsFromShorts(
			entries,
			window,
		);

		const browserResult = await this.createUrlDimensionWindowCountsFromShorts({
			type: URL_DIMENSION_TYPE.BROWSER,
			window,
			rowsByShort: browserRowsByShort,
		});
		const osResult = await this.createUrlDimensionWindowCountsFromShorts({
			type: URL_DIMENSION_TYPE.OS,
			window,
			rowsByShort: osRowsByShort,
		});
		const deviceResult = await this.createUrlDimensionWindowCountsFromShorts({
			type: URL_DIMENSION_TYPE.DEVICE,
			window,
			rowsByShort: deviceRowsByShort,
		});
		const referrerResult = await this.createUrlDimensionWindowCountsFromShorts({
			type: URL_DIMENSION_TYPE.REFERRER,
			window,
			rowsByShort: referrerRowsByShort,
		});

		await this.redisService.clearAggregatedClickKeys(bucketKey, shorts);

		const logger = getLoggerStore();
		logger.info(
			{
				bucket: bucketKey,
				clicks: clicksResult,
				browser: browserResult,
				os: osResult,
				device: deviceResult,
				referrer: referrerResult,
				window: window.toISOString(),
			},
			"Aggregated click stats",
		);
	}

	async aggregateHourlyClicks() {
		const start = await this.getNextHourlyWindow();
		if (!start) {
			return;
		}

		const end = this.getLatestClosedHourWindow();
		if (start.getTime() > end.getTime()) {
			return;
		}

		const clicks = await this.aggregateClickWindows({
			start,
			end,
			stepMs: 60 * 60 * 1000,
			source: "minute",
			target: "hour",
		});
		const dimensions = await this.aggregateDimensionWindows({
			start,
			end,
			stepMs: 60 * 60 * 1000,
			source: "minute",
			target: "hour",
		});

		const logger = getLoggerStore();
		logger.info(
			{
				start: start.toISOString(),
				end: end.toISOString(),
				clicks,
				dimensions,
			},
			"Aggregated hourly click stats",
		);
	}

	async aggregateDailyClicks() {
		const start = await this.getNextDailyWindow();
		if (!start) {
			return;
		}

		const end = this.getLatestClosedDayWindow();
		if (start.getTime() > end.getTime()) {
			return;
		}

		const clicks = await this.aggregateClickWindows({
			start,
			end,
			stepMs: 24 * 60 * 60 * 1000,
			source: "hour",
			target: "day",
		});
		const dimensions = await this.aggregateDimensionWindows({
			start,
			end,
			stepMs: 24 * 60 * 60 * 1000,
			source: "hour",
			target: "day",
		});

		const logger = getLoggerStore();
		logger.info(
			{
				start: start.toISOString(),
				end: end.toISOString(),
				clicks,
				dimensions,
			},
			"Aggregated daily click stats",
		);
	}

	private normalizeReferrer(referrer?: string) {
		const directReferrer = "direct";
		if (!referrer) {
			return directReferrer;
		}

		const value = referrer.trim();
		if (!value) {
			return directReferrer;
		}

		try {
			const url = new URL(value);
			if (!url.hostname) {
				return directReferrer;
			}
			return url.hostname.replace(/^www\./i, "").toLowerCase();
		} catch {
			return directReferrer;
		}
	}

	async ingestLateClickEvent(message: UrlClickMessage) {
		const occurredAt = message.occurredAt ?? Date.now();
		const ageMs = Date.now() - occurredAt;
		const bucket = Math.floor(occurredAt / STATS_BUCKET_MS);
		const window = new Date(bucket * STATS_BUCKET_MS);

		const url = await this.prisma.url.findFirst({
			where: { short: message.short, deletedAt: null },
			select: { id: true },
		});
		if (!url) {
			const logger = getLoggerStore();
			logger.warn(
				{ short: message.short, occurredAt, ageMs },
				"Late click ignored because URL was not found",
			);
			return { status: "missing_url" as const };
		}

		const referrerValue = this.normalizeReferrer(message.referrer);
		await this.prisma.$transaction(async (tx) => {
			await tx.urlWindowCount.upsert({
				where: {
					urlId_window: {
						urlId: url.id,
						window,
					},
				},
				update: { count: { increment: 1 } },
				create: { urlId: url.id, window, count: 1 },
			});

			const dimensions: Array<{ type: string; value: string }> = [
				{ type: URL_DIMENSION_TYPE.BROWSER, value: message.browserDimension },
				{ type: URL_DIMENSION_TYPE.OS, value: message.osDimension },
				{ type: URL_DIMENSION_TYPE.DEVICE, value: message.deviceDimension },
				{ type: URL_DIMENSION_TYPE.REFERRER, value: referrerValue },
			];

			await Promise.all(
				dimensions.map((dimension) =>
					tx.urlDimensionWindowCount.upsert({
						where: {
							urlId_window_type_value: {
								urlId: url.id,
								window,
								type: dimension.type,
								value: dimension.value,
							},
						},
						update: { count: { increment: 1 } },
						create: {
							urlId: url.id,
							window,
							type: dimension.type,
							value: dimension.value,
							count: 1,
						},
					}),
				),
			);
		});

		const logger = getLoggerStore();
		logger.info(
			{
				short: message.short,
				window: window.toISOString(),
				ageMs,
				thresholdMs: LATE_CLICK_EVENT_THRESHOLD_MS,
			},
			"Late click event ingested directly into database",
		);

		return { status: "ingested" as const };
	}
}
