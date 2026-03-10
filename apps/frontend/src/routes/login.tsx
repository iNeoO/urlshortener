import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { API_ERROR } from "@urlshortener/common/constants";
import { PostSignInEmailJsonSchema } from "@urlshortener/common/schema";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { ErrorMessage } from "../components/ui/error-message";
import { Input } from "../components/ui/input";
import { Link } from "../components/ui/link";
import { useLogin, useResendValidationEmail } from "../hooks/query/auth.hook";
import { useZodForm } from "../hooks/useZodForm.hook";
import { ApiError } from "../libs/api/apiError";

export const Route = createFileRoute("/login")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const auth = Route.useRouteContext({
		select: (context) => context.auth,
	});
	const router = useRouter();
	const loginMutation = useLogin();
	const resendValidationMutation = useResendValidationEmail();
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [errorVariant, setErrorVariant] = useState<
		"warning" | "error" | "info" | "success"
	>("error");
	const [canResendValidationEmail, setCanResendValidationEmail] =
		useState(false);
	const [resendSuccessMessage, setResendSuccessMessage] = useState<
		string | null
	>(null);
	const { fieldErrors, safeParseWithFieldErrors } = useZodForm([
		"email",
		"password",
	] as const);

	const handleLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		setErrorMessage(null);
		setErrorVariant("error");
		setCanResendValidationEmail(false);
		setResendSuccessMessage(null);
		const parsed = safeParseWithFieldErrors(PostSignInEmailJsonSchema, {
			email: loginEmail.trim(),
			password: loginPassword,
		});
		if (!parsed.success) {
			setErrorVariant("warning");
			setErrorMessage("Please fix the form errors.");
			return;
		}
		try {
			await auth.login(parsed.data);
			await router.invalidate();
			router.navigate({ to: "/home" });
		} catch (error) {
			if (error instanceof ApiError) {
				setCanResendValidationEmail(
					error.code === API_ERROR.EMAIL_NOT_VERIFIED,
				);
				setErrorVariant("error");
				setErrorMessage(error.message);
				return;
			}
			setErrorVariant("error");
			setErrorMessage(error instanceof Error ? error.message : "Login failed");
		}
	};

	const handleResendValidationEmail = async () => {
		setResendSuccessMessage(null);
		setErrorMessage(null);
		setErrorVariant("error");
		try {
			await resendValidationMutation.mutateAsync({ email: loginEmail.trim() });
			setResendSuccessMessage("A new validation email has been sent.");
		} catch (error) {
			setErrorVariant("error");
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Failed to send validation email",
			);
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Authentication</h1>
			<p className="mt-1 text-sm text-gray-500">
				Quick login/signup to test session auth.
			</p>

			{errorMessage ? (
				<ErrorMessage
					className="mt-4"
					message={errorMessage}
					variant={errorVariant}
				/>
			) : null}
			{canResendValidationEmail ? (
				<div className="mt-3">
					<Button
						type="button"
						variant="primary"
						onClick={handleResendValidationEmail}
						disabled={resendValidationMutation.isPending}
						className="w-full justify-center sm:w-auto"
					>
						{resendValidationMutation.isPending
							? "Sending..."
							: "Resend validation email"}
					</Button>
				</div>
			) : null}
			{resendSuccessMessage ? (
				<ErrorMessage
					className="mt-4"
					message={resendSuccessMessage}
					variant="success"
				/>
			) : null}

			<form
				onSubmit={handleLogin}
				className="mt-6 rounded border border-gray-200 p-4"
			>
				<h2 className="text-lg font-medium">Login</h2>
				<Input
					id="email"
					label="Email"
					type="email"
					value={loginEmail}
					onChange={(e) => setLoginEmail(e.target.value)}
					required
					error={fieldErrors.email}
					wrapperClassName="mt-4"
				/>
				<Input
					id="password"
					label="Password"
					type="password"
					value={loginPassword}
					onChange={(e) => setLoginPassword(e.target.value)}
					required
					error={fieldErrors.password}
					wrapperClassName="mt-4"
				/>
				<Button
					type="submit"
					disabled={loginMutation.isPending}
					variant="primary"
					className="mt-4 w-full justify-center"
				>
					{loginMutation.isPending ? "Signing in..." : "Sign in"}
				</Button>
				<p className="mt-3 text-sm text-gray-600">
					Forgot your password?{" "}
					<Link
						to="/password-forgotten"
						className="rounded-none border-none bg-transparent px-0 py-0 align-baseline font-medium text-blue-100 hover:underline"
					>
						Reset it
					</Link>
				</p>
			</form>
			<p className="mt-4 text-sm text-gray-600">
				Don&apos;t have an account?{" "}
				<Link
					to="/sign-up"
					className="rounded-none border-none bg-transparent px-0 py-0 align-baseline font-medium text-blue-100 hover:underline"
				>
					Create one
				</Link>
			</p>
		</div>
	);
}
