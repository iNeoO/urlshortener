import type { GetInvitationsQuerySchema } from "@urlshortener/common/schema";
import type { z } from "zod";
import { client } from "../hc.ts";
import { toApiError } from "./apiError.ts";

export type GetInvitationsParams = z.input<typeof GetInvitationsQuerySchema>;

export async function getInvitations(params: GetInvitationsParams = {}) {
	const res = await client.invitations.$get({
		query: {
			...(params.limit !== undefined ? { limit: String(params.limit) } : {}),
			...(params.offset !== undefined ? { offset: String(params.offset) } : {}),
			...(params.order ? { order: params.order } : {}),
			...(params.sort ? { sort: params.sort } : {}),
			...(params.search ? { search: params.search } : {}),
		},
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to fetch invitations");
	}
	const json = await res.json();
	return json;
}

export async function acceptInvitation(invitationId: string) {
	const res = await client.invitations[":invitationId"].accept.$post({
		param: { invitationId },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to accept invitation");
	}
	const json = await res.json();
	return json;
}

export async function refuseInvitation(invitationId: string) {
	const res = await client.invitations[":invitationId"].refuse.$post({
		param: { invitationId },
	});
	if (!res.ok) {
		throw await toApiError(res, "Failed to refuse invitation");
	}
	const json = await res.json();
	return json;
}
