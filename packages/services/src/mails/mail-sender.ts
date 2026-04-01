export type MailSender = {
	sendValidationEmail(to: string, token: string): Promise<void>;
	sendInvitationsEmail(
		to: string,
		groupName: string,
		inviterName: string,
	): Promise<void>;
	sendPasswordResetEmail(to: string, token: string): Promise<void>;
};
