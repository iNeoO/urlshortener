import { startResilientConsumer } from "@urlshortener/infra/amqp";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import { env } from "./config/env.js";
import type { MailMessage } from "./contracts/mail-message.js";
import { parseRawMessage } from "./contracts/mail-message.js";

type StartConsumerParams = {
	handleMailMessage: (message: MailMessage) => Promise<void>;
	shutdown: () => Promise<void>;
};

export const startConsumer = ({
	handleMailMessage,
	shutdown,
}: StartConsumerParams) => {
	startResilientConsumer({
		amqpUrl: env.AMQP_URL,
		queue: env.AMQP_MAIL_QUEUE,
		prefetch: env.AMQP_MAIL_PREFETCH,
		workerName: "notifications-mail-worker",
		shutdown,
		onMessage: async (channel, rawMessage) => {
			const messageLogger = pinoLogger.child({
				worker: "notifications-mail-worker",
				queue: env.AMQP_MAIL_QUEUE,
				deliveryTag: rawMessage.fields.deliveryTag,
				messageId: rawMessage.properties.messageId,
				routingKey: rawMessage.fields.routingKey,
			});

			await loggerStorage.run(messageLogger, async () => {
				try {
					const message = parseRawMessage(rawMessage.content);
					await handleMailMessage(message);
					channel.ack(rawMessage);
				} catch (error) {
					messageLogger.error(
						{
							err: error,
							raw: rawMessage.content.toString("utf-8"),
						},
						"Failed to process mail message",
					);

					channel.nack(rawMessage, false, false);
				}
			});
		},
	});
};
