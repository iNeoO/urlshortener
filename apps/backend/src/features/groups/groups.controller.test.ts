import type { Context } from "hono";
import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { hasPermissionMock } = vi.hoisted(() => ({
	hasPermissionMock: vi.fn(),
}));

vi.mock("../../helpers/permissions.js", () => ({
	hasPermission: hasPermissionMock,
}));

vi.mock("../../middlewares/auth.middleware.js", () => ({
	createAuthMiddleware: vi.fn(
		() => async (c: Context, next: () => Promise<void>) => {
			c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
			c.set("groups", [
				{
					id: "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111",
					role: "OWNER",
					name: "Core Team",
				},
			]);
			await next();
		},
	),
}));

import { createGroupsController } from "./groups.controller.js";

const groupId = "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111";
const userId = "123e4567-e89b-42d3-a456-426614174000";

describe("GroupsController", () => {
	beforeEach(() => {
		hasPermissionMock.mockReset();
	});

	it("should return groups summary", async () => {
		const result = { data: [], total: 0 };
		const servicesMock = {
			groupsService: {
				getGroupsSummaryForUser: vi.fn().mockResolvedValue(result),
			},
			urlsService: {},
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupsController(servicesMock as any);
		const client = testClient(app);
		const response = await client.index.$get({
			query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" },
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual(result);
	});

	it("should create group", async () => {
		const group = {
			id: groupId,
			name: "Core Team",
			description: "Main",
			createdById: userId,
			createdAt: new Date("2024-01-01T00:00:00.000Z"),
			updatedAt: new Date("2024-01-01T00:00:00.000Z"),
		};
		const servicesMock = {
			groupsService: { createGroup: vi.fn().mockResolvedValue(group) },
			urlsService: {},
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupsController(servicesMock as any);
		const client = testClient(app);
		const response = await client.index.$post({
			json: { name: "Core Team", description: "Main" },
		});
		expect(response.status).toBe(201);
		await expect(response.json()).resolves.toEqual({
			data: {
				...group,
				createdAt: "2024-01-01T00:00:00.000Z",
				updatedAt: "2024-01-01T00:00:00.000Z",
			},
		});
	});

	it("should return 404 when group is not readable", async () => {
		hasPermissionMock.mockReturnValue(false);
		const servicesMock = {
			groupsService: { getGroupById: vi.fn() },
			urlsService: {},
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupsController(servicesMock as any);
		const client = testClient(app);
		const response = await client[":groupId"].$get({ param: { groupId } });
		expect(response.status).toBe(404);
	});

	it("should delete group member", async () => {
		hasPermissionMock.mockReturnValue(true);
		const servicesMock = {
			groupsService: {
				getGroupMember: vi.fn().mockResolvedValue({ role: "MEMBER" }),
				removeGroupMember: vi.fn().mockResolvedValue(undefined),
			},
			urlsService: {},
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupsController(servicesMock as any);
		const client = testClient(app);
		const otherUserId = "123e4567-e89b-42d3-a456-426614174999";
		const response = await client[":groupId"].members[":userId"].$delete({
			param: { groupId, userId: otherUserId },
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			data: { groupId, userId: otherUserId, deleted: true },
		});
	});

	it("should update member role", async () => {
		hasPermissionMock.mockReturnValue(true);
		const servicesMock = {
			groupsService: {
				getGroupMember: vi.fn().mockResolvedValue({ role: "MEMBER" }),
				updateGroupMemberRole: vi.fn().mockResolvedValue({
					groupId,
					userId: "123e4567-e89b-42d3-a456-426614174999",
					role: "ADMIN",
				}),
			},
			urlsService: {},
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createGroupsController(servicesMock as any);
		const client = testClient(app);
		const otherUserId = "123e4567-e89b-42d3-a456-426614174999";
		const response = await client[":groupId"].members[":userId"].role.$patch({
			param: { groupId, userId: otherUserId },
			json: { role: "ADMIN" },
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			data: { groupId, userId: otherUserId, role: "ADMIN" },
		});
	});
});
