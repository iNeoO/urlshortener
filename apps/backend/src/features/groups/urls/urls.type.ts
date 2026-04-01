import type { z } from "zod";
import type {
	GetGroupUrlsQuerySchema,
	GetGroupUrlsResponseSchema,
	PostGroupUrlResponseSchema,
} from "./urls.schema.js";

type PostGroupUrlResponse = z.infer<typeof PostGroupUrlResponseSchema>;
type GroupUrl = Omit<PostGroupUrlResponse["data"], "createdAt"> & {
	createdAt: Date;
};

export type PostGroupUrlResponseApi = { data: GroupUrl };

type GetGroupUrlsResponse = z.infer<typeof GetGroupUrlsResponseSchema>;
type GroupUrlSummary = Omit<
	GetGroupUrlsResponse["data"][number],
	"createdAt"
> & {
	createdAt: Date;
};

export type GetGroupUrlsResponseApi = {
	data: GroupUrlSummary[];
	total: GetGroupUrlsResponse["total"];
};

export type GetGroupUrlsQuery = z.infer<typeof GetGroupUrlsQuerySchema>;
