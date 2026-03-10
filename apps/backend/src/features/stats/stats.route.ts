import {
	openApi401Unauthorized,
	openApiProtectedRoute,
	openApiResponses,
} from "@urlshortener/infra/helpers";
import {
	GetLastHourClicksResponseSchema,
	GetLastHourStatsByValueResponseSchema,
	GetStatsResponseSchema,
} from "./stats.schema.js";

export const GetStatsRoute = openApiProtectedRoute({
	description: "Get Stats",
	responses: {
		...openApiResponses(GetStatsResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetStatsByRangeClicksRoute = openApiProtectedRoute({
	description: "Get Click Stats By Range",
	responses: {
		...openApiResponses(GetLastHourClicksResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetStatsByRangeBrowsersRoute = openApiProtectedRoute({
	description: "Get Browser Stats By Range",
	responses: {
		...openApiResponses(GetLastHourStatsByValueResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetStatsByRangeOsRoute = openApiProtectedRoute({
	description: "Get OS Stats By Range",
	responses: {
		...openApiResponses(GetLastHourStatsByValueResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetStatsByRangeDevicesRoute = openApiProtectedRoute({
	description: "Get Device Stats By Range",
	responses: {
		...openApiResponses(GetLastHourStatsByValueResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});

export const GetStatsByRangeReferrersRoute = openApiProtectedRoute({
	description: "Get Referrer Stats By Range",
	responses: {
		...openApiResponses(GetLastHourStatsByValueResponseSchema),
		...openApi401Unauthorized("Unauthorized"),
	},
});
