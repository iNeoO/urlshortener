import type {
	PostPasswordResetConfirmJsonSchema,
	PostPasswordResetJsonSchema,
	PostResendValidationEmailJsonSchema,
	PostSignInEmailJsonSchema,
	PostSignUpEmailJsonSchema,
	PostValidateEmailJsonSchema,
} from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc.ts";
import { toApiError } from "./apiError.ts";

export type SignUpEmailBody = z.infer<typeof PostSignUpEmailJsonSchema>;

export type SignInEmailBody = z.infer<typeof PostSignInEmailJsonSchema>;

export type PasswordResetRequestBody = z.infer<
	typeof PostPasswordResetJsonSchema
>;
export type PasswordResetConfirmBody = z.infer<
	typeof PostPasswordResetConfirmJsonSchema
>;
export type ValidateEmailBody = z.infer<typeof PostValidateEmailJsonSchema>;
export type ResendValidationEmailBody = z.infer<
	typeof PostResendValidationEmailJsonSchema
>;

export async function checkAuth() {
	const res = await client.auth.check.$get();
	if (!res.ok) {
		throw await toApiError(res, "Failed to check auth");
	}
	const json = await res.json();
	return json.data.authenticated;
}

export async function signUpEmail(body: SignUpEmailBody) {
	const res = await client.auth["sign-up"].email.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to sign up");
	}
	const json = await res.json();
	return json;
}

export async function signInEmail(body: SignInEmailBody) {
	const res = await client.auth["sign-in"].email.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to sign in");
	}
	const json = await res.json();
	return json;
}

export async function requestPasswordReset(body: PasswordResetRequestBody) {
	const res = await client.auth["password-reset"].$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to request password reset");
	}
	const json = await res.json();
	return json;
}

export async function confirmPasswordReset(body: PasswordResetConfirmBody) {
	const res = await client.auth["password-reset"].confirm.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to reset password");
	}
	const json = await res.json();
	return json;
}

export async function validateEmail(body: ValidateEmailBody) {
	const res = await client.auth["validate-email"].$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to validate email");
	}
	const json = await res.json();
	return json;
}

export async function resendValidationEmail(body: ResendValidationEmailBody) {
	const res = await client.auth["validate-email"].resend.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to send validation email");
	}
	const json = await res.json();
	return json;
}

export async function signOut() {
	const res = await client.auth["sign-out"].$post();
	if (!res.ok) {
		throw await toApiError(res, "Failed to sign out");
	}
	const json = await res.json();
	return json;
}
