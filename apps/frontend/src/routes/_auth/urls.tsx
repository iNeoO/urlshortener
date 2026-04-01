import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ROLES } from "@urlshortener/common/constants";
import { useEffect, useMemo, useState } from "react";
import { GroupHeader } from "../../components/group/group-header";
import { ErrorMessage } from "../../components/ui/error-message";
import { UrlsTable } from "../../components/urls/urls.table";
import { useProfileGroups } from "../../hooks/query/profile.hook";
import { useUrls } from "../../hooks/query/urls.hook";
import { useDebounce } from "../../hooks/useDebounce.hook";
import { ALLOWED_URL_SORTS } from "../../utils/dataTable/urlsSorts";
import { createListSearchParamsSchema } from "../../utils/listSearchParamsSchema";

const TABLE_DEFAULT_LIMIT = 10;
const TABLE_DEFAULT_OFFSET = 0;

const urlsSearchSchema = createListSearchParamsSchema(ALLOWED_URL_SORTS);

export const Route = createFileRoute("/_auth/urls")({
	validateSearch: zodValidator(urlsSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isUrlDetailsRoute = pathname.startsWith("/urls/");
	if (isUrlDetailsRoute) {
		return <Outlet />;
	}

	return <UrlsListPage />;
}

function UrlsListPage() {
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
				offset: String(0),
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

	const { data, isLoading, isError, error } = useUrls(queryParams);
	const { data: profileGroupsData } = useProfileGroups();
	const canCreateUrl = (profileGroupsData?.data ?? []).some(
		(group) =>
			group.role === ROLES.OWNER ||
			group.role === ROLES.ADMIN ||
			group.role === ROLES.MEMBER,
	);

	return (
		<div className="space-y-4 p-6">
			<GroupHeader title="URLs" breadcrumbItems={[{ label: "URLs" }]} />

			{isError ? (
				<ErrorMessage
					message={`Failed to load urls: ${error?.message ?? "Unknown error"}`}
				/>
			) : null}

			<UrlsTable
				data={data?.data ?? []}
				total={data?.total}
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
				order={searchParams.order}
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
				showCreateButton={canCreateUrl}
			/>
		</div>
	);
}
