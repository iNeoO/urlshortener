import type { z } from "zod";
import type {
	DeleteGroupMemberResponseSchema,
	DeleteGroupResponseSchema,
	GetGroupMembersQuerySchema,
	GetGroupMembersResponseSchema,
	GetGroupResponseSchema,
	GetGroupsQuerySchema,
	GetGroupsResponseSchema,
	PatchGroupMemberRoleResponseSchema,
	PatchGroupResponseSchema,
	PostGroupResponseSchema,
} from "./groups.schema.js";

type GetGroupsResponse = z.infer<typeof GetGroupsResponseSchema>;
type GroupSummary = Omit<GetGroupsResponse["data"][number], "createdAt"> & {
	createdAt: Date;
};

export type GetGroupsResponseApi = {
	data: GroupSummary[];
	total: GetGroupsResponse["total"];
};

export type GetGroupsQuery = z.infer<typeof GetGroupsQuerySchema>;
export type GetGroupMembersQuery = z.infer<typeof GetGroupMembersQuerySchema>;

type GetGroupResponse = z.infer<typeof GetGroupResponseSchema>;
type GroupDetails = Omit<GetGroupResponse, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};

export type GetGroupResponseApi = {
	data: GroupDetails;
};

type GetGroupMembersResponse = z.infer<typeof GetGroupMembersResponseSchema>;
type GroupMemberSummary = Omit<
	GetGroupMembersResponse["data"][number],
	"createdAt"
> & {
	createdAt: Date;
};

export type GetGroupMembersResponseApi = {
	data: GroupMemberSummary[];
	total: GetGroupMembersResponse["total"];
};

type PostGroupResponse = z.infer<typeof PostGroupResponseSchema>;
type Group = Omit<PostGroupResponse, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};

export type PostGroupResponseApi = {
	data: Group;
};

type PatchGroupResponse = z.infer<typeof PatchGroupResponseSchema>;
type PatchGroup = Omit<PatchGroupResponse, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};

export type PatchGroupResponseApi = {
	data: PatchGroup;
};

export type DeleteGroupResponseApi = {
	data: z.infer<typeof DeleteGroupResponseSchema>;
};

export type DeleteGroupMemberResponseApi = {
	data: z.infer<typeof DeleteGroupMemberResponseSchema>;
};

export type PatchGroupMemberRoleResponseApi = {
	data: z.infer<typeof PatchGroupMemberRoleResponseSchema>;
};
