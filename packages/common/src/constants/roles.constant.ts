export const ROLES = {
	OWNER: "OWNER",
	ADMIN: "ADMIN",
	MEMBER: "MEMBER",
	GUEST: "GUEST",
} as const;

export const roles: Record<keyof typeof ROLES, string> = {
	OWNER: "owner",
	ADMIN: "admin",
	MEMBER: "member",
	GUEST: "guest",
};
