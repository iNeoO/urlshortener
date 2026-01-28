import { client } from "../hc.js";

export type GetCampaignsParams = {
	limit?: number;
	offset?: number;
	order?: "asc" | "desc";
	search?: string;
};

export async function getCampaigns(params: GetCampaignsParams) {
	const res = await client.campaigns.$get({
		query: {
			...(params.limit ? { limit: String(params.limit) } : {}),
			...(params.offset ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw new Error(
			`Failed to fetch campaigns: ${res.status} ${res.statusText}`,
		);
	}
	const json = await res.json();
	return json;
}

export async function getClicksLastHourByMinute() {
	const res = await client.campaigns.clicks["last-hour"].$get();
	if (!res.ok) {
		throw new Error(
			`Failed to fetch clicks last hour by minute: ${res.status} ${res.statusText}`,
		);
	}
	const json = await res.json();
	return json;
}
