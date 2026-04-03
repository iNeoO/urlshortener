import { env } from "@urlshortener/infra/configs";
import { getLoggerStore, pinoLogger } from "@urlshortener/infra/libs";
import * as nodemailer from "nodemailer";
import type { MailSender } from "./mail-sender.js";
import { invitationEmailTemplate } from "./templates/invitationEmail.template.js";
import { resetPasswordEmailTemplate } from "./templates/resetPasswordEmail.template.js";
import { validationEmailTemplate } from "./templates/validationEmail.template.js";

export class MailsService implements MailSender {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			secure: env.SMTP_SECURE,
			auth: {
				user: env.SMTP_AUTH_USER,
				pass: env.SMTP_AUTH_PASS,
			},
		});
	}

	async sendMail(options: nodemailer.SendMailOptions) {
		const logger = (() => {
			try {
				return getLoggerStore();
			} catch {
				return pinoLogger;
			}
		})();
		const payload = {
			from: options.from ?? env.SMTP_AUTH_USER,
			...options,
		};

		logger.info(
			{ to: payload.to, from: payload.from, subject: payload.subject },
			"Sending email",
		);

		const info = await this.transporter.sendMail(payload);

		if (info.accepted.length === 0) {
			logger.error(
				{
					to: payload.to,
					from: payload.from,
					subject: payload.subject,
					messageId: info.messageId,
					response: info.response,
					accepted: info.accepted,
					rejected: info.rejected,
				},
				"Email was rejected by SMTP provider",
			);
			throw new Error("Email rejected by SMTP provider");
		}

		logger.info(
			{
				to: payload.to,
				from: payload.from,
				subject: payload.subject,
				messageId: info.messageId,
				response: info.response,
				accepted: info.accepted,
				rejected: info.rejected,
			},
			"Email sent",
		);

		return info;
	}

	async sendValidationEmail(to: string, token: string) {
		const validationLink = `${env.FRONTEND_URL}/validate-email?token=${token}`;
		const content = validationEmailTemplate(validationLink);
		const text = [
			"Welcome to URL Shortener.",
			`Validate your email address: ${validationLink}`,
			"If you did not sign up for this account, ignore this email.",
		].join("\n\n");

		await this.sendMail({
			to,
			subject: "Validate your email address",
			text,
			html: content,
		});
	}

	async sendInvitationsEmail(
		to: string,
		groupName: string,
		inviterName: string,
	) {
		const content = invitationEmailTemplate(groupName, inviterName);
		const text = [
			`You've been invited to join the group ${groupName}.`,
			`${inviterName} invited you to join the group.`,
			`Open the application: ${env.FRONTEND_URL}`,
		].join("\n\n");

		await this.sendMail({
			to,
			subject: `You've been invited to join the group ${groupName}`,
			text,
			html: content,
		});
	}

	async sendPasswordResetEmail(to: string, token: string) {
		const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
		const content = resetPasswordEmailTemplate(resetLink);
		const text = [
			"We received a request to reset your password.",
			`Reset your password: ${resetLink}`,
			"If you did not request a password reset, ignore this email.",
		].join("\n\n");

		await this.sendMail({
			to,
			subject: "Reset your password",
			text,
			html: content,
		});
	}
}
