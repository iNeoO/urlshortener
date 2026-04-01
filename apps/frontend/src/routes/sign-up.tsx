import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PostSignUpEmailJsonSchema } from "@urlshortener/common/schema";
import { useId, useState } from "react";
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
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Create account</h1>
			<p className="mt-1 text-sm text-gray-500">
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
				<form
					onSubmit={handleSignup}
					className="mt-6 rounded border border-gray-200 p-4"
				>
					<h2 className="text-lg font-medium">Signup</h2>
					<Input
						id={usernameId}
						label="Username"
						type="text"
						value={signupUsername}
						onChange={(e) => setSignupUsername(e.target.value)}
						required
						error={fieldErrors.username}
						wrapperClassName="mt-4"
					/>
					<Input
						id={emailId}
						label="Email"
						type="email"
						value={signupEmail}
						onChange={(e) => setSignupEmail(e.target.value)}
						required
						error={fieldErrors.email}
						wrapperClassName="mt-4"
					/>
					<Input
						id={passwordId}
						label="Password"
						type="password"
						value={signupPassword}
						onChange={(e) => setSignupPassword(e.target.value)}
						required
						error={fieldErrors.password}
						wrapperClassName="mt-4"
					/>
					<Button
						type="submit"
						disabled={signUpMutation.isPending}
						variant="primary"
						className="mt-4 w-full justify-center"
					>
						{signUpMutation.isPending ? "Creating..." : "Create account"}
					</Button>
				</form>
			)}
			<p className="mt-4 text-sm text-gray-600">
				Already have an account?{" "}
				<Link to="/login" className="font-medium text-gray-900 hover:underline">
					Sign in
				</Link>
			</p>
		</div>
	);
}
