import { Scalar } from "@scalar/hono-api-reference";
import type { LogsBindings } from "@urlshortener/infra/factories";
import type { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

export function setupOpenAPI(app: Hono<LogsBindings>) {
	app.get(
		"/openapi/spec",
		openAPIRouteHandler(app, {
			documentation: {
				info: {
					title: "Redirector API",
					version: "1.0.0",
					description: "Redirector API",
				},
			},
		}),
	);

	app.get(
		"/openapi/ui",
		Scalar({
			theme: "deepSpace",
			url: "/openapi/spec",
		}),
	);
}
