import { prisma } from "@urlshortener/db";
import { env } from "@urlshortener/infra/configs";
import { connectRedis, createRedisClient } from "@urlshortener/infra/redis";
import { RedisService, StatsService } from "@urlshortener/services";
import { createUrlClickHandler } from "./services/urlClick.handler.js";

export const createContainer = () => {
	const redis = createRedisClient();
	const redisService = new RedisService(
		redis,
		env.REDIS_URLSHORTENER_KEY_PREFIX,
	);
	const statsService = new StatsService(prisma, redisService);
	const handleUrlClickedEvent = createUrlClickHandler({
		redisService,
		statsService,
	});

	return {
		init: async () => {
			await connectRedis(redis);
		},
		shutdown: async () => {
			await redis.quit();
			await prisma.$disconnect();
		},
		handleUrlClickedEvent,
	};
};
