import { appWithLogs } from "@urlshortener/infra/factories";
import { apiError } from "@urlshortener/infra/helpers";
import { validator } from "hono-openapi";
import type { AppServices } from "../../services/container.js";
import { RedirectShortenUrlRoute } from "./urls.route.js";
import { GetShortenUrlParamSchema } from "./urls.schema.js";
import {
	parseUserAgent,
	toBrowserDimension,
	toOsDimension,
} from "./urls.userAgent.js";

type UrlsControllerServices = Pick<
	AppServices,
	"urlsService" | "statsPublisher"
>;

export const createUrlsController = (services: UrlsControllerServices) =>
	appWithLogs
		.createApp()
		.get(
			"/:id",
			RedirectShortenUrlRoute,
			validator("param", GetShortenUrlParamSchema),
			async (c) => {
				const id = c.req.valid("param").id;

				const url = await services.urlsService.getShortenUrl(id);

				if (!url) {
					return apiError(c, "URL_NOT_FOUND");
				}

				const userAgent = c.req.header("user-agent") || "UNKNOWN";
				const referrer = c.req.header("referer");
				const ua = parseUserAgent(userAgent);
				const logger = c.get("logger");

				void services.statsPublisher
					.sendUrlClickedEvent({
						short: id,
						referrer,
						browserDimension: toBrowserDimension(ua),
						osDimension: toOsDimension(ua),
						deviceDimension: ua.deviceType,
					})
					.catch((error) => {
						logger.error(
							{
								err: error,
								short: id,
								referrer,
							},
							"Failed to publish stats.url-clicked event",
						);
					});

				return c.redirect(url, 302);
			},
		);
