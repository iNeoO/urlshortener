export type CreateSessionParams = {
	userId: string;
	expiresAt: Date;
};

export type ResetPasswordForUserParams = {
	userId: string;
	tokenId: string;
	passwordHash: string;
};
