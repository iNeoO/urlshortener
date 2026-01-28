import { prisma } from "@urlshortener/db";
import { AGGREGATION_INTERVAL_MS } from "../config/index.js";
import { loggerStorage } from "../helpers/asyncLocalStorage.js";
import { pinoLogger } from "../libs/pino.js";
import { connectRedis, redis } from "../libs/redis.js";
import { aggregateClicks } from "./jobs/aggregateClicks.js";

await connectRedis();

const run = async () => {
	await loggerStorage.run(pinoLogger, async () => {
		try {
			await aggregateClicks();
		} catch (err) {
			pinoLogger.error({ err }, "[Worker] aggregateClicks failed");
		}
	});
};

const interval = setInterval(run, AGGREGATION_INTERVAL_MS);
run();

const gracefulShutdown = async (signal: string) => {
	pinoLogger.info(`${signal} received. Worker shutdown initiated.`);
	clearInterval(interval);
	await redis.quit();
	await prisma.$disconnect();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
