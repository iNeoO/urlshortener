import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Link } from "../components/ui/link";
import { useValidateEmail } from "../hooks/query/auth.hook";

type ValidationStatus = "idle" | "loading" | "success" | "error";
const validateEmailSearchParamsSchema = z.object({
	token: z.string(),
});

export const Route = createFileRoute("/validate-email")({
	validateSearch: zodValidator(validateEmailSearchParamsSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const { token } = Route.useSearch();
	const validateMutation = useValidateEmail();
	const [status, setStatus] = useState<ValidationStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const hasValidated = useRef(false);

	useEffect(() => {
		if (!token || hasValidated.current) {
			return;
		}

		hasValidated.current = true;
		setStatus("loading");
		setErrorMessage(null);

		validateMutation
			.mutateAsync({ token })
			.then(() => {
				setStatus("success");
			})
			.catch((error) => {
				setStatus("error");
				setErrorMessage(
					error instanceof Error ? error.message : "Validation failed",
				);
			});
	}, [token, validateMutation]);

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10">
			<h1 className="text-2xl font-semibold">Email validation</h1>
			<p className="mt-1 text-sm text-gray-500">
				We are validating your email address.
			</p>

			{!token ? (
				<div className="mt-6 rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
					Missing validation token. Please use the link from your email.
				</div>
			) : null}

			{status === "loading" ? (
				<div className="mt-6 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
					Validating your email...
				</div>
			) : null}

			{status === "success" ? (
				<div className="mt-6 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
					Your email has been validated. You can now sign in.
					<Link to="/login">Go to login</Link>
				</div>
			) : null}

			{status === "error" ? (
				<div className="mt-6 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{errorMessage ?? "Validation failed"}
				</div>
			) : null}
		</div>
	);
}
