import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { REDIRECTOR_URL } from "../../configs/constant";
import type { LastWindowCountFromUrls } from "../../hooks/query/urls.hook";
import {
	HOME_CARD_CHROME_CLASS,
	HOME_CARD_TITLE_CLASS,
} from "./home-card.styles";

type LastWindowCountsTableProps = {
	data: LastWindowCountFromUrls[];
	isLoading?: boolean;
	isError?: boolean;
	errorMessage?: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
	hour: "2-digit",
	minute: "2-digit",
});
const columnHelper = createColumnHelper<LastWindowCountFromUrls>();

const formatTimeAgo = (value: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return { label: value, time: value };
	}
	const diffMs = Date.now() - date.getTime();
	const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));
	if (diffMinutes < 1) {
		return { label: "just now", time: dateFormatter.format(date) };
	}
	if (diffMinutes === 1) {
		return { label: "1 min ago", time: dateFormatter.format(date) };
	}
	return { label: `${diffMinutes} mins ago`, time: dateFormatter.format(date) };
};

const columns = [
	columnHelper.accessor("windowStart", {
		header: "Timestamp",
		cell: (value) => {
			const formatted = formatTimeAgo(String(value.getValue() ?? ""));
			return (
				<div className="min-w-28">
					<p className="font-medium text-(--color-text)">{formatted.label}</p>
					<p className="text-xs text-(--color-muted)">{formatted.time}</p>
				</div>
			);
		},
	}),
	columnHelper.accessor("short", {
		header: "Short URL",
		cell: (value) => {
			const short = String(value.getValue() ?? "");
			const href = `${REDIRECTOR_URL}/${short}`;
			return (
				<a
					className="font-medium text-(--color-text) underline decoration-(--color-muted) underline-offset-2 hover:text-white"
					href={href}
					rel="noreferrer"
					target="_blank"
				>
					/{short}
				</a>
			);
		},
	}),
	columnHelper.accessor("redirect", {
		header: "Redirect",
		cell: (value) => {
			const redirect = String(value.getValue() ?? "");
			return (
				<a
					className="block max-w-64 truncate text-(--color-muted) underline decoration-(--color-border) underline-offset-2 hover:text-(--color-text)"
					href={redirect}
					rel="noreferrer"
					target="_blank"
					title={redirect}
				>
					{redirect}
				</a>
			);
		},
	}),
	columnHelper.accessor("group", {
		header: "Group",
		cell: (value) => {
			const group = value.getValue();
			return (
				<p className="truncate font-medium text-(--color-text)">{group.name}</p>
			);
		},
	}),
	columnHelper.accessor("count", {
		header: "Count",
		cell: (value) => (
			<span className="tabular-nums font-medium text-(--color-text)">
				{numberFormatter.format(value.getValue() ?? 0)}
			</span>
		),
	}),
];

export function LastWindowCountsTable({
	data,
	isLoading = false,
	isError = false,
	errorMessage,
}: LastWindowCountsTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	const rows = table.getRowModel().rows;

	return (
		<div className={HOME_CARD_CHROME_CLASS}>
			<div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
				<p className={HOME_CARD_TITLE_CLASS}>Recent Clicks Activity</p>
				<div className="rounded-lg border border-(--color-border) bg-(--color-panel) px-3 py-1 text-xs text-(--color-muted)">
					Latest 10
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-sm">
					<thead className="bg-(--color-surface-deep) text-[10px] uppercase tracking-[0.16em] text-(--color-muted)">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="border-b border-(--color-border) px-4 py-3 font-semibold"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									className="px-4 py-6 text-center text-(--color-muted)"
									colSpan={columns.length}
								>
									Loading latest counts...
								</td>
							</tr>
						) : isError ? (
							<tr>
								<td
									className="px-4 py-6 text-center text-rose-300"
									colSpan={columns.length}
								>
									{errorMessage ?? "Failed to load latest counts"}
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td
									className="bg-(--color-surface) px-4 py-6 text-center text-(--color-muted)"
									colSpan={columns.length}
								>
									No counts available yet.
								</td>
							</tr>
						) : (
							rows.map((row, rowIndex) => (
								<tr
									key={row.id}
									className="bg-(--color-panel) transition-colors hover:bg-(--color-surface)"
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className={[
												"px-4 py-3 align-top text-(--color-text)",
												rowIndex < rows.length - 1
													? "border-b border-(--color-border)"
													: "",
											].join(" ")}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
