import { MailsService } from "@urlshortener/services";
import { createMailHandler } from "./services/mail-handler.js";

export const createContainer = () => {
	const mailsService = new MailsService();
	const handleMailMessage = createMailHandler({ mailsService });

	return {
		init: async () => {},
		shutdown: async () => {},
		handleMailMessage,
	};
};
