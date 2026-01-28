import { validator } from "hono-openapi";
import { appWithLogs } from "../../helpers/factories/appWithLogs.js";
import {
	GetCampaignsRoute,
	GetLastHourClicksRoute,
} from "./campaigns.route.js";
import { GetCampaignsQuerySchema } from "./campaigns.schema.js";
import {
	getCampaigns,
	getClicksLastHourByMinute,
} from "./campaigns.service.js";
import type {
	CampaignsResponseApi,
	LastHourClicksResponseApi,
} from "./campaigns.type.js";

export const campaignsController = appWithLogs
	.createApp()
	.get(
		"/",
		GetCampaignsRoute(),
		validator("query", GetCampaignsQuerySchema),
		async (c) => {
			const query = c.req.valid("query");
			const campaigns = await getCampaigns(query);
			return c.json(campaigns satisfies CampaignsResponseApi);
		},
	)
	.get("/clicks/last-hour", GetLastHourClicksRoute(), async (c) => {
		const data = await getClicksLastHourByMinute();
		return c.json({ data } satisfies LastHourClicksResponseApi);
	});
