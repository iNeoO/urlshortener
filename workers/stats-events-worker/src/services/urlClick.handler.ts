import {
	LATE_CLICK_EVENT_THRESHOLD_MS,
	STATS_BUCKET_MS,
} from "@urlshortener/common/constants";
import type { UrlClickMessage } from "@urlshortener/common/types";
import { getLoggerStore } from "@urlshortener/infra/libs";
import type { RedisService, StatsService } from "@urlshortener/services";

type CreateUrlClickHandlerParams = {
	redisService: RedisService;
	statsService: StatsService;
};

export const createUrlClickHandler = ({
	redisService,
	statsService,
}: CreateUrlClickHandlerParams) => {
	return async (message: UrlClickMessage) => {
		const occurredAt = message.occurredAt ?? Date.now();
		const ageMs = Date.now() - occurredAt;
		if (ageMs > LATE_CLICK_EVENT_THRESHOLD_MS) {
			await statsService.ingestLateClickEvent({ ...message, occurredAt });

			const logger = getLoggerStore();
			logger.info(
				{
					type: message.type,
					short: message.short,
					occurredAt,
					ageMs,
					thresholdMs: LATE_CLICK_EVENT_THRESHOLD_MS,
				},
				"Late stats click event handled via direct DB ingestion",
			);
			return;
		}

		const bucket = Math.floor(occurredAt / STATS_BUCKET_MS);
		const bucketKey = bucket.toString();

		await redisService.incrementAfterClick({
			short: message.short,
			bucketKey,
			message,
		});

		const logger = getLoggerStore();
		logger.info(
			{
				type: message.type,
				short: message.short,
				bucket: bucketKey,
			},
			"Stats click event processed",
		);
	};
};
