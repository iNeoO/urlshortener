import {
	openApi400ZodError,
	openApi403Forbidden,
	openApiProtectedRoute,
	openApiResponse,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import {
	GetGroupUrlsResponseSchema,
	PostGroupUrlResponseSchema,
} from "./urls.schema.js";

export const PostGroupUrlRoute = openApiProtectedRoute({
	description: "Create a URL in a group",
	responses: {
		...openApiResponse(
			PostGroupUrlResponseSchema,
			201,
			"URL created successfully",
		),
		...openApi400ZodError("Zod error"),
		...openApi403Forbidden("Forbidden"),
	},
});

export const GetGroupUrlsRoute = openApiProtectedRoute({
	description: "Get URLs in a group",
	responses: {
		...openApiResponses(
			GetGroupUrlsResponseSchema,
			200,
			"URLs retrieved successfully",
		),
		...openApi403Forbidden("Forbidden"),
	},
});
