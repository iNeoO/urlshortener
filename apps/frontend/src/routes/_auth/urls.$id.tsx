import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { GroupHeader } from "../../components/group/group-header";
import { StatsBreakdownCard } from "../../components/home/stats-breakdown.card";
import { TotalClicksCard } from "../../components/home/total-clicks.card";
import { SegmentedTabs } from "../../components/ui/segmented-tabs";
import {
	useBrowsersStats,
	useDevicesStats,
	useOsStats,
	useReferrersStats,
} from "../../hooks/query/stats.hook";
import type { StatsRange } from "../../libs/api/stats.api";
import {
	formatStatsRangeLabel,
	STATS_RANGE_OPTIONS,
} from "../../libs/statsRange";

const urlParamsSchema = z.object({
	id: z.string().min(1),
});

const statsSearchSchema = z.object({
	range: z.enum(["1h", "24h", "7d", "30d"]).default("1h"),
});

export const Route = createFileRoute("/_auth/urls/$id")({
	params: {
		parse: (params) => urlParamsSchema.parse(params),
	},
	validateSearch: zodValidator(statsSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { range } = Route.useSearch();
	const navigate = Route.useNavigate();
	const rangeLabel = formatStatsRangeLabel(range);
	const browsersStats = useBrowsersStats(range, id);
	const osStats = useOsStats(range, id);
	const devicesStats = useDevicesStats(range, id);
	const referrersStats = useReferrersStats(range, id);

	return (
		<div className="w-full px-6 py-6">
			<GroupHeader
				title="URL Analytics"
				breadcrumbItems={[
					{ label: "URLs", to: "/urls" },
					{ label: `URL ${id}` },
				]}
			/>
			<div className="space-y-4">
				<div className="flex justify-end">
					<SegmentedTabs
						options={STATS_RANGE_OPTIONS}
						value={range}
						onChange={(nextRange: StatsRange) =>
							navigate({
								search: (prev) => ({ ...prev, range: nextRange }),
								replace: true,
							})
						}
						ariaLabel="URL stats range"
					/>
				</div>
				<TotalClicksCard
					urlId={id}
					range={range}
					title="URL Total Clicks"
					subtitle={`Based on this URL in the ${rangeLabel}`}
				/>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<StatsBreakdownCard
						title="Browsers"
						subtitle={`Top browsers in the ${rangeLabel}`}
						data={browsersStats.data?.data ?? []}
						isLoading={browsersStats.isLoading}
						isError={browsersStats.isError}
						errorMessage={browsersStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Operating systems"
						subtitle={`Top operating systems in the ${rangeLabel}`}
						data={osStats.data?.data ?? []}
						isLoading={osStats.isLoading}
						isError={osStats.isError}
						errorMessage={osStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Devices"
						subtitle={`Top devices in the ${rangeLabel}`}
						data={devicesStats.data?.data ?? []}
						isLoading={devicesStats.isLoading}
						isError={devicesStats.isError}
						errorMessage={devicesStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Referrers"
						subtitle={`Top referrers in the ${rangeLabel}`}
						data={referrersStats.data?.data ?? []}
						isLoading={referrersStats.isLoading}
						isError={referrersStats.isError}
						errorMessage={referrersStats.error?.message}
					/>
				</div>
			</div>
		</div>
	);
}
