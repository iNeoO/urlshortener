import { z } from "zod";

export const PostSignUpEmailJsonSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
	username: z
		.string()
		.min(3)
		.max(30)
		.regex(/^[A-Za-z0-9]+$/, "Only base62 characters allowed"),
});

export const PostSignInEmailJsonSchema = PostSignUpEmailJsonSchema.pick({
	email: true,
	password: true,
});

export const PostValidateEmailJsonSchema = z.object({
	token: z.string().min(1),
});

export const PostResendValidationEmailJsonSchema = z.object({
	email: z.email(),
});

export const PostPasswordResetJsonSchema = z.object({
	email: z.email(),
});

export const PostPasswordResetConfirmJsonSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
});
