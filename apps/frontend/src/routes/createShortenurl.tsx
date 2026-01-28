import { createFileRoute } from "@tanstack/react-router";
import { PostShortenUrlJsonSchema } from "@urlshortener/backend/schema";
import { useId, useState, useTransition } from "react";
import { z } from "zod";
import { Card } from "../components/ui/card";
import { useCreateShortenUrl } from "../hooks/mutations/shortenurl.mutation";

export const Route = createFileRoute("/createShortenurl")({
	component: CreateShortUrl,
});

function CreateShortUrl() {
	const navigate = Route.useNavigate();
	const { mutateAsync } = useCreateShortenUrl();
	const [isPending, startTransition] = useTransition();
	const nameId = useId();
	const descriptionId = useId();
	const originalId = useId();
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Record<"name" | "description" | "original", string>>
	>({});
	const [form, setForm] = useState({
		name: "",
		description: "",
		original: "",
	});

	const handleSubmit = () => {
		startTransition(async () => {
			setError(null);
			setFieldErrors({});

			const parsed = PostShortenUrlJsonSchema.safeParse(form);
			if (!parsed.success) {
				const tree = z.treeifyError(parsed.error);
				setFieldErrors({
					name: tree.properties?.name?.errors?.[0],
					description: tree.properties?.description?.errors?.[0],
					original: tree.properties?.original?.errors?.[0],
				});
				setError("Please fix the form errors.");
				return;
			}

			try {
				await mutateAsync(parsed.data);
				navigate({ to: "/" });
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to create URL.");
			}
		});
	};

	return (
		<div className="space-y-4 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold text-slate-900">
					Create short URL
				</h1>
				<p className="text-sm text-slate-600">
					Add a name, description, and the original URL.
				</p>
			</div>

			<Card>
				<div className="space-y-4">
					<div className="space-y-1">
						<label
							className="text-sm font-medium text-slate-700"
							htmlFor={nameId}
						>
							Name
						</label>
						<input
							id={nameId}
							className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
							value={form.name}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, name: event.target.value }))
							}
						/>
						{fieldErrors.name ? (
							<p className="text-xs text-red-600">{fieldErrors.name}</p>
						) : null}
					</div>

					<div className="space-y-1">
						<label
							className="text-sm font-medium text-slate-700"
							htmlFor={descriptionId}
						>
							Description
						</label>
						<textarea
							id={descriptionId}
							rows={4}
							className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
							value={form.description}
							onChange={(event) =>
								setForm((prev) => ({
									...prev,
									description: event.target.value,
								}))
							}
						/>
						{fieldErrors.description ? (
							<p className="text-xs text-red-600">{fieldErrors.description}</p>
						) : null}
					</div>

					<div className="space-y-1">
						<label
							className="text-sm font-medium text-slate-700"
							htmlFor={originalId}
						>
							Original URL
						</label>
						<input
							id={originalId}
							className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
							value={form.original}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, original: event.target.value }))
							}
						/>
						{fieldErrors.original ? (
							<p className="text-xs text-red-600">{fieldErrors.original}</p>
						) : null}
					</div>

					{error ? <p className="text-sm text-red-600">{error}</p> : null}

					<button
						type="button"
						onClick={handleSubmit}
						disabled={isPending}
						className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isPending ? "Creating..." : "Create short URL"}
					</button>
				</div>
			</Card>
		</div>
	);
}
