import { startResilientConsumer } from "@urlshortener/infra/amqp";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import { env } from "./config/env.js";
import {
	type AggregateClicksMessage,
	parseRawMessage,
} from "./contracts/aggregate-clicks-message.js";

type StartConsumerParams = {
	handleAggregateClicks: (message: AggregateClicksMessage) => Promise<void>;
	shutdown: () => Promise<void>;
};

export const startConsumer = ({
	handleAggregateClicks,
	shutdown,
}: StartConsumerParams) => {
	startResilientConsumer({
		amqpUrl: env.AMQP_URL,
		queue: env.AMQP_STATS_AGGREGATE_QUEUE,
		prefetch: env.AMQP_STATS_AGGREGATE_PREFETCH,
		workerName: "stats-aggregate-worker",
		shutdown,
		onMessage: async (channel, rawMessage) => {
			const messageLogger = pinoLogger.child({
				worker: "stats-aggregate-worker",
				queue: env.AMQP_STATS_AGGREGATE_QUEUE,
				deliveryTag: rawMessage.fields.deliveryTag,
				messageId: rawMessage.properties.messageId,
				routingKey: rawMessage.fields.routingKey,
			});

			await loggerStorage.run(messageLogger, async () => {
				try {
					const message = parseRawMessage(rawMessage.content);
					await handleAggregateClicks(message);
					channel.ack(rawMessage);
				} catch (error) {
					messageLogger.error(
						{
							err: error,
							raw: rawMessage.content.toString("utf-8"),
						},
						"Failed to process aggregate message",
					);

					channel.nack(rawMessage, false, false);
				}
			});
		},
	});
};
