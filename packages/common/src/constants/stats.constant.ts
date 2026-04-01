export const STATS_VALUE = {
	CLICK: "CLICK",
	REFERRER: "REFERRER",
	BROWSER: "BROWSER",
	OS: "OS",
	DEVICE: "DEVICE",
} as const;

export const STATS_BUCKET_MS = 60_000; // 1 minute buckets
export const LATE_CLICK_EVENT_THRESHOLD_MS = 3 * STATS_BUCKET_MS; // older than 3 minutes => direct DB ingestion
export const AGGREGATION_LAG_MS = 2 * STATS_BUCKET_MS; // aggregate 2 minutes behind
export const STATS_BUCKET_TTL_SECONDS = 60 * 60 * 24; // 24 hours
