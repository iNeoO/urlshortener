import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getBrowsersStats,
	getClicksLastHourByMinute,
	getDevicesStats,
	getOsStats,
	getReferrersStats,
	type StatsRange,
} from "../../libs/api/stats.api";

export type LastHourPoint = Awaited<
	ReturnType<typeof getClicksLastHourByMinute>
>["data"][number];

export const useClicksLastHourByMinute = (urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "clicks", "last-hour", "by-minute", urlId ?? "all"],
			queryFn: () => getClicksLastHourByMinute(urlId),
		}),
	);
};

export const useCampaignsClicksLastHourByMinute = () =>
	useClicksLastHourByMinute();

export const useBrowsersStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "browsers", range, urlId ?? "all"],
			queryFn: () => getBrowsersStats(range, urlId),
		}),
	);
};

export const useOsStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "os", range, urlId ?? "all"],
			queryFn: () => getOsStats(range, urlId),
		}),
	);
};

export const useDevicesStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "devices", range, urlId ?? "all"],
			queryFn: () => getDevicesStats(range, urlId),
		}),
	);
};

export const useReferrersStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "referrers", range, urlId ?? "all"],
			queryFn: () => getReferrersStats(range, urlId),
		}),
	);
};
