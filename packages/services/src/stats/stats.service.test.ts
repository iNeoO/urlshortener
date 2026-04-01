import {
	AGGREGATION_LAG_MS,
	STATS_BUCKET_MS,
	URL_DIMENSION_TYPE,
} from "@urlshortener/common/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loggerInfoMock, loggerWarnMock, loggerErrorMock } = vi.hoisted(() => ({
	loggerInfoMock: vi.fn(),
	loggerWarnMock: vi.fn(),
	loggerErrorMock: vi.fn(),
}));

vi.mock("@urlshortener/infra/libs", () => ({
	getLoggerStore: vi.fn(() => ({
		info: loggerInfoMock,
		warn: loggerWarnMock,
		error: loggerErrorMock,
	})),
}));

import { StatsService } from "./stats.service.js";

describe("StatsService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-01-01T12:34:56.000Z"));
		loggerInfoMock.mockReset();
		loggerWarnMock.mockReset();
		loggerErrorMock.mockReset();
	});

	describe("createUrlWindowCountsFromShorts", () => {
		it("should return zero when entries are empty", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			const prismaMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const statsService = new StatsService(prismaMock, redisServiceMock);

			const result = await statsService.createUrlWindowCountsFromShorts(
				[],
				new Date("2024-01-01T12:00:00.000Z"),
			);

			expect(result).toEqual({ created: 0, missing: 0 });
		});

		it("should create rows for existing shorts and report missing ones", async () => {
			const window = new Date("2024-01-01T12:00:00.000Z");
			const prismaMock = {
				url: {
					findMany: vi.fn().mockResolvedValue([
						{ id: "url-1", short: "abc" },
						{ id: "url-2", short: "def" },
					]),
				},
				urlWindowCount: {
					createMany: vi.fn().mockResolvedValue(undefined),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const statsService = new StatsService(prismaMock, redisServiceMock);

			const result = await statsService.createUrlWindowCountsFromShorts(
				[
					["abc", "2"],
					["missing", "5"],
					["def", "3"],
				],
				window,
			);

			expect(result).toEqual({ created: 2, missing: 1 });
			expect(prismaMock.url.findMany).toHaveBeenCalledWith({
				where: { short: { in: ["abc", "missing", "def"] }, deletedAt: null },
				select: { id: true, short: true },
			});
			expect(prismaMock.urlWindowCount.createMany).toHaveBeenCalledWith({
				data: [
					{ urlId: "url-1", window, count: 2 },
					{ urlId: "url-2", window, count: 3 },
				],
			});
		});
	});

	describe("createUrlDimensionWindowCountsFromShorts", () => {
		it("should create dimension rows and count missing values", async () => {
			const window = new Date("2024-01-01T12:00:00.000Z");
			const prismaMock = {
				url: {
					findMany: vi.fn().mockResolvedValue([{ id: "url-1", short: "abc" }]),
				},
				urlDimensionWindowCount: {
					createMany: vi.fn().mockResolvedValue(undefined),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const statsService = new StatsService(prismaMock, redisServiceMock);

			const result =
				await statsService.createUrlDimensionWindowCountsFromShorts({
					type: URL_DIMENSION_TYPE.BROWSER,
					window,
					rowsByShort: {
						abc: { chrome: "4", firefox: "1" },
						missing: { safari: "2" },
					},
				});

			expect(result).toEqual({ created: 2, missing: 1 });
			expect(
				prismaMock.urlDimensionWindowCount.createMany,
			).toHaveBeenCalledWith({
				data: [
					{
						urlId: "url-1",
						window,
						type: URL_DIMENSION_TYPE.BROWSER,
						value: "chrome",
						count: 4,
					},
					{
						urlId: "url-1",
						window,
						type: URL_DIMENSION_TYPE.BROWSER,
						value: "firefox",
						count: 1,
					},
				],
			});
		});
	});

	describe("getClickCountsByUrlIds", () => {
		it("should return empty map when url ids are empty", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			const prismaMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const statsService = new StatsService(prismaMock, redisServiceMock);

			const result = await statsService.getClickCountsByUrlIds([]);

			expect(result).toEqual(new Map());
		});

		it("should return click counts grouped by url id", async () => {
			const prismaMock = {
				urlWindowCount: {
					groupBy: vi.fn().mockResolvedValue([
						{ urlId: "url-1", _sum: { count: 5 } },
						{ urlId: "url-2", _sum: { count: null } },
					]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const statsService = new StatsService(prismaMock, redisServiceMock);

			const result = await statsService.getClickCountsByUrlIds([
				"url-1",
				"url-2",
			]);

			expect(result).toEqual(
				new Map([
					["url-1", 5],
					["url-2", 0],
				]),
			);
		});
	});

	describe("helpers", () => {
		it("should truncate dates to expected granularity", () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma and Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService({} as any, {} as any);
			const date = new Date("2024-01-01T12:34:56.789Z");

			expect(statsService.truncateToGranularity(date, "minute")).toEqual(
				new Date("2024-01-01T12:34:00.000Z"),
			);
			expect(statsService.truncateToGranularity(date, "hour")).toEqual(
				new Date("2024-01-01T12:00:00.000Z"),
			);
			expect(statsService.truncateToGranularity(date, "day")).toEqual(
				new Date("2024-01-01T00:00:00.000Z"),
			);
		});

		it("should build a window series with missing slots filled with zero", () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma and Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService({} as any, {} as any);
			const since = new Date("2024-01-01T12:00:00.000Z");
			const now = new Date("2024-01-01T12:03:00.000Z");

			const result = statsService.buildWindowSeries(
				since,
				now,
				60_000,
				new Map([[since.getTime() + 60_000, 4]]),
			);

			expect(result).toEqual([
				{ window: new Date("2024-01-01T12:00:00.000Z"), count: 0 },
				{ window: new Date("2024-01-01T12:01:00.000Z"), count: 4 },
				{ window: new Date("2024-01-01T12:02:00.000Z"), count: 0 },
			]);
		});
	});

	describe("getStatsByRange", () => {
		it("should return an empty series when no groups are provided", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma and Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService({} as any, {} as any);

			const result = await statsService.getStatsByRange([], "1h");

			expect(result).toHaveLength(60);
			expect(result.every((entry) => entry.count === 0)).toBe(true);
			expect(result[0]?.window).toEqual(new Date("2024-01-01T11:34:00.000Z"));
		});

		it("should aggregate hour stats for 24h range", async () => {
			const prismaMock = {
				urlHourCount: {
					findMany: vi.fn().mockResolvedValue([
						{ window: new Date("2024-01-01T10:15:00.000Z"), count: 2 },
						{ window: new Date("2024-01-01T10:45:00.000Z"), count: 3 },
					]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService(prismaMock, {} as any);

			const result = await statsService.getStatsByRange(
				["group-id"],
				"24h",
				"url-1",
			);

			expect(prismaMock.urlHourCount.findMany).toHaveBeenCalledWith({
				where: {
					window: {
						gte: new Date("2023-12-31T12:00:00.000Z"),
						lt: new Date("2024-01-01T12:00:00.000Z"),
					},
					url: {
						deletedAt: null,
						groupId: { in: ["group-id"] },
						id: "url-1",
					},
				},
				select: {
					window: true,
					count: true,
				},
			});
			const target = result.find(
				(entry) =>
					entry.window.getTime() ===
					new Date("2024-01-01T10:00:00.000Z").getTime(),
			);
			expect(target).toEqual({
				window: new Date("2024-01-01T10:00:00.000Z"),
				count: 5,
			});
		});
	});

	describe("getStatsByValue", () => {
		it("should return grouped minute stats for the requested dimension", async () => {
			const prismaMock = {
				urlDimensionWindowCount: {
					groupBy: vi.fn().mockResolvedValue([
						{ value: "chrome", _sum: { count: 8 } },
						{ value: "firefox", _sum: { count: null } },
					]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService(prismaMock, {} as any);

			const result = await statsService.getStatsByValue(
				"BROWSER",
				["group-id"],
				"1h",
				"url-1",
			);

			expect(result).toEqual([
				{ value: "chrome", count: 8 },
				{ value: "firefox", count: 0 },
			]);
		});
	});

	describe("getStats", () => {
		it("should return urls enriched with total clicks", async () => {
			const urls = [
				{
					id: "url-1",
					name: "Homepage",
					description: "Main page",
					original: "https://example.com",
					short: "abc",
					createdAt: new Date("2024-01-01T00:00:00.000Z"),
				},
			];
			const prismaMock = {
				url: {
					count: vi.fn().mockReturnValue("count-query"),
					findMany: vi.fn().mockReturnValue("find-many-query"),
				},
				urlWindowCount: {
					groupBy: vi
						.fn()
						.mockResolvedValue([{ urlId: "url-1", _sum: { count: 9 } }]),
				},
				$transaction: vi.fn().mockResolvedValue([1, urls]),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService(prismaMock, {} as any);

			const result = await statsService.getStats(["group-id"], {
				limit: 10,
				offset: 0,
				order: "desc",
				sort: "createdAt",
				search: "home",
			});

			expect(result).toEqual({
				data: [
					{
						...urls[0],
						totalClicks: 9,
					},
				],
				total: 1,
			});
		});
	});

	describe("aggregateClicks", () => {
		it("should stop when bucket lock is not acquired", async () => {
			const redisServiceMock = {
				acquireClickCountLock: vi.fn().mockResolvedValue(false),
				getClickCountEntries: vi.fn(),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: StatsService mock kept intentionally minimal for this unit test
			const statsService = new StatsService({} as any, redisServiceMock);

			await statsService.aggregateClicks();

			const bucket = Math.floor(
				(Date.now() - AGGREGATION_LAG_MS) / STATS_BUCKET_MS,
			).toString();
			expect(redisServiceMock.acquireClickCountLock).toHaveBeenCalledWith(
				bucket,
			);
			expect(redisServiceMock.getClickCountEntries).not.toHaveBeenCalled();
		});

		it("should aggregate clicks and dimensions then clear redis keys", async () => {
			const redisServiceMock = {
				acquireClickCountLock: vi.fn().mockResolvedValue(true),
				getClickCountEntries: vi.fn().mockResolvedValue({ abc: "2", def: "1" }),
				getDimensionHashesForShorts: vi.fn().mockResolvedValue({
					browserHashes: [{ chrome: "2" }, {}],
					osHashes: [{ macos: "2" }, {}],
					deviceHashes: [{ desktop: "2" }, {}],
					referrerHashes: [{ google: "2" }, {}],
				}),
				clearAggregatedClickKeys: vi.fn().mockResolvedValue(undefined),
				releaseClickCountLock: vi.fn(),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: StatsService mock kept intentionally minimal for this unit test
			const statsService = new StatsService({} as any, redisServiceMock);
			const clicksSpy = vi
				.spyOn(statsService, "createUrlWindowCountsFromShorts")
				.mockResolvedValue({ created: 2, missing: 0 });
			const dimensionSpy = vi
				.spyOn(statsService, "createUrlDimensionWindowCountsFromShorts")
				.mockResolvedValue({ created: 1, missing: 0 });

			await statsService.aggregateClicks();

			const bucket = Math.floor(
				(Date.now() - AGGREGATION_LAG_MS) / STATS_BUCKET_MS,
			).toString();
			const window = new Date(Number(bucket) * STATS_BUCKET_MS);
			expect(clicksSpy).toHaveBeenCalledWith(
				[
					["abc", "2"],
					["def", "1"],
				],
				window,
			);
			expect(dimensionSpy).toHaveBeenCalledTimes(4);
			expect(redisServiceMock.clearAggregatedClickKeys).toHaveBeenCalledWith(
				bucket,
				["abc", "def"],
			);
			expect(loggerInfoMock).toHaveBeenCalled();
		});
	});

	describe("ingestLateClickEvent", () => {
		it("should return missing_url when short does not exist", async () => {
			const prismaMock = {
				url: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const statsService = new StatsService(prismaMock, {} as any);

			const result = await statsService.ingestLateClickEvent({
				type: "stats.url-clicked",
				short: "missing",
				browserDimension: "Chrome",
				osDimension: "macOS",
				deviceDimension: "Desktop",
				referrer: "https://www.google.com/search?q=test",
				occurredAt: Date.now() - 1_000,
			});

			expect(result).toEqual({ status: "missing_url" });
			expect(loggerWarnMock).toHaveBeenCalled();
		});

		it("should upsert click and dimension counts for a late event", async () => {
			const occurredAt = new Date("2024-01-01T12:31:12.000Z").getTime();
			const upsertClickMock = vi.fn().mockResolvedValue(undefined);
			const upsertDimensionMock = vi.fn().mockResolvedValue(undefined);
			const txMock = {
				urlWindowCount: {
					upsert: upsertClickMock,
				},
				urlDimensionWindowCount: {
					upsert: upsertDimensionMock,
				},
			};
			const prismaMock = {
				url: {
					findFirst: vi.fn().mockResolvedValue({ id: "url-1" }),
				},
				$transaction: vi
					.fn()
					.mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: StatsService mock kept intentionally minimal for this unit test
			const statsService = new StatsService(prismaMock, {} as any);

			const result = await statsService.ingestLateClickEvent({
				type: "stats.url-clicked",
				short: "abc",
				browserDimension: "Chrome",
				osDimension: "macOS",
				deviceDimension: "Desktop",
				referrer: "https://www.google.com/search?q=test",
				occurredAt,
			});

			const window = new Date(
				Math.floor(occurredAt / STATS_BUCKET_MS) * STATS_BUCKET_MS,
			);
			expect(result).toEqual({ status: "ingested" });
			expect(upsertClickMock).toHaveBeenCalledWith({
				where: {
					urlId_window: {
						urlId: "url-1",
						window,
					},
				},
				update: { count: { increment: 1 } },
				create: { urlId: "url-1", window, count: 1 },
			});
			expect(upsertDimensionMock).toHaveBeenCalledTimes(4);
			expect(upsertDimensionMock).toHaveBeenCalledWith({
				where: {
					urlId_window_type_value: {
						urlId: "url-1",
						window,
						type: URL_DIMENSION_TYPE.REFERRER,
						value: "google.com",
					},
				},
				update: { count: { increment: 1 } },
				create: {
					urlId: "url-1",
					window,
					type: URL_DIMENSION_TYPE.REFERRER,
					value: "google.com",
					count: 1,
				},
			});
			expect(loggerInfoMock).toHaveBeenCalled();
		});
	});
});
