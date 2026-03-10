import { createFileRoute } from "@tanstack/react-router";
import type { GetGroupsQuery } from "@urlshortener/common/types";
import { useEffect, useMemo, useState } from "react";
import { GroupHeader } from "../../components/group/group-header";
import { GroupsTable } from "../../components/group/groups.table";
import { ErrorMessage } from "../../components/ui/error-message";
import { Link } from "../../components/ui/link";
import { useGroups } from "../../hooks/query/groups.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { ALLOWED_GROUP_SORTS } from "../../utils/dataTable/groupsSorts";
import { normalizeListSearchParams } from "../../utils/normalizeListSearchParams";

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;
const TABLE_DEFAULT_ORDER: NonNullable<GetGroupsQuery["order"]> = "desc";

const normalizeSearchParams = (
	search: Record<string, unknown>,
): Partial<GetGroupsQuery> =>
	normalizeListSearchParams<GetGroupsQuery>(search, {
		allowedSorts: ALLOWED_GROUP_SORTS,
	});

export const Route = createFileRoute("/_auth/groups")({
	validateSearch: normalizeSearchParams,
	component: RouteComponent,
});

function RouteComponent() {
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

	const { data, isLoading, isError, error } = useGroups(queryParams);

	return (
		<div className="space-y-4 p-6">
			<GroupHeader title="Groups" breadcrumbItems={[{ label: "Groups" }]} />

			{isError ? (
				<ErrorMessage
					message={`Failed to load groups: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}
			<GroupsTable
				data={data?.data ?? []}
				total={data?.total}
				search={search}
				onSearchChange={setSearch}
				limit={searchParams.limit ?? TABLE_DEFAULT_LIMIT}
				offset={searchParams.offset ?? TABLE_DEFAULT_OFFSET}
				sort={searchParams.sort}
				order={searchParams.order ?? TABLE_DEFAULT_ORDER}
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
				headerActions={
					<Link to="/create-group" variant="primary">
						Create group
					</Link>
				}
			/>
		</div>
	);
}
