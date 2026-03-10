import type { StatsByValuePoint } from "../../libs/api/stats.api";
import { HOME_CARD_CLASS, HOME_CARD_TITLE_CLASS } from "./home-card.styles";

type StatsBreakdownCardProps = {
	title: string;
	subtitle: string;
	isLoading: boolean;
	isError: boolean;
	errorMessage?: string;
	data: StatsByValuePoint[];
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function StatsBreakdownCard({
	title,
	subtitle,
	isLoading,
	isError,
	errorMessage,
	data,
}: StatsBreakdownCardProps) {
	const sorted = [...data].sort((a, b) => b.count - a.count);
	const topRows = sorted.slice(0, 3);
	const maxCount = topRows[0]?.count ?? 1;
	const titleToneClass =
		title === "Browsers"
			? "text-sky-800"
			: title === "Operating systems"
				? "text-indigo-800"
				: title === "Devices"
					? "text-teal-800"
					: title === "Referrers"
						? "text-cyan-800"
						: "text-(--color-primary)/85";

	return (
		<div className={HOME_CARD_CLASS}>
			<div>
				<p className={`${HOME_CARD_TITLE_CLASS} ${titleToneClass}`}>{title}</p>
				{isError ? (
					<p className="mt-1 text-sm text-rose-300">
						{errorMessage ?? "Failed to load stats"}
					</p>
				) : null}
			</div>

			<div className="mt-5 space-y-2">
				{isLoading ? (
					<p className="text-xs text-(--color-primary)/70">
						Loading breakdown...
					</p>
				) : isError ? (
					<p className="text-xs text-rose-300">Breakdown unavailable</p>
				) : topRows.length === 0 ? (
					<p className="text-xs text-(--color-primary)/70">No data available</p>
				) : (
					topRows.map((row) => {
						const width = `${Math.max(8, Math.round((row.count / maxCount) * 100))}%`;
						return (
							<div key={row.value} className="space-y-1">
								<div className="flex items-center justify-between gap-3 text-xs">
									<span
										className="truncate text-(--color-primary)/85"
										title={row.value}
									>
										{row.value}
									</span>
									<span className="tabular-nums text-(--color-primary)">
										{numberFormatter.format(row.count)}
									</span>
								</div>
								<div className="h-1.5 rounded-full bg-(--color-ice)/40">
									<div
										className="h-1.5 rounded-full bg-(--color-primary)/80"
										style={{ width }}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>
			<p className="mt-3 text-xs text-(--color-primary)/70">{subtitle}</p>
		</div>
	);
}
