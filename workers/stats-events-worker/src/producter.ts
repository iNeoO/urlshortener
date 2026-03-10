import { UrlClickMessageSchema } from "@urlshortener/common/schema";
import type { UrlClickMessage } from "@urlshortener/common/types";
import amqp from "amqplib";
import { env } from "./config/env.js";

type StatsEventsPublisherOptions = {
	amqpUrl?: string;
	queue?: string;
};

export class StatsEventsPublisher {
	private amqpUrl: string;
	private queue: string;
	private connection?: amqp.ChannelModel;
	private channelPromise?: Promise<amqp.Channel>;

	constructor(options?: StatsEventsPublisherOptions) {
		this.amqpUrl = options?.amqpUrl ?? env.AMQP_URL;
		this.queue = options?.queue ?? env.AMQP_STATS_EVENTS_QUEUE;
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

	async publish(message: UrlClickMessage) {
		const payload = UrlClickMessageSchema.parse(message);
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

	async sendUrlClickedEvent(
		message: Omit<UrlClickMessage, "type" | "occurredAt"> & {
			occurredAt?: number;
		},
	) {
		await this.publish({
			type: "stats.url-clicked",
			occurredAt: message.occurredAt ?? Date.now(),
			...message,
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
