import { z } from "zod";

const envSchema = z.object({
	AMQP_URL: z.string().default("amqp://localhost:5672"),
	AMQP_MAIL_QUEUE: z.string().default("mail.send"),
	AMQP_MAIL_PREFETCH: z.coerce.number().int().positive().default(10),
});

export const env = envSchema.parse(process.env);
