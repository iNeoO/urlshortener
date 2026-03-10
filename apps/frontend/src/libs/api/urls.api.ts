import type {
	GetUrlsQuerySchema,
	PostUrlJsonSchema,
} from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc.ts";
import { toApiError } from "./apiError.ts";

export type CreateUrlBody = z.infer<typeof PostUrlJsonSchema>;
export type GetUrlsParams = z.input<typeof GetUrlsQuerySchema>;

export async function getUrls(params: GetUrlsParams = {}) {
	const res = await client.urls.$get({
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch urls");
	}
	const json = await res.json();
	return json;
}

export async function getLastWindowCounts() {
	const res = await client.urls["last-window-counts"].$get();
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch last window counts");
	}
	const json = await res.json();
	return json;
}

export async function createUrl(body: CreateUrlBody) {
	const res = await client.urls.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to create url");
	}
	const json = await res.json();
	return json;
}
