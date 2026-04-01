import { z } from "zod";

export const mailMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("mail.validation"),
		to: z.email(),
		token: z.string().min(1),
	}),
	z.object({
		type: z.literal("mail.password-reset"),
		to: z.email(),
		token: z.string().min(1),
	}),
	z.object({
		type: z.literal("mail.invitation"),
		to: z.email(),
		groupName: z.string().min(1),
		inviterName: z.string().min(1),
	}),
]);

export type MailMessage = z.infer<typeof mailMessageSchema>;

export const parseRawMessage = (payload: Buffer) => {
	const parsedJson = JSON.parse(payload.toString("utf-8"));
	return mailMessageSchema.parse(parsedJson);
};
