import {
	openApi400ZodError,
	openApi401Unauthorized,
	openApi403Forbidden,
	openApi409Conflict,
	openApiProtectedRoute,
	openApiResponse,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import {
	GetLastWindowCountsResponseSchema,
	GetUrlsResponseSchema,
	PostUrlResponseSchema,
} from "./urls.schema.js";

export const GetUrlsRoute = openApiProtectedRoute({
	description: "Get URLs",
	responses: {
		...openApiResponses(GetUrlsResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetLastWindowCountsRoute = openApiProtectedRoute({
	description: "Get last URL window counts",
	responses: {
		...openApiResponses(GetLastWindowCountsResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const PostUrlRoute = openApiProtectedRoute({
	description: "Create a URL",
	responses: {
		...openApiResponse(PostUrlResponseSchema, 201, "URL created successfully"),
		...openApi400ZodError("Zod error"),
		...openApi403Forbidden("Forbidden"),
		...openApi409Conflict("Short URL collision"),
	},
});
