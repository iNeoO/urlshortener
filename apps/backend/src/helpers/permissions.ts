import { ROLES } from "@urlshortener/common/constants";
import type { Role } from "@urlshortener/common/types";

export type UserGroup = {
	id: string;
	role: Role;
	name: string;
};

export type PermissionAction =
	| "read"
	| "write"
	| "admin"
	| "owner"
	| "create_url";

const READ_ROLES = new Set<Role>([
	ROLES.OWNER,
	ROLES.ADMIN,
	ROLES.MEMBER,
	ROLES.GUEST,
]);
const WRITE_ROLES = new Set<Role>([ROLES.OWNER, ROLES.ADMIN]);
const CREATE_URL_ROLES = new Set<Role>([
	ROLES.OWNER,
	ROLES.ADMIN,
	ROLES.MEMBER,
]);

export const hasPermission = (
	groups: UserGroup[],
	groupId: string,
	action: PermissionAction,
) => {
	const group = groups.find((g) => g.id === groupId);
	if (!group) return false;

	switch (action) {
		case "read":
			return READ_ROLES.has(group.role);
		case "write":
			return WRITE_ROLES.has(group.role);
		case "admin":
			return WRITE_ROLES.has(group.role);
		case "owner":
			return group.role === ROLES.OWNER;
		case "create_url":
			return CREATE_URL_ROLES.has(group.role);
		default:
			return false;
	}
};
