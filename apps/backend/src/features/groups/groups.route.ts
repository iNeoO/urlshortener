import {
	openApi400ZodError,
	openApi403Forbidden,
	openApi404NotFound,
	openApiProtectedRoute,
	openApiResponse,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import {
	DeleteGroupMemberResponseSchema,
	DeleteGroupResponseSchema,
	GetGroupMembersResponseSchema,
	GetGroupResponseSchema,
	GetGroupsResponseSchema,
	PatchGroupMemberRoleResponseSchema,
	PatchGroupResponseSchema,
	PostGroupResponseSchema,
} from "./groups.schema.js";

export const GetGroupsRoute = openApiProtectedRoute({
	description: "Get all groups the user is a member of",
	responses: {
		...openApiResponses(
			GetGroupsResponseSchema,
			200,
			"Groups retrieved successfully",
		),
	},
});

export const PostGroupRoute = openApiProtectedRoute({
	description: "Create a new group",
	responses: {
		...openApiResponse(
			PostGroupResponseSchema,
			201,
			"Group created successfully",
		),
		...openApi400ZodError("Zod error"),
	},
});

export const GetGroupRoute = openApiProtectedRoute({
	description: "Get group details by ID",
	responses: {
		...openApiResponse(
			GetGroupResponseSchema,
			200,
			"Group retrieved successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const GetGroupMembersRoute = openApiProtectedRoute({
	description: "Get group members by group ID",
	responses: {
		...openApiResponse(
			GetGroupMembersResponseSchema,
			200,
			"Group members retrieved successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const PatchGroupRoute = openApiProtectedRoute({
	description: "Update a group",
	responses: {
		...openApiResponse(
			PatchGroupResponseSchema,
			200,
			"Group updated successfully",
		),
		...openApi400ZodError("Zod error"),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const DeleteGroupRoute = openApiProtectedRoute({
	description: "Delete a group",
	responses: {
		...openApiResponse(
			DeleteGroupResponseSchema,
			200,
			"Group deleted successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const DeleteGroupMemberRoute = openApiProtectedRoute({
	description: "Remove a member from a group",
	responses: {
		...openApiResponse(
			DeleteGroupMemberResponseSchema,
			200,
			"Member removed from group successfully",
		),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});

export const PatchGroupMemberRoleRoute = openApiProtectedRoute({
	description: "Update a member's role in a group",
	responses: {
		...openApiResponse(
			PatchGroupMemberRoleResponseSchema,
			200,
			"Member role updated successfully",
		),
		...openApi400ZodError("Zod error"),
		...openApi403Forbidden("Forbidden"),
		...openApi404NotFound("Not found"),
	},
});
