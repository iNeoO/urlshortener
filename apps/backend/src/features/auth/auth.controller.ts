import { API_ERROR } from "@urlshortener/common/constants";
import { env } from "@urlshortener/infra/configs";
import { appWithLogs } from "@urlshortener/infra/factories";
import {
	throwHTTPException400BadRequest,
	throwHTTPException401Unauthorized,
	throwHTTPException403Forbidden,
	throwHTTPException409Conflict,
} from "@urlshortener/infra/helpers";
import { hashPassword, verifyPassword } from "@urlshortener/services";
import { deleteCookie, getSignedCookie } from "hono/cookie";
import { validator } from "hono-openapi";
import {
	COOKIE_AUTH_NAME,
	COOKIE_REFRESH_EXPIRATION,
	COOKIE_REFRESH_NAME,
} from "../../config/cookie.js";
import {
	clearAuthCookies,
	refreshAuthCookies,
	resolveAuthValidation,
} from "../../middlewares/auth.middleware.js";
import type { AppServices } from "../../services/container.js";
import {
	GetAuthCheckRoute,
	PostPasswordResetConfirmRoute,
	PostPasswordResetRequestRoute,
	PostResendValidationEmailRoute,
	PostSignInEmailRoute,
	PostSignOutRoute,
	PostSignUpEmailRoute,
	PostValidateEmailRoute,
} from "./auth.route.js";
import {
	PostPasswordResetConfirmJsonSchema,
	PostPasswordResetJsonSchema,
	PostResendValidationEmailJsonSchema,
	PostSignInEmailJsonSchema,
	PostSignUpEmailJsonSchema,
	PostValidateEmailJsonSchema,
} from "./auth.schema.js";
import type {
	AuthCheckResponseApi,
	AuthEmailValidationApi,
	AuthPasswordResetConfirmApi,
	AuthPasswordResetRequestApi,
	AuthSignOutResponseApi,
	AuthUserCreationApi,
	AuthUserResponseApi,
} from "./auth.type.js";
import { fakePasswordVerify, setAuthCookies } from "./auth.utils.js";

type AuthControllerServices = Pick<
	AppServices,
	"usersService" | "authService" | "mailsService"
>;

