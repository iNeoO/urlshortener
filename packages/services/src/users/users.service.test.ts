import { describe, expect, it, vi } from "vitest";
import { UsersService } from "./users.service.js";

const mockUser = {
	id: "user-id",
	name: "John Doe",
	email: "john@doe.test",
};

const mockUserForAuth = {
	...mockUser,
	passwordHash: "hashed-password",
	deletedAt: null,
	emailVerified: false,
	createdAt: new Date("2024-01-01T00:00:00.000Z"),
	updatedAt: new Date("2024-01-02T00:00:00.000Z"),
};

describe("UsersService", () => {
	describe("getUser", () => {
		it("should return user", async () => {
			const prismaMock = {
				user: {
					findUnique: vi.fn().mockResolvedValue(mockUser),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = await usersService.getUser("user-id");

			expect(result).toEqual(mockUser);
			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: {
					id: "user-id",
					deletedAt: null,
				},
				omit: {
					passwordHash: true,
					deletedAt: true,
				},
			});
		});
	});

	describe("getUserByIdForAuth", () => {
		it("should return user for auth by id", async () => {
			const prismaMock = {
				user: {
					findUnique: vi.fn().mockResolvedValue(mockUserForAuth),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = await usersService.getUserByIdForAuth("user-id");

			expect(result).toEqual(mockUserForAuth);
			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: {
					id: "user-id",
				},
			});
		});
	});

	describe("getUserByEmailForAuth", () => {
		it("should return user for auth by email", async () => {
			const prismaMock = {
				user: {
					findUnique: vi.fn().mockResolvedValue(mockUserForAuth),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = await usersService.getUserByEmailForAuth("john@doe.test");

			expect(result).toEqual(mockUserForAuth);
			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: {
					email: "john@doe.test",
				},
			});
		});
	});

	describe("createUserForAuth", () => {
		it("should create user for auth", async () => {
			const prismaMock = {
				user: {
					create: vi.fn().mockResolvedValue(mockUser),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = await usersService.createUserForAuth({
				name: "John Doe",
				email: "john@doe.test",
				passwordHash: "hashed-password",
			});

			expect(result).toEqual(mockUser);
			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					name: "John Doe",
					email: "john@doe.test",
					passwordHash: "hashed-password",
					emailVerified: false,
				},
				omit: {
					passwordHash: true,
					deletedAt: true,
				},
			});
		});
	});

	describe("updateUserForProfile", () => {
		it("should update user profile with provided fields", async () => {
			const prismaMock = {
				user: {
					update: vi.fn().mockResolvedValue(mockUser),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = await usersService.updateUserForProfile({
				userId: "user-id",
				name: "Jane Doe",
				passwordHash: "new-hashed-password",
			});

			expect(result).toEqual(mockUser);
			expect(prismaMock.user.update).toHaveBeenCalledWith({
				where: {
					id: "user-id",
					deletedAt: null,
				},
				data: {
					name: "Jane Doe",
					passwordHash: "new-hashed-password",
				},
				omit: {
					passwordHash: true,
					deletedAt: true,
				},
			});
		});

		it("should omit undefined fields when updating user profile", async () => {
			const prismaMock = {
				user: {
					update: vi.fn().mockResolvedValue(mockUser),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			await usersService.updateUserForProfile({
				userId: "user-id",
				name: "Jane Doe",
				passwordHash: undefined,
			});

			expect(prismaMock.user.update).toHaveBeenCalledWith({
				where: {
					id: "user-id",
					deletedAt: null,
				},
				data: {
					name: "Jane Doe",
				},
				omit: {
					passwordHash: true,
					deletedAt: true,
				},
			});
		});
	});

	describe("updateUserEmailVerified", () => {
		it("should update user email verification flag", async () => {
			const prismaMock = {
				user: {
					update: vi.fn().mockResolvedValue(undefined),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			await usersService.updateUserEmailVerified("user-id");

			expect(prismaMock.user.update).toHaveBeenCalledWith({
				where: {
					id: "user-id",
				},
				data: {
					emailVerified: true,
				},
			});
		});
	});

	describe("sanitizeUser", () => {
		it("should remove sensitive fields from user", () => {
			const prismaMock = {
				user: {},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;

			const usersService = new UsersService(prismaMock);

			const result = usersService.sanitizeUser(mockUserForAuth);

			expect(result).toEqual({
				id: "user-id",
				name: "John Doe",
				email: "john@doe.test",
				emailVerified: false,
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-02T00:00:00.000Z"),
			});
		});
	});
});
