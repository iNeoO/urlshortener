import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GroupHeader } from "../../components/group/group-header";
import { StatsBreakdownCard } from "../../components/home/stats-breakdown.card";
import { TotalClicksCard } from "../../components/home/total-clicks.card";
import {
	useBrowsersStats,
	useDevicesStats,
	useOsStats,
	useReferrersStats,
} from "../../hooks/query/stats.hook";

const urlParamsSchema = z.object({
	id: z.string().min(1),
});

export const Route = createFileRoute("/_auth/urls/$id")({
	params: {
		parse: (params) => urlParamsSchema.parse(params),
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const browsersStats = useBrowsersStats("1h", id);
	const osStats = useOsStats("1h", id);
	const devicesStats = useDevicesStats("1h", id);
	const referrersStats = useReferrersStats("1h", id);

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
				<TotalClicksCard
					urlId={id}
					title="URL Total Clicks"
					subtitle="Based on this URL in the last 60 minutes"
				/>
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
			</div>
		</div>
	);
}
