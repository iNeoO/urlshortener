import type { StatsService } from "@urlshortener/services";

type CreateAggregateClicksJobParams = {
	statsService: StatsService;
};

export const createAggregateClicksJob = ({
	statsService,
}: CreateAggregateClicksJobParams) => {
	return async () => {
		await statsService.aggregateClicks();
	};
};
