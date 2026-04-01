import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ROLES } from "@urlshortener/common/constants";
import type { GetGroupInvitationsQuery } from "@urlshortener/common/types";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { GroupInvitationsTable } from "../../components/group/group-invitations.table";
import { ErrorMessage } from "../../components/ui/error-message";
import {
	useGroupDetails,
	useGroupInvitations,
} from "../../hooks/query/groups.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { ALLOWED_GROUP_INVITATION_SORTS } from "../../utils/dataTable/invitationsSorts";
import { createListSearchParamsSchema } from "../../utils/listSearchParamsSchema";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;
const TABLE_DEFAULT_ORDER: NonNullable<GetGroupInvitationsQuery["order"]> =
	"desc";

const groupInvitationsSearchSchema = createListSearchParamsSchema(
	ALLOWED_GROUP_INVITATION_SORTS,
);

export const Route = createFileRoute("/_auth/group/$groupId/invitations")({
	params: {
		parse: (params) => groupIdParamsSchema.parse(params),
	},
	validateSearch: zodValidator(groupInvitationsSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	const navigate = Route.useNavigate();
	const { data: groupData } = useGroupDetails(groupId);
	const currentUserRole = groupData?.data.currentUserRole ?? null;

	useEffect(() => {
		if (
			currentUserRole === ROLES.OWNER ||
			currentUserRole === ROLES.ADMIN ||
			currentUserRole === null
		) {
			return;
		}
		navigate({ to: "/groups", replace: true });
	}, [currentUserRole, navigate]);

	if (
		currentUserRole !== ROLES.OWNER &&
		currentUserRole !== ROLES.ADMIN &&
		currentUserRole !== null
	) {
		return null;
	}

	return <GroupInvitationsContent groupId={groupId} />;
}

function GroupInvitationsContent({ groupId }: { groupId: string }) {
	const searchParams = Route.useSearch();
	const navigate = Route.useNavigate();
	const [search, setSearch] = useState(searchParams.search ?? "");
	const debouncedSearch = useDebounce(search, 400);

	const queryParams = useMemo(
		() => ({
			limit: searchParams.limit,
			offset: searchParams.offset,
			sort: searchParams.sort,
			order: searchParams.order,
			...(searchParams.search ? { search: searchParams.search } : {}),
		}),
		[searchParams],
	);

	const { data, isLoading, isError, error } = useGroupInvitations(
		groupId,
		queryParams,
	);

	useEffect(() => {
		const nextSearch = debouncedSearch.trim();
		if (nextSearch === (searchParams.search ?? "")) {
			return;
		}
		navigate({
			search: (prev) => ({
				...prev,
				search: nextSearch || undefined,
				offset: String(0),
			}),
			replace: true,
		});
	}, [debouncedSearch, navigate, searchParams.search]);

	return (
		<>
			{isError ? (
				<ErrorMessage
					message={`Failed to load invitations: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}
			<GroupInvitationsTable
				data={data?.data ?? []}
				total={data?.data?.length ?? 0}
				search={search}
				onSearchChange={setSearch}
				limit={
					Number.isNaN(Number(searchParams.limit))
						? TABLE_DEFAULT_LIMIT
						: Number(searchParams.limit)
				}
				offset={
					Number.isNaN(Number(searchParams.offset))
						? TABLE_DEFAULT_OFFSET
						: Number(searchParams.offset)
				}
				sort={searchParams.sort}
				order={searchParams.order ?? TABLE_DEFAULT_ORDER}
				onOffsetChange={(nextOffset) =>
					navigate({
						search: (prev) => ({ ...prev, offset: String(nextOffset) }),
						replace: true,
					})
				}
				onLimitChange={(nextLimit) =>
					navigate({
						search: (prev) => ({
							...prev,
							limit: String(nextLimit),
							offset: String(0),
						}),
						replace: true,
					})
				}
				onSortChange={(next) =>
					navigate({
						search: (prev) => ({
							...prev,
							sort: next.sort,
							order: next.order,
							offset: String(0),
						}),
						replace: true,
					})
				}
				isLoading={isLoading}
			/>
		</>
	);
}
