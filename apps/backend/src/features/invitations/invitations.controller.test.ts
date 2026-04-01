import { testClient } from "hono/testing";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../middlewares/auth.middleware.js", () => ({
	createAuthMiddleware: vi.fn(
		() => async (c: Context, next: () => Promise<void>) => {
			c.set("userId", "123e4567-e89b-42d3-a456-426614174000");
			c.set("groups", []);
			await next();
		},
	),
}));

import type { Context } from "hono";
import { createInvitationsController } from "./invitations.controller.js";

const invitationId = "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f1234";

describe("InvitationsController", () => {
	it("should return invitations for current user", async () => {
		const invitations = [
			{
				id: invitationId,
				groupId: "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f9999",
				email: "john@doe.test",
				role: "ADMIN",
			},
		];
		const servicesMock = {
			invitationsService: {
				getInvitationsForUser: vi.fn().mockResolvedValue(invitations),
			},
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createInvitationsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.invitations.$get({
			query: {
				limit: "10",
				offset: "0",
				order: "desc",
				sort: "createdAt",
			},
		});

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data: invitations });
	});

	it("should return forbidden when accepting invitation is not allowed", async () => {
		const servicesMock = {
			invitationsService: {
				acceptInvitation: vi.fn().mockResolvedValue({ status: "forbidden" }),
			},
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createInvitationsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.invitations[":invitationId"].accept.$post({
			param: { invitationId },
		});

		expect(response.status).toBe(403);
		await expect(response.json()).resolves.toEqual({
			code: "MISSING_PERMISSION",
			error: "Forbidden",
		});
	});

	it("should refuse invitation and return updated invitation", async () => {
		const invitation = {
			id: invitationId,
			groupId: "0195f8b4-8b5a-7cc0-a8f3-9c0d6e4f9999",
			email: "john@doe.test",
			role: "MEMBER",
		};
		const servicesMock = {
			invitationsService: {
				refuseInvitation: vi
					.fn()
					.mockResolvedValue({ status: "refused", invitation }),
			},
			authService: {},
			usersService: {},
			groupsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createInvitationsController(servicesMock as any);
		const client = testClient(app);

		const response = await client.invitations[":invitationId"].refuse.$post({
			param: { invitationId },
		});

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data: invitation });
	});
});
