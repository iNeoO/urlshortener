import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ROLES } from "@urlshortener/common/constants";
import type { GetGroupMembersQuery, Role } from "@urlshortener/common/types";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { InviteMemberModal } from "../../components/group/invite-member.modal";
import { MembersTable } from "../../components/group/members.table";
import { ErrorMessage } from "../../components/ui/error-message";
import {
	useGroupDetails,
	useGroupMembers,
} from "../../hooks/query/groups.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { updateGroupMemberRole } from "../../libs/api/groups.api";
import { queryClient } from "../../libs/queryClient";
import { normalizeListSearchParams } from "../../utils/normalizeListSearchParams";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;
const ALLOWED_SORTS: readonly NonNullable<GetGroupMembersQuery["sort"]>[] = [
	"createdAt",
	"name",
	"email",
	"role",
];

const normalizeSearchParams = (
	search: Record<string, unknown>,
): Partial<GetGroupMembersQuery> =>
	normalizeListSearchParams<GetGroupMembersQuery>(search, {
		allowedSorts: ALLOWED_SORTS,
	});

export const Route = createFileRoute("/_auth/group/$groupId/members")({
	params: {
		parse: (params) => groupIdParamsSchema.parse(params),
	},
	validateSearch: normalizeSearchParams,
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();
	const authUserId = Route.useRouteContext({
		select: (context) => context.auth.user?.id,
	});

	const [search, setSearch] = useState(searchParams.search ?? "");
	const debouncedSearch = useDebounce(search, 400);
	useEffect(() => {
		const nextSearch = debouncedSearch.trim();
		if (nextSearch === (searchParams.search ?? "")) {
			return;
		}
		navigate({
			search: (prev) => ({
				...prev,
				search: nextSearch || undefined,
				offset: 0,
			}),
			replace: true,
		});
	}, [debouncedSearch, navigate, searchParams.search]);

	const groupQueryParams = useMemo(
		() => ({
			limit: searchParams.limit,
			offset: searchParams.offset,
			sort: searchParams.sort,
			order: searchParams.order,
			...(searchParams.search ? { search: searchParams.search } : {}),
		}),
		[searchParams],
	);

	const {
		data: groupData,
		isError: isGroupError,
		error: groupError,
	} = useGroupDetails(groupId);
	const {
		data: membersData,
		isLoading: isMembersLoading,
		isError: isMembersError,
		error: membersError,
	} = useGroupMembers(groupId, groupQueryParams);
	const [actionError, setActionError] = useState<string | null>(null);

	const currentMemberRole = groupData?.data.currentUserRole ?? null;

	const { mutateAsync: mutateUpdateRole, isPending: isPendingRoleUpdate } =
		useMutation({
			mutationKey: ["groups", groupId, "members", "update-role"],
			mutationFn: (params: { userId: string; role: Exclude<Role, "OWNER"> }) =>
				updateGroupMemberRole({
					groupId,
					userId: params.userId,
					body: { role: params.role },
				}),
		});
	const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

	const handleUpdateMemberRole = async (params: {
		userId: string;
		role: Exclude<Role, "OWNER">;
	}) => {
		setActionError(null);
		setUpdatingUserId(params.userId);
		try {
			await mutateUpdateRole(params);
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
			await queryClient.invalidateQueries({
				queryKey: ["groups", groupId, "members"],
			});
		} catch (mutationError) {
			setActionError(
				mutationError instanceof Error
					? mutationError.message
					: "Failed to update member role",
			);
		} finally {
			setUpdatingUserId(null);
		}
	};

	return (
		<>
			{isGroupError || isMembersError ? (
				<ErrorMessage
					message={`Failed to load members: ${
						groupError?.message ?? membersError?.message ?? "Unknown error"
					}`}
				/>
			) : null}
			{actionError ? <ErrorMessage message={actionError} /> : null}
			<MembersTable
				members={membersData?.data ?? []}
				total={membersData?.total ?? 0}
				search={search}
				onSearchChange={setSearch}
				limit={searchParams.limit ?? TABLE_DEFAULT_LIMIT}
				offset={searchParams.offset ?? TABLE_DEFAULT_OFFSET}
				onOffsetChange={(nextOffset) =>
					navigate({
						search: (prev) => ({ ...prev, offset: nextOffset }),
						replace: true,
					})
				}
				onLimitChange={(nextLimit) =>
					navigate({
						search: (prev) => ({ ...prev, limit: nextLimit, offset: 0 }),
						replace: true,
					})
				}
				sort={searchParams.sort}
				order={searchParams.order}
				currentUserId={authUserId}
				currentUserRole={currentMemberRole}
				onUpdateRole={handleUpdateMemberRole}
				updatingUserId={isPendingRoleUpdate ? updatingUserId : null}
				onSortChange={({ sort, order }) =>
					navigate({
						search: (prev) => ({
							...prev,
							sort: sort as GetGroupMembersQuery["sort"] | undefined,
							order,
							offset: 0,
						}),
						replace: true,
					})
				}
				isLoading={isMembersLoading}
				headerActions={
					currentMemberRole === ROLES.OWNER ||
					currentMemberRole === ROLES.ADMIN ? (
						<InviteMemberModal
							groupId={groupId}
							currentUserRole={currentMemberRole}
						/>
					) : undefined
				}
			/>
		</>
	);
}
