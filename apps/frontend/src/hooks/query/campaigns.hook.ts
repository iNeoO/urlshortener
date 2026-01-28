import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	type GetCampaignsParams,
	getCampaigns,
	getClicksLastHourByMinute,
} from "../../libs/api/campaigns.api";

export const campaignsOptions = (queryParams: GetCampaignsParams) =>
	queryOptions({
		queryKey: ["campaigns", queryParams],
		queryFn: () => getCampaigns(queryParams),
	});

export const useCampaigns = (queryParams: GetCampaignsParams) => {
	return useQuery(campaignsOptions(queryParams));
};

export const useCampaignsClicksLastHourByMinute = () => {
	return useQuery(
		queryOptions({
			queryKey: ["campaigns", "clicks", "last-hour", "by-minute"],
			queryFn: () => getClicksLastHourByMinute(),
		}),
	);
};
