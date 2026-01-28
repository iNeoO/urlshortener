import {
	AGGREGATION_LAG_MS,
	CLICK_BUCKET_KEY_PREFIX,
	CLICK_BUCKET_MS,
} from "../../config/index.js";
import { createUrlWindowCountsFromShorts } from "../../features/campaigns/campaigns.service.js";
import { getLoggerStore } from "../../helpers/asyncLocalStorage.js";
import { redis } from "../../libs/redis.js";

export const aggregateClicks = async () => {
	const bucket = Math.floor(
		(Date.now() - AGGREGATION_LAG_MS) / CLICK_BUCKET_MS,
	);
	const key = `${CLICK_BUCKET_KEY_PREFIX}:${bucket}`;
	const lockKey = `${key}:lock`;
	const lock = await redis.set(lockKey, "1", "PX", 55_000, "NX");
	if (!lock) {
		return;
	}

	const data = await redis.hgetall(key);
	const entries = Object.entries(data);
	if (entries.length === 0) {
		await redis.del(lockKey);
		return;
	}

	const window = new Date(bucket * CLICK_BUCKET_MS);
	const { created, missing } = await createUrlWindowCountsFromShorts(
		entries,
		window,
	);

	await redis.del(key);
	await redis.del(lockKey);
	const logger = getLoggerStore();
	logger.info(
		{
			key,
			rows: created,
			missing,
			window: window.toISOString(),
		},
		"[Worker] Aggregated clicks",
	);
};
