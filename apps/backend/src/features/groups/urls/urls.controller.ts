import { Prisma } from "@urlshortener/db";
import { apiError } from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../../helpers/factories/appWithAuth.js";
import { hasPermission } from "../../../helpers/permissions.js";
import type { AppServices } from "../../../services/container.js";
import { idGenerator, toBase62 } from "../../urls/urls.utils.js";
import { GroupIdParamSchema } from "../groups.schema.js";
import { GetGroupUrlsRoute, PostGroupUrlRoute } from "./urls.route.js";
import {
	GetGroupUrlsQuerySchema,
	PostGroupUrlJsonSchema,
} from "./urls.schema.js";
import type {
	GetGroupUrlsResponseApi,
	PostGroupUrlResponseApi,
} from "./urls.type.js";

type GroupUrlsControllerServices = Pick<AppServices, "groupsService" | "urlsService">;

export const createGroupUrlsController = (
	services: GroupUrlsControllerServices,
) =>
	appWithAuth
		.createApp()
		.get(
			"/:groupId/urls",
			GetGroupUrlsRoute,
			validator("param", GroupIdParamSchema),
			validator("query", GetGroupUrlsQuerySchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const query = c.req.valid("query");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "read")) {
					return apiError(c, "GROUP_MISSING_PERMISSION");
				}

				const urls = await services.urlsService.getUrlsByGroupIds(
					[groupId],
					query,
				);
				const response: GetGroupUrlsResponseApi = urls;
				return c.json(response, 200);
			},
		)
		.post(
			"/:groupId/urls",
			PostGroupUrlRoute,
			validator("param", GroupIdParamSchema),
			validator("json", PostGroupUrlJsonSchema),
			async (c) => {
				const { groupId } = c.req.valid("param");
				const groups = c.get("groups");
				if (!hasPermission(groups, groupId, "create_url")) {
					return apiError(c, "GROUP_MISSING_PERMISSION");
				}

				const params = c.req.valid("json");
				const id = idGenerator.generateId();
				const short = toBase62(id);

				try {
					const url = await services.urlsService.createUrl({
						...params,
						id,
						short,
						groupId,
					});
					const group = await services.groupsService.getGroupById(groupId);

					const response: PostGroupUrlResponseApi = {
						data: {
							...url,
							totalClicks: 0,
							group: {
								id: groupId,
								name: group?.name ?? "",
								description: group?.description ?? null,
							},
						},
					};
					return c.json(response, 201);
				} catch (err) {
					if (
						err instanceof Prisma.PrismaClientKnownRequestError &&
						err.code === "P2002"
					) {
						return apiError(c, "SHORT_URL_COLLISION");
					}
					throw err;
				}
			},
		);
