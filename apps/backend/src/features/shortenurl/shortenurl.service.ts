import { prisma } from "@urlshortener/db";
import {
	CLICK_BUCKET_KEY_PREFIX,
	CLICK_BUCKET_MS,
	CLICK_BUCKET_TTL_SECONDS,
	URL_CACHE_TTL_SECONDS,
} from "../../config/index.js";
import { redis } from "../../libs/redis.js";

export const getShortenUrl = async (short: string) => {
	const cacheKey = `url:${short}`;
	const cached = await redis.get(cacheKey);
	if (cached) {
		return cached;
	}

	const url = await prisma.url.findFirst({
		where: { short, deletedAt: null },
		omit: {
			deletedAt: true,
		},
	});
	if (url) {
		await redis.set(cacheKey, url.original, "EX", URL_CACHE_TTL_SECONDS);
	}
	return url?.original;
};

export const createShortenUrl = async (params: {
	id: string;
	name: string;
	description: string;
	original: string;
	short: string;
}) => {
	const created = await prisma.url.create({
		data: params,
		omit: {
			deletedAt: true,
		},
	});
	await redis.set(
		`url:${created.short}`,
		created.original,
		"EX",
		URL_CACHE_TTL_SECONDS,
	);
	return created;
};

export const incrementShortenUrlClick = async (id: string) => {
	const bucket = Math.floor(Date.now() / CLICK_BUCKET_MS);
	const key = `${CLICK_BUCKET_KEY_PREFIX}:${bucket}`;
	const pipeline = redis.multi();
	pipeline.hincrby(key, id, 1);
	pipeline.expire(key, CLICK_BUCKET_TTL_SECONDS);
	await pipeline.exec();
};
