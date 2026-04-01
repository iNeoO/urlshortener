import { ROLES } from "@urlshortener/common/constants";
import type { Role } from "@urlshortener/common/types";
import type { PrismaClient } from "@urlshortener/db";
import { getLoggerStore } from "@urlshortener/infra/libs";
import type { RedisService } from "../redis/redis.service.js";
import type {
	CachedGroup,
	GetGroupMembersQuery,
	GetGroupsQuery,
} from "./groups.type.js";

const GROUPS_CACHE_VERSION = 1;

export class GroupsService {
	private prisma: PrismaClient;
	private redisService: RedisService;

	constructor(prisma: PrismaClient, redisService: RedisService) {
		this.prisma = prisma;
		this.redisService = redisService;
	}

	private async getCachedGroups(userId: string) {
		try {
			const payload = await this.redisService.getCachedGroups(userId);
			if (!payload) {
				return null;
			}

			if (payload.version !== GROUPS_CACHE_VERSION) {
				await this.redisService.deleteCachedGroups(userId);
				return null;
			}
			return payload.data;
		} catch (err) {
			const logger = getLoggerStore();
			logger.error({ err, userId }, "Failed to parse cached groups");
			await this.redisService.deleteCachedGroups(userId);
			return null;
		}
	}

	async setCachedGroups(userId: string, groups: CachedGroup[]) {
		const payload = {
			version: GROUPS_CACHE_VERSION,
			data: groups,
		};
		await this.redisService.setCachedGroups(userId, payload);
	}

	async invalidateCachedGroups(userId: string) {
		await this.redisService.deleteCachedGroups(userId);
	}

	async getGroupsForUser(userId: string) {
		const cachedGroups = await this.getCachedGroups(userId);
		if (cachedGroups) {
			return cachedGroups;
		}

		const groups = await this.prisma.groupMember.findMany({
			where: { userId },
			select: {
				groupId: true,
				role: true,
				group: { select: { name: true } },
			},
		});

		const groupList = groups.map((group) => ({
			id: group.groupId,
			role: group.role as Role,
			name: group.group.name,
		}));

		await this.setCachedGroups(userId, groupList);
		return groupList;
	}

	async getGroupsSummaryForUser(
		userId: string,
		{
			limit = 10,
			offset = 0,
			order = "desc",
			sort = "createdAt",
			search,
		}: GetGroupsQuery,
	) {
		const where = {
			userId,
			group: {
				deletedAt: null,
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{
									description: {
										contains: search,
										mode: "insensitive" as const,
									},
								},
							],
						}
					: {}),
			},
		};

		const orderBy = (() => {
			switch (sort) {
				case "name":
					return { group: { name: order } } as const;
				case "description":
					return { group: { description: order } } as const;
				case "role":
					return { role: order } as const;
				case "totalUrls":
					return { group: { urls: { _count: order } } } as const;
				case "totalUsers":
					return { group: { members: { _count: order } } } as const;
				default:
					return { group: { createdAt: order } } as const;
			}
		})();

		const [rows, total] = await this.prisma.$transaction([
			this.prisma.groupMember.findMany({
				where,
				orderBy,
				skip: offset,
				take: limit,
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
			}),
			this.prisma.groupMember.count({ where }),
		]);

		return {
			data: rows.map((member) => ({
				id: member.group.id,
				name: member.group.name,
				description: member.group.description,
				role: member.role as Role,
				createdAt: member.group.createdAt,
				totalUrls: member.group._count.urls,
				totalUsers: member.group._count.members,
			})),
			total,
		};
	}

	async getGroupById(groupId: string) {
		return await this.prisma.group.findFirst({
			where: { id: groupId, deletedAt: null },
			select: {
				id: true,
				name: true,
				description: true,
				createdById: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async getGroupMembersByGroupId(
		groupId: string,
		{
			limit = 10,
			offset = 0,
			order = "desc",
			sort = "createdAt",
			search,
		}: GetGroupMembersQuery,
	) {
		const memberWhere = {
			groupId,
			...(search
				? {
						OR: [
							{
								user: {
									name: {
										contains: search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								user: {
									email: {
										contains: search,
										mode: "insensitive" as const,
									},
								},
							},
							{
								role: {
									contains: search,
									mode: "insensitive" as const,
								},
							},
						],
					}
				: {}),
		};

		const memberOrderBy = (() => {
			switch (sort) {
				case "name":
					return { user: { name: order } } as const;
				case "email":
					return { user: { email: order } } as const;
				case "role":
					return { role: order } as const;
				default:
					return { createdAt: order } as const;
			}
		})();

		const [members, total] = await this.prisma.$transaction([
			this.prisma.groupMember.findMany({
				where: memberWhere,
				orderBy: memberOrderBy,
				skip: offset,
				take: limit,
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
			}),
			this.prisma.groupMember.count({ where: memberWhere }),
		]);

		return {
			data: members.map((member) => ({
				...member,
				role: member.role as Role,
			})),
			total,
		};
	}

	async createGroup(params: {
		name: string;
		description?: string | null;
		createdById: string;
	}) {
		const group = await this.prisma.$transaction(async (tx) => {
			const createdGroup = await tx.group.create({
				data: {
					name: params.name,
					description: params.description ?? null,
					createdById: params.createdById,
				},
			});

			await tx.groupMember.create({
				data: {
					groupId: createdGroup.id,
					userId: params.createdById,
					role: ROLES.OWNER,
				},
			});

			return createdGroup;
		});

		await this.invalidateCachedGroups(params.createdById);
		return group;
	}

	async updateGroup(params: {
		groupId: string;
		name?: string;
		description?: string | null;
	}) {
		return await this.prisma.group.update({
			where: { id: params.groupId },
			data: {
				...(params.name !== undefined ? { name: params.name } : {}),
				...(params.description !== undefined
					? { description: params.description }
					: {}),
			},
		});
	}

	async softDeleteGroup(groupId: string) {
		return await this.prisma.group.update({
			where: { id: groupId },
			data: { deletedAt: new Date() },
		});
	}

	async removeGroupMember(params: { groupId: string; userId: string }) {
		const groupMember = await this.prisma.groupMember.delete({
			where: {
				groupId_userId: {
					groupId: params.groupId,
					userId: params.userId,
				},
			},
		});
		await this.invalidateCachedGroups(params.userId);
		return groupMember;
	}

	async getGroupMember(params: { groupId: string; userId: string }) {
		return await this.prisma.groupMember.findUnique({
			where: {
				groupId_userId: {
					groupId: params.groupId,
					userId: params.userId,
				},
			},
			select: {
				groupId: true,
				userId: true,
				role: true,
			},
		});
	}

	async updateGroupMemberRole(params: {
		groupId: string;
		userId: string;
		role: Role;
	}) {
		const groupMember = await this.prisma.groupMember.update({
			where: {
				groupId_userId: {
					groupId: params.groupId,
					userId: params.userId,
				},
			},
			data: {
				role: params.role,
			},
			include: {
				user: { select: { name: true, email: true } },
			},
		});
		await this.invalidateCachedGroups(params.userId);
		return { ...groupMember, role: groupMember.role as Role };
	}
}
