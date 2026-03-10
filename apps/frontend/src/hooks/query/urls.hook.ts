import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import {
	type GetUrlsParams,
	getLastWindowCounts,
	getUrls,
} from "../../libs/api/urls.api";

export type UrlFromUrls = Awaited<ReturnType<typeof getUrls>>["data"][number];
export type LastWindowCountFromUrls = Awaited<
	ReturnType<typeof getLastWindowCounts>
>["data"][number];

export const urlsOptions = (queryParams: GetUrlsParams) =>
	queryOptions({
		queryKey: ["urls", queryParams],
		queryFn: () => getUrls(queryParams),
		placeholderData: keepPreviousData,
	});

export const useUrls = (queryParams: GetUrlsParams) => {
	return useQuery(urlsOptions(queryParams));
};

export const useLastWindowCounts = () => {
	return useQuery(
		queryOptions({
			queryKey: ["urls", "last-window-counts"],
			queryFn: getLastWindowCounts,
		}),
	);
};
