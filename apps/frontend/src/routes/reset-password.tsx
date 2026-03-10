import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useId, useState } from "react";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { ErrorMessage } from "../components/ui/error-message";
import { Input } from "../components/ui/input";
import { usePasswordResetConfirm } from "../hooks/query/auth.hook";
import { useZodForm } from "../hooks/useZodForm.hook";

const resetPasswordSearchSchema = z.object({
	token: z.string().min(1),
});

const resetPasswordFormSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters."),
		confirmPassword: z.string().min(1, "Please confirm your password."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match.",
	});

export const Route = createFileRoute("/reset-password")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/home" });
		}
	},
	validateSearch: zodValidator(resetPasswordSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const { token } = Route.useSearch();
	const resetConfirmMutation = usePasswordResetConfirm();
	const passwordId = useId();
	const confirmPasswordId = useId();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { fieldErrors, safeParseWithFieldErrors } = useZodForm([
		"password",
		"confirmPassword",
	] as const);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setErrorMessage(null);

		const parsed = safeParseWithFieldErrors(resetPasswordFormSchema, {
			password,
			confirmPassword,
		});
		if (!parsed.success) return;

		try {
			await resetConfirmMutation.mutateAsync({
				token,
				password: parsed.data.password,
			});
			setIsSubmitted(true);
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "Reset failed");
		}
	};

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Set new password</h1>
			<p className="mt-1 text-sm text-gray-500">
				Choose a new password for your account.
			</p>

			{errorMessage ? (
				<ErrorMessage className="mt-4" message={errorMessage} />
			) : null}

			{isSubmitted ? (
				<div className="mt-6 space-y-4">
					<div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
						Password reset successful. You can now sign in.
					</div>
					<Link
						to="/login"
						className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
					>
						Go to login
					</Link>
				</div>
			) : (
				<form
					onSubmit={handleSubmit}
					className="mt-6 rounded border border-gray-200 p-4"
				>
					<Input
						id={passwordId}
						label="New password"
						type="password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
						error={fieldErrors.password}
					/>
					<Input
						id={confirmPasswordId}
						label="Confirm new password"
						type="password"
						value={confirmPassword}
						onChange={(event) => setConfirmPassword(event.target.value)}
						required
						error={fieldErrors.confirmPassword}
						wrapperClassName="mt-4"
					/>
					<Button
						type="submit"
						variant="primary"
						disabled={resetConfirmMutation.isPending}
						className="mt-4 w-full justify-center"
					>
						{resetConfirmMutation.isPending ? "Resetting..." : "Reset password"}
					</Button>
				</form>
			)}
		</div>
	);
}
