import { env } from "@urlshortener/infra/configs";

export const COOKIE_AUTH_EXPIRATION =
	process.env.COOKIE_AUTH_EXPIRATION || "900"; // 15 minutes
export const COOKIE_REFRESH_EXPIRATION =
	process.env.COOKIE_REFRESH_EXPIRATION || "604800"; // 7 days
export const COOKIE_AUTH_NAME = env.NAME_AUTH_TOKEN;
export const COOKIE_REFRESH_NAME = env.NAME_REFRESH_TOKEN;
