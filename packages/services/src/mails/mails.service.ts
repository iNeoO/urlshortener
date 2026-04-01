import { env } from "@urlshortener/infra/configs";
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
			secure: false,
			auth: {
				user: env.SMTP_AUTH_USER,
				pass: env.SMTP_AUTH_PASS,
			},
		});
	}

	async sendMail(options: nodemailer.SendMailOptions) {
		return this.transporter.sendMail({
			from: `shortener <${env.SMTP_AUTH_USER || options.from}>`,
			...options,
		});
	}

	async sendValidationEmail(to: string, token: string) {
		const validationLink = `${env.FRONTEND_URL}/validate-email?token=${token}`;
		const content = validationEmailTemplate(validationLink);

		await this.sendMail({
			to,
			subject: "Validate your email address",
			html: content,
		});
	}

	async sendInvitationsEmail(
		to: string,
		groupName: string,
		inviterName: string,
	) {
		const content = invitationEmailTemplate(groupName, inviterName);

		await this.sendMail({
			to,
			subject: `You've been invited to join the group ${groupName}`,
			html: content,
		});
	}

	async sendPasswordResetEmail(to: string, token: string) {
		const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
		const content = resetPasswordEmailTemplate(resetLink);

		await this.sendMail({
			to,
			subject: "Reset your password",
			html: content,
		});
	}
}
