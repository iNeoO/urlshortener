import { describeRoute, resolver } from "hono-openapi";
import {
	GetCampaignsResponseSchema,
	GetLastHourClicksResponseSchema,
} from "./campaigns.schema.js";

export const GetCampaignsRoute = () =>
	describeRoute({
		responses: {
			200: {
				description: "Successful response",
				content: {
					"application/json": {
						schema: resolver(GetCampaignsResponseSchema),
					},
				},
			},
		},
	});

export const GetLastHourClicksRoute = () =>
	describeRoute({
		responses: {
			200: {
				description: "Successful response",
				content: {
					"application/json": {
						schema: resolver(GetLastHourClicksResponseSchema),
					},
				},
			},
		},
	});
