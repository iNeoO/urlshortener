import { API_ERROR } from "@urlshortener/common/constants";
import { GetInvitationsQuerySchema } from "@urlshortener/common/schema";
import {
	throwHTTPException403Forbidden,
	throwHTTPException404NotFound,
} from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../helpers/factories/appWithAuth.js";
import { createAuthMiddleware } from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	GetInvitationsRoute,
	PostAcceptInvitationRoute,
	PostRefuseInvitationRoute,
} from "./invitations.route.js";
import { InvitationIdParamSchema } from "./invitations.schema.js";
import type {
	AcceptInvitationResponseApi,
	GetInvitationsResponseApi,
	RefuseInvitationResponseApi,
} from "./invitations.type.js";

type InvitationsControllerServices = Pick<
	AppServices,
	"invitationsService" | "authService" | "usersService" | "groupsService"
>;

export const createInvitationsController = (
	services: InvitationsControllerServices,
) => {
	const authMiddleware = createAuthMiddleware(services);

	return appWithAuth
		.createApp()
		.use(authMiddleware)
		.get(
			"/invitations",
			GetInvitationsRoute,
			validator("query", GetInvitationsQuerySchema),
			async (c) => {
				const userId = c.get("userId");
				const query = c.req.valid("query");
				const data = await services.invitationsService.getInvitationsForUser(
					userId,
					query,
				);
				const response: GetInvitationsResponseApi = { data };
				return c.json(response, 200);
			},
		)
		.post(
			"/invitations/:invitationId/accept",
			PostAcceptInvitationRoute,
			validator("param", InvitationIdParamSchema),
			async (c) => {
				const { invitationId } = c.req.valid("param");
				const userId = c.get("userId");
				const result = await services.invitationsService.acceptInvitation({
					invitationId,
					userId,
				});

				if (result.status === "accepted") {
					const response: AcceptInvitationResponseApi = { data: result.member };
					return c.json(response, 200);
				}
				if (result.status === "forbidden") {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				return throwHTTPException404NotFound(
					"Invitation not found or invalid",
					{
						res: c.res,
						cause: { code: API_ERROR.INVITATION_NOT_FOUND },
					},
				);
			},
		)
		.post(
			"/invitations/:invitationId/refuse",
			PostRefuseInvitationRoute,
			validator("param", InvitationIdParamSchema),
			async (c) => {
				const { invitationId } = c.req.valid("param");
				const userId = c.get("userId");
				const result = await services.invitationsService.refuseInvitation({
					invitationId,
					userId,
				});

				if (result.status === "refused") {
					const response: RefuseInvitationResponseApi = {
						data: result.invitation,
					};
					return c.json(response, 200);
				}
				if (result.status === "forbidden") {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				return throwHTTPException404NotFound(
					"Invitation not found or invalid",
					{
						res: c.res,
						cause: { code: API_ERROR.INVITATION_NOT_FOUND },
					},
				);
			},
		);
};
