import amqp from "amqplib";
import { env } from "./config/env.js";
import {
	type MailMessage,
	mailMessageSchema,
} from "./contracts/mail-message.js";

export class MailPublisher {
	private amqpUrl: string;
	private queue: string;
	private connection?: amqp.ChannelModel;
	private channelPromise?: Promise<amqp.Channel>;

	constructor() {
		this.amqpUrl = env.AMQP_URL;
		this.queue = env.AMQP_MAIL_QUEUE;
	}

	private async getChannel() {
		if (!this.channelPromise) {
			this.channelPromise = amqp
				.connect(this.amqpUrl)
				.then(async (connection) => {
					this.connection = connection;
					const channel = await connection.createChannel();
					await channel.assertQueue(this.queue, { durable: true });
					return channel;
				})
				.catch((error) => {
					this.channelPromise = undefined;
					throw error;
				});
		}

		return this.channelPromise;
	}

	async publish(message: MailMessage) {
		const payload = mailMessageSchema.parse(message);
		const channel = await this.getChannel();
		channel.sendToQueue(
			this.queue,
			Buffer.from(JSON.stringify(payload), "utf-8"),
			{
				persistent: true,
				contentType: "application/json",
				type: payload.type,
			},
		);
	}

	async sendValidationEmail(to: string, token: string) {
		await this.publish({
			type: "mail.validation",
			to,
			token,
		});
	}

	async sendPasswordResetEmail(to: string, token: string) {
		await this.publish({
			type: "mail.password-reset",
			to,
			token,
		});
	}

	async sendInvitationsEmail(
		to: string,
		groupName: string,
		inviterName: string,
	) {
		await this.publish({
			type: "mail.invitation",
			to,
			groupName,
			inviterName,
		});
	}

	async close() {
		const channelPromise = this.channelPromise;
		this.channelPromise = undefined;
		const channel = channelPromise
			? await channelPromise.catch(() => null)
			: null;
		if (channel) {
			await channel.close().catch(() => undefined);
		}
		if (this.connection) {
			await this.connection.close().catch(() => undefined);
			this.connection = undefined;
		}
	}
}
