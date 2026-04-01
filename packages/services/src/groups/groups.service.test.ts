import { ROLES } from "@urlshortener/common/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerErrorMock = vi.fn();

vi.mock("@urlshortener/infra/libs", () => ({
	getLoggerStore: vi.fn(() => ({
		error: loggerErrorMock,
	})),
}));

import { GroupsService } from "./groups.service.js";

const mockCachedGroups = [
	{
		id: "group-id",
		name: "Core Team",
		role: ROLES.OWNER,
	},
];

describe("GroupsService", () => {
	beforeEach(() => {
		loggerErrorMock.mockReset();
	});

	describe("setCachedGroups", () => {
		it("should set cached groups with cache version", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			const prismaMock = {} as any;
			const redisServiceMock = {
				setCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			await groupsService.setCachedGroups("user-id", mockCachedGroups);

			expect(redisServiceMock.setCachedGroups).toHaveBeenCalledWith("user-id", {
				version: 1,
				data: mockCachedGroups,
			});
		});
	});

	describe("invalidateCachedGroups", () => {
		it("should delete cached groups", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			const prismaMock = {} as any;
			const redisServiceMock = {
				deleteCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			await groupsService.invalidateCachedGroups("user-id");

			expect(redisServiceMock.deleteCachedGroups).toHaveBeenCalledWith(
				"user-id",
			);
		});
	});

	describe("getGroupsForUser", () => {
		it("should return cached groups when cache is valid", async () => {
			const prismaMock = {
				groupMember: {
					findMany: vi.fn(),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedGroups: vi.fn().mockResolvedValue({
					version: 1,
					data: mockCachedGroups,
				}),
				deleteCachedGroups: vi.fn(),
				setCachedGroups: vi.fn(),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupsForUser("user-id");

			expect(result).toEqual(mockCachedGroups);
			expect(prismaMock.groupMember.findMany).not.toHaveBeenCalled();
		});

		it("should invalidate cache when version is outdated and fetch groups", async () => {
			const prismaMock = {
				groupMember: {
					findMany: vi.fn().mockResolvedValue([
						{
							groupId: "group-id",
							role: ROLES.ADMIN,
							group: {
								name: "Core Team",
							},
						},
					]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedGroups: vi.fn().mockResolvedValue({
					version: 0,
					data: mockCachedGroups,
				}),
				deleteCachedGroups: vi.fn().mockResolvedValue(undefined),
				setCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupsForUser("user-id");

			expect(result).toEqual([
				{
					id: "group-id",
					role: ROLES.ADMIN,
					name: "Core Team",
				},
			]);
			expect(redisServiceMock.deleteCachedGroups).toHaveBeenCalledWith(
				"user-id",
			);
			expect(prismaMock.groupMember.findMany).toHaveBeenCalledWith({
				where: { userId: "user-id" },
				select: {
					groupId: true,
					role: true,
					group: { select: { name: true } },
				},
			});
			expect(redisServiceMock.setCachedGroups).toHaveBeenCalledWith("user-id", {
				version: 1,
				data: [
					{
						id: "group-id",
						role: ROLES.ADMIN,
						name: "Core Team",
					},
				],
			});
		});

		it("should recover from cache parse failure and fetch groups", async () => {
			const cacheError = new Error("invalid cache");
			const prismaMock = {
				groupMember: {
					findMany: vi.fn().mockResolvedValue([]),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				getCachedGroups: vi.fn().mockRejectedValue(cacheError),
				deleteCachedGroups: vi.fn().mockResolvedValue(undefined),
				setCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupsForUser("user-id");

			expect(result).toEqual([]);
			expect(loggerErrorMock).toHaveBeenCalledWith(
				{ err: cacheError, userId: "user-id" },
				"Failed to parse cached groups",
			);
			expect(redisServiceMock.deleteCachedGroups).toHaveBeenCalledWith(
				"user-id",
			);
		});
	});

	describe("getGroupsSummaryForUser", () => {
		it("should return groups summary", async () => {
			const createdAt = new Date("2024-01-01T00:00:00.000Z");
			const prismaMock = {
				groupMember: {
					findMany: vi.fn().mockReturnValue("find-many-query"),
					count: vi.fn().mockReturnValue("count-query"),
				},
				$transaction: vi.fn().mockResolvedValue([
					[
						{
							role: ROLES.ADMIN,
							group: {
								id: "group-id",
								name: "Core Team",
								description: "Main group",
								createdAt,
								_count: {
									urls: 5,
									members: 3,
								},
							},
						},
					],
					1,
				]),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupsSummaryForUser("user-id", {
				limit: 20,
				offset: 5,
				order: "asc",
				sort: "name",
				search: "core",
			});

			expect(result).toEqual({
				data: [
					{
						id: "group-id",
						name: "Core Team",
						description: "Main group",
						role: ROLES.ADMIN,
						createdAt,
						totalUrls: 5,
						totalUsers: 3,
					},
				],
				total: 1,
			});
			expect(prismaMock.groupMember.findMany).toHaveBeenCalledWith({
				where: {
					userId: "user-id",
					group: {
						deletedAt: null,
						OR: [
							{ name: { contains: "core", mode: "insensitive" } },
							{ description: { contains: "core", mode: "insensitive" } },
						],
					},
				},
				orderBy: { group: { name: "asc" } },
				skip: 5,
				take: 20,
				select: {
					role: true,
					group: {
						select: {
							id: true,
							name: true,
							description: true,
							createdAt: true,
							_count: {
								select: {
									urls: { where: { deletedAt: null } },
									members: true,
								},
							},
						},
					},
				},
			});
		});
	});

	describe("getGroupById", () => {
		it("should return group by id", async () => {
			const group = {
				id: "group-id",
				name: "Core Team",
				description: "Main group",
				createdById: "user-id",
				createdAt: new Date("2024-01-01T00:00:00.000Z"),
				updatedAt: new Date("2024-01-02T00:00:00.000Z"),
			};
			const prismaMock = {
				group: {
					findFirst: vi.fn().mockResolvedValue(group),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupById("group-id");

			expect(result).toEqual(group);
			expect(prismaMock.group.findFirst).toHaveBeenCalledWith({
				where: { id: "group-id", deletedAt: null },
				select: {
					id: true,
					name: true,
					description: true,
					createdById: true,
					createdAt: true,
					updatedAt: true,
				},
			});
		});
	});

	describe("getGroupMembersByGroupId", () => {
		it("should return group members", async () => {
			const createdAt = new Date("2024-01-01T00:00:00.000Z");
			const prismaMock = {
				groupMember: {
					findMany: vi.fn().mockReturnValue("find-many-query"),
					count: vi.fn().mockReturnValue("count-query"),
				},
				$transaction: vi.fn().mockResolvedValue([
					[
						{
							id: "member-id",
							groupId: "group-id",
							userId: "user-id",
							role: ROLES.ADMIN,
							createdAt,
							user: {
								name: "John Doe",
								email: "john@doe.test",
							},
						},
					],
					1,
				]),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.getGroupMembersByGroupId("group-id", {
				limit: 10,
				offset: 0,
				order: "asc",
				sort: "name",
				search: "john",
			});

			expect(result).toEqual({
				data: [
					{
						id: "member-id",
						groupId: "group-id",
						userId: "user-id",
						role: ROLES.ADMIN,
						createdAt,
						user: {
							name: "John Doe",
							email: "john@doe.test",
						},
					},
				],
				total: 1,
			});
			expect(prismaMock.groupMember.findMany).toHaveBeenCalledWith({
				where: {
					groupId: "group-id",
					OR: [
						{ user: { name: { contains: "john", mode: "insensitive" } } },
						{ user: { email: { contains: "john", mode: "insensitive" } } },
						{ role: { contains: "john", mode: "insensitive" } },
					],
				},
				orderBy: { user: { name: "asc" } },
				skip: 0,
				take: 10,
				select: {
					id: true,
					groupId: true,
					userId: true,
					role: true,
					createdAt: true,
					user: {
						select: {
							name: true,
							email: true,
						},
					},
				},
			});
		});
	});

	describe("createGroup", () => {
		it("should create group, create owner membership and invalidate cache", async () => {
			const createdGroup = {
				id: "group-id",
				name: "Core Team",
				description: "Main group",
				createdById: "user-id",
			};
			const txMock = {
				group: {
					create: vi.fn().mockResolvedValue(createdGroup),
				},
				groupMember: {
					create: vi.fn().mockResolvedValue(undefined),
				},
			};
			const prismaMock = {
				$transaction: vi
					.fn()
					.mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				deleteCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.createGroup({
				name: "Core Team",
				description: "Main group",
				createdById: "user-id",
			});

			expect(result).toEqual(createdGroup);
			expect(txMock.group.create).toHaveBeenCalledWith({
				data: {
					name: "Core Team",
					description: "Main group",
					createdById: "user-id",
				},
			});
			expect(txMock.groupMember.create).toHaveBeenCalledWith({
				data: {
					groupId: "group-id",
					userId: "user-id",
					role: ROLES.OWNER,
				},
			});
			expect(redisServiceMock.deleteCachedGroups).toHaveBeenCalledWith(
				"user-id",
			);
		});
	});

	describe("updateGroup", () => {
		it("should update provided group fields", async () => {
			const updatedGroup = { id: "group-id" };
			const prismaMock = {
				group: {
					update: vi.fn().mockResolvedValue(updatedGroup),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.updateGroup({
				groupId: "group-id",
				name: "New name",
				description: null,
			});

			expect(result).toEqual(updatedGroup);
			expect(prismaMock.group.update).toHaveBeenCalledWith({
				where: { id: "group-id" },
				data: {
					name: "New name",
					description: null,
				},
			});
		});
	});

	describe("softDeleteGroup", () => {
		it("should soft delete group", async () => {
			const deletedGroup = { id: "group-id" };
			const prismaMock = {
				group: {
					update: vi.fn().mockResolvedValue(deletedGroup),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;

			const groupsService = new GroupsService(prismaMock, redisServiceMock);

			const result = await groupsService.softDeleteGroup("group-id");

			expect(result).toEqual(deletedGroup);
			expect(prismaMock.group.update).toHaveBeenCalledWith({
				where: { id: "group-id" },
				data: { deletedAt: expect.any(Date) },
			});
		});
	});
});
