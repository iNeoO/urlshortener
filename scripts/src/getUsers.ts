import { prisma } from "@urlshortener/db";
import { pinoLogger } from "@urlshortener/infra/libs";

const logger = pinoLogger.child({ script: "getUsers" });

const main = async () => {
	const users = await prisma.user.findMany({
		where: {
			deletedAt: null,
		},
		select: {
			id: true,
			name: true,
			email: true,
			emailVerified: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	logger.info({ count: users.length }, "Users fetched");

	if (users.length === 0) {
		logger.info("No active users found");
		return;
	}

	for (const user of users) {
		logger.info({ user }, "User");
	}
};

main()
	.catch((error: unknown) => {
		logger.error({ err: error }, "Failed to fetch users");
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
