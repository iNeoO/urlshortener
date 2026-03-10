import type { PrismaClient } from "@urlshortener/db";
import type {
	CreateUserForAuthParams,
	UpdateUserForProfileParams,
} from "./users.type.js";

export class UsersService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async getUser(userId: string) {
		return await this.prisma.user.findUnique({
			where: {
				id: userId,
				deletedAt: null,
			},
			omit: {
				passwordHash: true,
				deletedAt: true,
			},
		});
	}

	async getUserByIdForAuth(id: string) {
		return await this.prisma.user.findUnique({
			where: {
				id,
			},
		});
	}

	async getUserByEmailForAuth(email: string) {
		return await this.prisma.user.findUnique({
			where: {
				email,
			},
		});
	}

	async createUserForAuth({
		name,
		email,
		passwordHash,
	}: CreateUserForAuthParams) {
		return await this.prisma.user.create({
			data: {
				name,
				email,
				passwordHash,
				emailVerified: false,
			},
			omit: {
				passwordHash: true,
				deletedAt: true,
			},
		});
	}

	async updateUserForProfile({
		userId,
		name,
		passwordHash,
	}: UpdateUserForProfileParams) {
		return await this.prisma.user.update({
			where: {
				id: userId,
				deletedAt: null,
			},
			data: {
				...(name !== undefined ? { name } : {}),
				...(passwordHash !== undefined ? { passwordHash } : {}),
			},
			omit: {
				passwordHash: true,
				deletedAt: true,
			},
		});
	}

	async updateUserEmailVerified(userId: string) {
		await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				emailVerified: true,
			},
		});
	}

	sanitizeUser = (
		user: NonNullable<Awaited<ReturnType<typeof this.getUserByIdForAuth>>>,
	) => {
		const {
			passwordHash: _passwordHash,
			deletedAt: _deletedAt,
			...safeUser
		} = user;
		return safeUser;
	};
}
