import { z } from "zod";

export const ShortenUrlSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	createdAt: z.iso.datetime(),
});

export const PostShortenUrlJsonSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500),
	original: z.httpUrl(),
});

export const PostShortenUrlResponseSchema = z.object({
	data: ShortenUrlSchema,
});

export const GetShortenUrlParamSchema = z.object({
	id: z.string(),
});
