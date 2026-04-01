import { type PrismaClient, prisma } from "@urlshortener/db";
import { type RedisClient, redis } from "@urlshortener/infra/redis";
import { MailPublisher } from "@urlshortener/notification-email-worker/publisher";
import {
	AuthService,
	GroupsService,
	InvitationsService,
	type MailSender,
	RedisService,
	StatsService,
	UrlsService,
	UsersService,
} from "@urlshortener/services";

export type AppServices = {
	prisma: PrismaClient;
	redis: RedisClient;
	mailsService: MailSender;
	usersService: UsersService;
	authService: AuthService;
	statsService: StatsService;
	urlsService: UrlsService;
	groupsService: GroupsService;
	invitationsService: InvitationsService;
};

export const createServices = (): AppServices => {
	const mailsService = new MailPublisher();
	const redisService = new RedisService(redis);
	const usersService = new UsersService(prisma);
	const authService = new AuthService(prisma);
	const statsService = new StatsService(prisma, redisService);
	const urlsService = new UrlsService(prisma, redisService);
	const groupsService = new GroupsService(prisma, redisService);
	const invitationsService = new InvitationsService(
		prisma,
		redisService,
		usersService,
	);

	return {
		prisma,
		redis,
		mailsService,
		usersService,
		authService,
		statsService,
		urlsService,
		groupsService,
		invitationsService,
	};
};

export const services: AppServices = createServices();
