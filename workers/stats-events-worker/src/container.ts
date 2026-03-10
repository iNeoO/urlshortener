import { prisma } from "@urlshortener/db";
import { connectRedis, redis } from "@urlshortener/infra/redis";
import { RedisService, StatsService } from "@urlshortener/services";
import { createUrlClickHandler } from "./services/urlClick.handler.js";

export const createContainer = () => {
	const redisService = new RedisService(redis);
	const statsService = new StatsService(prisma, redisService);
	const handleUrlClickedEvent = createUrlClickHandler({
		redisService,
		statsService,
	});

	return {
		init: async () => {
			await connectRedis();
		},
		shutdown: async () => {
			await redis.quit();
			await prisma.$disconnect();
		},
		handleUrlClickedEvent,
	};
};
