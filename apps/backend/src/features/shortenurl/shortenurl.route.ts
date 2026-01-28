import { describeRoute, resolver } from "hono-openapi";
import { ErrorSchema, ZodSafeParseErrorSchema } from "../../helpers/errors.js";
import { PostShortenUrlResponseSchema } from "./shortenurl.schema.js";

export const PostShortenUrlRoute = () =>
	describeRoute({
		responses: {
			201: {
				description: "URL created successfully",
				content: {
					"application/json": {
						schema: resolver(PostShortenUrlResponseSchema),
					},
				},
			},
			400: {
				description: "Bad Request",
				content: {
					"application/json": {
						schema: resolver(ZodSafeParseErrorSchema),
					},
				},
			},
		},
	});

export const RedirectShortenUrlRoute = () =>
	describeRoute({
		responses: {
			302: {
				description: "Successful redirection",
			},
			404: {
				description: "Not Found",
				content: {
					"application/json": {
						schema: resolver(ErrorSchema),
					},
				},
			},
		},
	});
