import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { hasPermissionMock, generateIdMock, toBase62Mock } = vi.hoisted(() => ({
	hasPermissionMock: vi.fn(),
	generateIdMock: vi.fn(),
	toBase62Mock: vi.fn(),
}));

vi.mock("../../../helpers/permissions.js", () => ({
	hasPermission: hasPermissionMock,
}));

vi.mock("../../urls/urls.utils.js", () => ({
	idGenerator: { generateId: generateIdMock },
	toBase62: toBase62Mock,
}));

import { createGroupUrlsController } from "./urls.controller.js";

const groupId = "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111";

describe("GroupUrlsController", () => {
	beforeEach(() => {
		hasPermissionMock.mockReset();
		generateIdMock.mockReset();
		toBase62Mock.mockReset();
	});

	it("should return 403 when listing urls without read permission", async () => {
		hasPermissionMock.mockReturnValue(false);
		const servicesMock = {
			groupsService: {},
			urlsService: { getUrlsByGroupIds: vi.fn() },
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupUrlsController(servicesMock as any);
		app.use("*", async (c, next) => {
			c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
			await next();
		});
		const client = testClient(app);

		const response = await client[":groupId"].urls.$get({
			param: { groupId },
			query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" },
		});
		expect(response.status).toBe(403);
	});

	it("should return urls for group", async () => {
		hasPermissionMock.mockReturnValue(true);
		const urls = { data: [], total: 0 };
		const servicesMock = {
			groupsService: {},
			urlsService: { getUrlsByGroupIds: vi.fn().mockResolvedValue(urls) },
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupUrlsController(servicesMock as any);
		app.use("*", async (c, next) => {
			c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
			await next();
		});
		const client = testClient(app);

		const response = await client[":groupId"].urls.$get({
			param: { groupId },
			query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" },
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual(urls);
	});

	it("should create group url", async () => {
		hasPermissionMock.mockReturnValue(true);
		generateIdMock.mockReturnValue("generated-id");
		toBase62Mock.mockReturnValue("short123");
		const created = {
			id: "generated-id",
			name: "Homepage",
			description: "Main",
			original: "https://example.com",
			short: "short123",
			groupId,
		};
		const servicesMock = {
			groupsService: {
				getGroupById: vi
					.fn()
					.mockResolvedValue({ name: "Core Team", description: "Main group" }),
			},
			urlsService: { createUrl: vi.fn().mockResolvedValue(created) },
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupUrlsController(servicesMock as any);
		app.use("*", async (c, next) => {
			c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
			await next();
		});
		const client = testClient(app);

		const response = await client[":groupId"].urls.$post({
			param: { groupId },
			json: {
				name: "Homepage",
				description: "Main",
				original: "https://example.com",
			},
		});
		expect(response.status).toBe(201);
		await expect(response.json()).resolves.toEqual({
			data: {
				...created,
				totalClicks: 0,
				group: { id: groupId, name: "Core Team", description: "Main group" },
			},
		});
	});
});
