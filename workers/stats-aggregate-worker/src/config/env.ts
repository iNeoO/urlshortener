import { z } from "zod";

const envSchema = z.object({
	AMQP_URL: z.string().default("amqp://localhost:5672"),
	AMQP_STATS_AGGREGATE_QUEUE: z.string().default("stats.aggregate"),
	AMQP_STATS_AGGREGATE_PREFETCH: z.coerce.number().int().positive().default(1),
});

export const env = envSchema.parse(process.env);
