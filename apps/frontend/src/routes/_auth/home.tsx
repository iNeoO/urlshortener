import { createFileRoute, redirect } from "@tanstack/react-router";
import { LastWindowCountsTable } from "../../components/home/last-window-counts.table";
import { StatsBreakdownCard } from "../../components/home/stats-breakdown.card";
import { TotalClicksCard } from "../../components/home/total-clicks.card.tsx";
import { AuthHeaderPortal } from "../../components/layout/auth-header.portal";
import {
	useBrowsersStats,
	useDevicesStats,
	useOsStats,
	useReferrersStats,
} from "../../hooks/query/stats.hook";
import { useLastWindowCounts } from "../../hooks/query/urls.hook";

export const Route = createFileRoute("/_auth/home")({
	beforeLoad: ({ context }) => {
		const { isAuthenticated } = context.auth;
		if (!isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const browsersStats = useBrowsersStats("1h");
	const osStats = useOsStats("1h");
	const devicesStats = useDevicesStats("1h");
	const referrersStats = useReferrersStats("1h");
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
				<TotalClicksCard />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					<StatsBreakdownCard
						title="Browsers"
						subtitle="Top browsers in the last 60 minutes"
						data={browsersStats.data?.data ?? []}
						isLoading={browsersStats.isLoading}
						isError={browsersStats.isError}
						errorMessage={browsersStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Operating systems"
						subtitle="Top operating systems in the last 60 minutes"
						data={osStats.data?.data ?? []}
						isLoading={osStats.isLoading}
						isError={osStats.isError}
						errorMessage={osStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Devices"
						subtitle="Top devices in the last 60 minutes"
						data={devicesStats.data?.data ?? []}
						isLoading={devicesStats.isLoading}
						isError={devicesStats.isError}
						errorMessage={devicesStats.error?.message}
					/>
					<StatsBreakdownCard
						title="Referrers"
						subtitle="Top referrers in the last 60 minutes"
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
