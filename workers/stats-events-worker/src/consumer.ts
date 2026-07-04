import type { UrlClickMessage } from "@urlshortener/common/types";
import { startResilientConsumer } from "@urlshortener/infra/amqp";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import { env } from "./config/env.js";
import { parseRawMessage } from "./services/urlClick.util.js";

type StartConsumerParams = {
	handleUrlClickedEvent: (message: UrlClickMessage) => Promise<void>;
	shutdown: () => Promise<void>;
};

export const startConsumer = ({
	handleUrlClickedEvent,
	shutdown,
}: StartConsumerParams) => {
	startResilientConsumer({
		amqpUrl: env.AMQP_URL,
		queue: env.AMQP_STATS_EVENTS_QUEUE,
		prefetch: env.AMQP_STATS_EVENTS_PREFETCH,
		workerName: "stats-events-worker",
		shutdown,
		onMessage: async (channel, rawMessage) => {
			const messageLogger = pinoLogger.child({
				worker: "stats-events-worker",
				queue: env.AMQP_STATS_EVENTS_QUEUE,
				deliveryTag: rawMessage.fields.deliveryTag,
				messageId: rawMessage.properties.messageId,
				routingKey: rawMessage.fields.routingKey,
			});

			await loggerStorage.run(messageLogger, async () => {
				try {
					const message = parseRawMessage(rawMessage.content);
					await handleUrlClickedEvent(message);
					channel.ack(rawMessage);
				} catch (error) {
					messageLogger.error(
						{
							err: error,
							raw: rawMessage.content.toString("utf-8"),
						},
						"Failed to process stats event",
					);

					channel.nack(rawMessage, false, false);
				}
			});
		},
	});
};
