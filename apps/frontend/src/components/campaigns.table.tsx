import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { BACKEND_URL } from "../configs/constant";
import type { getCampaigns } from "../libs/api/campaigns.api";
import { Card } from "./ui/card";

export type CampaignRow = Awaited<
	ReturnType<typeof getCampaigns>
>["data"][number];

type CampaignsTableProps = {
	data: CampaignRow[];
	total?: number;
	search: string;
	onSearchChange: (value: string) => void;
	isLoading?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "medium",
	timeStyle: "short",
});
const columnHelper = createColumnHelper<CampaignRow>();

const columns = [
	columnHelper.accessor("name", {
		header: "Name",
		cell: (value) => value.getValue(),
	}),
	columnHelper.accessor("description", {
		header: "Description",
		cell: (value) => value.getValue(),
	}),
	columnHelper.accessor("original", {
		header: "Original URL",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			return (
				<a
					className="text-sky-700 hover:text-sky-900 underline underline-offset-2"
					href={val}
					rel="noreferrer"
					target="_blank"
				>
					{val}
				</a>
			);
		},
	}),
	columnHelper.accessor("short", {
		header: "Short URL",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			const href = BACKEND_URL
				? `${BACKEND_URL.replace(/\/$/, "")}/u/${val}`
				: "";
			const label = href || val;
			return (
				<a
					className="text-sky-700 hover:text-sky-900 underline underline-offset-2"
					href={href || undefined}
					rel={href ? "noreferrer" : undefined}
					target={href ? "_blank" : undefined}
				>
					{label}
				</a>
			);
		},
	}),
	columnHelper.accessor("totalClicks", {
		header: "Clicks",
		cell: (value) => (
			<span className="tabular-nums">{String(value.getValue() ?? 0)}</span>
		),
	}),
	columnHelper.accessor("createdAt", {
		header: "Created",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			const date = val ? new Date(val) : null;
			return (
				<span className="whitespace-nowrap text-slate-700">
					{date && !Number.isNaN(date.getTime())
						? dateFormatter.format(date)
						: val}
				</span>
			);
		},
	}),
];

export function CampaignsTable({
	data,
	total,
	search,
	onSearchChange,
	isLoading = false,
}: CampaignsTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Card className="p-0">
			<div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
						Search
					</span>
					<input
						className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
						placeholder="Search campaigns..."
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
					/>
				</div>
				<div className="text-sm font-semibold text-slate-600">
					Total: {total ?? data.length}
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-separate border-spacing-y-2 text-left text-sm">
					<thead className="text-xs uppercase tracking-wide text-slate-400">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="border-b border-slate-200 px-4 py-3 font-semibold"
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
									className="px-4 py-6 text-center text-slate-500"
									colSpan={columns.length}
								>
									Loading campaigns...
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td
									className="px-4 py-6 text-center text-slate-500"
									colSpan={columns.length}
								>
									No campaigns found.
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="odd:bg-white even:bg-slate-50">
									{row.getVisibleCells().map((cell, index) => (
										<td
											key={cell.id}
											className={[
												"px-4 py-3 align-top text-slate-700",
												index === 0 ? "rounded-l-lg" : "",
												index === row.getVisibleCells().length - 1
													? "rounded-r-lg"
													: "",
											]
												.filter(Boolean)
												.join(" ")}
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
		</Card>
	);
}
