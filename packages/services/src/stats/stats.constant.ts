import type { StatsRange } from "@urlshortener/common/types";
import type { RangeConfig } from "./stats.type.js";

export const RANGE_CONFIG: Record<StatsRange, RangeConfig> = {
	"1h": {
		granularity: "minute",
		stepMs: 60_000,
		durationMs: 60 * 60_000,
	},
	"24h": {
		granularity: "hour",
		stepMs: 60 * 60_000,
		durationMs: 24 * 60 * 60_000,
	},
	"7d": {
		granularity: "day",
		stepMs: 24 * 60 * 60_000,
		durationMs: 7 * 24 * 60 * 60_000,
	},
	"30d": {
		granularity: "day",
		stepMs: 24 * 60 * 60_000,
		durationMs: 30 * 24 * 60 * 60_000,
	},
};
