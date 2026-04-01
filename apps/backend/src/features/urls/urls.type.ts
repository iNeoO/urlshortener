import type { z } from "zod";
import type {
	GetLastWindowCountsResponseSchema,
	GetUrlsQuerySchema,
	GetUrlsResponseSchema,
	PostUrlJsonSchema,
	PostUrlResponseSchema,
} from "./urls.schema.js";

type GetUrlsResponse = z.infer<typeof GetUrlsResponseSchema>;
type UrlSummary = Omit<GetUrlsResponse["data"][number], "createdAt"> & {
	createdAt: Date;
};

export type GetUrlsResponseApi = {
	data: UrlSummary[];
	total: GetUrlsResponse["total"];
};

export type GetUrlsQuery = z.infer<typeof GetUrlsQuerySchema>;

type GetLastWindowCountsResponse = z.infer<
	typeof GetLastWindowCountsResponseSchema
>;
type LastWindowCount = Omit<
	GetLastWindowCountsResponse["data"][number],
	"windowStart" | "windowEnd"
> & {
	windowStart: Date;
	windowEnd: Date;
};

export type GetLastWindowCountsResponseApi = {
	data: LastWindowCount[];
};

export type PostUrlParams = z.infer<typeof PostUrlJsonSchema>;
type PostUrlResponse = z.infer<typeof PostUrlResponseSchema>;
type CreatedUrl = Omit<PostUrlResponse, "createdAt"> & {
	createdAt: Date;
};

export type PostUrlResponseApi = {
	data: CreatedUrl;
};
