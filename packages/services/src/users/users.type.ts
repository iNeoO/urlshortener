export type CreateUserForAuthParams = {
	name: string;
	email: string;
	passwordHash: string;
};

export type UpdateUserForProfileParams = {
	userId: string;
	name?: string;
	passwordHash?: string;
};
