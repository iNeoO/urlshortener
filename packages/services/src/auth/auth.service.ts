import crypto from "node:crypto";
import type { PrismaClient } from "@urlshortener/db";
import {
	EMAIL_VALIDATION_TOKEN_TTL_MS,
	PASSWORD_RESET_TOKEN_TTL_MS,
} from "../config/token.js";
import type {
	CreateSessionParams,
	ResetPasswordForUserParams,
} from "./auth.type.js";

export class AuthService {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async createSession({ userId, expiresAt }: CreateSessionParams) {
		return await this.prisma.session.create({
			data: {
				userId,
				expiresAt,
			},
		});
	}

	async getSession(sessionId: string) {
		return await this.prisma.session.findFirst({
			where: {
				id: sessionId,
			},
		});
	}

	async deleteSession(sessionId: string) {
		const result = await this.prisma.session.deleteMany({
			where: {
				id: sessionId,
			},
		});
		return { count: result.count };
	}

	async createEmailValidationToken(userId: string) {
		const token = crypto.randomBytes(32).toString("hex");
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		const expiresAt = new Date(Date.now() + EMAIL_VALIDATION_TOKEN_TTL_MS);

		await this.prisma.emailVerificationToken.deleteMany({
			where: {
				userId,
				usedAt: null,
			},
		});

		await this.prisma.emailVerificationToken.create({
			data: {
				userId,
				tokenHash,
				expiresAt,
			},
		});

		return { token, expiresAt };
	}

	async getValidEmailToken(token: string) {
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		const now = new Date();

		const storedToken = await this.prisma.emailVerificationToken.findFirst({
			where: {
				tokenHash,
				usedAt: null,
				expiresAt: {
					gt: now,
				},
			},
		});

		return storedToken;
	}

	async updateEmailValidationTokenUsage(id: string, userId: string) {
		await this.prisma.$transaction([
			this.prisma.emailVerificationToken.update({
				where: { id },
				data: { usedAt: new Date() },
			}),
			this.prisma.user.update({
				where: { id: userId },
				data: { emailVerified: true },
			}),
			this.prisma.emailVerificationToken.deleteMany({
				where: {
					userId,
					id: { not: id },
				},
			}),
		]);
	}

	async createPasswordResetToken(userId: string) {
		const token = crypto.randomBytes(32).toString("hex");
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

		await this.prisma.passwordResetToken.deleteMany({
			where: {
				userId,
				usedAt: null,
			},
		});

		await this.prisma.passwordResetToken.create({
			data: {
				userId,
				tokenHash,
				expiresAt,
			},
		});

		return { token, expiresAt };
	}

	async getValidPasswordResetToken(token: string) {
		const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
		const now = new Date();

		return await this.prisma.passwordResetToken.findFirst({
			where: {
				tokenHash,
				usedAt: null,
				expiresAt: {
					gt: now,
				},
			},
		});
	}

	async resetPasswordForUser({
		tokenId,
		userId,
		passwordHash,
	}: ResetPasswordForUserParams) {
		await this.prisma.$transaction([
			this.prisma.passwordResetToken.update({
				where: { id: tokenId },
				data: { usedAt: new Date() },
			}),
			this.prisma.user.update({
				where: { id: userId },
				data: { passwordHash },
			}),
			this.prisma.passwordResetToken.deleteMany({
				where: {
					userId: userId,
					id: { not: tokenId },
				},
			}),
			this.prisma.session.deleteMany({
				where: {
					userId: userId,
				},
			}),
		]);
	}
}
