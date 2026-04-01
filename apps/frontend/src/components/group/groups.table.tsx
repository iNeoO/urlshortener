import type { ColumnDef } from "@tanstack/react-table";
import type { GetGroupsQuery } from "@urlshortener/common/types";
import type { ReactNode } from "react";
import type { GroupFromGroups } from "../../hooks/query/groups.hook";
import { ALLOWED_GROUP_SORTS } from "../../utils/dataTable/groupsSorts";
import { Table } from "../ui/data-table/table";
import { Link } from "../ui/link";
import { RoleTag } from "./role.tag";

type GroupsTableProps = {
	data: GroupFromGroups[];
	total?: number;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	sort: GetGroupsQuery["sort"];
	order: GetGroupsQuery["order"];
	onSortChange: (next: {
		sort?: GetGroupsQuery["sort"];
		order?: GetGroupsQuery["order"];
	}) => void;
	isLoading?: boolean;
	headerActions?: ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const columns: ColumnDef<GroupFromGroups>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: (value) => value.getValue(),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: (value) => value.getValue() ?? "-",
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => <RoleTag role={row.original.role} />,
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: (value) => {
			const val = String(value.getValue() ?? "");
			const date = val ? new Date(val) : null;
			return (
				<span className="whitespace-nowrap text-(--color-muted)">
					{date && !Number.isNaN(date.getTime())
						? dateFormatter.format(date)
						: val}
				</span>
			);
		},
	},
	{
		accessorKey: "totalUrls",
		header: "URLs",
		cell: (value) => (
			<span className="tabular-nums">{String(value.getValue())}</span>
		),
	},
	{
		accessorKey: "totalUsers",
		header: "Members",
		cell: (value) => (
			<span className="tabular-nums">{String(value.getValue())}</span>
		),
	},
	{
		id: "actions",
		header: "Action",
		enableSorting: false,
		cell: ({ row }) => (
			<Link
				to="/group/$groupId"
				params={{ groupId: row.original.id }}
				className="inline-flex items-center rounded-lg border border-(--color-border) bg-(--color-panel) px-3 py-1.5 text-sm font-medium text-(--color-text) transition hover:border-(--color-muted) hover:text-white"
			>
				Open
			</Link>
		),
	},
];

export function GroupsTable({
	data,
	total,
	search,
	onSearchChange,
	limit,
	offset,
	onOffsetChange,
	onLimitChange,
	sort,
	order,
	onSortChange,
	isLoading = false,
	headerActions,
}: GroupsTableProps) {
	return (
		<Table
			columns={columns}
			total={total ?? data.length}
			name="groups"
			search={search}
			onSearchChange={onSearchChange}
			limit={limit}
			offset={offset}
			onOffsetChange={onOffsetChange}
			onLimitChange={onLimitChange}
			data={data}
			sort={sort}
			order={order}
			allowedSorts={ALLOWED_GROUP_SORTS}
			onSortChange={onSortChange}
			isLoading={isLoading}
			headerActions={headerActions}
		/>
	);
}
