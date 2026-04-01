import { describe, expect, it, vi } from "vitest";
import { STATS_BUCKET_MS } from "../config/clicks.js";
import { UrlsService } from "./urls.service.js";

vi.mock("@urlshortener/infra/redis", () => ({
	URL_CACHE_TTL_SECONDS: 600,
}));

const URL_CACHE_TTL_SECONDS = 600;

const mockUrl = {
	id: "url-id",
	name: "Homepage",
	description: "Main website",
	original: "https://example.com",
	short: "abc123",
	groupId: "group-id",
	createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

describe("UrlsService", () => {
	describe("getShortenUrl", () => {
		it("should return cached short url without querying prisma", async () => {
			const prismaMock = {
				url: {
					findFirst: vi.fn(),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedShortUrl: vi
					.fn()
					.mockResolvedValue("https://cached.example.com"),
				setCachedShortUrl: vi.fn(),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getShortenUrl("abc123");

			expect(result).toBe("https://cached.example.com");
			expect(redisServiceMock.getCachedShortUrl).toHaveBeenCalledWith("abc123");
			expect(prismaMock.url.findFirst).not.toHaveBeenCalled();
			expect(redisServiceMock.setCachedShortUrl).not.toHaveBeenCalled();
		});

		it("should query prisma and cache short url when cache is empty", async () => {
			const prismaMock = {
				url: {
					findFirst: vi.fn().mockResolvedValue(mockUrl),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedShortUrl: vi.fn().mockResolvedValue(null),
				setCachedShortUrl: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getShortenUrl("abc123");

			expect(result).toBe("https://example.com");
			expect(prismaMock.url.findFirst).toHaveBeenCalledWith({
				where: {
					short: "abc123",
					deletedAt: null,
				},
				omit: {
					deletedAt: true,
				},
			});
			expect(redisServiceMock.setCachedShortUrl).toHaveBeenCalledWith({
				short: "abc123",
				original: "https://example.com",
				ttlSeconds: URL_CACHE_TTL_SECONDS,
			});
		});

		it("should return undefined when short url does not exist", async () => {
			const prismaMock = {
				url: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedShortUrl: vi.fn().mockResolvedValue(null),
				setCachedShortUrl: vi.fn(),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getShortenUrl("missing");

			expect(result).toBeUndefined();
			expect(redisServiceMock.setCachedShortUrl).not.toHaveBeenCalled();
		});
	});

	describe("createUrl", () => {
		it("should create and cache url", async () => {
			const prismaMock = {
				url: {
					create: vi.fn().mockResolvedValue(mockUrl),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				setCachedShortUrl: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.createUrl({
				id: "url-id",
				name: "Homepage",
				description: "Main website",
				original: "https://example.com",
				short: "abc123",
				groupId: "group-id",
			});

			expect(result).toEqual(mockUrl);
			expect(prismaMock.url.create).toHaveBeenCalledWith({
				data: {
					id: "url-id",
					name: "Homepage",
					description: "Main website",
					original: "https://example.com",
					short: "abc123",
					groupId: "group-id",
				},
				omit: {
					deletedAt: true,
				},
			});
			expect(redisServiceMock.setCachedShortUrl).toHaveBeenCalledWith({
				short: "abc123",
				original: "https://example.com",
				ttlSeconds: URL_CACHE_TTL_SECONDS,
			});
		});
	});

	describe("getUrlsByGroupIds", () => {
		it("should return empty data when no urls are found", async () => {
			const transactionResult = [0, []];
			const prismaMock = {
				url: {
					count: vi.fn().mockReturnValue("count-query"),
					findMany: vi.fn().mockReturnValue("find-many-query"),
				},
				urlWindowCount: {
					groupBy: vi.fn(),
				},
				$transaction: vi.fn().mockResolvedValue(transactionResult),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getUrlsByGroupIds(["group-id"], {
				limit: 10,
				offset: 0,
				order: "desc",
				sort: "createdAt",
			});

			expect(result).toEqual({
				data: [],
				total: 0,
			});
			expect(prismaMock.url.count).toHaveBeenCalledWith({
				where: {
					deletedAt: null,
					groupId: { in: ["group-id"] },
				},
			});
			expect(prismaMock.url.findMany).toHaveBeenCalledWith({
				where: {
					deletedAt: null,
					groupId: { in: ["group-id"] },
				},
				orderBy: { createdAt: "desc" },
				skip: 0,
				take: 10,
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
			});
			expect(prismaMock.urlWindowCount.groupBy).not.toHaveBeenCalled();
		});

		it("should return urls with total clicks", async () => {
			const urls = [
				{
					...mockUrl,
					group: {
						id: "group-id",
						name: "Main Group",
						description: "Main group description",
					},
				},
				{
					...mockUrl,
					id: "url-id-2",
					short: "xyz789",
					group: {
						id: "group-id",
						name: "Main Group",
						description: "Main group description",
					},
				},
			];
			const prismaMock = {
				url: {
					count: vi.fn().mockReturnValue("count-query"),
					findMany: vi.fn().mockReturnValue("find-many-query"),
				},
				urlWindowCount: {
					groupBy: vi.fn().mockResolvedValue([
						{
							urlId: "url-id",
							_sum: {
								count: 12,
							},
						},
					]),
				},
				$transaction: vi.fn().mockResolvedValue([2, urls]),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getUrlsByGroupIds(["group-id"], {
				limit: 20,
				offset: 5,
				order: "asc",
				sort: "name",
				search: "home",
			});

			expect(result).toEqual({
				data: [
					{
						...urls[0],
						totalClicks: 12,
					},
					{
						...urls[1],
						totalClicks: 0,
					},
				],
				total: 2,
			});
			expect(prismaMock.url.count).toHaveBeenCalledWith({
				where: {
					deletedAt: null,
					groupId: { in: ["group-id"] },
					OR: [
						{ name: { contains: "home", mode: "insensitive" } },
						{ description: { contains: "home", mode: "insensitive" } },
					],
				},
			});
			expect(prismaMock.url.findMany).toHaveBeenCalledWith({
				where: {
					deletedAt: null,
					groupId: { in: ["group-id"] },
					OR: [
						{ name: { contains: "home", mode: "insensitive" } },
						{ description: { contains: "home", mode: "insensitive" } },
					],
				},
				orderBy: { name: "asc" },
				skip: 5,
				take: 20,
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
			});
			expect(prismaMock.urlWindowCount.groupBy).toHaveBeenCalledWith({
				by: ["urlId"],
				where: {
					urlId: {
						in: ["url-id", "url-id-2"],
					},
				},
				_sum: {
					count: true,
				},
			});
		});
	});

	describe("getLastWindowCounts", () => {
		it("should return empty array when group ids are empty", async () => {
			const prismaMock = {
				urlWindowCount: {
					findMany: vi.fn(),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getLastWindowCounts([]);

			expect(result).toEqual([]);
			expect(prismaMock.urlWindowCount.findMany).not.toHaveBeenCalled();
		});

		it("should return mapped last window counts", async () => {
			const windowStart = new Date("2024-01-01T10:00:00.000Z");
			const prismaMock = {
				urlWindowCount: {
					findMany: vi.fn().mockResolvedValue([
						{
							urlId: "url-id",
							count: 42,
							window: windowStart,
							url: {
								short: "abc123",
								original: "https://example.com",
								group: {
									id: "group-id",
									name: "Main Group",
								},
							},
						},
					]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const urlsService = new UrlsService(prismaMock, redisServiceMock);

			const result = await urlsService.getLastWindowCounts(["group-id"]);

			expect(result).toEqual([
				{
					urlId: "url-id",
					short: "abc123",
					redirect: "https://example.com",
					group: {
						id: "group-id",
						name: "Main Group",
					},
					count: 42,
					windowStart,
					windowEnd: new Date(windowStart.getTime() + STATS_BUCKET_MS),
				},
			]);
			expect(prismaMock.urlWindowCount.findMany).toHaveBeenCalledWith({
				where: {
					url: {
						deletedAt: null,
						groupId: { in: ["group-id"] },
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
		});
	});
});
