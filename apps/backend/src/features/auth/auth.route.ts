import {
	openApi400ZodError,
	openApi409Conflict,
	openApiResponse,
} from "@urlshortener/infra/helpers";
import { describeRoute } from "hono-openapi";
import {
	AuthCheckResponseSchema,
	AuthUserSchema,
	EmailValidationResponseSchema,
	PasswordResetResponseSchema,
	SignOutResponseSchema,
	SignUpResponseSchema,
} from "./auth.schema.js";

export const PostSignUpEmailRoute = describeRoute({
	responses: {
		...openApiResponse(SignUpResponseSchema, 201, "Sign up successful"),
		...openApi400ZodError("Zod error"),
		...openApi409Conflict("Email already in use"),
	},
});

export const PostSignInEmailRoute = describeRoute({
	responses: {
		...openApiResponse(AuthUserSchema, 200, "Sign in successful"),
		...openApi400ZodError("Zod error"),
	},
});

export const PostSignOutRoute = describeRoute({
	responses: {
		...openApiResponse(SignOutResponseSchema, 200, "Sign out successful"),
	},
});

export const PostValidateEmailRoute = describeRoute({
	responses: {
		...openApiResponse(EmailValidationResponseSchema, 200, "Email validated"),
		...openApi400ZodError("Zod error"),
	},
});

export const PostResendValidationEmailRoute = describeRoute({
	responses: {
		...openApiResponse(
			EmailValidationResponseSchema,
			200,
			"Validation email sent",
		),
		...openApi400ZodError("Zod error"),
	},
});

export const PostPasswordResetRequestRoute = describeRoute({
	responses: {
		...openApiResponse(
			PasswordResetResponseSchema,
			200,
			"Password reset email sent",
		),
		...openApi400ZodError("Zod error"),
	},
});

export const PostPasswordResetConfirmRoute = describeRoute({
	responses: {
		...openApiResponse(
			PasswordResetResponseSchema,
			200,
			"Password reset successful",
		),
		...openApi400ZodError("Zod error"),
	},
});

export const GetAuthCheckRoute = describeRoute({
	responses: {
		...openApiResponse(AuthCheckResponseSchema, 200, "Auth check"),
	},
});
