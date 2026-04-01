import type {
	GetGroupInvitationsQuery,
	GetInvitationsQuery,
} from "@urlshortener/common/types";

export const ALLOWED_INVITATION_SORTS: readonly NonNullable<
	GetInvitationsQuery["sort"]
>[] = [
	"group.name",
	"role",
	"createdAt",
	"expiresAt",
	"acceptedAt",
	"refusedAt",
	"invitedBy.name",
];

export const ALLOWED_GROUP_INVITATION_SORTS: readonly NonNullable<
	GetGroupInvitationsQuery["sort"]
>[] = [
	"role",
	"createdAt",
	"expiresAt",
	"acceptedAt",
	"refusedAt",
	"invitedBy.name",
];
