import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PostGroupJsonSchema } from "@urlshortener/common/schema";
import { useId, useState, useTransition } from "react";
import { GroupHeader } from "../../components/group/group-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link } from "../../components/ui/link";
import { TextArea } from "../../components/ui/textarea";
import { useZodForm } from "../../hooks/useZodForm.hook";
import { createGroup } from "../../libs/api/groups.api";
import { queryClient } from "../../libs/queryClient";

export const Route = createFileRoute("/_auth/create-group")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { mutateAsync } = useMutation({
		mutationKey: ["groups", "create"],
		mutationFn: createGroup,
	});
	const [isPending, startTransition] = useTransition();
	const nameId = useId();
	const descriptionId = useId();
	const { fieldErrors, safeParseWithFieldErrors } = useZodForm([
		"name",
		"description",
	] as const);
	const [form, setForm] = useState({
		name: "",
		description: "",
	});

	const handleSubmit = () => {
		startTransition(async () => {
			const parsed = safeParseWithFieldErrors(PostGroupJsonSchema, {
				name: form.name.trim(),
				description:
					form.description.trim() === "" ? undefined : form.description.trim(),
			});

			if (!parsed.success) return;

			try {
				await mutateAsync(parsed.data);
				await queryClient.invalidateQueries({ queryKey: ["groups"] });
				navigate({ to: "/groups" });
			} catch {
				// API errors are intentionally not rendered as a bottom alert.
			}
		});
	};

	return (
		<div className="space-y-4 p-6">
			<GroupHeader
				title="Create group"
				breadcrumbItems={[
					{ label: "Groups", to: "/groups" },
					{ label: "Create group" },
				]}
				actions={
					<Link to="/groups" variant="secondary">
						Cancel
					</Link>
				}
			/>

			<Card>
				<p className="mb-4 text-sm text-(--color-muted)">
					Create a new group with a name and optional description.
				</p>
				<div className="space-y-4">
					<Input
						id={nameId}
						type="text"
						label="Name"
						value={form.name}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, name: event.target.value }))
						}
						placeholder="Engineering team"
						error={fieldErrors.name}
					/>

					<TextArea
						id={descriptionId}
						label="Description (optional)"
						value={form.description}
						onChange={(event) =>
							setForm((prev) => ({
								...prev,
								description: event.target.value,
							}))
						}
						placeholder="What this group is for"
						error={fieldErrors.description}
					/>

					<div className="flex items-center justify-end gap-3">
						<Button
							onClick={handleSubmit}
							disabled={isPending}
							variant="primary"
						>
							{isPending ? "Creating..." : "Create group"}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
