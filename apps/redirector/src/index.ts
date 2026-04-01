import { serve } from "@hono/node-server";
import { pinoLogger } from "@urlshortener/infra/libs";
import { connectRedis } from "@urlshortener/infra/redis";
import { createApp, createServices } from "./app.js";
import { setupOpenAPI } from "./libs/openAPI.js";

const services = createServices();
const app = createApp(services);

await connectRedis();
setupOpenAPI(app);

const server = serve(
	{
		fetch: app.fetch,
		port: 4001,
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
	await services.statsPublisher.close();
	await services.prisma.$disconnect();
	await services.redis.quit();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
