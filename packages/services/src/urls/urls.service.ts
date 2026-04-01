import type { PrismaClient } from "@urlshortener/db";
import { URL_CACHE_TTL_SECONDS } from "@urlshortener/infra/redis";
import { STATS_BUCKET_MS } from "../config/clicks.js";
import type { RedisService } from "../redis/redis.service.js";
import type { CreateUrl, GetUrlsQuery } from "./urls.type.js";

export class UrlsService {
	private prisma: PrismaClient;
	private redisService: RedisService;

	constructor(prisma: PrismaClient, redisService: RedisService) {
		this.prisma = prisma;
		this.redisService = redisService;
	}

	async getShortenUrl(short: string) {
		const cached = await this.redisService.getCachedShortUrl(short);
		if (cached) {
			return cached;
		}

		const url = await this.prisma.url.findFirst({
			where: { short, deletedAt: null },
			omit: {
				deletedAt: true,
			},
		});
		if (url) {
			await this.redisService.setCachedShortUrl({
				short,
				original: url.original,
				ttlSeconds: URL_CACHE_TTL_SECONDS,
			});
		}

		return url?.original;
	}

	async createUrl({
		id,
		name,
		description,
		original,
		short,
		groupId,
	}: CreateUrl) {
		const created = await this.prisma.url.create({
			data: {
				id,
				name,
				description,
				original,
				short,
				groupId,
			},
			omit: {
				deletedAt: true,
			},
		});

		await this.redisService.setCachedShortUrl({
			short: created.short,
			original: created.original,
			ttlSeconds: URL_CACHE_TTL_SECONDS,
		});

		return created;
	}

	async getUrlsByGroupIds(
		groupIds: string[],
		{
			limit = 10,
			offset = 0,
			order = "desc",
			sort = "createdAt",
			search,
		}: GetUrlsQuery,
	) {
		const where = {
			deletedAt: null,
			groupId: { in: groupIds },
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
					original: true,
					short: true,
					description: true,
					groupId: true,
					createdAt: true,
					group: {
						select: {
							id: true,
							name: true,
							description: true,
						},
					},
				},
			}),
		]);

		if (urls.length === 0) {
			return { data: [], total };
		}

		const urlIds = urls.map((url) => url.id);
		const grouped = await this.prisma.urlWindowCount.groupBy({
			by: ["urlId"],
			where: { urlId: { in: urlIds } },
			_sum: { count: true },
		});
		const clicksById = new Map(
			grouped.map((row) => [row.urlId, row._sum.count ?? 0]),
		);

		return {
			data: urls.map((url) => ({
				...url,
				totalClicks: clicksById.get(url.id) ?? 0,
			})),
			total,
		};
	}

	async getLastWindowCounts(groupIds: string[]) {
		if (groupIds.length === 0) {
			return [];
		}

		const rows = await this.prisma.urlWindowCount.findMany({
			where: {
				url: {
					deletedAt: null,
					groupId: { in: groupIds },
				},
			},
			orderBy: [{ window: "desc" }, { createdAt: "desc" }],
			take: 10,
			select: {
				urlId: true,
				count: true,
				window: true,
				url: {
					select: {
						short: true,
						original: true,
						group: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});

		return rows.map((row) => ({
			urlId: row.urlId,
			short: row.url.short,
			redirect: row.url.original,
			group: row.url.group,
			count: row.count,
			windowStart: row.window,
			windowEnd: new Date(row.window.getTime() + STATS_BUCKET_MS),
		}));
	}
}
