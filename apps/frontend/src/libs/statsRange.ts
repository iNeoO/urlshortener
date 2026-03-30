import type { StatsRange } from "./api/stats.api";

export const STATS_RANGE_OPTIONS: Array<{
	label: string;
	value: StatsRange;
}> = [
	{ label: "Last 1h", value: "1h" },
	{ label: "Last 24h", value: "24h" },
	{ label: "Last 7d", value: "7d" },
	{ label: "Last 30d", value: "30d" },
];

export const formatStatsRangeLabel = (range: StatsRange) => {
	switch (range) {
		case "1h":
			return "last 60 minutes";
		case "24h":
			return "last 24 hours";
		case "7d":
			return "last 7 days";
		case "30d":
			return "last 30 days";
	}
};
