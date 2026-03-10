import { createFileRoute } from "@tanstack/react-router";
import { ROLES } from "@urlshortener/common/constants";
import type { GetGroupUrlsQuery } from "@urlshortener/common/types";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ErrorMessage } from "../../components/ui/error-message";
import { UrlsTable } from "../../components/urls/urls.table";
import { useGroupDetails, useGroupUrls } from "../../hooks/query/groups.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { normalizeListSearchParams } from "../../utils/normalizeListSearchParams";

const groupIdParamsSchema = z.object({
	groupId: z.uuidv7(),
});

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;
const ALLOWED_SORTS: readonly NonNullable<GetGroupUrlsQuery["sort"]>[] = [
	"createdAt",
	"name",
	"description",
];

const normalizeSearchParams = (
	search: Record<string, unknown>,
): Partial<GetGroupUrlsQuery> =>
	normalizeListSearchParams<GetGroupUrlsQuery>(search, {
		allowedSorts: ALLOWED_SORTS,
	});

export const Route = createFileRoute("/_auth/group/$groupId/urls")({
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

	const { data, isLoading, isError, error } = useGroupUrls(
		groupId,
		queryParams,
	);
	const { data: groupData } = useGroupDetails(groupId);
	const currentUserRole = groupData?.data.currentUserRole ?? null;
	const canCreateUrl =
		currentUserRole === ROLES.OWNER ||
		currentUserRole === ROLES.ADMIN ||
		currentUserRole === ROLES.MEMBER;

	return (
		<>
			{isError ? (
				<ErrorMessage
					message={`Failed to load urls: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}
			<UrlsTable
				data={data?.data ?? []}
				total={data?.total ?? 0}
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
				onSortChange={(next) =>
					navigate({
						search: (prev) => ({
							...prev,
							sort: next.sort,
							order: next.order,
							offset: 0,
						}),
						replace: true,
					})
				}
				isLoading={isLoading}
				showCreateButton={canCreateUrl}
			/>
		</>
	);
}
