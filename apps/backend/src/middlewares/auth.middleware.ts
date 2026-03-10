import { API_ERROR } from "@urlshortener/common/constants";
import { env } from "@urlshortener/infra/configs";
import { throwHTTPException401Unauthorized } from "@urlshortener/infra/helpers";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import {
	COOKIE_AUTH_EXPIRATION,
	COOKIE_AUTH_NAME,
	COOKIE_REFRESH_EXPIRATION,
	COOKIE_REFRESH_NAME,
} from "../config/cookie.js";
import { appWithAuth } from "../helpers/factories/appWithAuth.js";
import type { AppServices } from "../services/container.js";

type AuthSession = {
	id: string;
	userId: string;
	expiresAt: Date;
};

type AuthUser = {
	id: string;
};

type AuthValidationInput = {
	authUserId: string | undefined;
	sessionId: string | undefined;
	session: AuthSession | null;
	user: AuthUser | null;
	nowMs: number;
};

type UnauthenticatedResult = {
	authenticated: false;
	code:
		| typeof API_ERROR.INVALID_SESSION
		| typeof API_ERROR.SESSION_EXPIRED
		| typeof API_ERROR.USER_NOT_FOUND;
};

type AuthenticatedFromAuthCookieResult = {
	authenticated: true;
	source: "auth-cookie";
	userId: string;
};

type AuthenticatedFromRefreshResult = {
	authenticated: true;
	source: "refresh";
	userId: string;
	sessionId: string;
};

export type AuthValidationResult =
	| UnauthenticatedResult
	| AuthenticatedFromAuthCookieResult
	| AuthenticatedFromRefreshResult;

type AuthValidationServices = Pick<AppServices, "authService" | "usersService">;
type AuthMiddlewareServices = AuthValidationServices &
	Pick<AppServices, "groupsService">;

export const evaluateAuthValidation = (
	input: AuthValidationInput,
): AuthValidationResult => {
	if (input.authUserId) {
		return {
			authenticated: true,
			source: "auth-cookie",
			userId: input.authUserId,
		};
	}

	if (!input.sessionId || !input.session) {
		return {
			authenticated: false,
			code: API_ERROR.INVALID_SESSION,
		};
	}

	if (input.session.expiresAt.getTime() <= input.nowMs) {
		return {
			authenticated: false,
			code: API_ERROR.SESSION_EXPIRED,
		};
	}

	if (!input.user) {
		return {
			authenticated: false,
			code: API_ERROR.USER_NOT_FOUND,
		};
	}

	return {
		authenticated: true,
		source: "refresh",
		userId: input.user.id,
		sessionId: input.sessionId,
	};
};

export const resolveAuthValidation = async (
	c: Context,
	services: AuthValidationServices,
): Promise<AuthValidationResult> => {
	const authUserId = await getSignedCookie(
		c,
		env.JWT_AUTH_SECRET,
		COOKIE_AUTH_NAME,
	);
	if (authUserId) {
		return evaluateAuthValidation({
			authUserId,
			sessionId: undefined,
			session: null,
			user: null,
			nowMs: Date.now(),
		});
	}

	const sessionId = await getSignedCookie(
		c,
		env.JWT_REFRESH_SECRET,
		COOKIE_REFRESH_NAME,
	);
	if (!sessionId) {
		return evaluateAuthValidation({
			authUserId: undefined,
			sessionId: undefined,
			session: null,
			user: null,
			nowMs: Date.now(),
		});
	}

	const session = await services.authService.getSession(sessionId);
	const user = session
		? await services.usersService.getUser(session.userId)
		: null;

	return evaluateAuthValidation({
		authUserId: undefined,
		sessionId,
		session,
		user,
		nowMs: Date.now(),
	});
};

export const clearAuthCookies = (c: Context) => {
	deleteCookie(c, COOKIE_REFRESH_NAME);
	deleteCookie(c, COOKIE_AUTH_NAME);
};

export const refreshAuthCookies = async (
	c: Context,
	result: AuthValidationResult,
) => {
	if (!result.authenticated || result.source !== "refresh") {
		return;
	}

	await setSignedCookie(
		c,
		COOKIE_AUTH_NAME,
		result.userId,
		env.JWT_AUTH_SECRET,
		{
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
			maxAge: Number(COOKIE_AUTH_EXPIRATION),
		},
	);

	await setSignedCookie(
		c,
		COOKIE_REFRESH_NAME,
		result.sessionId,
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

export const createAuthMiddleware = (services: AuthMiddlewareServices) =>
	appWithAuth.createMiddleware(async (c, next) => {
		const result = await resolveAuthValidation(c, services);

		if (result.authenticated === false) {
			clearAuthCookies(c);
			throw throwHTTPException401Unauthorized("Unauthorized", {
				res: c.res,
				cause: { code: result.code },
			});
		}

		await refreshAuthCookies(c, result);

		const groups = await services.groupsService.getGroupsForUser(result.userId);

		c.set("userId", result.userId);
		c.set("groups", groups);

		return await next();
	});
