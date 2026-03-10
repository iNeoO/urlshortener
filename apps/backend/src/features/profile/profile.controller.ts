import {
	throwHTTPException400BadRequest,
	throwHTTPException404NotFound,
} from "@urlshortener/infra/helpers";
import { hashPassword, verifyPassword } from "@urlshortener/services";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../helpers/factories/appWithAuth.js";
import { createAuthMiddleware } from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	GetProfileGroupsRoute,
	GetProfileRoute,
	PatchProfileRoute,
} from "./profile.route.js";
import { PatchProfileMeJsonSchema } from "./profile.schema.js";
import type {
	ProfileGroupsResponseApi,
	ProfileResponseApi,
} from "./profile.type.js";

type ProfileControllerServices = Pick<
	AppServices,
	"usersService" | "groupsService" | "authService"
>;

export const createProfileController = (
	services: ProfileControllerServices,
) => {
	const authMiddleware = createAuthMiddleware(services);

	return appWithAuth
		.createApp()
		.use(authMiddleware)
		.get("/me", GetProfileRoute, async (c) => {
			const userId = c.get("userId");
			const user = await services.usersService.getUser(userId);
			if (!user) {
				const logger = c.get("logger");
				logger.error(`Profile not found for userId: ${userId}`);
				throwHTTPException404NotFound("Profile not found", {
					res: c.res,
					cause: { code: "PROFILE_NOT_FOUND" },
				});
			}
			const response: ProfileResponseApi = { data: user };
			return c.json(response, 200);
		})
		.get("/groups", GetProfileGroupsRoute, async (c) => {
			const userId = c.get("userId");
			const groups = await services.groupsService.getGroupsForUser(userId);
			const response: ProfileGroupsResponseApi = { data: groups };
			return c.json(response, 200);
		})
		.patch(
			"/me",
			PatchProfileRoute,
			validator("json", PatchProfileMeJsonSchema),
			async (c) => {
				const userId = c.get("userId");
				const { name, currentPassword, newPassword } = c.req.valid("json");

				if (currentPassword && newPassword) {
					const userForPassword =
						await services.usersService.getUserByIdForAuth(userId);
					if (!userForPassword || userForPassword.deletedAt) {
						const logger = c.get("logger");
						logger.error(`Profile not found for userId: ${userId}`);
						throwHTTPException404NotFound("Profile not found", {
							res: c.res,
							cause: { code: "PROFILE_NOT_FOUND" },
						});
					}

					const isCurrentPasswordValid = await verifyPassword(
						userForPassword.passwordHash,
						currentPassword,
					);

					if (!isCurrentPasswordValid) {
						throwHTTPException400BadRequest("Current password is incorrect", {
							res: c.res,
						});
					}
				}

				const passwordHash = newPassword
					? await hashPassword(newPassword)
					: undefined;
				const user = await services.usersService.updateUserForProfile({
					userId,
					name,
					passwordHash,
				});

				const response: ProfileResponseApi = { data: user };
				return c.json(response, 200);
			},
		);
};