export const createAuthController = (services: AuthControllerServices) => {
	return appWithLogs
		.createApp()
		.post(
			"/sign-up/email",
			PostSignUpEmailRoute,
			validator("json", PostSignUpEmailJsonSchema),
			async (c) => {
				const { email, password, username } = c.req.valid("json");

				const existingUser =
					await services.usersService.getUserByEmailForAuth(email);
				if (existingUser) {
					throwHTTPException409Conflict("Email already in use", {
						res: c.res,
						cause: { code: API_ERROR.EMAIL_ALREADY_EXISTS },
					});
				}

				const passwordHash = await hashPassword(password);
				const user = await services.usersService.createUserForAuth({
					email,
					name: username,
					passwordHash,
				});

				const { token } = await services.authService.createEmailValidationToken(
					user.id,
				);

				await services.mailsService.sendValidationEmail(user.email, token);

				const response: AuthUserCreationApi = { data: { success: true } };
				return c.json(response, 201);
			},
		)
		.post(
			"/sign-in/email",
			PostSignInEmailRoute,
			validator("json", PostSignInEmailJsonSchema),
			async (c) => {
				const { email, password } = c.req.valid("json");

				const user = await services.usersService.getUserByEmailForAuth(email);
				if (!user || user.deletedAt) {
					await fakePasswordVerify(password);
					throwHTTPException401Unauthorized("Invalid Credential", {
						res: c.res,
						cause: { code: API_ERROR.INVALID_CREDENTIALS },
					});
				}

				const passwordValid = await verifyPassword(user.passwordHash, password);
				if (!passwordValid) {
					throwHTTPException401Unauthorized("Invalid Credential", {
						res: c.res,
						cause: { code: API_ERROR.INVALID_CREDENTIALS },
					});
				}

				if (!user.emailVerified) {
					throwHTTPException403Forbidden("Email not verified", {
						res: c.res,
						cause: { code: API_ERROR.EMAIL_NOT_VERIFIED },
					});
				}

				const sessionExpiresAt = new Date(
					Date.now() + Number(COOKIE_REFRESH_EXPIRATION) * 1000,
				);
				const session = await services.authService.createSession({
					userId: user.id,
					expiresAt: sessionExpiresAt,
				});
				await setAuthCookies(c, {
					userId: user.id,
					sessionId: session.id,
				});

				const response: AuthUserResponseApi = {
					data: services.usersService.sanitizeUser(user),
				};
				return c.json(response, 200);
			},
		)
		.post(
			"/validate-email",
			PostValidateEmailRoute,
			validator("json", PostValidateEmailJsonSchema),
			async (c) => {
				const { token } = c.req.valid("json");
				const storedToken =
					await services.authService.getValidEmailToken(token);

				if (!storedToken) {
					throwHTTPException400BadRequest("Invalid or expired token", {
						res: c.res,
						cause: { code: API_ERROR.INVALID_TOKEN },
					});
				}

				await services.authService.updateEmailValidationTokenUsage(
					storedToken.id,
					storedToken.userId,
				);

				const response: AuthEmailValidationApi = { data: { success: true } };
				return c.json(response, 200);
			},
		)
		.post(
			"/validate-email/resend",
			PostResendValidationEmailRoute,
			validator("json", PostResendValidationEmailJsonSchema),
			async (c) => {
				const { email } = c.req.valid("json");
				const user = await services.usersService.getUserByEmailForAuth(email);

				if (user && !user.deletedAt && !user.emailVerified) {
					const { token } =
						await services.authService.createEmailValidationToken(user.id);
					await services.mailsService.sendValidationEmail(user.email, token);
				}

				const response: AuthEmailValidationApi = { data: { success: true } };
				return c.json(response, 200);
			},
		)
		.post(
			"/password-reset",
			PostPasswordResetRequestRoute,
			validator("json", PostPasswordResetJsonSchema),
			async (c) => {
				const { email } = c.req.valid("json");

				const user = await services.usersService.getUserByEmailForAuth(email);
				if (user && !user.deletedAt) {
					const { token } = await services.authService.createPasswordResetToken(
						user.id,
					);
					await services.mailsService.sendPasswordResetEmail(user.email, token);
				}

				const response: AuthPasswordResetRequestApi = {
					data: { success: true },
				};
				return c.json(response, 200);
			},
		)
		.post(
			"/password-reset/confirm",
			PostPasswordResetConfirmRoute,
			validator("json", PostPasswordResetConfirmJsonSchema),
			async (c) => {
				const { token, password } = c.req.valid("json");

				const storedToken =
					await services.authService.getValidPasswordResetToken(token);
				if (!storedToken) {
					throwHTTPException400BadRequest("Invalid or expired token", {
						res: c.res,
						cause: { code: API_ERROR.INVALID_TOKEN },
					});
				}

				const passwordHash = await hashPassword(password);
				await services.authService.resetPasswordForUser({
					userId: storedToken.userId,
					tokenId: storedToken.id,
					passwordHash,
				});

				const response: AuthPasswordResetConfirmApi = {
					data: { success: true },
				};
				return c.json(response, 200);
			},
		)
		.post("/sign-out", PostSignOutRoute, async (c) => {
			const sessionId = await getSignedCookie(
				c,
				env.JWT_REFRESH_SECRET,
				COOKIE_REFRESH_NAME,
			);
			if (sessionId) {
				await services.authService.deleteSession(sessionId);
			}

			deleteCookie(c, COOKIE_REFRESH_NAME);
			deleteCookie(c, COOKIE_AUTH_NAME);

			const response: AuthSignOutResponseApi = { data: { success: true } };
			return c.json(response, 200);
		})
		.get("/check", GetAuthCheckRoute, async (c) => {
			const result = await resolveAuthValidation(c, services);
			if (!result.authenticated) {
				clearAuthCookies(c);

				const response: AuthCheckResponseApi = {
					data: { authenticated: false },
				};
				return c.json(response, 200);
			}

			await refreshAuthCookies(c, result);

			const response: AuthCheckResponseApi = {
				data: { authenticated: true },
			};
			return c.json(response, 200);
		});
};
