import { env } from "@urlshortener/infra/configs";
import { fakePasswordVerify } from "@urlshortener/services";
import type { Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import {
	COOKIE_AUTH_EXPIRATION,
	COOKIE_AUTH_NAME,
	COOKIE_REFRESH_EXPIRATION,
	COOKIE_REFRESH_NAME,
} from "../../config/cookie.js";

export const setAuthCookies = async (
	c: Context,
	{
		userId,
		sessionId,
	}: {
		userId: string;
		sessionId: string;
	},
) => {
	await setSignedCookie(c, COOKIE_AUTH_NAME, userId, env.JWT_AUTH_SECRET, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/",
		maxAge: Number(COOKIE_AUTH_EXPIRATION),
	});

	await setSignedCookie(
		c,
		COOKIE_REFRESH_NAME,
		sessionId,
		env.JWT_REFRESH_SECRET,
		{
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
			maxAge: Number(COOKIE_REFRESH_EXPIRATION),
		},
	);
};

export { fakePasswordVerify };
