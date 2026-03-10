import { API_ERROR } from "@urlshortener/common/constants";
import { Prisma } from "@urlshortener/db";
import {
	throwHTTPException403Forbidden,
	throwHTTPException409Conflict,
} from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../helpers/factories/appWithAuth.js";
import { hasPermission } from "../../helpers/permissions.js";
import { createAuthMiddleware } from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	GetLastWindowCountsRoute,
	GetUrlsRoute,
	PostUrlRoute,
} from "./urls.route.js";
import { GetUrlsQuerySchema, PostUrlJsonSchema } from "./urls.schema.js";
import type {
	GetLastWindowCountsResponseApi,
	GetUrlsResponseApi,
	PostUrlResponseApi,
} from "./urls.type.js";
import { idGenerator, toBase62 } from "./urls.utils.js";

type UrlsControllerServices = Pick<
	AppServices,
	"urlsService" | "authService" | "usersService" | "groupsService"
>;

export const createUrlsController = (services: UrlsControllerServices) => {
	const authMiddleware = createAuthMiddleware(services);

	return appWithAuth
		.createApp()
		.use(authMiddleware)
		.post(
			"/",
			PostUrlRoute,
			validator("json", PostUrlJsonSchema),
			async (c) => {
				const params = c.req.valid("json");
				const groups = c.get("groups");
				if (!hasPermission(groups, params.groupId, "create_url")) {
					throwHTTPException403Forbidden("Forbidden", {
						res: c.res,
						cause: { code: API_ERROR.MISSING_PERMISSION },
					});
				}

				const id = idGenerator.generateId();
				const short = toBase62(id);

				try {
					const url = await services.urlsService.createUrl({
						...params,
						id,
						short,
					});

					const response: PostUrlResponseApi = { data: url };
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
		)
		.get(
			"/",
			GetUrlsRoute,
			validator("query", GetUrlsQuerySchema),
			async (c) => {
				const query = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const urls = await services.urlsService.getUrlsByGroupIds(
					groups,
					query,
				);

				const response: GetUrlsResponseApi = urls;
				return c.json(response, 200);
			},
		)
		.get("/last-window-counts", GetLastWindowCountsRoute, async (c) => {
			const groups = c.get("groups").map(({ id }) => id);
			const data = await services.urlsService.getLastWindowCounts(groups);
			const response: GetLastWindowCountsResponseApi = { data };
			return c.json(response, 200);
		});
};
