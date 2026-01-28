import { Redis } from "ioredis";
import { pinoLogger } from "./pino.js";

const redisHost = process.env.REDIS_URLSHORTENER_HOST ?? "127.0.0.1";
const redisPort = Number(process.env.REDIS_URLSHORTENER_PORT ?? "6379");
const redisPassword = process.env.REDIS_URLSHORTENER_PASSWORD;

export const redis = new Redis({
  host: redisHost,
  port: redisPort,
  ...(process.env.REDIS_URLSHORTENER_USERNAME && {
    username: process.env.REDIS_URLSHORTENER_USERNAME,
  }),
  ...(redisPassword && { password: redisPassword }),
  retryStrategy: (t) => Math.min(200 * t, 2000),
  maxRetriesPerRequest: 1,
});

redis.on("error", (e) => pinoLogger.error({ err: e }, "[Redis] error"));
redis.on("connect", () => pinoLogger.info("[Redis] connect"));
redis.on("ready", () => pinoLogger.info("[Redis] ready"));
redis.on("reconnecting", () => pinoLogger.warn("[Redis] reconnecting"));

export const connectRedis = async () => {
  if (redis.status === "ready") {
    return redis;
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
        redis.off("ready", onReady);
        redis.off("error", onError);
      };
      redis.once("ready", onReady);
      redis.once("error", onError);
    });

  if (redis.status === "connecting" || redis.status === "connect") {
    await waitForReady();
    return redis;
  }

  await redis.connect();
  return redis;
};
