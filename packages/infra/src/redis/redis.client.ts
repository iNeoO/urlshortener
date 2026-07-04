import { pinoLogger } from "@urlshortener/infra/libs";
import { Redis } from "ioredis";
import { env } from "../configs/env.js";

export type RedisClient = Redis;

export const createRedisClient = (): RedisClient => {
	const client = new Redis({
		host: env.REDIS_URLSHORTENER_HOST,
		port: env.REDIS_URLSHORTENER_PORT,
		...(env.REDIS_URLSHORTENER_USERNAME && {
			username: env.REDIS_URLSHORTENER_USERNAME,
		}),
		...(env.REDIS_URLSHORTENER_PASSWORD && {
			password: env.REDIS_URLSHORTENER_PASSWORD,
		}),
		retryStrategy: (t) => Math.min(200 * t, 2000),
		maxRetriesPerRequest: 1,
	});

	client.on("error", (e) => pinoLogger.error({ err: e }, "[Redis] error"));
	client.on("connect", () => pinoLogger.info("[Redis] connect"));
	client.on("ready", () => pinoLogger.info("[Redis] ready"));
	client.on("reconnecting", () => pinoLogger.warn("[Redis] reconnecting"));

	return client;
};

export const connectRedis = async (client: RedisClient) => {
	if (client.status === "ready") {
		return client;
	}

	const waitForReady = () =>
		new Promise<void>((resolve, reject) => {
			const onReady = () => {
				cleanup();
				resolve();
			};
			const onError = (error: unknown) => {
				cleanup();
				reject(error);
			};
			const cleanup = () => {
				client.off("ready", onReady);
				client.off("error", onError);
			};
			client.once("ready", onReady);
			client.once("error", onError);
		});

	if (client.status === "connecting" || client.status === "connect") {
		await waitForReady();
		return client;
	}

	await client.connect();
	return client;
};
