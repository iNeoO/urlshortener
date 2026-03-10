import type { GetStatsRangeQuerySchema } from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc";
import { toApiError } from "./apiError.ts";

export type StatsRange = z.input<typeof GetStatsRangeQuerySchema>["range"];
export type StatsByValuePoint = {
	value: string;
	count: number;
};

export async function getClicksLastHourByMinute(urlId?: string) {
	const res = await client.stats.clicks.$get({
		query: {
			range: "1h",
			...(urlId ? { urlId } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch clicks last hour by minute");
	}
	const json = await res.json();
	return json;
}

export async function getBrowsersStats(
	range: StatsRange = "1h",
	urlId?: string,
) {
	const res = await client.stats.browsers.$get({
		query: { range, ...(urlId ? { urlId } : {}) },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch browser stats");
	}
	const json = await res.json();
	return json;
}

export async function getOsStats(range: StatsRange = "1h", urlId?: string) {
	const res = await client.stats.os.$get({
		query: { range, ...(urlId ? { urlId } : {}) },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch OS stats");
	}
	const json = await res.json();
	return json;
}

export async function getDevicesStats(
	range: StatsRange = "1h",
	urlId?: string,
) {
	const res = await client.stats.devices.$get({
		query: { range, ...(urlId ? { urlId } : {}) },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch device stats");
	}
	const json = await res.json();
	return json;
}

export async function getReferrersStats(
	range: StatsRange = "1h",
	urlId?: string,
) {
	const res = await client.stats.referrers.$get({
		query: { range, ...(urlId ? { urlId } : {}) },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch referrer stats");
	}
	const json = await res.json();
	return json;
}
