import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@urlshortener/common/constants";
import { InvitationsService } from "./invitations.service.js";

const now = new Date("2024-01-01T12:00:00.000Z");

describe("InvitationsService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
	});

	describe("createInvitation", () => {
		it("should create invitation", async () => {
			const invitation = {
				id: "invitation-id",
				groupId: "group-id",
				email: "john@doe.test",
				role: ROLES.ADMIN,
				invitedById: "user-id",
				expiresAt: new Date("2024-01-02T12:00:00.000Z"),
			};
			const prismaMock = {
				groupInvitation: {
					create: vi.fn().mockResolvedValue(invitation),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.createInvitation(invitation);

			expect(result).toEqual(invitation);
			expect(prismaMock.groupInvitation.create).toHaveBeenCalledWith({
				data: {
					groupId: "group-id",
					email: "john@doe.test",
					role: ROLES.ADMIN,
					invitedById: "user-id",
					expiresAt: new Date("2024-01-02T12:00:00.000Z"),
				},
			});
		});
	});

	describe("hasInvitationRefused", () => {
		it("should query refused invitation", async () => {
			const prismaMock = {
				groupInvitation: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			await invitationsService.hasInvitationRefused({
				groupId: "group-id",
				email: "john@doe.test",
			});

			expect(prismaMock.groupInvitation.findFirst).toHaveBeenCalledWith({
				where: {
					groupId: "group-id",
					email: "john@doe.test",
					refusedAt: { not: null },
				},
			});
		});
	});

	describe("getPendingInvitation", () => {
		it("should query pending invitation", async () => {
			const prismaMock = {
				groupInvitation: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			await invitationsService.getPendingInvitation({
				groupId: "group-id",
				email: "john@doe.test",
			});

			expect(prismaMock.groupInvitation.findFirst).toHaveBeenCalledWith({
				where: {
					groupId: "group-id",
					email: "john@doe.test",
					acceptedAt: null,
					refusedAt: null,
					revokedAt: null,
					expiresAt: { gt: now },
				},
			});
		});
	});

	describe("isEmailAlreadyGroupMember", () => {
		it("should query membership by email", async () => {
			const prismaMock = {
				groupMember: {
					findFirst: vi.fn().mockResolvedValue(null),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			await invitationsService.isEmailAlreadyGroupMember({
				groupId: "group-id",
				email: "john@doe.test",
			});

			expect(prismaMock.groupMember.findFirst).toHaveBeenCalledWith({
				where: {
					groupId: "group-id",
					user: {
						email: "john@doe.test",
						deletedAt: null,
					},
				},
				select: {
					id: true,
				},
			});
		});
	});

	describe("getInvitationsForUser", () => {
		it("should return empty array when user does not exist", async () => {
			const prismaMock = {
				groupInvitation: {
					findMany: vi.fn(),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			const usersServiceMock = {
				getUser: vi.fn().mockResolvedValue(null),
				// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.getInvitationsForUser("user-id", {});

			expect(result).toEqual([]);
			expect(prismaMock.groupInvitation.findMany).not.toHaveBeenCalled();
		});

		it("should return invitations for user", async () => {
			const invitations = [
				{
					id: "invitation-id",
					role: ROLES.ADMIN,
					email: "john@doe.test",
					group: {
						id: "group-id",
						name: "Core Team",
						description: "Main group",
					},
					invitedBy: {
						id: "inviter-id",
						email: "jane@doe.test",
						name: "Jane Doe",
					},
				},
			];
			const prismaMock = {
				groupInvitation: {
					findMany: vi.fn().mockResolvedValue(invitations),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			const usersServiceMock = {
				getUser: vi.fn().mockResolvedValue({
					id: "user-id",
					email: "john@doe.test",
				}),
				// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.getInvitationsForUser("user-id", {
				limit: 10,
				offset: 5,
				order: "asc",
				sort: "group.name",
				search: " core ",
			});

			expect(result).toEqual(invitations);
			expect(prismaMock.groupInvitation.findMany).toHaveBeenCalledWith({
				where: {
					email: "john@doe.test",
					revokedAt: null,
					OR: [
						{ role: { contains: "core", mode: "insensitive" } },
						{
							group: {
								name: { contains: "core", mode: "insensitive" },
							},
						},
						{
							group: {
								description: { contains: "core", mode: "insensitive" },
							},
						},
						{
							invitedBy: {
								email: { contains: "core", mode: "insensitive" },
							},
						},
						{
							invitedBy: {
								name: { contains: "core", mode: "insensitive" },
							},
						},
					],
				},
				include: {
					group: {
						select: {
							id: true,
							name: true,
							description: true,
						},
					},
					invitedBy: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
				orderBy: { group: { name: "asc" } },
				skip: 5,
				take: 10,
			});
		});
	});

	describe("getInvitationsForGroup", () => {
		it("should return invitations for group", async () => {
			const invitations = [
				{
					id: "invitation-id",
					role: ROLES.MEMBER,
					email: "john@doe.test",
					invitedBy: {
						id: "inviter-id",
						email: "jane@doe.test",
						name: "Jane Doe",
					},
				},
			];
			const prismaMock = {
				groupInvitation: {
					findMany: vi.fn().mockResolvedValue(invitations),
				},
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.getInvitationsForGroup(["group-id"], {
				limit: 10,
				offset: 0,
				order: "desc",
				sort: "invitedBy.name",
				search: "john",
			});

			expect(result).toEqual(invitations);
			expect(prismaMock.groupInvitation.findMany).toHaveBeenCalledWith({
				where: {
					groupId: { in: ["group-id"] },
					revokedAt: null,
					OR: [
						{ email: { contains: "john", mode: "insensitive" } },
						{ role: { contains: "john", mode: "insensitive" } },
						{
							invitedBy: {
								email: { contains: "john", mode: "insensitive" },
							},
						},
						{
							invitedBy: {
								name: { contains: "john", mode: "insensitive" },
							},
						},
					],
				},
				include: {
					invitedBy: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
				orderBy: { invitedBy: { name: "desc" } },
				skip: 0,
				take: 10,
			});
		});
	});

	describe("refuseInvitation", () => {
		it("should return forbidden when invitation email does not match user", async () => {
			const invitation = {
				id: "invitation-id",
				email: "john@doe.test",
				acceptedAt: null,
				refusedAt: null,
				revokedAt: null,
				expiresAt: new Date("2024-01-02T12:00:00.000Z"),
			};
			const txMock = {
				groupInvitation: {
					findUnique: vi.fn().mockResolvedValue(invitation),
				},
				user: {
					findUnique: vi
						.fn()
						.mockResolvedValue({ id: "user-id", email: "other@doe.test" }),
				},
			};
			const prismaMock = {
				$transaction: vi.fn().mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.refuseInvitation({
				invitationId: "invitation-id",
				userId: "user-id",
			});

			expect(result).toEqual({ status: "forbidden" });
		});

		it("should refuse invitation", async () => {
			const invitation = {
				id: "invitation-id",
				email: "john@doe.test",
				role: ROLES.ADMIN,
				acceptedAt: null,
				refusedAt: null,
				revokedAt: null,
				expiresAt: new Date("2024-01-02T12:00:00.000Z"),
			};
			const updatedInvitation = {
				...invitation,
				refusedAt: new Date("2024-01-01T12:30:00.000Z"),
			};
			const txMock = {
				groupInvitation: {
					findUnique: vi.fn().mockResolvedValue(invitation),
					update: vi.fn().mockResolvedValue(updatedInvitation),
				},
				user: {
					findUnique: vi
						.fn()
						.mockResolvedValue({ id: "user-id", email: "john@doe.test" }),
				},
			};
			const prismaMock = {
				$transaction: vi.fn().mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.refuseInvitation({
				invitationId: "invitation-id",
				userId: "user-id",
			});

			expect(result).toEqual({
				status: "refused",
				invitation: updatedInvitation,
			});
			expect(txMock.groupInvitation.update).toHaveBeenCalledWith({
				where: { id: "invitation-id" },
				data: { refusedAt: expect.any(Date) },
			});
		});
	});

	describe("acceptInvitation", () => {
		it("should return expired when invitation is expired", async () => {
			const txMock = {
				groupInvitation: {
					findUnique: vi.fn().mockResolvedValue({
						id: "invitation-id",
						acceptedAt: null,
						revokedAt: null,
						expiresAt: new Date("2024-01-01T11:00:00.000Z"),
					}),
				},
			};
			const prismaMock = {
				$transaction: vi.fn().mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			const redisServiceMock = {} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.acceptInvitation({
				invitationId: "invitation-id",
				userId: "user-id",
			});

			expect(result).toEqual({ status: "expired" });
		});

		it("should accept invitation and invalidate cache", async () => {
			const invitation = {
				id: "invitation-id",
				groupId: "group-id",
				email: "john@doe.test",
				role: ROLES.MEMBER,
				acceptedAt: null,
				revokedAt: null,
				expiresAt: new Date("2024-01-02T12:00:00.000Z"),
			};
			const member = {
				id: "member-id",
				groupId: "group-id",
				userId: "user-id",
				role: ROLES.MEMBER,
				user: {
					name: "John Doe",
					email: "john@doe.test",
				},
			};
			const txMock = {
				groupInvitation: {
					findUnique: vi.fn().mockResolvedValue(invitation),
					update: vi.fn().mockResolvedValue(undefined),
				},
				user: {
					findUnique: vi
						.fn()
						.mockResolvedValue({ id: "user-id", email: "john@doe.test" }),
				},
				groupMember: {
					create: vi.fn().mockResolvedValue(member),
				},
			};
			const prismaMock = {
				$transaction: vi.fn().mockImplementation((callback) => callback(txMock)),
				// biome-ignore lint/suspicious/noExplicitAny: Prisma mock kept intentionally minimal for this unit test
			} as any;
			const redisServiceMock = {
				deleteCachedGroups: vi.fn().mockResolvedValue(undefined),
				// biome-ignore lint/suspicious/noExplicitAny: Redis mock kept intentionally minimal for this unit test
			} as any;
			// biome-ignore lint/suspicious/noExplicitAny: UsersService mock kept intentionally minimal for this unit test
			const usersServiceMock = {} as any;

			const invitationsService = new InvitationsService(
				prismaMock,
				redisServiceMock,
				usersServiceMock,
			);

			const result = await invitationsService.acceptInvitation({
				invitationId: "invitation-id",
				userId: "user-id",
			});

			expect(result).toEqual({
				status: "accepted",
				member,
			});
			expect(txMock.groupMember.create).toHaveBeenCalledWith({
				data: {
					groupId: "group-id",
					userId: "user-id",
					role: ROLES.MEMBER,
				},
				include: {
					user: { select: { name: true, email: true } },
				},
			});
			expect(txMock.groupInvitation.update).toHaveBeenCalledWith({
				where: { id: "invitation-id" },
				data: { acceptedAt: expect.any(Date) },
			});
			expect(redisServiceMock.deleteCachedGroups).toHaveBeenCalledWith("user-id");
		});
	});
});
