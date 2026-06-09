import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PostSignUpEmailJsonSchema } from "@urlshortener/common/schema";
import { useId, useState } from "react";
import logoImage from "../assets/logo.png";
import { Button } from "../components/ui/button";
import { ErrorMessage } from "../components/ui/error-message";
import { Input } from "../components/ui/input";
import { useSignUp } from "../hooks/query/auth.hook";
import { useZodForm } from "../hooks/useZodForm.hook";
import { ApiError } from "../libs/api/apiError";

export const Route = createFileRoute("/sign-up")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const signUpMutation = useSignUp();
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupUsername, setSignupUsername] = useState("");
	const usernameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const { fieldErrors, safeParseWithFieldErrors } = useZodForm([
		"email",
		"password",
		"username",
	] as const);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSignup = async (event: React.FormEvent) => {
		event.preventDefault();
		setErrorMessage(null);
		const parsed = safeParseWithFieldErrors(PostSignUpEmailJsonSchema, {
			email: signupEmail.trim(),
			password: signupPassword,
			username: signupUsername.trim(),
		});
		if (!parsed.success) return;
		try {
			await signUpMutation.mutateAsync(parsed.data);
			setIsSubmitted(true);
		} catch (error) {
			if (error instanceof ApiError) {
				setErrorMessage(error.message);
				return;
			}
			setErrorMessage(error instanceof Error ? error.message : "Signup failed");
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
						Create account
					</h2>
					<p className="mt-1 text-sm text-(--color-muted)">
						Sign up to start shortening URLs.
					</p>

					{errorMessage ? (
						<ErrorMessage className="mt-4" message={errorMessage} />
					) : null}

					{isSubmitted ? (
						<ErrorMessage
							className="mt-6"
							message="Account created. Check your email to validate your address before logging in."
							variant="success"
						/>
					) : (
						<form onSubmit={handleSignup} className="mt-6 space-y-4">
							<Input
								id={usernameId}
								label="Username"
								type="text"
								value={signupUsername}
								onChange={(e) => setSignupUsername(e.target.value)}
								required
								error={fieldErrors.username}
							/>
							<Input
								id={emailId}
								label="Email"
								type="email"
								value={signupEmail}
								onChange={(e) => setSignupEmail(e.target.value)}
								required
								error={fieldErrors.email}
							/>
							<Input
								id={passwordId}
								label="Password"
								type="password"
								value={signupPassword}
								onChange={(e) => setSignupPassword(e.target.value)}
								required
								error={fieldErrors.password}
							/>
							<Button
								type="submit"
								disabled={signUpMutation.isPending}
								variant="primary"
								className="mt-2 w-full justify-center"
							>
								{signUpMutation.isPending ? "Creating..." : "Create account"}
							</Button>
						</form>
					)}

					<p className="mt-6 text-sm text-(--color-muted)">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-(--color-primary) hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
