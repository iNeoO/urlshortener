import { z } from "zod";
import { ROLES } from "../constants/roles.constant.js";

const memberRoleSchema = z.enum([ROLES.ADMIN, ROLES.MEMBER, ROLES.GUEST]);

export const PostGroupJsonSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).nullable().optional(),
});

export const PatchGroupJsonSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
});

export const PostInvitationJsonSchema = z.object({
	email: z.email(),
	role: memberRoleSchema,
});

export const PatchGroupMemberRoleJsonSchema = z.object({
	role: memberRoleSchema,
});

export const GetGroupsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
	offset: z.coerce.number().int().min(0).default(0).optional(),
	order: z.enum(["asc", "desc"]).default("desc").optional(),
	sort: z
		.enum([
			"createdAt",
			"name",
			"description",
			"role",
			"totalUrls",
			"totalUsers",
		])
		.default("createdAt")
		.optional(),
	search: z.string().trim().min(1).optional(),
});

export const GetGroupMembersQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
	offset: z.coerce.number().int().min(0).default(0).optional(),
	order: z.enum(["asc", "desc"]).default("desc").optional(),
	sort: z
		.enum(["createdAt", "name", "email", "role"])
		.default("createdAt")
		.optional(),
	search: z.string().trim().min(1).optional(),
});

export const GetGroupUrlsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	offset: z.coerce.number().int().min(0).default(0),
	order: z.enum(["asc", "desc"]).default("desc"),
	sort: z.enum(["createdAt", "name", "description"]).default("createdAt"),
	search: z.string().trim().min(1).optional(),
});

export const GroupSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	role: memberRoleSchema,
	createdAt: z.iso.datetime(),
	totalUrls: z.number().int().nonnegative(),
	totalUsers: z.number().int().nonnegative(),
});

export const GetGroupsResponseSchema = z.object({
	data: z.array(GroupSummarySchema),
	total: z.number().int().nonnegative(),
});

export const GroupDetailsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	createdById: z.string(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
	currentUserRole: memberRoleSchema.nullable(),
});

export const GetGroupResponseSchema = z.object({
	data: GroupDetailsSchema,
});

export const GroupMemberSchema = z.object({
	id: z.string(),
	groupId: z.string(),
	userId: z.string(),
	role: memberRoleSchema,
	createdAt: z.iso.datetime(),
	user: z.object({
		name: z.string(),
		email: z.email(),
	}),
});

const cachedGroupRoleSchema = z.enum([
	ROLES.OWNER,
	ROLES.ADMIN,
	ROLES.MEMBER,
	ROLES.GUEST,
]);

export const CachedGroupsPayloadSchema = z.object({
	version: z.number(),
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			role: cachedGroupRoleSchema,
		}),
	),
});

export const GetGroupMembersResponseSchema = z.object({
	data: z.array(GroupMemberSchema),
	total: z.number().int().nonnegative(),
});

export const GroupUrlSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	original: z.httpUrl(),
	short: z.string(),
	groupId: z.string(),
	createdAt: z.iso.datetime(),
	totalClicks: z.number().int().nonnegative(),
	group: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string().nullable(),
	}),
});

export const GetGroupUrlsResponseSchema = z.object({
	data: z.array(GroupUrlSchema),
	total: z.number().int().nonnegative(),
});
