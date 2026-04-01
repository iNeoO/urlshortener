const DIRECT_REFERRER = "direct";

import { STATS_BUCKET_TTL_SECONDS } from "@urlshortener/common/constants";
import type { RedisClient } from "@urlshortener/infra/redis";

export const normalizeReferrer = (referrer?: string) => {
	if (!referrer) {
		return DIRECT_REFERRER;
	}

	const value = referrer.trim();
	if (!value) {
		return DIRECT_REFERRER;
	}

	try {
		const url = new URL(value);
		if (!url.hostname) {
			return DIRECT_REFERRER;
		}
		return url.hostname.replace(/^www\./i, "").toLowerCase();
	} catch {
		return DIRECT_REFERRER;
	}
};

export const incrementHash = (
	pipeline: ReturnType<RedisClient["multi"]>,
	key: string,
	field: string,
) => {
	pipeline.hincrby(key, field, 1);
	pipeline.expire(key, STATS_BUCKET_TTL_SECONDS);
};
