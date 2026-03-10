import {
	openApi400ZodError,
	openApi403Forbidden,
	openApi404NotFound,
	openApi409Conflict,
	openApiProtectedRoute,
	openApiResponse,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import { GroupMemberSchema } from "../groups.schema.js";
import {
	GetGroupInvitationsResponseSchema,
	PostInvitationResponseSchema,
} from "./invitations.schema.js";

export const GetGroupInvitationsRoute = openApiProtectedRoute({
	description: "Get invitations created in a group",
	responses: {
		...openApiResponses(
			GetGroupInvitationsResponseSchema,
			200,
			"Invitations retrieved successfully",
		),
	},
});

export const PostInvitationRoute = openApiProtectedRoute({
	description: "Invite a member to a group",
	responses: {
		...openApiResponse(
			PostInvitationResponseSchema,
			201,
			"Invitation created successfully",
		),
		...openApi400ZodError("Zod error"),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
		...openApi409Conflict("Conflict"),
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
