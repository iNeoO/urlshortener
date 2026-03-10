import type { z } from "zod";
import type {
	GetLastHourClicksResponseSchema,
	GetLastHourStatsByValueResponseSchema,
	GetStatsQuerySchema,
	GetStatsRangeQuerySchema,
	GetStatsResponseSchema,
} from "./stats.schema.js";

export type GetStatsResponseApi = z.infer<typeof GetStatsResponseSchema>;
type Stats = Omit<GetStatsResponseApi["data"][number], "createdAt"> & {
	createdAt: Date;
};
export type StatsResponseApi = { data: Stats[]; total: number };

type GetLastHourClickResponse = z.infer<typeof GetLastHourClicksResponseSchema>;
type LastHourClick = Omit<
	GetLastHourClickResponse["data"][number],
	"window"
> & {
	window: Date;
};
export type LastHourClicksResponseApi = { data: LastHourClick[] };

export type LastHourStatsByValueResponseApi = z.infer<
	typeof GetLastHourStatsByValueResponseSchema
>;

export type GetStatsParams = z.infer<typeof GetStatsQuerySchema>;
export type StatsRange = z.infer<typeof GetStatsRangeQuerySchema>["range"];
