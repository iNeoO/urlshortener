import {
	GetUrlsQuerySchema,
	PostUrlJsonSchema,
} from "@urlshortener/common/schema";
import { z } from "zod";

export { GetUrlsQuerySchema, PostUrlJsonSchema };

export const UrlSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	groupId: z.string(),
	createdAt: z.iso.datetime(),
	totalClicks: z.number().int().nonnegative(),
});

export const GetUrlsResponseSchema = z.object({
	data: z.array(UrlSchema),
	total: z.number().int().nonnegative(),
});

export const PostUrlResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	groupId: z.string(),
	createdAt: z.iso.datetime(),
});

export const UrlLastWindowCountSchema = z.object({
	urlId: z.string(),
	short: z.string(),
	redirect: z.httpUrl(),
	group: z.object({
		id: z.string(),
		name: z.string(),
	}),
	count: z.number().int().nonnegative(),
	windowStart: z.iso.datetime(),
	windowEnd: z.iso.datetime(),
});

export const GetLastWindowCountsResponseSchema = z.object({
	data: z.array(UrlLastWindowCountSchema),
});
