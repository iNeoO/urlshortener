import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { API_ERROR } from "@urlshortener/common/constants";
import { PostSignInEmailJsonSchema } from "@urlshortener/common/schema";
import { useState } from "react";
import logoImage from "../assets/logo.png";
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
		<div className="flex min-h-screen">
			{/* Branding panel */}
			<div className="hidden lg:flex lg:w-2/5 flex-col justify-between bg-(--color-surface-deep) border-r border-(--color-border) p-10">
				<div className="flex items-center gap-3">
					<img
						src={logoImage}
						alt="UrlShortener logo"
						className="h-10 w-10 rounded-xl"
					/>
					<span className="text-base font-semibold tracking-wide text-(--color-text)">
						UrlShortener
					</span>
				</div>
				<div>
					<h1 className="text-3xl font-semibold tracking-tight text-(--color-text) leading-snug">
						Shorten links.
						<br />
						Track every click.
					</h1>
					<ul className="mt-8 space-y-4">
						{[
							"Aggregated click stats by browser, OS and device",
							"Team collaboration with role-based access",
							"Privacy-friendly and lightweight by design",
						].map((item) => (
							<li
								key={item}
								className="flex items-start gap-3 text-sm text-(--color-muted)"
							>
								<span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-(--color-primary)/20 flex items-center justify-center">
									<span className="h-1.5 w-1.5 rounded-full bg-(--color-primary)" />
								</span>
								{item}
							</li>
						))}
					</ul>
				</div>
				<p className="text-xs text-(--color-muted)/60">Open source · Free</p>
			</div>

			{/* Form panel */}
			<div className="flex flex-1 flex-col items-center justify-center bg-(--color-surface) px-6 py-12">
				<div className="w-full max-w-sm">
					<div className="lg:hidden flex items-center gap-3 mb-8">
						<img
							src={logoImage}
							alt="UrlShortener logo"
							className="h-8 w-8 rounded-xl"
						/>
						<span className="text-sm font-semibold text-(--color-text)">
							UrlShortener
						</span>
					</div>

					<h2 className="text-2xl font-semibold tracking-tight text-(--color-text)">
						Sign in
					</h2>
					<p className="mt-1 text-sm text-(--color-muted)">
						Enter your email and password to continue.
					</p>

					{errorMessage ? (
						<ErrorMessage
							className="mt-4"
							message={errorMessage}
							variant={errorVariant}
						/>
					) : null}
					{resendSuccessMessage ? (
						<ErrorMessage
							className="mt-4"
							message={resendSuccessMessage}
							variant="success"
						/>
					) : null}

					<form onSubmit={handleLogin} className="mt-6 space-y-4">
						<Input
							id="email"
							label="Email"
							type="email"
							value={loginEmail}
							onChange={(e) => setLoginEmail(e.target.value)}
							required
							error={fieldErrors.email}
						/>
						<Input
							id="password"
							label="Password"
							type="password"
							value={loginPassword}
							onChange={(e) => setLoginPassword(e.target.value)}
							required
							error={fieldErrors.password}
						/>
						<Button
							type="submit"
							disabled={loginMutation.isPending}
							variant="primary"
							className="mt-2 w-full justify-center"
						>
							{loginMutation.isPending ? "Signing in..." : "Sign in"}
						</Button>
					</form>

					{canResendValidationEmail ? (
						<div className="mt-4">
							<Button
								type="button"
								variant="secondary"
								onClick={handleResendValidationEmail}
								disabled={resendValidationMutation.isPending}
								className="w-full justify-center"
							>
								{resendValidationMutation.isPending
									? "Sending..."
									: "Resend validation email"}
							</Button>
						</div>
					) : null}

					<div className="mt-6 space-y-2 text-sm text-(--color-muted)">
						<p>
							Forgot your password?{" "}
							<Link
								to="/password-forgotten"
								className="rounded-none border-none bg-transparent px-0 py-0 align-baseline font-medium text-(--color-primary) hover:underline"
							>
								Reset it
							</Link>
						</p>
						<p>
							No account?{" "}
							<Link
								to="/sign-up"
								className="rounded-none border-none bg-transparent px-0 py-0 align-baseline font-medium text-(--color-primary) hover:underline"
							>
								Create one
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
