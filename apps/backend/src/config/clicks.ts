import {
	AGGREGATION_LAG_MS,
	STATS_BUCKET_MS,
} from "@urlshortener/common/constants";

export { STATS_BUCKET_MS };
export const STATS_BUCKET_TTL_SECONDS = 60 * 60 * 24; // 24 hours
export { AGGREGATION_LAG_MS };
export const AGGREGATION_INTERVAL_MS = 10_000; // run worker every 10s
