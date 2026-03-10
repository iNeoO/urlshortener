import { useMutation } from "@tanstack/react-query";
import {
	confirmPasswordReset,
	type PasswordResetConfirmBody,
	type PasswordResetRequestBody,
	type ResendValidationEmailBody,
	requestPasswordReset,
	resendValidationEmail,
	type SignInEmailBody,
	type SignUpEmailBody,
	signInEmail,
	signOut,
	signUpEmail,
	type ValidateEmailBody,
	validateEmail,
} from "../../libs/api/auth.api";

export const useLogin = () => {
	return useMutation({
		mutationFn: (body: SignInEmailBody) => signInEmail(body),
	});
};

export const useLogout = () => {
	return useMutation({
		mutationFn: () => signOut(),
	});
};

export const useSignUp = () => {
	return useMutation({
		mutationFn: (body: SignUpEmailBody) => signUpEmail(body),
	});
};

export const usePasswordResetRequest = () => {
	return useMutation({
		mutationFn: (body: PasswordResetRequestBody) => requestPasswordReset(body),
	});
};

export const usePasswordResetConfirm = () => {
	return useMutation({
		mutationFn: (body: PasswordResetConfirmBody) => confirmPasswordReset(body),
	});
};

export const useValidateEmail = () => {
	return useMutation({
		mutationFn: (body: ValidateEmailBody) => validateEmail(body),
	});
};

export const useResendValidationEmail = () => {
	return useMutation({
		mutationFn: (body: ResendValidationEmailBody) =>
			resendValidationEmail(body),
	});
};
