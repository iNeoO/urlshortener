import {
	openApi400BadRequest,
	openApi401Unauthorized,
	openApi404NotFound,
	openApiProtectedRoute,
	openApiResponse,
} from "@urlshortener/infra/helpers";
import { describeRoute } from "hono-openapi";
import { ProfileGroupsSchema, ProfileSchema } from "./profile.schema.js";

export const GetProfileRoute = openApiProtectedRoute({
	description: "Get current user profile",
	responses: {
		...openApiResponse(ProfileSchema, 200, "Profile retrieved successfully"),
		...openApi404NotFound("Not found"),
	},
});

export const PatchProfileRoute = describeRoute({
	description: "Update current user profile",
	responses: {
		...openApi401Unauthorized("Unauthorized"),
		...openApiResponse(ProfileSchema, 200, "Profile updated successfully"),
		...openApi400BadRequest("Bad request"),
		...openApi404NotFound("Not found"),
	},
});

export const GetProfileGroupsRoute = openApiProtectedRoute({
	description: "Get current user groups",
	responses: {
		...openApiResponse(
			ProfileGroupsSchema,
			200,
			"Groups retrieved successfully",
		),
	},
});
