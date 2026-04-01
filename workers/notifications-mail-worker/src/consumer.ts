import process from "node:process";
import { loggerStorage, pinoLogger } from "@urlshortener/infra/libs";
import amqp from "amqplib";
import { env } from "./config/env.js";
import type { MailMessage } from "./contracts/mail-message.js";
import { parseRawMessage } from "./contracts/mail-message.js";

type StartConsumerParams = {
	handleMailMessage: (message: MailMessage) => Promise<void>;
	shutdown: () => Promise<void>;
};

export const startConsumer = async ({
	handleMailMessage,
	shutdown,
}: StartConsumerParams) => {
	const connection = await amqp.connect(env.AMQP_URL);
	const channel = await connection.createChannel();

	await channel.assertQueue(env.AMQP_MAIL_QUEUE, { durable: true });
	await channel.prefetch(env.AMQP_MAIL_PREFETCH);

	pinoLogger.info(
		{
			queue: env.AMQP_MAIL_QUEUE,
			prefetch: env.AMQP_MAIL_PREFETCH,
		},
		"Mail worker is consuming",
	);

	const close = async (signal: string) => {
		pinoLogger.info({ signal }, "Shutting down mail worker");
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
		env.AMQP_MAIL_QUEUE,
		async (rawMessage) => {
			if (!rawMessage) {
				return;
			}

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
		{ noAck: false },
	);
};
