import { PatchGroupJsonSchema } from "@urlshortener/common/schema";
import { useEffect, useId, useState } from "react";
import { useZodForm } from "../../hooks/useZodForm.hook";
import type { UpdateGroupBody } from "../../libs/api/groups.api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { TextArea } from "../ui/textarea";

type GroupSettingsCardProps = {
	name: string;
	description: string | null;
	canEdit?: boolean;
	isSubmitting?: boolean;
	onSubmit: (body: UpdateGroupBody) => Promise<void> | void;
};

export function GroupSettingsCard({
	name,
	description,
	canEdit = true,
	isSubmitting = false,
	onSubmit,
}: GroupSettingsCardProps) {
	const nameId = useId();
	const descriptionId = useId();
	const [form, setForm] = useState({
		name: "",
		description: "",
	});
	const { fieldErrors: formErrors, safeParseWithFieldErrors } = useZodForm([
		"name",
		"description",
	] as const);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setForm({
			name,
			description: description ?? "",
		});
	}, [name, description]);

	const handleSubmit = async () => {
		const parsed = safeParseWithFieldErrors(PatchGroupJsonSchema, {
			name: form.name.trim(),
			description: form.description.trim() || undefined,
		});

		if (!parsed.success) return;

		try {
			setIsSaving(true);
			await onSubmit(parsed.data);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card className="space-y-4">
			<h2 className="text-lg font-semibold text-(--color-text)">Settings</h2>
			<div className="space-y-4">
				<Input
					id={nameId}
					type="text"
					label="Name"
					value={form.name}
					disabled={!canEdit}
					onChange={(event) =>
						setForm((prev) => ({ ...prev, name: event.target.value }))
					}
					error={formErrors.name}
					placeholder="Engineering team"
				/>
				<TextArea
					id={descriptionId}
					label="Description"
					value={form.description}
					disabled={!canEdit}
					onChange={(event) =>
						setForm((prev) => ({
							...prev,
							description: event.target.value,
						}))
					}
					placeholder="What this group is for"
					error={formErrors.description}
				/>
				{canEdit ? (
					<div className="flex justify-end">
						<Button onClick={handleSubmit} disabled={isSaving || isSubmitting}>
							{isSaving || isSubmitting ? "Saving..." : "Save settings"}
						</Button>
					</div>
				) : null}
			</div>
		</Card>
	);
}
