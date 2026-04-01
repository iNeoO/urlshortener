import { prisma } from "@urlshortener/db";
import { connectRedis, redis } from "@urlshortener/infra/redis";
import { RedisService, StatsService } from "@urlshortener/services";
import { createAggregateClicksWorker } from "./workers/aggregate-clicks.worker.js";

export const createContainer = () => {
	const redisService = new RedisService(redis);
	const statsService = new StatsService(prisma, redisService);
	const aggregateClicks = createAggregateClicksWorker({ statsService });

	return {
		init: async () => {
			await connectRedis();
		},
		shutdown: async () => {
			await redis.quit();
			await prisma.$disconnect();
		},
		handleAggregateClicks: aggregateClicks,
	};
};
