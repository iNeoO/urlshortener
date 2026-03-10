import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useState } from "react";
import { Card } from "../card";
import { Input } from "../input";
import { SortButton } from "./sort-button";
import { TablePaginationControls } from "./table-pagination-controls";

type TableProps<T, TSort extends string = string> = {
	columns: ColumnDef<T>[];
	total: number;
	name: string;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	data: T[];
	isLoading?: boolean;
	sort?: TSort;
	order?: "asc" | "desc";
	allowedSorts?: readonly TSort[];
	onSortChange?: (next: { sort?: TSort; order?: "asc" | "desc" }) => void;
	headerActions?: ReactNode;
};

export function Table<T, TSort extends string = string>({
	columns,
	name,
	total,
	search,
	onSearchChange,
	limit,
	offset,
	onOffsetChange,
	onLimitChange,
	data,
	isLoading = false,
	sort,
	order,
	allowedSorts,
	onSortChange,
	headerActions,
}: TableProps<T, TSort>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const isServerSorting = Boolean(onSortChange);
	const sortingState: SortingState =
		isServerSorting && sort
			? [
					{
						id: sort,
						desc: order === "desc",
					},
				]
			: sorting;
	const table = useReactTable({
		data,
		columns,
		state: { sorting: sortingState },
		...(isServerSorting ? {} : { onSortingChange: setSorting }),
		getCoreRowModel: getCoreRowModel(),
		...(isServerSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
		manualSorting: isServerSorting,
	});

	const handleSortClick = (columnId: string) => {
		if (!onSortChange) return;
		if (allowedSorts && !allowedSorts.includes(columnId as TSort)) {
			return;
		}
		const nextSort = columnId as TSort;
		if (sort !== columnId) {
			onSortChange({ sort: nextSort, order: "asc" });
			return;
		}
		if (order === "asc") {
			onSortChange({ sort: nextSort, order: "desc" });
			return;
		}
		onSortChange({ sort: undefined, order: undefined });
	};

	return (
		<Card withPadding={false}>
			<div className="flex items-center justify-between gap-4 px-4 py-3">
				<div className="text-sm font-semibold text-(--color-text)">
					Total {name}: {total ?? data.length}
				</div>
				<div className="flex w-full max-w-xl items-center justify-end gap-2">
					<div className="w-full max-w-sm">
						<Input
							label="Search"
							labelClassName="u-sr-only"
							wrapperClassName="space-y-0"
							className="h-9 py-0"
							placeholder="Search by name or description..."
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
						/>
					</div>
					{headerActions ? (
						<div className="shrink-0">{headerActions}</div>
					) : null}
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-sm">
					<thead className="bg-(--color-surface-deep) text-xs uppercase tracking-wide text-(--color-muted)">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="border-b border-(--color-border) px-4 py-3 font-semibold"
									>
										{header.isPlaceholder ? null : header.column.getCanSort() ? (
											<SortButton
												label={flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
												direction={
													isServerSorting
														? sort === header.column.id
															? (order ?? false)
															: false
														: header.column.getIsSorted()
												}
												onClick={
													isServerSorting
														? () => handleSortClick(header.column.id)
														: header.column.getToggleSortingHandler()
												}
												aria-label={`Sort by ${String(header.column.columnDef.header ?? header.column.id)}`}
											/>
										) : (
											flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)
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
									Loading {name}...
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td
									className="px-4 py-6 text-center text-(--color-muted)"
									colSpan={columns.length}
								>
									No {name} found.
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="odd:bg-(--color-panel) even:bg-(--color-surface)"
								>
									{row.getVisibleCells().map((cell, index) => (
										<td
											key={cell.id}
											className={[
												"px-4 py-3 align-top text-(--color-text)",
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
			<TablePaginationControls
				total={total ?? data.length}
				limit={limit}
				offset={offset}
				onOffsetChange={onOffsetChange}
				onLimitChange={onLimitChange}
			/>
		</Card>
	);
}
