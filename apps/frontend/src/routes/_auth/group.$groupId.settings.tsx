import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ROLES } from "@urlshortener/common/constants";
import { z } from "zod";
import { GroupSettingsCard } from "../../components/group/group-settings.card";
import { useGroupDetails } from "../../hooks/query/groups.hook";
import { type UpdateGroupBody, updateGroup } from "../../libs/api/groups.api";
import { queryClient } from "../../libs/queryClient";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

export const Route = createFileRoute("/_auth/group/$groupId/settings")({
	params: {
		parse: (params) => groupIdParamsSchema.parse(params),
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	const { data: groupData } = useGroupDetails(groupId);
	const group = groupData?.data;

	const currentMemberRole = group?.currentUserRole ?? null;
	const canEdit =
		currentMemberRole === ROLES.OWNER || currentMemberRole === ROLES.ADMIN;

	const { mutateAsync, isPending } = useMutation({
		mutationKey: ["groups", groupId, "update"],
		mutationFn: (body: UpdateGroupBody) => updateGroup(groupId, body),
	});

	const handleSubmit = async (body: UpdateGroupBody) => {
		await mutateAsync(body);
		await queryClient.invalidateQueries({ queryKey: ["groups"] });
		await queryClient.invalidateQueries({
			queryKey: ["groups", groupId, "details"],
		});
	};

	return (
		<GroupSettingsCard
			name={group?.name ?? ""}
			description={group?.description ?? ""}
			canEdit={canEdit}
			isSubmitting={isPending}
			onSubmit={handleSubmit}
		/>
	);
}
