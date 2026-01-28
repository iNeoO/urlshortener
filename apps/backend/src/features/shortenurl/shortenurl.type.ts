import type { z } from "zod";
import type { PostShortenUrlResponseSchema } from "./shortenurl.schema.js";

type PostShortenUrlResponse = z.infer<typeof PostShortenUrlResponseSchema>;
type ShortenUrl = Omit<PostShortenUrlResponse["data"], "createdAt"> & {
	createdAt: Date;
};
export type ShortenUrlResponseApi = { data: ShortenUrl };
