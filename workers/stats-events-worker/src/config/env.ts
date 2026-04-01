import { z } from "zod";

const envSchema = z.object({
	AMQP_URL: z.string().default("amqp://localhost:5672"),
	AMQP_STATS_EVENTS_QUEUE: z.string().default("stats.events"),
	AMQP_STATS_EVENTS_PREFETCH: z.coerce.number().int().positive().default(100),
	STATS_BUCKET_TTL_SECONDS: z.coerce
		.number()
		.int()
		.positive()
		.default(60 * 60 * 24),
});

export const env = envSchema.parse(process.env);
