import { createFileRoute, useRouter } from "@tanstack/react-router";
import { PatchProfileMeJsonSchema } from "@urlshortener/common/schema";
import { useEffect, useId, useState } from "react";
import { z } from "zod";
import { AuthHeaderPortal } from "../../components/layout/auth-header.portal";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ErrorMessage } from "../../components/ui/error-message";
import { Input } from "../../components/ui/input";
import { useProfile, useUpdateProfile } from "../../hooks/query/profile.hook";
import { useZodForm } from "../../hooks/useZodForm.hook";

const updatePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, "Current password must be at least 8 characters."),
		newPassword: z
			.string()
			.min(8, "New password must be at least 8 characters."),
		confirmNewPassword: z.string().min(1, "Please confirm your new password."),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		path: ["confirmNewPassword"],
		message: "Passwords do not match.",
	});

export const Route = createFileRoute("/_auth/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const auth = Route.useRouteContext({
		select: (context) => context.auth,
	});
	const router = useRouter();
	const nameId = useId();
	const currentPasswordId = useId();
	const newPasswordId = useId();
	const confirmNewPasswordId = useId();
	const { data: profileResponse } = useProfile();
	const updateProfileMutation = useUpdateProfile();

	const [name, setName] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [nameErrorMessage, setNameErrorMessage] = useState<string | null>(null);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState<
		string | null
	>(null);
	const [nameSuccessMessage, setNameSuccessMessage] = useState<string | null>(
		null,
	);
	const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<
		string | null
	>(null);
	const [isPendingLogout, setIsPendingLogout] = useState(false);

	const { fieldErrors: nameErrors, safeParseWithFieldErrors: safeParseName } =
		useZodForm(["name"] as const);
	const {
		fieldErrors: passwordErrors,
		safeParseWithFieldErrors: safeParsePassword,
	} = useZodForm([
		"currentPassword",
		"newPassword",
		"confirmNewPassword",
	] as const);

	useEffect(() => {
		if (profileResponse?.data.name) {
			setName(profileResponse.data.name);
		}
	}, [profileResponse?.data.name]);

	const handleNameSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setNameErrorMessage(null);
		setNameSuccessMessage(null);

		const parsed = safeParseName(
			PatchProfileMeJsonSchema.pick({ name: true }),
			{
				name: name.trim(),
			},
		);
		if (!parsed.success) return;

		try {
			await updateProfileMutation.mutateAsync({ name: parsed.data.name });
			setNameSuccessMessage("Name updated.");
		} catch (error) {
			setNameErrorMessage(
				error instanceof Error ? error.message : "Failed to update name",
			);
		}
	};

	const handlePasswordSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setPasswordErrorMessage(null);
		setPasswordSuccessMessage(null);

		const parsed = safeParsePassword(updatePasswordSchema, {
			currentPassword,
			newPassword,
			confirmNewPassword,
		});
		if (!parsed.success) return;

		try {
			await updateProfileMutation.mutateAsync({
				currentPassword: parsed.data.currentPassword,
				newPassword: parsed.data.newPassword,
			});
			setCurrentPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
			setPasswordSuccessMessage("Password updated.");
		} catch (error) {
			setPasswordErrorMessage(
				error instanceof Error ? error.message : "Failed to update password",
			);
		}
	};

	const handleLogout = async () => {
		setIsPendingLogout(true);
		await auth.logout();
		setIsPendingLogout(false);
		router.navigate({ to: "/login" });
	};

	return (
		<div className="w-full space-y-6 p-6">
			<AuthHeaderPortal>
				<div>
					<h1 className="text-2xl font-semibold text-(--color-text)">
						Settings
					</h1>
					<p className="mt-1 text-sm text-(--color-muted)">
						Update your account details.
					</p>
				</div>
			</AuthHeaderPortal>

			<Card>
				<h2 className="text-lg font-semibold text-(--color-text)">
					Display name
				</h2>
				<p className="mt-1 text-sm text-(--color-muted)">
					Choose how your name appears across the app.
				</p>
				<form onSubmit={handleNameSubmit} className="mt-4 space-y-4">
					<Input
						id={nameId}
						label="Name"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						error={nameErrors.name}
					/>
					{nameErrorMessage ? (
						<ErrorMessage message={nameErrorMessage} />
					) : null}
					{nameSuccessMessage ? (
						<ErrorMessage message={nameSuccessMessage} variant="success" />
					) : null}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={updateProfileMutation.isPending}
							className="min-w-28 justify-center"
						>
							{updateProfileMutation.isPending ? "Saving..." : "Save name"}
						</Button>
					</div>
				</form>
			</Card>

			<Card>
				<h2 className="text-lg font-semibold text-(--color-text)">Password</h2>
				<p className="mt-1 text-sm text-(--color-muted)">
					Enter your current password to set a new one.
				</p>
				<form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
					<Input
						id={currentPasswordId}
						label="Current password"
						type="password"
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						error={passwordErrors.currentPassword}
					/>
					<Input
						id={newPasswordId}
						label="New password"
						type="password"
						value={newPassword}
						onChange={(event) => setNewPassword(event.target.value)}
						error={passwordErrors.newPassword}
					/>
					<Input
						id={confirmNewPasswordId}
						label="Confirm new password"
						type="password"
						value={confirmNewPassword}
						onChange={(event) => setConfirmNewPassword(event.target.value)}
						error={passwordErrors.confirmNewPassword}
					/>
					{passwordErrorMessage ? (
						<ErrorMessage message={passwordErrorMessage} />
					) : null}
					{passwordSuccessMessage ? (
						<ErrorMessage message={passwordSuccessMessage} variant="success" />
					) : null}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={updateProfileMutation.isPending}
							className="min-w-36 justify-center"
						>
							{updateProfileMutation.isPending
								? "Updating..."
								: "Update password"}
						</Button>
					</div>
				</form>
			</Card>

			<Card>
				<h2 className="text-lg font-semibold text-(--color-text)">Sign out</h2>
				<p className="mt-1 text-sm text-(--color-muted)">
					End your current session on this device. You can sign back in any
					time.
				</p>
				<div className="mt-4 flex justify-end">
					<Button
						type="button"
						variant="secondary"
						onClick={handleLogout}
						disabled={isPendingLogout}
						className="min-w-28 justify-center"
					>
						{isPendingLogout ? "Signing out..." : "Sign out"}
					</Button>
				</div>
			</Card>
		</div>
	);
}
