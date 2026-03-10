import argon2 from "argon2";

const DUMMY_PASSWORD_HASH =
	"$argon2i$v=19$m=16,t=2,p=1$SzlrbVpzTURESWdlSGNDcA$dpAtEKCbOwhvTzalQTisSw";

export const fakePasswordVerify = async (password: string) => {
	await argon2.verify(DUMMY_PASSWORD_HASH, password);
};

export const hashPassword = async (password: string) => {
	return await argon2.hash(password);
};

export const verifyPassword = async (hash: string, password: string) => {
	return await argon2.verify(hash, password);
};
