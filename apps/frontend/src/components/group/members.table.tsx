import type { ColumnDef } from "@tanstack/react-table";
import { ROLES } from "@urlshortener/common/constants";
import type { Role } from "@urlshortener/common/types";
import type { ReactNode } from "react";
import type { GroupMember } from "../../hooks/query/groups.hook";
import { Table } from "../ui/data-table/table";
import { RoleTag } from "./role.tag";
import { RoleSelectMenu } from "./role-select.menu";

type MembersTableProps = {
	members: GroupMember[];
	total: number;
	search: string;
	onSearchChange: (value: string) => void;
	limit: number;
	offset: number;
	onOffsetChange: (nextOffset: number) => void;
	onLimitChange: (nextLimit: number) => void;
	sort?: "createdAt" | "name" | "email" | "role";
	order?: "asc" | "desc";
	onSortChange: (next: { sort?: string; order?: "asc" | "desc" }) => void;
	currentUserId?: string;
	currentUserRole?: Role | null;
	onUpdateRole: (params: {
		userId: string;
		role: Exclude<Role, "OWNER">;
	}) => void;
	updatingUserId?: string | null;
	isLoading?: boolean;
	headerActions?: ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short",
});

const MANAGEABLE_ROLES: Exclude<Role, "OWNER">[] = [
	ROLES.ADMIN,
	ROLES.MEMBER,
	ROLES.GUEST,
];

const canManageMember = ({
	currentUserRole,
	currentUserId,
	targetUserId,
	targetRole,
}: {
	currentUserRole: Role | null | undefined;
	currentUserId?: string;
	targetUserId: string;
	targetRole: Role;
}) => {
	if (!currentUserRole || !currentUserId) return false;
	if (currentUserRole !== ROLES.ADMIN && currentUserRole !== ROLES.OWNER) {
		return false;
	}
	if (currentUserId === targetUserId) return false;
	if (targetRole === ROLES.OWNER) return false;
	if (currentUserRole === ROLES.ADMIN && targetRole === ROLES.ADMIN) {
		return false;
	}
	return true;
};

const getAvailableRoles = ({
	currentUserRole,
	targetRole,
}: {
	currentUserRole: Role | null | undefined;
	targetRole: Role;
}): Exclude<Role, "OWNER">[] => {
	const allowedRoles =
		currentUserRole === ROLES.OWNER
			? MANAGEABLE_ROLES
			: [ROLES.MEMBER, ROLES.GUEST];
	return allowedRoles.filter((role) => role !== targetRole);
};

const getColumns = ({
	currentUserId,
	currentUserRole,
	onUpdateRole,
	updatingUserId,
}: {
	currentUserId?: string;
	currentUserRole?: Role | null;
	onUpdateRole: (params: {
		userId: string;
		role: Exclude<Role, "OWNER">;
	}) => void;
	updatingUserId?: string | null;
}): ColumnDef<GroupMember>[] => [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => row.original.user.name,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => row.original.user.email,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const member = row.original;
			const canManage = canManageMember({
				currentUserRole,
				currentUserId,
				targetUserId: member.userId,
				targetRole: member.role,
			});
			if (!canManage) {
				return <RoleTag role={member.role} />;
			}

			const options = getAvailableRoles({
				currentUserRole,
				targetRole: member.role,
			});
			if (options.length === 0) {
				return <RoleTag role={member.role} />;
			}

			return (
				<RoleSelectMenu
					role={member.role}
					options={options}
					onSelect={(role) => onUpdateRole({ userId: member.userId, role })}
					disabled={updatingUserId === member.userId}
				/>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Joined",
		cell: ({ row }) => {
			const rawDate = row.original.createdAt;
			const date = rawDate ? new Date(rawDate) : null;
			return (
				<span className="whitespace-nowrap text-(--color-muted)">
					{date && !Number.isNaN(date.getTime())
						? dateFormatter.format(date)
						: rawDate}
				</span>
			);
		},
	},
];

export function MembersTable({
	members,
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
	currentUserId,
	currentUserRole,
	onUpdateRole,
	updatingUserId,
	isLoading = false,
	headerActions,
}: MembersTableProps) {
	const columns = getColumns({
		currentUserId,
		currentUserRole,
		onUpdateRole,
		updatingUserId,
	});

	return (
		<Table
			columns={columns}
			total={total}
			name="members"
			search={search}
			onSearchChange={onSearchChange}
			limit={limit}
			offset={offset}
			onOffsetChange={onOffsetChange}
			onLimitChange={onLimitChange}
			sort={sort}
			order={order}
			onSortChange={onSortChange}
			data={members}
			isLoading={isLoading}
			headerActions={headerActions}
		/>
	);
}
