import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getBrowsersStats,
	getClicksStats,
	getDevicesStats,
	getOsStats,
	getReferrersStats,
	type StatsRange,
} from "../../libs/api/stats.api";

const STATS_REFETCH_INTERVAL_MS = 10_000;

export type StatsClickPoint = Awaited<
	ReturnType<typeof getClicksStats>
>["data"][number];

export const useClicksStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "clicks", range, urlId ?? "all"],
			queryFn: () => getClicksStats(range, urlId),
			refetchInterval: STATS_REFETCH_INTERVAL_MS,
		}),
	);
};

export const useCampaignsClicksStats = (range: StatsRange = "1h") =>
	useClicksStats(range);

export const useBrowsersStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "browsers", range, urlId ?? "all"],
			queryFn: () => getBrowsersStats(range, urlId),
			refetchInterval: STATS_REFETCH_INTERVAL_MS,
		}),
	);
};

export const useOsStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "os", range, urlId ?? "all"],
			queryFn: () => getOsStats(range, urlId),
			refetchInterval: STATS_REFETCH_INTERVAL_MS,
		}),
	);
};

export const useDevicesStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "devices", range, urlId ?? "all"],
			queryFn: () => getDevicesStats(range, urlId),
			refetchInterval: STATS_REFETCH_INTERVAL_MS,
		}),
	);
};

export const useReferrersStats = (range: StatsRange = "1h", urlId?: string) => {
	return useQuery(
		queryOptions({
			queryKey: ["stats", "referrers", range, urlId ?? "all"],
			queryFn: () => getReferrersStats(range, urlId),
			refetchInterval: STATS_REFETCH_INTERVAL_MS,
		}),
	);
};
