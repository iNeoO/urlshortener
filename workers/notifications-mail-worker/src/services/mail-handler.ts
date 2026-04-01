import { getLoggerStore } from "@urlshortener/infra/libs";
import type { MailsService } from "@urlshortener/services";
import type { MailMessage } from "../contracts/mail-message.js";

type CreateMailHandlerParams = {
	mailsService: MailsService;
};

export const createMailHandler = ({
	mailsService,
}: CreateMailHandlerParams) => {
	return async (message: MailMessage) => {
		const logger = getLoggerStore();
		logger.info(
			{ type: message.type, to: message.to },
			"Processing mail message",
		);

		switch (message.type) {
			case "mail.validation":
				await mailsService.sendValidationEmail(message.to, message.token);
				break;
			case "mail.password-reset":
				await mailsService.sendPasswordResetEmail(message.to, message.token);
				break;
			case "mail.invitation":
				await mailsService.sendInvitationsEmail(
					message.to,
					message.groupName,
					message.inviterName,
				);
				break;
		}

		logger.info(
			{ type: message.type, to: message.to },
			"Mail message processed",
		);
	};
};
