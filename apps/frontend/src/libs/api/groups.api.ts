import type {
	GetGroupInvitationsQuerySchema,
	GetGroupMembersQuerySchema,
	GetGroupsQuerySchema,
	GetGroupUrlsQuerySchema,
	PatchGroupJsonSchema,
	PatchGroupMemberRoleJsonSchema,
	PostGroupJsonSchema,
	PostInvitationJsonSchema,
	PostUrlJsonSchema,
} from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc.ts";
import { toApiError } from "./apiError.ts";

export type CreateGroupBody = z.infer<typeof PostGroupJsonSchema>;

export type UpdateGroupBody = z.infer<typeof PatchGroupJsonSchema>;

export type GetGroupsParams = z.input<typeof GetGroupsQuerySchema>;
export type GetGroupInvitationsParams = z.input<
	typeof GetGroupInvitationsQuerySchema
>;
export type GetGroupMembersParams = z.input<typeof GetGroupMembersQuerySchema>;
export type GetGroupUrlsParams = z.input<typeof GetGroupUrlsQuerySchema>;
export type UpdateGroupMemberRoleBody = z.infer<
	typeof PatchGroupMemberRoleJsonSchema
>;
export type CreateGroupInvitationBody = z.infer<
	typeof PostInvitationJsonSchema
>;
export type CreateGroupUrlBody = Omit<
	z.infer<typeof PostUrlJsonSchema>,
	"groupId"
>;

export async function getGroups(params: GetGroupsParams = {}) {
	const res = await client.groups.$get({
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch groups");
	}
	const json = await res.json();
	return json;
}

export async function getGroup(groupId: string) {
	const res = await client.groups[":groupId"].$get({
		param: { groupId },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch group");
	}
	const json = await res.json();
	return json;
}

export async function getGroupMembers(
	groupId: string,
	params: GetGroupMembersParams = {},
) {
	const res = await client.groups[":groupId"].members.$get({
		param: { groupId },
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch group members");
	}
	const json = await res.json();
	return json;
}

export async function getGroupInvitations(
	groupId: string,
	params: GetGroupInvitationsParams = {},
) {
	const res = await client.groups[":groupId"].invitations.$get({
		param: { groupId },
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch group invitations");
	}
	const json = await res.json();
	return json;
}

export async function getGroupUrls(
	groupId: string,
	params: GetGroupUrlsParams = {},
) {
	const res = await client.groups[":groupId"].urls.$get({
		param: { groupId },
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch group urls");
	}
	const json = await res.json();
	return json;
}

export async function createGroup(body: CreateGroupBody) {
	const res = await client.groups.$post({
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to create group");
	}
	const json = await res.json();
	return json;
}

export async function updateGroup(groupId: string, body: UpdateGroupBody) {
	const res = await client.groups[":groupId"].$patch({
		param: { groupId },
		json: body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to update group");
	}
	const json = await res.json();
	return json;
}

export async function deleteGroup(groupId: string) {
	const res = await client.groups[":groupId"].$delete({
		param: { groupId },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to delete group");
	}
	const json = await res.json();
	return json;
}

export async function removeGroupMember(params: {
	groupId: string;
	userId: string;
}) {
	const res = await client.groups[":groupId"].members[":userId"].$delete({
		param: { groupId: params.groupId, userId: params.userId },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to remove group member");
	}
	const json = await res.json();
	return json;
}

export async function updateGroupMemberRole(params: {
	groupId: string;
	userId: string;
	body: UpdateGroupMemberRoleBody;
}) {
	const res = await client.groups[":groupId"].members[":userId"].role.$patch({
		param: { groupId: params.groupId, userId: params.userId },
		json: params.body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to update group member role");
	}
	const json = await res.json();
	return json;
}

export async function createGroupInvitation(params: {
	groupId: string;
	body: CreateGroupInvitationBody;
}) {
	const res = await client.groups[":groupId"].invitations.$post({
		param: { groupId: params.groupId },
		json: params.body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to invite member");
	}
	const json = await res.json();
	return json;
}

export async function createGroupUrl(params: {
	groupId: string;
	body: CreateGroupUrlBody;
}) {
	const res = await client.groups[":groupId"].urls.$post({
		param: { groupId: params.groupId },
		json: params.body,
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to create group url");
	}
	const json = await res.json();
	return json;
}
