import { z } from "zod";

const envSchema = z.object({
	FRONTEND_URL: z.url(),
	REDIS_URLSHORTENER_PASSWORD: z.string(),
	REDIS_URLSHORTENER_PORT: z.coerce.number().default(6379),
	REDIS_URLSHORTENER_HOST: z.string().default("127.0.0.1"),
	REDIS_URLSHORTENER_USERNAME: z.string().optional(),
	JWT_REFRESH_SECRET: z.string(),
	JWT_AUTH_SECRET: z.string(),
	NAME_REFRESH_TOKEN: z.string(),
	NAME_AUTH_TOKEN: z.string(),
	SMTP_HOST: z.string(),
	SMTP_PORT: z.coerce.number(),
	SMTP_AUTH_USER: z.email(),
	SMTP_AUTH_PASS: z.string(),
	AMQP_URL: z.string().default("amqp://localhost:5672"),
	AMQP_MAIL_QUEUE: z.string().default("mail.send"),
});

export const env = envSchema.parse(process.env);
