import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	LinearScale,
	Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useClicksLastHourByMinute } from "../../hooks/query/stats.hook";
import { HOME_CARD_CLASS, HOME_CARD_TITLE_CLASS } from "./home-card.styles";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const numberFormatter = new Intl.NumberFormat("en-US");

const buildChartData = (bars: number[]) => {
	const maxBar = Math.max(...bars, 1);
	return {
		labels: bars.map((_, index) => String(index + 1)),
		datasets: [
			{
				data: bars,
				backgroundColor: bars.map((value) =>
					value === maxBar && value > 0
						? "rgba(60, 136, 230, 0.95)"
						: "rgba(159, 212, 255, 0.75)",
				),
				borderRadius: 3,
				borderSkipped: false,
				barPercentage: 0.78,
				categoryPercentage: 0.92,
			},
		],
	};
};

const chartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: { display: false },
		tooltip: {
			displayColors: false,
			callbacks: {
				label: (context: { raw: unknown }) => `${String(context.raw)} clicks`,
			},
		},
	},
	scales: {
		x: {
			display: false,
			grid: { display: false },
		},
		y: {
			display: false,
			grid: { display: false },
			beginAtZero: true,
		},
	},
} as const;

type TotalClicksCardProps = {
	urlId?: string;
	title?: string;
	subtitle?: string;
};

export function TotalClicksCard({
	urlId,
	title = "Total Clicks",
	subtitle = "Based on the last 60 minutes",
}: TotalClicksCardProps) {
	const { data, isLoading, isError, error } = useClicksLastHourByMinute(urlId);
	const points = data?.data ?? [];
	const counts = points.map((point) => point.count);
	const totalClicks = counts.reduce((acc, value) => acc + value, 0);
	const chartData = buildChartData(counts);
	const splitIndex = Math.floor(counts.length / 2);
	const previousWindow = counts
		.slice(0, splitIndex)
		.reduce((acc, value) => acc + value, 0);
	const currentWindow = counts
		.slice(splitIndex)
		.reduce((acc, value) => acc + value, 0);
	const trendPercent =
		previousWindow === 0
			? currentWindow > 0
				? 100
				: 0
			: ((currentWindow - previousWindow) / previousWindow) * 100;
	const trendLabel = `${trendPercent >= 0 ? "+" : ""}${Math.round(trendPercent)}%`;
	const trendToneClass =
		trendPercent >= 0
			? "bg-[var(--color-ice)]/50 text-[var(--color-primary)]"
			: "bg-[#ffd8e2] text-[#b42352]";

	return (
		<div className={HOME_CARD_CLASS}>
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className={HOME_CARD_TITLE_CLASS}>{title}</p>
					{isLoading ? (
						<p className="mt-1 text-3xl font-semibold tracking-tight">...</p>
					) : isError ? (
						<p className="mt-1 text-sm text-rose-300">
							{error?.message ?? "Failed to load stats"}
						</p>
					) : (
						<p className="mt-1 text-4xl font-semibold tracking-tight text-(--color-primary)">
							{numberFormatter.format(totalClicks)}
						</p>
					)}
				</div>
				<span
					className={[
						"inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums",
						trendToneClass,
					].join(" ")}
				>
					{trendLabel}
				</span>
			</div>

			<div className="mt-5 h-14">
				{isLoading ? (
					<div className="flex h-full items-center text-xs text-(--color-primary)/70">
						Loading chart...
					</div>
				) : isError ? (
					<div className="flex h-full items-center text-xs text-rose-300">
						Chart unavailable
					</div>
				) : (
					<Bar data={chartData} options={chartOptions} />
				)}
			</div>
			<p className="mt-3 text-xs text-(--color-primary)/70">{subtitle}</p>
		</div>
	);
}
