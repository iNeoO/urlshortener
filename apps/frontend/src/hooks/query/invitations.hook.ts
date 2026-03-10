import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import {
	acceptInvitation,
	type GetInvitationsParams,
	getInvitations,
	refuseInvitation,
} from "../../libs/api/invitations.api";

export type Invitation = Awaited<
	ReturnType<typeof getInvitations>
>["data"][number];

export const invitationsOptions = (queryParams: GetInvitationsParams = {}) =>
	queryOptions({
		queryKey: ["invitations", queryParams],
		queryFn: () => getInvitations(queryParams),
		placeholderData: keepPreviousData,
	});

export const useInvitations = (queryParams: GetInvitationsParams = {}) => {
	return useQuery(invitationsOptions(queryParams));
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
