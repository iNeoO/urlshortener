import { getLoggerStore } from "@urlshortener/infra/libs";
import { generatePlausibleReferrer } from "./referrer.ts";
import { generateRandomUserAgent } from "./userAgent.ts";

export const fetchRedirection = async (
	url: string,
	abortController: AbortController,
) => {
	const start = new Date();
	const logger = getLoggerStore();
	const userAgent = generateRandomUserAgent();
	const referer = generatePlausibleReferrer();
	try {
		const headers: Record<string, string> = {
			"User-Agent": userAgent,
		};
		if (referer) {
			headers.Referer = referer;
		}

		const response = await fetch(url, {
			headers,
			redirect: "manual",
			signal: abortController.signal,
		});
		const duration = Date.now() - start.getTime();
		const location = response.headers.get("location");
		logger.info(
			{
				duration,
				status: response.status,
				location,
				userAgent,
				referer: referer ?? "direct",
			},
			`Fetch completed in ${duration}ms with user-agent: ${userAgent}`,
		);
		return response;
	} catch (err) {
		if (err instanceof Error) {
			if (err.name === "AbortError") {
				logger.info("Fetch aborted");
			} else {
				logger.error({ err }, "Fetch error:");
			}
		}
	}
};
