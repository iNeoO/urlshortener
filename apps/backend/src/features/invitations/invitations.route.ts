import {
	openApi403Forbidden,
	openApi404NotFound,
	openApiProtectedRoute,
	openApiResponse,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import { GroupMemberSchema } from "../groups/groups.schema.js";
import {
	GetInvitationsResponseSchema,
	PostInvitationResponseSchema,
} from "../groups/invitations/invitations.schema.js";

export const GetInvitationsRoute = openApiProtectedRoute({
	description: "Get group invitations for the current user",
	responses: {
		...openApiResponses(
			GetInvitationsResponseSchema,
			200,
			"Invitations retrieved successfully",
		),
	},
});

export const PostAcceptInvitationRoute = openApiProtectedRoute({
	description: "Accept a group invitation",
	responses: {
		...openApiResponse(
			GroupMemberSchema,
			200,
			"Invitation accepted successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const PostRefuseInvitationRoute = openApiProtectedRoute({
	description: "Refuse a group invitation",
	responses: {
		...openApiResponse(
			PostInvitationResponseSchema,
			200,
			"Invitation refused successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});
