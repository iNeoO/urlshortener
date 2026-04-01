import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { ROLES } from "@urlshortener/common/constants";
import { useId, useMemo, useState } from "react";
import { z } from "zod";
import { GroupHeader } from "../../components/group/group-header";
import { GroupSettingsCard } from "../../components/group/group-settings.card";
import { Button } from "../../components/ui/button";
import { ErrorMessage } from "../../components/ui/error-message";
import { TabPanel } from "../../components/ui/tab-panel";
import { useGroupDetails } from "../../hooks/query/groups.hook";
import {
	removeGroupMember,
	type UpdateGroupBody,
	updateGroup,
} from "../../libs/api/groups.api";
import { queryClient } from "../../libs/queryClient";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

type GroupTab = "urls" | "members" | "invitations";

export const Route = createFileRoute("/_auth/group/$groupId")({
	params: {
		parse: (params) => groupIdParamsSchema.parse(params),
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	const groupDetailsId = useId();
	const navigate = Route.useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const authUserId = Route.useRouteContext({
		select: (context) => context.auth.user?.id,
	});

	const activeTab = useMemo<GroupTab>(() => {
		if (pathname.endsWith("/members")) return "members";
		if (pathname.endsWith("/invitations")) return "invitations";
		return "urls";
	}, [pathname]);

	const { data: groupData, isError, error } = useGroupDetails(groupId);
	const [actionError, setActionError] = useState<string | null>(null);

	const group = groupData?.data;
	const currentMemberRole = group?.currentUserRole ?? null;
	const canEditSettings =
		currentMemberRole === ROLES.OWNER || currentMemberRole === ROLES.ADMIN;

	const { mutateAsync: mutateUpdateGroup, isPending: isPendingUpdate } =
		useMutation({
			mutationKey: ["groups", groupId, "update"],
			mutationFn: (body: UpdateGroupBody) => updateGroup(groupId, body),
		});

	const { mutateAsync: mutateLeaveGroup, isPending: isPendingLeave } =
		useMutation({
			mutationKey: ["groups", groupId, "leave"],
			mutationFn: () => {
				if (!authUserId) throw new Error("User not found");
				return removeGroupMember({ groupId, userId: authUserId });
			},
		});

	const handleUpdateSettings = async (body: UpdateGroupBody) => {
		setActionError(null);
		try {
			await mutateUpdateGroup(body);
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
			await queryClient.invalidateQueries({
				queryKey: ["groups", groupId, "details"],
			});
		} catch (mutationError) {
			setActionError(
				mutationError instanceof Error
					? mutationError.message
					: "Failed to update group",
			);
		}
	};

	const handleLeaveGroup = async () => {
		const confirmed = window.confirm(
			"Leave this group? You will lose access immediately.",
		);
		if (!confirmed) return;

		setActionError(null);
		try {
			await mutateLeaveGroup();
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
			navigate({ to: "/groups" });
		} catch (mutationError) {
			setActionError(
				mutationError instanceof Error
					? mutationError.message
					: "Failed to leave group",
			);
		}
	};

	return (
		<div className="space-y-4 p-6">
			<GroupHeader
				title={group?.name ?? "Group"}
				breadcrumbItems={[
					{ label: "Groups", to: "/groups" },
					{ label: group?.name ?? "Details" },
				]}
				actions={
					currentMemberRole && currentMemberRole !== ROLES.OWNER ? (
						<Button
							className="bg-rose-600 text-white hover:bg-rose-500"
							onClick={handleLeaveGroup}
							disabled={isPendingLeave}
						>
							{isPendingLeave ? "Leaving..." : "Leave group"}
						</Button>
					) : null
				}
			/>

			{isError ? (
				<ErrorMessage
					message={`Failed to load group: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}
			{actionError ? <ErrorMessage message={actionError} /> : null}

			<GroupSettingsCard
				name={group?.name ?? ""}
				description={group?.description ?? ""}
				canEdit={canEditSettings}
				isSubmitting={isPendingUpdate}
				onSubmit={handleUpdateSettings}
			/>

			<TabPanel
				id={groupDetailsId}
				tabs={[
					{ id: "urls", label: "URLs" },
					{ id: "members", label: "Members" },
					...(currentMemberRole === ROLES.OWNER ||
					currentMemberRole === ROLES.ADMIN
						? ([{ id: "invitations", label: "Invitations" }] as const)
						: []),
				]}
				activeTab={activeTab}
				onChange={(tab) => {
					if (tab === "urls") {
						navigate({ to: "/group/$groupId/urls", params: { groupId } });
						return;
					}
					if (tab === "invitations") {
						navigate({
							to: "/group/$groupId/invitations",
							params: { groupId },
						});
						return;
					}
					navigate({ to: "/group/$groupId/members", params: { groupId } });
				}}
			/>

			<Outlet />
		</div>
	);
}
