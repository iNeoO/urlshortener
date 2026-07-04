import { type PrismaClient, prisma } from "@urlshortener/db";
import { env } from "@urlshortener/infra/configs";
import { createRedisClient, type RedisClient } from "@urlshortener/infra/redis";
import { RedisService, UrlsService } from "@urlshortener/services";
import { StatsEventsPublisher } from "@urlshortener/stats-events-worker/publisher";

export type AppServices = {
	prisma: PrismaClient;
	redis: RedisClient;
	urlsService: UrlsService;
	statsPublisher: StatsEventsPublisher;
};

export const createServices = (): AppServices => {
	const redis = createRedisClient();
	const redisService = new RedisService(
		redis,
		env.REDIS_URLSHORTENER_KEY_PREFIX,
	);
	const urlsService = new UrlsService(prisma, redisService);
	const statsPublisher = new StatsEventsPublisher();

	return {
		prisma,
		redis,
		urlsService,
		statsPublisher,
	};
};

export const services = createServices();
