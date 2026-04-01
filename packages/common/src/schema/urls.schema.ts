import { z } from "zod";

export const GET_URLS_SORT_COLUMNS = [
	"createdAt",
	"name",
	"description",
	"original",
	"short",
] as const;

export const PostUrlJsonSchema = z.object({
	groupId: z.string(),
	name: z.string().min(1).max(100),
	description: z.string().max(500),
	original: z.httpUrl(),
});

export const GetUrlsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	offset: z.coerce.number().int().min(0).default(0),
	order: z.enum(["asc", "desc"]).default("desc"),
	sort: z.enum(GET_URLS_SORT_COLUMNS).default("createdAt"),
	search: z.string().trim().min(1).optional(),
});

export const CachedShortUrlSchema = z.string().min(1);
