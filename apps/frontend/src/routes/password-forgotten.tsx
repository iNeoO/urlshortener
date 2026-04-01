import { createFileRoute, redirect } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Button } from "../components/ui/button";
import { ErrorMessage } from "../components/ui/error-message";
import { Input } from "../components/ui/input";
import { usePasswordResetRequest } from "../hooks/query/auth.hook";

export const Route = createFileRoute("/password-forgotten")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const resetMutation = usePasswordResetRequest();
	const emailId = useId();
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setErrorMessage(null);
		try {
			await resetMutation.mutateAsync({ email });
			setIsSubmitted(true);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Request failed",
			);
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Reset password</h1>
			<p className="mt-1 text-sm text-gray-500">
				Enter your email and we will send you a reset link.
			</p>

			{errorMessage ? <ErrorMessage message={errorMessage} /> : null}

			{isSubmitted ? (
				<div className="mt-6 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
					If this email exists, we sent a reset link.
				</div>
			) : (
				<form
					onSubmit={handleSubmit}
					className="mt-6 rounded border border-gray-200 p-4"
				>
					<Input
						id={emailId}
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						placeholder="you@example.com"
					/>
					<Button
						type="submit"
						variant="primary"
						disabled={resetMutation.isPending}
						className="mt-4 w-full justify-center"
					>
						{resetMutation.isPending ? "Sending..." : "Send reset link"}
					</Button>
				</form>
			)}
		</div>
	);
}
