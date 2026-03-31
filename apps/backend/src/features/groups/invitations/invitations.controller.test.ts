import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appWithAuth } from "../../../helpers/factories/appWithAuth.js";

const { hasPermissionMock } = vi.hoisted(() => ({
	hasPermissionMock: vi.fn(),
}));

vi.mock("../../../helpers/permissions.js", () => ({
	hasPermission: hasPermissionMock,
}));

import { createInvitationsController } from "./invitations.controller.js";

const groupId = "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1111";

describe("GroupInvitationsController", () => {
	beforeEach(() => {
		hasPermissionMock.mockReset();
	});

	it("should return 403 when listing invitations without permission", async () => {
		hasPermissionMock.mockReturnValue(false);
		const servicesMock = {
			invitationsService: {},
			usersService: {},
			mailsService: {},
			authService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const controller = createInvitationsController(servicesMock as any);
		const app = appWithAuth
			.createApp()
			.use("*", async (c, next) => {
				c.set("groups", [{ id: groupId, role: "MEMBER", name: "Core Team" }]);
				c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
				await next();
			})
			.route("/", controller);
		const client = testClient(app);

		const response = await client[":groupId"].invitations.$get({
			param: { groupId },
			query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" },
		});
		expect(response.status).toBe(403);
	});

	it("should return group invitations", async () => {
		hasPermissionMock.mockReturnValue(true);
		const data = [
			{ id: "inv-id", groupId, email: "john@doe.test", role: "MEMBER" },
		];
		const servicesMock = {
			invitationsService: {
				getInvitationsForGroup: vi.fn().mockResolvedValue(data),
			},
			usersService: {},
			mailsService: {},
			authService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const controller = createInvitationsController(servicesMock as any);
		const app = appWithAuth
			.createApp()
			.use("*", async (c, next) => {
				c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
				c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
				await next();
			})
			.route("/", controller);
		const client = testClient(app);

		const response = await client[":groupId"].invitations.$get({
			param: { groupId },
			query: { limit: "10", offset: "0", order: "desc", sort: "createdAt" },
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data });
	});

	it("should return conflict when invitation already exists", async () => {
		hasPermissionMock.mockReturnValue(true);
		const servicesMock = {
			invitationsService: {
				isEmailAlreadyGroupMember: vi.fn().mockResolvedValue(null),
				hasInvitationRefused: vi.fn().mockResolvedValue(null),
				getPendingInvitation: vi.fn().mockResolvedValue({ id: "existing" }),
				createInvitation: vi.fn(),
			},
			usersService: {},
			mailsService: {},
			authService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const controller = createInvitationsController(servicesMock as any);
		const app = appWithAuth
			.createApp()
			.use("*", async (c, next) => {
				c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
				c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
				await next();
			})
			.route("/", controller);
		const client = testClient(app);

		const response = await client[":groupId"].invitations.$post({
			param: { groupId },
			json: { email: "john@doe.test", role: "MEMBER" },
		});
		expect(response.status).toBe(409);
	});

	it("should create invitation and send email", async () => {
		hasPermissionMock.mockReturnValue(true);
		vi.spyOn(Date, "now").mockReturnValue(
			new Date("2024-01-01T00:00:00.000Z").getTime(),
		);
		const invitation = {
			id: "inv-id",
			groupId,
			email: "john@doe.test",
			role: "MEMBER",
			invitedById: "123e4567-e89b-42d3-a456-426614174000",
			expiresAt: new Date("2024-01-08T00:00:00.000Z"),
		};
		const servicesMock = {
			invitationsService: {
				isEmailAlreadyGroupMember: vi.fn().mockResolvedValue(null),
				hasInvitationRefused: vi.fn().mockResolvedValue(null),
				getPendingInvitation: vi.fn().mockResolvedValue(null),
				createInvitation: vi.fn().mockResolvedValue(invitation),
			},
			usersService: {
				getUser: vi.fn().mockResolvedValue({ name: "Jane Doe" }),
			},
			mailsService: {
				sendInvitationsEmail: vi.fn().mockResolvedValue(undefined),
			},
			authService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const controller = createInvitationsController(servicesMock as any);
		const app = appWithAuth
			.createApp()
			.use("*", async (c, next) => {
				c.set("groups", [{ id: groupId, role: "OWNER", name: "Core Team" }]);
				c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
				await next();
			})
			.route("/", controller);
		const client = testClient(app);

		const response = await client[":groupId"].invitations.$post({
			param: { groupId },
			json: { email: "john@doe.test", role: "MEMBER" },
		});
		expect(response.status).toBe(201);
		expect(servicesMock.mailsService.sendInvitationsEmail).toHaveBeenCalledWith(
			"john@doe.test",
			"Core Team",
			"Jane Doe",
		);
	});
});
