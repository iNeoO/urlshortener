import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CampaignClicksLastHourChart } from "../components/campaigns.chart";
import { CampaignsTable } from "../components/campaigns.table";
import { useCampaigns } from "../hooks/query/campaigns.hook";
import { useDebounce } from "../hooks/useDebounce";

type CampaignsSearchParams = {
	limit?: number;
	offset?: number;
	order?: "asc" | "desc";
	search?: string;
};

const DEFAULT_QUERY_PARAMS: CampaignsSearchParams = {
	limit: 10,
	offset: 0,
	order: "desc",
};

const normalizeSearchParams = (
	search: Record<string, unknown>,
): CampaignsSearchParams => {
	const limit = Number(search.limit);
	const offset = Number(search.offset);
	const order = search.order;
	const searchTerm =
		typeof search.search === "string" ? search.search.trim() : "";

	return {
		limit:
			Number.isFinite(limit) && limit >= 1 && limit <= 100
				? limit
				: DEFAULT_QUERY_PARAMS.limit,
		offset:
			Number.isFinite(offset) && offset >= 0
				? offset
				: DEFAULT_QUERY_PARAMS.offset,
		order:
			order === "asc" || order === "desc" ? order : DEFAULT_QUERY_PARAMS.order,
		...(searchTerm ? { search: searchTerm } : {}),
	};
};

export const Route = createFileRoute("/")({
	validateSearch: normalizeSearchParams,
	component: Index,
});

function Index() {
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
			}),
			replace: true,
		});
	}, [debouncedSearch, navigate, searchParams.search]);

	const queryParams = useMemo(
		() => ({
			limit: searchParams.limit,
			offset: searchParams.offset,
			order: searchParams.order,
			...(searchParams.search ? { search: searchParams.search } : {}),
		}),
		[searchParams],
	);

	const { data, isLoading, isError, error } = useCampaigns(queryParams);

	return (
		<div className="space-y-4 p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-2xl font-semibold text-slate-900">Campaigns</h1>
				<Link
					to="/createShortenurl"
					className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
				>
					Create short URL
				</Link>
			</div>

			{isError ? (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					Failed to load campaigns: {error?.message ?? "Unknown error"}
				</div>
			) : null}

			<CampaignClicksLastHourChart />

			<CampaignsTable
				data={data?.data ?? []}
				total={data?.total}
				search={search}
				onSearchChange={setSearch}
				isLoading={isLoading}
			/>
		</div>
	);
}
