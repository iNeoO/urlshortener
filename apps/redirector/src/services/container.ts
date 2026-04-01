import { type PrismaClient, prisma } from "@urlshortener/db";
import { type RedisClient, redis } from "@urlshortener/infra/redis";
import { RedisService, UrlsService } from "@urlshortener/services";
import { StatsEventsPublisher } from "@urlshortener/stats-events-worker/publisher";

export type AppServices = {
	prisma: PrismaClient;
	redis: RedisClient;
	urlsService: UrlsService;
	statsPublisher: StatsEventsPublisher;
};

export const createServices = (): AppServices => {
	const redisService = new RedisService(redis);
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
