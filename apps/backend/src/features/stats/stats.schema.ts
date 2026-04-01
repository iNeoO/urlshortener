import { GetStatsRangeQuerySchema } from "@urlshortener/common/schema";
import { z } from "zod";

export { GetStatsRangeQuerySchema };

export const StatsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	createdAt: z.iso.datetime(),
	totalClicks: z.number().int().nonnegative(),
});

export const GetStatsResponseSchema = z.object({
	data: z.array(StatsSchema),
	total: z.number().int().nonnegative(),
});

export const GetStatsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	offset: z.coerce.number().int().min(0).default(0),
	order: z.enum(["asc", "desc"]).default("desc"),
	sort: z.enum(["createdAt", "name"]).default("createdAt"),
	search: z.string().trim().min(1).optional(),
});

export const GetLastHourClicksResponseSchema = z.object({
	data: z.array(
		z.object({
			window: z.iso.datetime(),
			count: z.number().int().nonnegative(),
		}),
	),
});

export const GetLastHourStatsByValueResponseSchema = z.object({
	data: z.array(
		z.object({
			value: z.string(),
			count: z.number().int().nonnegative(),
		}),
	),
});
