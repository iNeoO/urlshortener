import amqp from "amqplib";
import { env } from "./config/env.js";
import {
	type AggregateClicksMessage,
	aggregateClicksMessageSchema,
} from "./contracts/aggregate-clicks-message.js";

type StatsAggregatePublisherOptions = {
	amqpUrl?: string;
	queue?: string;
};

export class StatsAggregatePublisher {
	private amqpUrl: string;
	private queue: string;
	private connection?: amqp.ChannelModel;
	private channelPromise?: Promise<amqp.Channel>;

	constructor(options?: StatsAggregatePublisherOptions) {
		this.amqpUrl = options?.amqpUrl ?? env.AMQP_URL;
		this.queue = options?.queue ?? env.AMQP_STATS_AGGREGATE_QUEUE;
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

	async publish(message: AggregateClicksMessage) {
		const payload = aggregateClicksMessageSchema.parse(message);
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

	async sendAggregateClicksEvent(message?: { occurredAt?: number }) {
		await this.publish({
			type: "stats.aggregate-minute",
			occurredAt: message?.occurredAt ?? Date.now(),
		});
	}

	async sendAggregateHourlyClicksEvent(message?: { occurredAt?: number }) {
		await this.publish({
			type: "stats.aggregate-hour",
			occurredAt: message?.occurredAt ?? Date.now(),
		});
	}

	async sendAggregateDailyClicksEvent(message?: { occurredAt?: number }) {
		await this.publish({
			type: "stats.aggregate-day",
			occurredAt: message?.occurredAt ?? Date.now(),
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
