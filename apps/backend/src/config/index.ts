export const URL_CACHE_TTL_SECONDS = 600; // 10 minutes

export const CLICK_BUCKET_MS = 60_000; // 1 minute buckets
export const CLICK_BUCKET_TTL_SECONDS = 60 * 60 * 24; // 24 hours
export const AGGREGATION_LAG_MS = 2 * CLICK_BUCKET_MS; // aggregate 2 minutes behind
export const AGGREGATION_INTERVAL_MS = 10_000; // run worker every 10s

export const CLICK_BUCKET_KEY_PREFIX = "url_clicks";
