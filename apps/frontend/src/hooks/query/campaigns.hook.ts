import {
	keepPreviousData,
	queryOptions,
	useQuery,
} from "@tanstack/react-query";
import {
	type GetCampaignsParams,
	getCampaigns,
} from "../../libs/api/campaigns.api";

export const campaignsOptions = (queryParams: GetCampaignsParams) =>
	queryOptions({
		queryKey: ["campaigns", queryParams],
		queryFn: () => getCampaigns(queryParams),
		placeholderData: keepPreviousData,
	});

export const useCampaigns = (queryParams: GetCampaignsParams) => {
	return useQuery(campaignsOptions(queryParams));
};
