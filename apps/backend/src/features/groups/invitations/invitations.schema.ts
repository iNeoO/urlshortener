import { ROLES } from "@urlshortener/common/constants";
import { z } from "zod";

export {
	GetGroupInvitationsQuerySchema,
	PatchGroupMemberRoleJsonSchema,
	PostInvitationJsonSchema,
} from "@urlshortener/common/schema";

const rolesSchema = z.enum([
	ROLES.OWNER,
	ROLES.ADMIN,
	ROLES.MEMBER,
	ROLES.GUEST,
]);

export const InvitationSchema = z.object({
	id: z.string(),
	groupId: z.string(),
	email: z.email(),
	role: rolesSchema,
	invitedById: z.string(),
	acceptedAt: z.iso.datetime().nullable(),
	revokedAt: z.iso.datetime().nullable(),
	refusedAt: z.iso.datetime().nullable(),
	expiresAt: z.iso.datetime(),
	createdAt: z.iso.datetime(),
});

export const InvitationExtendedSchema = InvitationSchema.extend({
	group: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string().nullable(),
	}),
	invitedBy: z.object({
		id: z.string(),
		email: z.email(),
		name: z.string(),
	}),
});

export const GroupInvitationSchema = InvitationSchema.extend({
	invitedBy: z.object({
		id: z.string(),
		email: z.email(),
		name: z.string(),
	}),
});

export const PostInvitationResponseSchema = InvitationSchema;

export const InvitationIdParamSchema = z.object({
	invitationId: z.uuidv7(),
});

export const GetInvitationsResponseSchema = z.array(InvitationExtendedSchema);
export const GetGroupInvitationsResponseSchema = z.array(GroupInvitationSchema);
