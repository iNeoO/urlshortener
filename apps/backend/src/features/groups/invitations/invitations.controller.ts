import { API_ERROR, ROLES } from "@urlshortener/common/constants";
import {
	throwHTTPException403Forbidden,
	throwHTTPException409Conflict,
} from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import { GROUP_INVITATION_EXPIRES_IN_DAYS } from "../../../config/business.js";
import { appWithAuth } from "../../../helpers/factories/appWithAuth.js";
import { hasPermission } from "../../../helpers/permissions.js";
import type { AppServices } from "../../../services/container.js";
import { GroupIdParamSchema } from "../groups.schema.js";
import {
	GetGroupInvitationsRoute,
	PostInvitationRoute,
} from "./invitations.route.js";
import {
	GetGroupInvitationsQuerySchema,
	PostInvitationJsonSchema,
} from "./invitations.schema.js";
import type {
	GetGroupInvitationsResponseApi,
	PostInvitationResponseApi,
} from "./invitations.type.js";

type InvitationsControllerServices = Pick<
	AppServices,
	| "invitationsService"
	| "usersService"
	| "mailsService"
	| "authService"
	| "groupsService"
>;

export const createInvitationsController = (
	services: InvitationsControllerServices,
) => {
	return appWithAuth
		.createApp()
		.get(
			"/:groupId/invitations",
			GetGroupInvitationsRoute,
			validator("param", GroupIdParamSchema),
			validator("query", GetGroupInvitationsQuerySchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const query = c.req.valid("query");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "admin")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}

				const data = await services.invitationsService.getInvitationsForGroup(
					[groupId],
					query,
				);
				const response: GetGroupInvitationsResponseApi = { data };
				return c.json(response, 200);
			},
		)
		.post(
			"/:groupId/invitations",
			PostInvitationRoute,
			validator("param", GroupIdParamSchema),
			validator("json", PostInvitationJsonSchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "admin")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const { email, role } = c.req.valid("json");
				const requesterMembership = groups.find(
					(group) => group.id === groupId,
				);
				if (requesterMembership?.role !== ROLES.OWNER && role === ROLES.ADMIN) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const existingGroupMember =
					await services.invitationsService.isEmailAlreadyGroupMember({
						groupId,
						email,
					});
				if (existingGroupMember) {
					throwHTTPException409Conflict("User is already in this group", {
						res: c.res,
						cause: { code: API_ERROR.USER_ALREADY_IN_GROUP },
					});
				}
				const refusedInvitation =
					await services.invitationsService.hasInvitationRefused({
						groupId,
						email,
					});
				if (refusedInvitation) {
					throwHTTPException403Forbidden("Invitation has been refused", {
						res: c.res,
						cause: { code: API_ERROR.INVITATION_REFUSED },
					});
				}
				const existing = await services.invitationsService.getPendingInvitation(
					{
						groupId,
						email,
					},
				);
				if (existing) {
					throwHTTPException409Conflict("Invitation already exists", {
						res: c.res,
						cause: { code: API_ERROR.INVITATION_ALREADY_EXISTS },
					});
				}
				const invitation = await services.invitationsService.createInvitation({
					groupId,
					email,
					role,
					invitedById: c.get("userId"),
					expiresAt: new Date(
						Date.now() + GROUP_INVITATION_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
					),
				});

				if (requesterMembership) {
					const user = await services.usersService.getUser(c.get("userId"));
					if (user) {
						await services.mailsService.sendInvitationsEmail(
							email,
							requesterMembership.name,
							user.name,
						);
					}
				}

				const response: PostInvitationResponseApi = { data: invitation };
				return c.json(response, 201);
			},
		);
};
