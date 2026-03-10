import { API_ERROR, ROLES } from "@urlshortener/common/constants";
import {
	throwHTTPException403Forbidden,
	throwHTTPException404NotFound,
} from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../helpers/factories/appWithAuth.js";
import { hasPermission } from "../../helpers/permissions.js";
import { createAuthMiddleware } from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	DeleteGroupMemberRoute,
	DeleteGroupRoute,
	GetGroupMembersRoute,
	GetGroupRoute,
	GetGroupsRoute,
	PatchGroupMemberRoleRoute,
	PatchGroupRoute,
	PostGroupRoute,
} from "./groups.route.js";
import {
	GetGroupMembersQuerySchema,
	GetGroupsQuerySchema,
	GroupIdParamSchema,
	GroupMemberIdParamSchema,
	PatchGroupJsonSchema,
	PatchGroupMemberRoleJsonSchema,
	PostGroupJsonSchema,
} from "./groups.schema.js";
import type {
	DeleteGroupMemberResponseApi,
	DeleteGroupResponseApi,
	GetGroupMembersResponseApi,
	GetGroupResponseApi,
	GetGroupsResponseApi,
	PatchGroupMemberRoleResponseApi,
	PatchGroupResponseApi,
	PostGroupResponseApi,
} from "./groups.type.js";
import { createInvitationsController } from "./invitations/invitations.controller.js";
import { createGroupUrlsController } from "./urls/urls.controller.js";

type GroupsControllerServices = Pick<
	AppServices,
	| "groupsService"
	| "urlsService"
	| "invitationsService"
	| "usersService"
	| "mailsService"
	| "authService"
>;

export const createGroupsController = (services: GroupsControllerServices) => {
	const authMiddleware = createAuthMiddleware(services);
	const urlsController = createGroupUrlsController(services);
	const invitationsController = createInvitationsController(services);

	return appWithAuth
		.createApp()
		.use(authMiddleware)
		.get(
			"/",
			GetGroupsRoute,
			validator("query", GetGroupsQuerySchema),
			async (c) => {
				const userId = c.get("userId");
				const query = c.req.valid("query");
				const result = await services.groupsService.getGroupsSummaryForUser(
					userId,
					query,
				);
				const response: GetGroupsResponseApi = result;
				return c.json(response, 200);
			},
		)
		.post(
			"/",
			PostGroupRoute,
			validator("json", PostGroupJsonSchema),
			async (c) => {
				const userId = c.get("userId");
				const params = c.req.valid("json");
				const group = await services.groupsService.createGroup({
					...params,
					createdById: userId,
				});
				const response: PostGroupResponseApi = { data: group };
				return c.json(response, 201);
			},
		)
		.route("/", urlsController)
		.route("/", invitationsController)
		.patch(
			"/:groupId",
			PatchGroupRoute,
			validator("param", GroupIdParamSchema),
			validator("json", PatchGroupJsonSchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "write")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const params = c.req.valid("json");
				const group = await services.groupsService.updateGroup({
					groupId,
					...params,
				});
				const response: PatchGroupResponseApi = { data: group };
				return c.json(response, 200);
			},
		)
		.get(
			"/:groupId",
			GetGroupRoute,
			validator("param", GroupIdParamSchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "read")) {
					throwHTTPException404NotFound("Not Found", {
						res: c.res,
						cause: { code: API_ERROR.GROUP_NOT_FOUND },
					});
				}

				const group = await services.groupsService.getGroupById(groupId);
				if (!group) {
					throwHTTPException404NotFound("Not Found", {
						res: c.res,
						cause: { code: API_ERROR.GROUP_NOT_FOUND },
					});
				}
				const currentUserRole =
					groups.find((entry) => entry.id === groupId)?.role ?? null;
				const response: GetGroupResponseApi = {
					data: {
						...group,
						currentUserRole,
					},
				};
				return c.json(response, 200);
			},
		)
		.get(
			"/:groupId/members",
			GetGroupMembersRoute,
			validator("param", GroupIdParamSchema),
			validator("query", GetGroupMembersQuerySchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const query = c.req.valid("query");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "read")) {
					throwHTTPException404NotFound("Not Found", {
						res: c.res,
						cause: { code: API_ERROR.GROUP_NOT_FOUND },
					});
				}

				const result = await services.groupsService.getGroupMembersByGroupId(
					groupId,
					query,
				);
				const response: GetGroupMembersResponseApi = result;
				return c.json(response, 200);
			},
		)
		.delete(
			"/:groupId",
			DeleteGroupRoute,
			validator("param", GroupIdParamSchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "admin")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				await services.groupsService.softDeleteGroup(groupId);
				const response: DeleteGroupResponseApi = {
					data: { id: groupId, deleted: true },
				};
				return c.json(response, 200);
			},
		)
		.delete(
			"/:groupId/members/:userId",
			DeleteGroupMemberRoute,
			validator("param", GroupMemberIdParamSchema),
			async (c) => {
				const { groupId, userId } = c.req.valid("param");
				const groups = c.get("groups");
				const requesterId = c.get("userId");
				const isSelfLeave = requesterId === userId;
				if (!isSelfLeave && !hasPermission(groups, groupId, "admin")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const member = await services.groupsService.getGroupMember({
					groupId,
					userId,
				});
				if (!member) {
					throwHTTPException404NotFound("Member not found", {
						res: c.res,
						cause: { code: API_ERROR.USER_NOT_FOUND },
					});
				}
				if (isSelfLeave && member.role === ROLES.OWNER) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				await services.groupsService.removeGroupMember({ groupId, userId });
				const response: DeleteGroupMemberResponseApi = {
					data: { groupId, userId, deleted: true },
				};
				return c.json(response, 200);
			},
		)
		.patch(
			"/:groupId/members/:userId/role",
			PatchGroupMemberRoleRoute,
			validator("param", GroupMemberIdParamSchema),
			validator("json", PatchGroupMemberRoleJsonSchema),
			async (c) => {
				const { groupId, userId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "admin")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const requesterId = c.get("userId");
				if (requesterId === userId) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const requesterMembership = groups.find(
					(group) => group.id === groupId,
				);
				const targetMember = await services.groupsService.getGroupMember({
					groupId,
					userId,
				});
				if (!targetMember) {
					throwHTTPException404NotFound("Member not found", {
						res: c.res,
						cause: { code: API_ERROR.USER_NOT_FOUND },
					});
				}
				if (targetMember.role === ROLES.OWNER) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				if (
					requesterMembership?.role !== ROLES.OWNER &&
					targetMember.role === ROLES.ADMIN
				) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const { role } = c.req.valid("json");
				if (requesterMembership?.role !== ROLES.OWNER && role === ROLES.ADMIN) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}
				const member = await services.groupsService.updateGroupMemberRole({
					groupId,
					userId,
					role,
				});
				const response: PatchGroupMemberRoleResponseApi = { data: member };
				return c.json(response, 200);
			},
		);
};
