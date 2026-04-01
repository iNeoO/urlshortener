import { STATS_VALUE } from "@urlshortener/common/constants";
import { validator } from "hono-openapi";
import { appWithAuth } from "../../helpers/factories/appWithAuth.js";
import { createAuthMiddleware } from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	GetStatsByRangeBrowsersRoute,
	GetStatsByRangeClicksRoute,
	GetStatsByRangeDevicesRoute,
	GetStatsByRangeOsRoute,
	GetStatsByRangeReferrersRoute,
	GetStatsRoute,
} from "./stats.route.js";
import {
	GetStatsQuerySchema,
	GetStatsRangeQuerySchema,
} from "./stats.schema.js";
import type {
	LastHourClicksResponseApi,
	LastHourStatsByValueResponseApi,
	StatsResponseApi,
} from "./stats.type.js";

type StatsControllerServices = Pick<
	AppServices,
	"statsService" | "authService" | "usersService" | "groupsService"
>;

export const createStatsController = (services: StatsControllerServices) => {
	const authMiddleware = createAuthMiddleware(services);

	return appWithAuth
		.createApp()
		.use(authMiddleware)
		.get(
			"/",
			GetStatsRoute,
			validator("query", GetStatsQuerySchema),
			async (c) => {
				const query = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const stats = await services.statsService.getStats(groups, query);
				const response: StatsResponseApi = stats;
				return c.json(response);
			},
		)
		.get(
			"/clicks",
			GetStatsByRangeClicksRoute,
			validator("query", GetStatsRangeQuerySchema),
			async (c) => {
				const { range, urlId } = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const data = await services.statsService.getStatsByRange(
					groups,
					range,
					urlId,
				);
				const response: LastHourClicksResponseApi = { data };
				return c.json(response);
			},
		)
		.get(
			"/browsers",
			GetStatsByRangeBrowsersRoute,
			validator("query", GetStatsRangeQuerySchema),
			async (c) => {
				const { range, urlId } = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const data = await services.statsService.getStatsByValue(
					STATS_VALUE.BROWSER,
					groups,
					range,
					urlId,
				);
				const response: LastHourStatsByValueResponseApi = { data };
				return c.json(response);
			},
		)
		.get(
			"/os",
			GetStatsByRangeOsRoute,
			validator("query", GetStatsRangeQuerySchema),
			async (c) => {
				const { range, urlId } = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const data = await services.statsService.getStatsByValue(
					STATS_VALUE.OS,
					groups,
					range,
					urlId,
				);
				const response: LastHourStatsByValueResponseApi = { data };
				return c.json(response);
			},
		)
		.get(
			"/devices",
			GetStatsByRangeDevicesRoute,
			validator("query", GetStatsRangeQuerySchema),
			async (c) => {
				const { range, urlId } = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const data = await services.statsService.getStatsByValue(
					STATS_VALUE.DEVICE,
					groups,
					range,
					urlId,
				);
				const response: LastHourStatsByValueResponseApi = { data };
				return c.json(response);
			},
		)
		.get(
			"/referrers",
			GetStatsByRangeReferrersRoute,
			validator("query", GetStatsRangeQuerySchema),
			async (c) => {
				const { range, urlId } = c.req.valid("query");
				const groups = c.get("groups").map(({ id }) => id);
				const data = await services.statsService.getStatsByValue(
					STATS_VALUE.REFERRER,
					groups,
					range,
					urlId,
				);
				const response: LastHourStatsByValueResponseApi = { data };
				return c.json(response);
			},
		);
};
