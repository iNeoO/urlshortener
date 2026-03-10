import { ROLES } from "@urlshortener/common/constants";
import {
	GetGroupMembersQuerySchema,
	GetGroupsQuerySchema,
	PatchGroupJsonSchema,
	PatchGroupMemberRoleJsonSchema,
	PostGroupJsonSchema,
} from "@urlshortener/common/schema";
import { z } from "zod";

export {
	GetGroupsQuerySchema,
	GetGroupMembersQuerySchema,
	PatchGroupJsonSchema,
	PostGroupJsonSchema,
	PatchGroupMemberRoleJsonSchema,
};

const rolesSchema = z.enum([
	ROLES.OWNER,
	ROLES.ADMIN,
	ROLES.MEMBER,
	ROLES.GUEST,
]);

export const GroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	createdById: z.string(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
});

export const GroupMemberSchema = z.object({
	id: z.string(),
	groupId: z.string(),
	userId: z.string(),
	user: z.object({
		name: z.string(),
		email: z.email(),
	}),
	role: rolesSchema,
	createdAt: z.iso.datetime(),
});

export const GroupForUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	role: rolesSchema,
	createdAt: z.iso.datetime(),
	totalUrls: z.number().int().nonnegative(),
	totalUsers: z.number().int().nonnegative(),
});

export const GetGroupsResponseSchema = z.object({
	data: z.array(GroupForUserSchema),
	total: z.number().int().nonnegative(),
});

export const PostGroupResponseSchema = GroupSchema;

export const PatchGroupResponseSchema = GroupSchema;

export const DeleteGroupResponseSchema = z.object({
	id: z.string(),
	deleted: z.boolean(),
});

export const GetGroupResponseSchema = GroupSchema.extend({
	currentUserRole: rolesSchema.nullable(),
});

export const GetGroupMembersResponseSchema = z.object({
	data: z.array(GroupMemberSchema),
	total: z.number().int().nonnegative(),
});

export const DeleteGroupMemberResponseSchema = z.object({
	groupId: z.string(),
	userId: z.string(),
	deleted: z.boolean(),
});

export const PatchGroupMemberRoleResponseSchema = GroupMemberSchema.pick({
	groupId: true,
	userId: true,
	role: true,
});

export const CachedGroupsSchema = z.object({
	version: z.number(),
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			role: rolesSchema,
		}),
	),
});

export const GroupIdParamSchema = z.object({
	groupId: z.uuidv7(),
});

export const GroupMemberIdParamSchema = z.object({
	groupId: z.uuidv7(),
	userId: z.uuidv4(),
});
