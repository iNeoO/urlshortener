export type StatsGranularity = "minute" | "hour" | "day";

export type RangeConfig = {
	granularity: StatsGranularity;
	stepMs: number;
	durationMs: number;
};

export type GetStatsParams = {
	limit: number;
	offset: number;
	order: "asc" | "desc";
	sort: "name" | "createdAt";
	search?: string;
};
