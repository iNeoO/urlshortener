import type {
	GetGroupInvitationsQuery,
	GetInvitationsQuery,
	Role,
} from "@urlshortener/common/types";
import type { Prisma, PrismaClient } from "@urlshortener/db";
import type { RedisService } from "../redis/redis.service.js";
import type { UsersService } from "../users/users.service.js";

export class InvitationsService {
	private prisma: PrismaClient;
	private redisService: RedisService;
	private usersService: UsersService;

	constructor(
		prisma: PrismaClient,
		redisService: RedisService,
		usersService: UsersService,
	) {
		this.prisma = prisma;
		this.redisService = redisService;
		this.usersService = usersService;
	}

	private async invalidateCachedGroups(userId: string) {
		await this.redisService.deleteCachedGroups(userId);
	}

	async createInvitation(params: {
		groupId: string;
		email: string;
		role: Role;
		invitedById: string;
		expiresAt: Date;
	}) {
		const invitation = await this.prisma.groupInvitation.create({
			data: {
				groupId: params.groupId,
				email: params.email,
				role: params.role,
				invitedById: params.invitedById,
				expiresAt: params.expiresAt,
			},
		});

		return {
			...invitation,
			role: invitation.role as Role,
		};
	}

	async hasInvitationRefused(params: { groupId: string; email: string }) {
		return await this.prisma.groupInvitation.findFirst({
			where: {
				groupId: params.groupId,
				email: params.email,
				refusedAt: { not: null },
			},
		});
	}

	async getPendingInvitation(params: { groupId: string; email: string }) {
		return await this.prisma.groupInvitation.findFirst({
			where: {
				groupId: params.groupId,
				email: params.email,
				acceptedAt: null,
				refusedAt: null,
				revokedAt: null,
				expiresAt: { gt: new Date() },
			},
		});
	}

	async isEmailAlreadyGroupMember(params: { groupId: string; email: string }) {
		return await this.prisma.groupMember.findFirst({
			where: {
				groupId: params.groupId,
				user: {
					email: params.email,
					deletedAt: null,
				},
			},
			select: {
				id: true,
			},
		});
	}

	async getInvitationsForUser(
		userId: string,
		{ limit, offset, order, sort = "createdAt", search }: GetInvitationsQuery,
	) {
		const user = await this.usersService.getUser(userId);
		if (!user) return [];
		const sortOrder: Prisma.SortOrder = order ?? "desc";
		const trimmedSearch = search?.trim();
		const orderBy: Prisma.GroupInvitationOrderByWithRelationInput =
			sort === "group.name"
				? { group: { name: sortOrder } }
				: sort === "invitedBy.name"
					? { invitedBy: { name: sortOrder } }
					: sort === "status"
						? { createdAt: sortOrder }
						: { [sort]: sortOrder };

		const invitations = await this.prisma.groupInvitation.findMany({
			where: {
				email: user.email,
				revokedAt: null,
				...(trimmedSearch
					? {
							OR: [
								{ role: { contains: trimmedSearch, mode: "insensitive" } },
								{
									group: {
										name: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
								{
									group: {
										description: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
								{
									invitedBy: {
										email: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
								{
									invitedBy: {
										name: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
							],
						}
					: {}),
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
			orderBy,
			...(typeof offset === "number" ? { skip: offset } : {}),
			...(typeof limit === "number" ? { take: limit } : {}),
		});
		return invitations.map((invitation) => ({
			...invitation,
			role: invitation.role as Role,
		}));
	}

	async getInvitationsForGroup(
		groupId: string[],
		{
			limit,
			offset,
			order,
			sort = "createdAt",
			search,
		}: GetGroupInvitationsQuery,
	) {
		const sortOrder: Prisma.SortOrder = order ?? "desc";
		const trimmedSearch = search?.trim();
		const orderBy: Prisma.GroupInvitationOrderByWithRelationInput =
			sort === "invitedBy.name"
				? { invitedBy: { name: sortOrder } }
				: sort === "status"
					? { createdAt: sortOrder }
					: { [sort]: sortOrder };

		const invitations = await this.prisma.groupInvitation.findMany({
			where: {
				groupId: { in: groupId },
				revokedAt: null,
				...(trimmedSearch
					? {
							OR: [
								{ email: { contains: trimmedSearch, mode: "insensitive" } },
								{ role: { contains: trimmedSearch, mode: "insensitive" } },
								{
									invitedBy: {
										email: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
								{
									invitedBy: {
										name: {
											contains: trimmedSearch,
											mode: "insensitive",
										},
									},
								},
							],
						}
					: {}),
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
			orderBy,
			...(typeof offset === "number" ? { skip: offset } : {}),
			...(typeof limit === "number" ? { take: limit } : {}),
		});
		return invitations.map((invitation) => ({
			...invitation,
			role: invitation.role as Role,
		}));
	}

	async refuseInvitation(params: { invitationId: string; userId: string }) {
		return this.prisma.$transaction(async (tx) => {
			const invitation = await tx.groupInvitation.findUnique({
				where: { id: params.invitationId },
			});
			if (!invitation) return { status: "not_found" as const };
			if (invitation.acceptedAt) return { status: "already_accepted" as const };
			if (invitation.refusedAt) return { status: "already_refused" as const };
			if (invitation.revokedAt) return { status: "revoked" as const };
			if (invitation.expiresAt.getTime() <= Date.now())
				return { status: "expired" as const };

			const user = await tx.user.findUnique({
				where: { id: params.userId, deletedAt: null },
				select: { id: true, email: true },
			});
			if (!user || user.email !== invitation.email) {
				return { status: "forbidden" as const };
			}

			const updatedInvitation = await tx.groupInvitation.update({
				where: { id: invitation.id },
				data: { refusedAt: new Date() },
			});

			return {
				status: "refused" as const,
				invitation: {
					...updatedInvitation,
					role: updatedInvitation.role as Role,
				},
			};
		});
	}

	async acceptInvitation(params: { invitationId: string; userId: string }) {
		return this.prisma.$transaction(async (tx) => {
			const invitation = await tx.groupInvitation.findUnique({
				where: { id: params.invitationId },
			});
			if (!invitation) return { status: "not_found" as const };
			if (invitation.acceptedAt) return { status: "already_accepted" as const };
			if (invitation.revokedAt) return { status: "revoked" as const };
			if (invitation.expiresAt.getTime() <= Date.now())
				return { status: "expired" as const };

			const user = await tx.user.findUnique({
				where: { id: params.userId, deletedAt: null },
				select: { id: true, email: true },
			});
			if (!user || user.email !== invitation.email) {
				return { status: "forbidden" as const };
			}

			const member = await tx.groupMember.create({
				data: {
					groupId: invitation.groupId,
					userId: user.id,
					role: invitation.role,
				},
				include: {
					user: { select: { name: true, email: true } },
				},
			});

			await tx.groupInvitation.update({
				where: { id: invitation.id },
				data: { acceptedAt: new Date() },
			});

			await this.invalidateCachedGroups(params.userId);

			return {
				status: "accepted" as const,
				member: { ...member, role: member.role as Role },
			};
		});
	}
}
