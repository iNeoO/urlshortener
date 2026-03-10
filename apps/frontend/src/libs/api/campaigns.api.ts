import { client } from "../hc.js";
import { toApiError } from "./apiError.ts";

export type GetCampaignsParams = {
	limit?: number;
	offset?: number;
	order?: "asc" | "desc";
	search?: string;
};

export type ClicksLastHourPoint = {
	window: string;
	count: number;
};

export type ClicksLastHourResponse = {
	data: ClicksLastHourPoint[];
};

export async function getCampaigns(params: GetCampaignsParams) {
	const res = await client.stats.$get({
		query: {
			...(params.limit ? { limit: String(params.limit) } : {}),
			...(params.offset ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch campaigns");
	}
	const json = await res.json();
	return json;
}
