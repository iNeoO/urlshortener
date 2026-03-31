import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { hasPermissionMock, generateIdMock, toBase62Mock, authGroups } =
	vi.hoisted(() => ({
		hasPermissionMock: vi.fn(),
		generateIdMock: vi.fn(),
		toBase62Mock: vi.fn(),
		authGroups: [{ id: "group-id", role: "OWNER", name: "Core Team" }],
	}));

vi.mock("../../helpers/permissions.js", () => ({
	hasPermission: hasPermissionMock,
}));

vi.mock("../../middlewares/auth.middleware.js", () => ({
	createAuthMiddleware: vi.fn(
		() => async (c: Context, next: () => Promise<void>) => {
			c.set("userId", "user-id");
			c.set("groups", authGroups);
			await next();
		},
	),
}));

vi.mock("./urls.utils.js", () => ({
	idGenerator: {
		generateId: generateIdMock,
	},
	toBase62: toBase62Mock,
}));

import type { Context } from "hono";
import { createUrlsController } from "./urls.controller.js";

describe("UrlsController", () => {
	beforeEach(() => {
		hasPermissionMock.mockReset();
		generateIdMock.mockReset();
		toBase62Mock.mockReset();
	});

	describe("POST /", () => {
		it("should return 403 when user does not have permission to create url", async () => {
			hasPermissionMock.mockReturnValue(false);

			const servicesMock = {
				urlsService: {
					createUrl: vi.fn(),
				},
				authService: {},
				usersService: {},
				groupsService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client.index.$post({
				json: {
					name: "Homepage",
					description: "Main page",
					original: "https://example.com",
					groupId: "group-id",
				},
			});

			expect(response.status).toBe(403);
			await expect(response.json()).resolves.toEqual({
				code: "MISSING_PERMISSION",
				error: "Forbidden",
			});
			expect(servicesMock.urlsService.createUrl).not.toHaveBeenCalled();
		});

		it("should create url and return 201 when user has permission", async () => {
			hasPermissionMock.mockReturnValue(true);
			generateIdMock.mockReturnValue("generated-id");
			toBase62Mock.mockReturnValue("short123");

			const createdUrl = {
				id: "generated-id",
				name: "Homepage",
				description: "Main page",
				original: "https://example.com",
				short: "short123",
				groupId: "group-id",
			};
			const servicesMock = {
				urlsService: {
					createUrl: vi.fn().mockResolvedValue(createdUrl),
				},
				authService: {},
				usersService: {},
				groupsService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client.index.$post({
				json: {
					name: "Homepage",
					description: "Main page",
					original: "https://example.com",
					groupId: "group-id",
				},
			});

			expect(response.status).toBe(201);
			await expect(response.json()).resolves.toEqual({
				data: createdUrl,
			});
			expect(hasPermissionMock).toHaveBeenCalledWith(
				authGroups,
				"group-id",
				"create_url",
			);
			expect(generateIdMock).toHaveBeenCalled();
			expect(toBase62Mock).toHaveBeenCalledWith("generated-id");
			expect(servicesMock.urlsService.createUrl).toHaveBeenCalledWith({
				id: "generated-id",
				short: "short123",
				name: "Homepage",
				description: "Main page",
				original: "https://example.com",
				groupId: "group-id",
			});
		});
	});

	describe("GET /", () => {
		it("should return urls for authenticated groups", async () => {
			const urlsResponse = {
				data: [
					{
						id: "url-id",
						name: "Homepage",
						description: "Main page",
						original: "https://example.com",
						short: "short123",
						totalClicks: 12,
					},
				],
				total: 1,
			};
			const servicesMock = {
				urlsService: {
					getUrlsByGroupIds: vi.fn().mockResolvedValue(urlsResponse),
				},
				authService: {},
				usersService: {},
				groupsService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client.index.$get({
				query: {
					limit: "10",
					offset: "0",
					order: "desc",
					sort: "createdAt",
				},
			});

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual(urlsResponse);
			expect(servicesMock.urlsService.getUrlsByGroupIds).toHaveBeenCalledWith(
				["group-id"],
				{
					limit: 10,
					offset: 0,
					order: "desc",
					sort: "createdAt",
				},
			);
		});
	});

	describe("GET /last-window-counts", () => {
		it("should return last window counts for authenticated groups", async () => {
			const lastWindowCounts = [
				{
					urlId: "url-id",
					short: "short123",
					redirect: "https://example.com",
					count: 5,
					windowStart: "2024-01-01T10:00:00.000Z",
					windowEnd: "2024-01-01T10:01:00.000Z",
				},
			];
			const servicesMock = {
				urlsService: {
					getLastWindowCounts: vi.fn().mockResolvedValue(lastWindowCounts),
				},
				authService: {},
				usersService: {},
				groupsService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createUrlsController(servicesMock as any);
			const client = testClient(app);

			const response = await client["last-window-counts"].$get();

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({
				data: lastWindowCounts,
			});
			expect(servicesMock.urlsService.getLastWindowCounts).toHaveBeenCalledWith(
				["group-id"],
			);
		});
	});
});
