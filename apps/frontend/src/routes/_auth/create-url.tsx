import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ROLES } from "@urlshortener/common/constants";
import { useState } from "react";
import { z } from "zod";
import { GroupHeader } from "../../components/group/group-header";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Link } from "../../components/ui/link";
import { Select } from "../../components/ui/select";
import { TextArea } from "../../components/ui/textarea";
import { profileGroupsOptions } from "../../hooks/query/profile.hook";
import { useZodForm } from "../../hooks/useZodForm.hook";
import { createGroupUrl } from "../../libs/api/groups.api";
import { queryClient } from "../../libs/queryClient";

const createUrlSchema = z.object({
	groupId: z.string().min(1, "Group is required"),
	name: z.string().trim().min(1).max(100),
	description: z.string().max(500),
	original: z.url(),
});

export const Route = createFileRoute("/_auth/create-url")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { data: groupsData, isLoading: isGroupsLoading } = useQuery(
		profileGroupsOptions(),
	);
	const groups = (groupsData?.data ?? []).filter(
		(group) =>
			group.role === ROLES.OWNER ||
			group.role === ROLES.ADMIN ||
			group.role === ROLES.MEMBER,
	);
	const hasCreatableGroup = groups.length > 0;
	const groupOptions = groups.map((group) => ({
		value: group.id,
		label: group.name,
	}));
	const { mutateAsync } = useMutation({
		mutationKey: ["urls", "create"],
		mutationFn: (payload: {
			groupId: string;
			name: string;
			description: string;
			original: string;
		}) =>
			createGroupUrl({
				groupId: payload.groupId,
				body: {
					name: payload.name,
					description: payload.description,
					original: payload.original,
				},
			}),
	});
	const { fieldErrors, safeParseWithFieldErrors } = useZodForm([
		"groupId",
		"name",
		"description",
		"original",
	] as const);
	const [form, setForm] = useState({
		groupId: "",
		name: "",
		description: "",
		original: "",
	});

	const handleSubmit = async () => {
		const parsed = safeParseWithFieldErrors(createUrlSchema, {
			groupId: form.groupId,
			name: form.name.trim(),
			description: form.description.trim(),
			original: form.original.trim(),
		});
		if (!parsed.success) return;

		try {
			await mutateAsync(parsed.data);
			await queryClient.invalidateQueries({ queryKey: ["urls"] });
			await queryClient.invalidateQueries({
				queryKey: ["groups", parsed.data.groupId, "urls"],
			});
			navigate({ to: "/urls" });
		} catch {
			// API errors are intentionally not rendered as a bottom alert.
		}
	};

	return (
		<div className="space-y-4 p-6">
			<GroupHeader
				title="Create URL"
				breadcrumbItems={[
					{ label: "URLs", to: "/urls" },
					{ label: "Create URL" },
				]}
				actions={
					<Link to="/urls" variant="secondary">
						Cancel
					</Link>
				}
			/>

			<Card>
				<p className="mb-4 text-sm text-(--color-muted)">
					Create a new short URL in one of your groups.
				</p>
				{!isGroupsLoading && !hasCreatableGroup ? (
					<p className="mb-4 text-sm text-(--color-muted)">
						You need owner, admin, or member access in at least one group to
						create URLs.
					</p>
				) : null}
				<div className="space-y-4">
					<Select
						label="Group"
						value={form.groupId}
						onChange={(groupId) => setForm((prev) => ({ ...prev, groupId }))}
						options={groupOptions}
						placeholder={
							isGroupsLoading ? "Loading groups..." : "Select a group"
						}
						disabled={isGroupsLoading || !hasCreatableGroup}
						error={fieldErrors.groupId}
					/>

					<Input
						type="text"
						label="Name"
						value={form.name}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, name: event.target.value }))
						}
						placeholder="Landing page campaign"
						error={fieldErrors.name}
					/>

					<Input
						type="url"
						label="Original URL"
						value={form.original}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, original: event.target.value }))
						}
						placeholder="https://example.com/landing"
						error={fieldErrors.original}
					/>

					<TextArea
						label="Description"
						value={form.description}
						onChange={(event) =>
							setForm((prev) => ({ ...prev, description: event.target.value }))
						}
						placeholder="Optional context for this URL"
						error={fieldErrors.description}
					/>

					<div className="flex items-center justify-end gap-3">
						<Button
							onClick={handleSubmit}
							disabled={isGroupsLoading || !hasCreatableGroup}
							variant="primary"
						>
							Create URL
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
