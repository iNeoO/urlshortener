import type { StatsService } from "@urlshortener/services";
import type { AggregateClicksMessage } from "../contracts/aggregate-clicks-message.js";

type CreateAggregateClicksWorkerParams = {
	statsService: StatsService;
};

export const createAggregateClicksWorker = ({
	statsService,
}: CreateAggregateClicksWorkerParams) => {
	return async (message: AggregateClicksMessage) => {
		switch (message.type) {
			case "stats.aggregate-minute":
				await statsService.aggregateClicks();
				return;
			case "stats.aggregate-hour":
				await statsService.aggregateHourlyClicks();
				return;
			case "stats.aggregate-day":
				await statsService.aggregateDailyClicks();
				return;
		}
	};
};
