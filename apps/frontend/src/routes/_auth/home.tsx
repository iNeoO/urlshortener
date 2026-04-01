import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { LastWindowCountsTable } from "../../components/home/last-window-counts.table";
import { StatsBreakdownCard } from "../../components/home/stats-breakdown.card";
import { TotalClicksCard } from "../../components/home/total-clicks.card.tsx";
import { AuthHeaderPortal } from "../../components/layout/auth-header.portal";
import { SegmentedTabs } from "../../components/ui/segmented-tabs";
import {
	useBrowsersStats,
	useDevicesStats,
	useOsStats,
	useReferrersStats,
} from "../../hooks/query/stats.hook";
import { useLastWindowCounts } from "../../hooks/query/urls.hook";
import type { StatsRange } from "../../libs/api/stats.api";
import {
	formatStatsRangeLabel,
	STATS_RANGE_OPTIONS,
} from "../../libs/statsRange";

const statsSearchSchema = z.object({
	range: z.enum(["1h", "24h", "7d", "30d"]).default("1h"),
});

export const Route = createFileRoute("/_auth/home")({
	beforeLoad: ({ context }) => {
		const { isAuthenticated } = context.auth;
		if (!isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	validateSearch: zodValidator(statsSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const { range } = Route.useSearch();
	const navigate = Route.useNavigate();
	const rangeLabel = formatStatsRangeLabel(range);
	const browsersStats = useBrowsersStats(range);
	const osStats = useOsStats(range);
	const devicesStats = useDevicesStats(range);
	const referrersStats = useReferrersStats(range);
	const lastWindowCounts = useLastWindowCounts();

	return (
		<div className="w-full px-6 py-6">
			<AuthHeaderPortal>
				<div>
					<h1 className="text-2xl font-semibold text-(--color-text)">
						Welcome
					</h1>
					<p className="mt-1 text-sm text-(--color-muted)">
						Live stats based on your current workspace.
					</p>
				</div>
			</AuthHeaderPortal>
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
						ariaLabel="Stats range"
					/>
				</div>
				<TotalClicksCard range={range} />
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
				<LastWindowCountsTable
					data={lastWindowCounts.data?.data ?? []}
					isLoading={lastWindowCounts.isLoading}
					isError={lastWindowCounts.isError}
					errorMessage={lastWindowCounts.error?.message}
				/>
			</div>
		</div>
	);
}
