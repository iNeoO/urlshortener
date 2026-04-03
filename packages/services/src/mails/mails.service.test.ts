import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMailMock, createTransportMock } = vi.hoisted(() => {
	const sendMailMock = vi.fn();
	const createTransportMock = vi.fn(() => ({
		sendMail: sendMailMock,
	}));

	return { sendMailMock, createTransportMock };
});

vi.mock("@urlshortener/infra/configs", () => ({
	env: {
		FRONTEND_URL: "https://app.example.com",
		SMTP_HOST: "smtp.example.com",
		SMTP_PORT: 587,
		SMTP_SECURE: false,
		SMTP_AUTH_USER: "smtp-user@example.com",
		SMTP_AUTH_PASS: "smtp-password",
	},
}));

vi.mock("nodemailer", () => ({
	createTransport: createTransportMock,
}));

vi.mock("./templates/validationEmail.template.js", () => ({
	validationEmailTemplate: vi.fn(
		(validationLink: string) => `validation-template:${validationLink}`,
	),
}));

vi.mock("./templates/invitationEmail.template.js", () => ({
	invitationEmailTemplate: vi.fn(
		(groupName: string, inviterName: string) =>
			`invitation-template:${groupName}:${inviterName}`,
	),
}));

vi.mock("./templates/resetPasswordEmail.template.js", () => ({
	resetPasswordEmailTemplate: vi.fn(
		(resetLink: string) => `reset-template:${resetLink}`,
	),
}));

import { MailsService } from "./mails.service.js";

describe("MailsService", () => {
	beforeEach(() => {
		createTransportMock.mockClear();
		sendMailMock.mockReset();
	});

	describe("constructor", () => {
		it("should create nodemailer transporter with smtp config", () => {
			new MailsService();

			expect(createTransportMock).toHaveBeenCalledWith({
				host: "smtp.example.com",
				port: 587,
				secure: false,
				auth: {
					user: "smtp-user@example.com",
					pass: "smtp-password",
				},
			});
		});
	});

	describe("sendMail", () => {
		it("should send mail with default from address", async () => {
			sendMailMock.mockResolvedValue({
				messageId: "message-id",
				response: "250 Ok",
				accepted: ["john@doe.test"],
				rejected: [],
			});

			const mailsService = new MailsService();

			const result = await mailsService.sendMail({
				to: "john@doe.test",
				subject: "Subject",
				html: "<p>Hello</p>",
			});

			expect(result).toEqual({
				messageId: "message-id",
				response: "250 Ok",
				accepted: ["john@doe.test"],
				rejected: [],
			});
			expect(sendMailMock).toHaveBeenCalledWith({
				from: "smtp-user@example.com",
				to: "john@doe.test",
				subject: "Subject",
				html: "<p>Hello</p>",
			});
		});
	});

	describe("sendValidationEmail", () => {
		it("should send validation email", async () => {
			sendMailMock.mockResolvedValue({
				messageId: "message-id",
				response: "250 Ok",
				accepted: ["john@doe.test"],
				rejected: [],
			});

			const mailsService = new MailsService();

			await mailsService.sendValidationEmail(
				"john@doe.test",
				"validation-token",
			);

			expect(sendMailMock).toHaveBeenCalledWith({
				from: "smtp-user@example.com",
				to: "john@doe.test",
				subject: "Validate your email address",
				text: "Welcome to URL Shortener.\n\nValidate your email address: https://app.example.com/validate-email?token=validation-token\n\nIf you did not sign up for this account, ignore this email.",
				html: "validation-template:https://app.example.com/validate-email?token=validation-token",
			});
		});
	});

	describe("sendInvitationsEmail", () => {
		it("should send invitation email", async () => {
			sendMailMock.mockResolvedValue({
				messageId: "message-id",
				response: "250 Ok",
				accepted: ["john@doe.test"],
				rejected: [],
			});

			const mailsService = new MailsService();

			await mailsService.sendInvitationsEmail(
				"john@doe.test",
				"Core Team",
				"Jane Doe",
			);

			expect(sendMailMock).toHaveBeenCalledWith({
				from: "smtp-user@example.com",
				to: "john@doe.test",
				subject: "You've been invited to join the group Core Team",
				text: "You've been invited to join the group Core Team.\n\nJane Doe invited you to join the group.\n\nOpen the application: https://app.example.com",
				html: "invitation-template:Core Team:Jane Doe",
			});
		});
	});

	describe("sendPasswordResetEmail", () => {
		it("should send password reset email", async () => {
			sendMailMock.mockResolvedValue({
				messageId: "message-id",
				response: "250 Ok",
				accepted: ["john@doe.test"],
				rejected: [],
			});

			const mailsService = new MailsService();

			await mailsService.sendPasswordResetEmail("john@doe.test", "reset-token");

			expect(sendMailMock).toHaveBeenCalledWith({
				from: "smtp-user@example.com",
				to: "john@doe.test",
				subject: "Reset your password",
				text: "We received a request to reset your password.\n\nReset your password: https://app.example.com/reset-password?token=reset-token\n\nIf you did not request a password reset, ignore this email.",
				html: "reset-template:https://app.example.com/reset-password?token=reset-token",
			});
		});
	});
});
