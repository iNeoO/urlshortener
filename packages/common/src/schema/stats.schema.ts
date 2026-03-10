import { z } from "zod";

export const GetStatsRangeQuerySchema = z.object({
	range: z.enum(["1h", "24h", "7d", "30d"]).default("1h"),
	urlId: z.string().optional(),
});
