import type { ColumnDef } from "@tanstack/react-table";
import type { GetInvitationsQuery } from "@urlshortener/common/types";
import type { Invitation } from "../../hooks/query/invitations.hook";
import { ALLOWED_INVITATION_SORTS } from "../../utils/dataTable/invitationsSorts";
import { Button } from "../ui/button";
import { Table } from "../ui/data-table/table";
import { RoleTag } from "./role.tag";

type InvitationsTableProps = {
	data: Invitation[];
	total: number;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	sort: GetInvitationsQuery["sort"];
	order: GetInvitationsQuery["order"];
	onSortChange: (next: {
		sort?: GetInvitationsQuery["sort"];
		order?: GetInvitationsQuery["order"];
	}) => void;
	isLoading?: boolean;
	onAcceptInvitation: (invitationId: string) => void;
	onRefuseInvitation: (invitationId: string) => void;
	acceptingInvitationId?: string | null;
	refusingInvitationId?: string | null;
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

export function InvitationsTable({
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
	onAcceptInvitation,
	onRefuseInvitation,
	acceptingInvitationId = null,
	refusingInvitationId = null,
}: InvitationsTableProps) {
	const columns: ColumnDef<Invitation>[] = [
		{
			id: "group.name",
			accessorKey: "group.name",
			header: "Group",
			cell: ({ row }) => row.original.group.name,
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
		{
			id: "actions",
			header: "Action",
			enableSorting: false,
			cell: ({ row }) => {
				const status = getInvitationStatus(row.original);
				if (status !== "Pending") return "-";

				return (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="primary"
							disabled={acceptingInvitationId === row.original.id}
							onClick={() => onAcceptInvitation(row.original.id)}
							className="justify-center"
						>
							{acceptingInvitationId === row.original.id
								? "Accepting..."
								: "Accept"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={refusingInvitationId === row.original.id}
							onClick={() => onRefuseInvitation(row.original.id)}
							className="justify-center"
						>
							{refusingInvitationId === row.original.id
								? "Refusing..."
								: "Refuse"}
						</Button>
					</div>
				);
			},
		},
	];

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
			allowedSorts={ALLOWED_INVITATION_SORTS}
			onSortChange={onSortChange}
			isLoading={isLoading}
		/>
	);
}
