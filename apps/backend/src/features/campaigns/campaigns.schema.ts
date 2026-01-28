import { z } from "zod";

export const CampaignSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	createdAt: z.iso.datetime(),
	totalClicks: z.number().int().nonnegative(),
});

export const GetCampaignsResponseSchema = z.object({
	data: z.array(CampaignSchema),
	total: z.number().int().nonnegative(),
});

export const GetCampaignsQuerySchema = z.object({
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
