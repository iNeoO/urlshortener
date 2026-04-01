import {
	PostPasswordResetConfirmJsonSchema,
	PostPasswordResetJsonSchema,
	PostResendValidationEmailJsonSchema,
	PostSignInEmailJsonSchema,
	PostSignUpEmailJsonSchema,
	PostValidateEmailJsonSchema,
} from "@urlshortener/common/schema";
import { z } from "zod";

export {
	PostSignInEmailJsonSchema,
	PostSignUpEmailJsonSchema,
	PostValidateEmailJsonSchema,
	PostResendValidationEmailJsonSchema,
	PostPasswordResetJsonSchema,
	PostPasswordResetConfirmJsonSchema,
};

export const AuthUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const SignUpResponseSchema = z.object({
	success: z.boolean(),
});

export const SignOutResponseSchema = z.object({
	success: z.boolean(),
});

export const EmailValidationResponseSchema = z.object({
	success: z.boolean(),
});

export const PasswordResetResponseSchema = z.object({
	success: z.boolean(),
});

export const AuthCheckResponseSchema = z.object({
	authenticated: z.boolean(),
});
