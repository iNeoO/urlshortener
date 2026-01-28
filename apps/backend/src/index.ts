import { serve } from "@hono/node-server";
import { prisma } from "@urlshortener/db";
import app from "./app.js";
import { setupOpenAPI } from "./libs/openAPI.js";

import { pinoLogger } from "./libs/pino.js";
import { connectRedis, redis } from "./libs/redis.js";

await connectRedis();
setupOpenAPI(app);

const server = serve(
	{
		fetch: app.fetch,
		port: 4000,
	},
	(info) => {
		pinoLogger.info(`Server is running on http://localhost:${info.port}`);
	},
);

const gracefulShutdown = async (signal: string) => {
	pinoLogger.info(`${signal} received. Graceful shutdown initiated.`);
	await new Promise<void>((resolve, reject) => {
		server.close((err) => {
			if (err) {
				reject(err);
			} else {
				pinoLogger.info("HTTP server closed");
				resolve();
			}
		});
	});
	await prisma.$disconnect();
	await redis.quit();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
