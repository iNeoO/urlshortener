import { env } from "@urlshortener/infra/configs";
import { logMiddleware } from "@urlshortener/infra/middlewares";
import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { createAuthController } from "./features/auth/auth.controller.js";
import { createGroupsController } from "./features/groups/groups.controller.js";
import { createInvitationsController } from "./features/invitations/invitations.controller.js";
import { createProfileController } from "./features/profile/profile.controller.js";
import { createStatsController } from "./features/stats/stats.controller.js";
import { createUrlsController } from "./features/urls/urls.controller.js";
import { errorHandler } from "./helpers/errors.js";
import {
	type AppServices,
	createServices,
	services,
} from "./services/container.js";

export { createServices };

export const createApp = (servicesContainer: AppServices = services) => {
	const authController = createAuthController(servicesContainer);
	const urlsController = createUrlsController(servicesContainer);
	const statsController = createStatsController(servicesContainer);
	const groupsController = createGroupsController(servicesContainer);
	const invitationsController = createInvitationsController(servicesContainer);
	const profileController = createProfileController(servicesContainer);

	return new Hono()
		.use(requestId())
		.use(logMiddleware)
		.use(secureHeaders())
		.use(
			csrf({
				origin: [env.FRONTEND_URL],
			}),
		)
		.route("/auth", authController)
		.route("/urls", urlsController)
		.route("/stats", statsController)
		.route("/groups", groupsController)
		.route("/", invitationsController)
		.route("/profile", profileController)
		.onError(errorHandler);
};

const app = createApp(services);

export default app;
