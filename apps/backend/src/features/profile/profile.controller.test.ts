import type { Context } from "hono";
import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyPasswordMock, hashPasswordMock, loggerErrorMock } = vi.hoisted(
	() => ({
		verifyPasswordMock: vi.fn(),
		hashPasswordMock: vi.fn(),
		loggerErrorMock: vi.fn(),
	}),
);

vi.mock("@urlshortener/services", () => ({
	verifyPassword: verifyPasswordMock,
	hashPassword: hashPasswordMock,
}));

vi.mock("../../middlewares/auth.middleware.js", () => ({
	createAuthMiddleware: vi.fn(
		() => async (c: Context, next: () => Promise<void>) => {
			c.set("userId", "user-id");
			c.set("groups", [{ id: "group-id", role: "OWNER", name: "Core Team" }]);
			c.set("logger", {
				error: loggerErrorMock,
			});
			await next();
		},
	),
}));

import { createProfileController } from "./profile.controller.js";

describe("ProfileController", () => {
	beforeEach(() => {
		verifyPasswordMock.mockReset();
		hashPasswordMock.mockReset();
		loggerErrorMock.mockReset();
	});

	describe("GET /me", () => {
		it("should return current user profile", async () => {
			const user = {
				id: "user-id",
				name: "John Doe",
				email: "john@doe.test",
				emailVerified: true,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-02T00:00:00.000Z"),
			};
			const servicesMock = {
				usersService: {
					getUser: vi.fn().mockResolvedValue(user),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$get();

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({
				data: {
					...user,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: "2024-01-02T00:00:00.000Z",
				},
			});
			expect(servicesMock.usersService.getUser).toHaveBeenCalledWith("user-id");
		});

		it("should return 404 when profile is missing", async () => {
			const servicesMock = {
				usersService: {
					getUser: vi.fn().mockResolvedValue(null),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$get();

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({
				code: "PROFILE_NOT_FOUND",
				error: "Profile not found",
			});
			expect(loggerErrorMock).toHaveBeenCalledWith(
				"Profile not found for userId: user-id",
			);
		});
	});

	describe("GET /groups", () => {
		it("should return groups for current user", async () => {
			const groups = [{ id: "group-id", name: "Core Team", role: "OWNER" }];
			const servicesMock = {
				usersService: {},
				groupsService: {
					getGroupsForUser: vi.fn().mockResolvedValue(groups),
				},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.groups.$get();

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({ data: groups });
			expect(servicesMock.groupsService.getGroupsForUser).toHaveBeenCalledWith(
				"user-id",
			);
		});
	});

	describe("PATCH /me", () => {
		it("should update profile name without password change", async () => {
			const updatedUser = {
				id: "user-id",
				name: "Jane Doe",
				email: "john@doe.test",
				emailVerified: true,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-03T00:00:00.000Z"),
			};
			const servicesMock = {
				usersService: {
					getUserByIdForAuth: vi.fn(),
					updateUserForProfile: vi.fn().mockResolvedValue(updatedUser),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$patch({
				json: {
					name: "Jane Doe",
				},
			});

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({
				data: {
					...updatedUser,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: "2024-01-03T00:00:00.000Z",
				},
			});
			expect(
				servicesMock.usersService.getUserByIdForAuth,
			).not.toHaveBeenCalled();
			expect(
				servicesMock.usersService.updateUserForProfile,
			).toHaveBeenCalledWith({
				userId: "user-id",
				name: "Jane Doe",
				passwordHash: undefined,
			});
		});

		it("should return 400 when current password is incorrect", async () => {
			verifyPasswordMock.mockResolvedValue(false);
			const servicesMock = {
				usersService: {
					getUserByIdForAuth: vi.fn().mockResolvedValue({
						id: "user-id",
						email: "john@doe.test",
						passwordHash: "hashed-password",
						deletedAt: null,
					}),
					updateUserForProfile: vi.fn(),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$patch({
				json: {
					currentPassword: "password123",
					newPassword: "newPassword123",
				},
			});

			expect(response.status).toBe(400);
			await expect(response.json()).resolves.toEqual({
				code: "CURRENT_PASSWORD_INCORRECT",
				error: "Current password is incorrect",
			});
			expect(verifyPasswordMock).toHaveBeenCalledWith(
				"hashed-password",
				"password123",
			);
			expect(
				servicesMock.usersService.updateUserForProfile,
			).not.toHaveBeenCalled();
		});

		it("should return 404 when auth profile is missing during password change", async () => {
			const servicesMock = {
				usersService: {
					getUserByIdForAuth: vi.fn().mockResolvedValue(null),
					updateUserForProfile: vi.fn(),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$patch({
				json: {
					currentPassword: "password123",
					newPassword: "newPassword123",
				},
			});

			expect(response.status).toBe(404);
			await expect(response.json()).resolves.toEqual({
				code: "PROFILE_NOT_FOUND",
				error: "Profile not found",
			});
			expect(loggerErrorMock).toHaveBeenCalledWith(
				"Profile not found for userId: user-id",
			);
		});

		it("should hash new password and update profile", async () => {
			verifyPasswordMock.mockResolvedValue(true);
			hashPasswordMock.mockResolvedValue("new-hashed-password");
			const updatedUser = {
				id: "user-id",
				name: "John Doe",
				email: "john@doe.test",
				emailVerified: true,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-03T00:00:00.000Z"),
			};
			const servicesMock = {
				usersService: {
					getUserByIdForAuth: vi.fn().mockResolvedValue({
						id: "user-id",
						email: "john@doe.test",
						passwordHash: "hashed-password",
						deletedAt: null,
					}),
					updateUserForProfile: vi.fn().mockResolvedValue(updatedUser),
				},
				groupsService: {},
				authService: {},
			};
			// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
			const app = createProfileController(servicesMock as any);
			const client = testClient(app);

			const response = await client.me.$patch({
				json: {
					name: "John Doe",
					currentPassword: "password123",
					newPassword: "newPassword123",
				},
			});

			expect(response.status).toBe(200);
			await expect(response.json()).resolves.toEqual({
				data: {
					...updatedUser,
					createdAt: "2024-01-01T00:00:00.000Z",
					updatedAt: "2024-01-03T00:00:00.000Z",
				},
			});
			expect(hashPasswordMock).toHaveBeenCalledWith("newPassword123");
			expect(
				servicesMock.usersService.updateUserForProfile,
			).toHaveBeenCalledWith({
				userId: "user-id",
				name: "John Doe",
				passwordHash: "new-hashed-password",
			});
		});
	});
});
