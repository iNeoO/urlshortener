import type { z } from "zod";
import type { STATS_VALUE } from "../constants/stats.constant.js";
import type { GetStatsRangeQuerySchema } from "../schema/index.js";

export type StatsValue = keyof typeof STATS_VALUE;

export type StatsRange = z.infer<typeof GetStatsRangeQuerySchema>["range"];
