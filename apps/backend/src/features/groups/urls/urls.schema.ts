import {
	GetGroupUrlsQuerySchema,
	GroupUrlSchema,
	PostUrlJsonSchema,
} from "@urlshortener/common/schema";
import { z } from "zod";

export { GetGroupUrlsQuerySchema };

export const PostGroupUrlJsonSchema = PostUrlJsonSchema.omit({
	groupId: true,
});

export const GetGroupUrlsResponseSchema = z.object({
	data: z.array(GroupUrlSchema),
	total: z.number().int().nonnegative(),
});

export const PostGroupUrlResponseSchema = z.object({
	data: GroupUrlSchema,
});
