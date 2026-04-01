import { useMutation } from "@tanstack/react-query";
import { API_ERROR, ROLES } from "@urlshortener/common/constants";
import type { Role } from "@urlshortener/common/types";
import { useState } from "react";
import { z } from "zod";
import { ApiError } from "../../libs/api/apiError";
import type { CreateGroupInvitationBody } from "../../libs/api/groups.api";
import { createGroupInvitation } from "../../libs/api/groups.api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Select } from "../ui/select";

const inviteSchema = z.object({
	email: z.email(),
});

type InviteMemberModalProps = {
	groupId: string;
	currentUserRole: Role;
};

export function InviteMemberModal({
	groupId,
	currentUserRole,
}: InviteMemberModalProps) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<CreateGroupInvitationBody["role"]>(
		ROLES.MEMBER,
	);
	const [emailError, setEmailError] = useState<string | undefined>();
	const [actionError, setActionError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const roleOptions =
		currentUserRole === ROLES.OWNER
			? [
					{ label: "Admin", value: ROLES.ADMIN },
					{ label: "Write", value: ROLES.MEMBER },
					{ label: "Read", value: ROLES.GUEST },
				]
			: [
					{ label: "Write", value: ROLES.MEMBER },
					{ label: "Read", value: ROLES.GUEST },
				];
	const { mutateAsync, isPending } = useMutation({
		mutationKey: ["groups", groupId, "invite"],
		mutationFn: (inviteEmail: string) =>
			createGroupInvitation({
				groupId,
				body: { email: inviteEmail, role },
			}),
	});

	const handleClose = () => {
		setOpen(false);
		setEmail("");
		setRole(ROLES.MEMBER);
		setEmailError(undefined);
		setActionError(null);
		setSuccessMessage(null);
	};

	const handleInvite = async () => {
		setEmailError(undefined);
		setActionError(null);
		setSuccessMessage(null);

		const parsed = inviteSchema.safeParse({ email: email.trim() });
		if (!parsed.success) {
			setEmailError(parsed.error.issues[0]?.message ?? "Invalid email");
			return;
		}

		try {
			await mutateAsync(parsed.data.email);
			setSuccessMessage("Invitation sent.");
		} catch (error) {
			if (error instanceof ApiError) {
				if (error.code === API_ERROR.USER_ALREADY_IN_GROUP) {
					setEmailError(error.message);
					return;
				}
				setActionError(error.message);
				return;
			}
			setActionError(
				error instanceof Error ? error.message : "Failed to invite",
			);
		}
	};

	return (
		<>
			<Button variant="primary" onClick={() => setOpen(true)}>
				Add member
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				title="Invite member"
				footer={
					<>
						<Button
							variant="secondary"
							onClick={handleClose}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button onClick={handleInvite} disabled={isPending}>
							{isPending ? "Sending..." : "Send invitation"}
						</Button>
					</>
				}
			>
				<div className="space-y-3">
					<Input
						label="Email"
						type="email"
						placeholder="user@example.com"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						error={emailError}
					/>
					<Select
						label="Role"
						value={role}
						onChange={(nextRole) =>
							setRole(nextRole as CreateGroupInvitationBody["role"])
						}
						options={roleOptions}
					/>
					{actionError ? (
						<p className="text-sm text-red-600">{actionError}</p>
					) : null}
					{successMessage ? (
						<p className="text-sm text-emerald-600">{successMessage}</p>
					) : null}
				</div>
			</Modal>
		</>
	);
}
