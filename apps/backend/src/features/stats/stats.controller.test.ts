import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../middlewares/auth.middleware.js", () => ({
	createAuthMiddleware: vi.fn(() => async (c: any, next: () => Promise<void>) => {
		c.set("userId", "user-id");
		c.set("groups", [{ id: "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111", role: "OWNER", name: "Core Team" }]);
		await next();
	}),
}));

import { createStatsController } from "./stats.controller.js";

describe("StatsController", () => {
	it("should return stats list", async () => {
		const stats = { data: [{ id: "url-id", name: "Homepage", description: "Main", original: "https://example.com", short: "abc", createdAt: new Date("2024-01-01T00:00:00.000Z"), totalClicks: 3 }], total: 1 };
		const servicesMock = {
			statsService: { getStats: vi.fn().mockResolvedValue(stats) },
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createStatsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.$get({ query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" } });
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			data: [{ ...stats.data[0], createdAt: "2024-01-01T00:00:00.000Z" }],
			total: 1,
		});
	});

	it("should return click stats by range", async () => {
		const data = [{ window: new Date("2024-01-01T10:00:00.000Z"), count: 5 }];
		const servicesMock = {
			statsService: { getStatsByRange: vi.fn().mockResolvedValue(data) },
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createStatsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.clicks.$get({ query: { range: "1h", urlId: "url-id" } });
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			data: [{ window: "2024-01-01T10:00:00.000Z", count: 5 }],
		});
	});

	it("should return browser stats by value", async () => {
		const data = [{ value: "Chrome", count: 7 }];
		const servicesMock = {
			statsService: { getStatsByValue: vi.fn().mockResolvedValue(data) },
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createStatsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.browsers.$get({ query: { range: "24h", urlId: "url-id" } });
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data });
		expect(servicesMock.statsService.getStatsByValue).toHaveBeenCalledWith(
			"BROWSER",
			["0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111"],
			"24h",
			"url-id",
		);
	});
});
