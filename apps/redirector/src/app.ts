import { logMiddleware } from "@urlshortener/infra/middlewares";
import { prometheus } from "@hono/prometheus";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { createUrlsController } from "./features/urls/urls.controller.js";
import { errorHandler } from "./helpers/errors.js";
import {
	type AppServices,
	createServices,
	services,
} from "./services/container.js";

export { createServices };

const { printMetrics, registerMetrics } = prometheus();

export const createApp = (servicesContainer: AppServices = services) => {
	const urlsController = createUrlsController(servicesContainer);

	return new Hono()
		.use(requestId())
		.use(logMiddleware)
		.use("*", registerMetrics)
		.use(secureHeaders())
		.get("/metrics", printMetrics)
		.route("/", urlsController)
		.onError(errorHandler);
};

const app = createApp(services);

export default app;
