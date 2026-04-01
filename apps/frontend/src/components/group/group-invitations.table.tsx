import type { ColumnDef } from "@tanstack/react-table";
import type { GetGroupInvitationsQuery } from "@urlshortener/common/types";
import type { GroupInvitation } from "../../hooks/query/groups.hook";
import { ALLOWED_GROUP_INVITATION_SORTS } from "../../utils/dataTable/invitationsSorts";
import { Table } from "../ui/data-table/table";
import { RoleTag } from "./role.tag";

type GroupInvitationsTableProps = {
	data: GroupInvitation[];
	total: number;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	sort: GetGroupInvitationsQuery["sort"];
	order: GetGroupInvitationsQuery["order"];
	onSortChange: (next: {
		sort?: GetGroupInvitationsQuery["sort"];
		order?: GetGroupInvitationsQuery["order"];
	}) => void;
	isLoading?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const formatDate = (rawDate: string) => {
	const date = new Date(rawDate);
	return Number.isNaN(date.getTime()) ? rawDate : dateFormatter.format(date);
};

const getInvitationStatus = (invitation: {
	acceptedAt: string | null;
	refusedAt: string | null;
	expiresAt: string;
}) => {
	if (invitation.acceptedAt) return "Accepted";
	if (invitation.refusedAt) return "Refused";
	const expiresAt = new Date(invitation.expiresAt);
	if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
		return "Expired";
	}
	return "Pending";
};

const columns: ColumnDef<GroupInvitation>[] = [
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => row.original.email,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => <RoleTag role={row.original.role} />,
	},
	{
		accessorKey: "createdAt",
		header: "Invited At",
		cell: ({ row }) => (
			<span className="whitespace-nowrap text-(--color-muted)">
				{formatDate(row.original.createdAt)}
			</span>
		),
	},
	{
		accessorKey: "expiresAt",
		header: "Expires At",
		cell: ({ row }) => (
			<span className="whitespace-nowrap text-(--color-muted)">
				{formatDate(row.original.expiresAt)}
			</span>
		),
	},
	{
		accessorKey: "acceptedAt",
		header: "Accepted At",
		cell: ({ row }) => (
			<span className="whitespace-nowrap text-(--color-muted)">
				{row.original.acceptedAt ? formatDate(row.original.acceptedAt) : "-"}
			</span>
		),
	},
	{
		accessorKey: "refusedAt",
		header: "Refused At",
		cell: ({ row }) => (
			<span className="whitespace-nowrap text-(--color-muted)">
				{row.original.refusedAt ? formatDate(row.original.refusedAt) : "-"}
			</span>
		),
	},
	{
		id: "invitedBy.name",
		accessorKey: "invitedBy.name",
		header: "Invited By",
		cell: ({ row }) => row.original.invitedBy.name,
	},
	{
		id: "status",
		header: "Status",
		enableSorting: false,
		cell: ({ row }) => getInvitationStatus(row.original),
	},
];

export function GroupInvitationsTable({
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
}: GroupInvitationsTableProps) {
	return (
		<Table
			columns={columns}
			total={total}
			name="invitations"
			search={search}
			onSearchChange={onSearchChange}
			limit={limit}
			offset={offset}
			onOffsetChange={onOffsetChange}
			onLimitChange={onLimitChange}
			data={data}
			sort={sort}
			order={order}
			allowedSorts={ALLOWED_GROUP_INVITATION_SORTS}
			onSortChange={onSortChange}
			isLoading={isLoading}
		/>
	);
}
