import {
	openApi404NotFound,
	openApiRedirect,
} from "@urlshortener/infra/helpers";
import { describeRoute } from "hono-openapi";

export const RedirectShortenUrlRoute = describeRoute({
	responses: {
		...openApiRedirect(302, "Redirect successful"),
		...openApi404NotFound("Not found"),
	},
});
