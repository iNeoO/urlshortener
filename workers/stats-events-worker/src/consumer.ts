import process from "node:process";
import type { UrlClickMessage } from "@urlshortener/common/types";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import amqp from "amqplib";
import { env } from "./config/env.js";
import { parseRawMessage } from "./services/urlClick.util.js";

type StartConsumerParams = {
	handleUrlClickedEvent: (message: UrlClickMessage) => Promise<void>;
	shutdown: () => Promise<void>;
};

export const startConsumer = async ({
	handleUrlClickedEvent,
	shutdown,
}: StartConsumerParams) => {
	const connection = await amqp.connect(env.AMQP_URL);
	const channel = await connection.createChannel();

	await channel.assertQueue(env.AMQP_STATS_EVENTS_QUEUE, { durable: true });
	await channel.prefetch(env.AMQP_STATS_EVENTS_PREFETCH);

	pinoLogger.info(
		{
			queue: env.AMQP_STATS_EVENTS_QUEUE,
			prefetch: env.AMQP_STATS_EVENTS_PREFETCH,
		},
		"Stats worker is consuming",
	);

	const close = async (signal: string) => {
		pinoLogger.info({ signal }, "Shutting down stats worker");
		await channel.close();
		await connection.close();
		await shutdown();
		process.exit(0);
	};

	process.on("SIGINT", () => {
		void close("SIGINT");
	});
	process.on("SIGTERM", () => {
		void close("SIGTERM");
	});

	await channel.consume(
		env.AMQP_STATS_EVENTS_QUEUE,
		async (rawMessage) => {
			if (!rawMessage) {
				return;
			}

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
		{ noAck: false },
	);
};
