import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";
import { createUrlsController } from "./urls.controller.js";

describe("UrlsController", () => {
	describe("GET /:id", () => {
		it("should redirect to the original URL if the shortened URL exists", async () => {
			const servicesMock = {
				urlsService: {
					getShortenUrl: vi.fn().mockResolvedValue("https://example.com"),
				},
				statsPublisher: {
					sendUrlClickedEvent: vi.fn().mockResolvedValue(undefined),
				},
			};

			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client[":id"].$get(
				{
					param: { id: "existing-id" },
				},
				{
					headers: {
						"user-agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
						referer: "https://google.com",
					},
				},
			);

			expect(response.status).toBe(302);
			expect(response.headers.get("Location")).toBe("https://example.com");
			expect(servicesMock.urlsService.getShortenUrl).toHaveBeenCalledWith(
				"existing-id",
			);
			expect(
				servicesMock.statsPublisher.sendUrlClickedEvent,
			).toHaveBeenCalledWith({
				short: "existing-id",
				referrer: "https://google.com",
				browserDimension: "Chrome:122.0.0.0",
				osDimension: "macOS:10.15.7",
				deviceDimension: "desktop",
			});
		});

		it("should return 404 if the shortened URL does not exist", async () => {
			const servicesMock = {
				urlsService: {
					getShortenUrl: vi.fn().mockResolvedValue(undefined),
				},
				statsPublisher: {
					sendUrlClickedEvent: vi.fn(),
				},
			};

			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client[":id"].$get({
				param: { id: "missing-id" },
			});

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({
				code: "URL_NOT_FOUND",
				error: "URL not found",
			});
			expect(servicesMock.urlsService.getShortenUrl).toHaveBeenCalledWith(
				"missing-id",
			);
			expect(
				servicesMock.statsPublisher.sendUrlClickedEvent,
			).not.toHaveBeenCalled();
		});
	});
});
