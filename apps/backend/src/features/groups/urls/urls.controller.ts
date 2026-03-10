import { API_ERROR } from "@urlshortener/common/constants";
import { Prisma } from "@urlshortener/db";
import {
	throwHTTPException403Forbidden,
	throwHTTPException409Conflict,
} from "@urlshortener/infra/helpers";
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

type GroupUrlsControllerServices = Pick<AppServices, "urlsService">;

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
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
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
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
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

					const response: PostGroupUrlResponseApi = {
						data: {
							...url,
							totalClicks: 0,
						},
					};
					return c.json(response, 201);
				} catch (err) {
					if (
						err instanceof Prisma.PrismaClientKnownRequestError &&
						err.code === "P2002"
					) {
						throwHTTPException409Conflict(
							"Short URL collision. Please retry.",
							{
								res: c.res,
								cause: { code: "SHORT_URL_COLLISION" },
							},
						);
					}
					throw err;
				}
			},
		);
