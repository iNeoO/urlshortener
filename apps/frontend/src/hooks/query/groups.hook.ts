import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import {
	type GetGroupInvitationsParams,
	type GetGroupMembersParams,
	type GetGroupsParams,
	type GetGroupUrlsParams,
	getGroup,
	getGroupInvitations,
	getGroupMembers,
	getGroups,
	getGroupUrls,
} from "../../libs/api/groups.api";
import {
	acceptInvitation,
	getInvitations,
	refuseInvitation,
} from "../../libs/api/invitations.api";

export type GroupFromGroups = Awaited<
	ReturnType<typeof getGroups>
>["data"][number];
export type GroupDetails = Awaited<ReturnType<typeof getGroup>>["data"];
export type GroupMember = Awaited<
	ReturnType<typeof getGroupMembers>
>["data"][number];
export type GroupInvitation = Awaited<
	ReturnType<typeof getGroupInvitations>
>["data"][number];
export type GroupUrl = Awaited<ReturnType<typeof getGroupUrls>>["data"][number];
export type Invitation = Awaited<
	ReturnType<typeof getInvitations>
>["data"][number];

export const groupsOptions = (queryParams: GetGroupsParams) =>
	queryOptions({
		queryKey: ["groups", queryParams],
		queryFn: () => getGroups(queryParams),
		placeholderData: keepPreviousData,
	});

export const groupDetailsOptions = (groupId: string) =>
	queryOptions({
		queryKey: ["groups", groupId, "details"],
		queryFn: () => getGroup(groupId),
		enabled: Boolean(groupId),
	});

export const groupMembersOptions = (
	groupId: string,
	queryParams: GetGroupMembersParams,
) =>
	queryOptions({
		queryKey: ["groups", groupId, "members", queryParams],
		queryFn: () => getGroupMembers(groupId, queryParams),
		placeholderData: keepPreviousData,
		enabled: Boolean(groupId),
	});

export const groupInvitationsOptions = (
	groupId: string,
	queryParams: GetGroupInvitationsParams,
) =>
	queryOptions({
		queryKey: ["groups", groupId, "invitations", queryParams],
		queryFn: () => getGroupInvitations(groupId, queryParams),
		placeholderData: keepPreviousData,
		enabled: Boolean(groupId),
	});

export const groupUrlsOptions = (
	groupId: string,
	queryParams: GetGroupUrlsParams,
) =>
	queryOptions({
		queryKey: ["groups", groupId, "urls", queryParams],
		queryFn: () => getGroupUrls(groupId, queryParams),
		placeholderData: keepPreviousData,
		enabled: Boolean(groupId),
	});

export const useGroups = (queryParams: GetGroupsParams) => {
	return useQuery(groupsOptions(queryParams));
};

export const useGroupDetails = (groupId: string) => {
	return useQuery(groupDetailsOptions(groupId));
};

export const useGroupMembers = (
	groupId: string,
	queryParams: GetGroupMembersParams,
) => {
	return useQuery(groupMembersOptions(groupId, queryParams));
};

export const useGroupInvitations = (
	groupId: string,
	queryParams: GetGroupInvitationsParams,
) => {
	return useQuery(groupInvitationsOptions(groupId, queryParams));
};

export const useGroupUrls = (
	groupId: string,
	queryParams: GetGroupUrlsParams,
) => {
	return useQuery(groupUrlsOptions(groupId, queryParams));
};

export const invitationsOptions = () =>
	queryOptions({
		queryKey: ["invitations"],
		queryFn: () => getInvitations(),
	});

export const useInvitations = () => {
	return useQuery(invitationsOptions());
};

export const useAcceptInvitation = () => {
	return useMutation({
		mutationFn: (invitationId: string) => acceptInvitation(invitationId),
	});
};

export const useRefuseInvitation = () => {
	return useMutation({
		mutationFn: (invitationId: string) => refuseInvitation(invitationId),
	});
};
