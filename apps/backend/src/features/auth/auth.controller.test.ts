import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	hashPasswordMock,
	verifyPasswordMock,
	fakePasswordVerifyMock,
	setAuthCookiesMock,
	clearAuthCookiesMock,
	refreshAuthCookiesMock,
	resolveAuthValidationMock,
	getSignedCookieMock,
	deleteCookieMock,
} = vi.hoisted(() => ({
	hashPasswordMock: vi.fn(),
	verifyPasswordMock: vi.fn(),
	fakePasswordVerifyMock: vi.fn(),
	setAuthCookiesMock: vi.fn(),
	clearAuthCookiesMock: vi.fn(),
	refreshAuthCookiesMock: vi.fn(),
	resolveAuthValidationMock: vi.fn(),
	getSignedCookieMock: vi.fn(),
	deleteCookieMock: vi.fn(),
}));

vi.mock("@urlshortener/infra/configs", () => ({
	env: {
		JWT_REFRESH_SECRET: "refresh-secret",
		FRONTEND_URL: "https://app.example.com",
		NAME_AUTH_TOKEN: "auth-token",
		NAME_REFRESH_TOKEN: "refresh-token",
	},
}));

vi.mock("@urlshortener/services", () => ({
	hashPassword: hashPasswordMock,
	verifyPassword: verifyPasswordMock,
}));

vi.mock("./auth.utils.js", () => ({
	fakePasswordVerify: fakePasswordVerifyMock,
	setAuthCookies: setAuthCookiesMock,
}));

vi.mock("../../middlewares/auth.middleware.js", () => ({
	clearAuthCookies: clearAuthCookiesMock,
	refreshAuthCookies: refreshAuthCookiesMock,
	resolveAuthValidation: resolveAuthValidationMock,
}));

vi.mock("hono/cookie", () => ({
	deleteCookie: deleteCookieMock,
	getSignedCookie: getSignedCookieMock,
}));

import { createAuthController } from "./auth.controller.js";

describe("AuthController", () => {
	beforeEach(() => {
		hashPasswordMock.mockReset();
		verifyPasswordMock.mockReset();
		fakePasswordVerifyMock.mockReset();
		setAuthCookiesMock.mockReset();
		clearAuthCookiesMock.mockReset();
		refreshAuthCookiesMock.mockReset();
		resolveAuthValidationMock.mockReset();
		getSignedCookieMock.mockReset();
		deleteCookieMock.mockReset();
	});

	it("should sign up a new user", async () => {
		hashPasswordMock.mockResolvedValue("hashed-password");
		const servicesMock = {
			usersService: {
				getUserByEmailForAuth: vi.fn().mockResolvedValue(null),
				createUserForAuth: vi.fn().mockResolvedValue({ id: "user-id", email: "john@doe.test" }),
			},
			authService: {
				createEmailValidationToken: vi.fn().mockResolvedValue({ token: "token" }),
			},
			mailsService: {
				sendValidationEmail: vi.fn().mockResolvedValue(undefined),
			},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createAuthController(servicesMock as any);
		const client = testClient(app);
		const response = await client["sign-up"].email.$post({ json: { email: "john@doe.test", password: "password123", username: "John" } });
		expect(response.status).toBe(201);
		await expect(response.json()).resolves.toEqual({ data: { success: true } });
	});

	it("should return invalid credentials when user is missing on sign in", async () => {
		const servicesMock = {
			usersService: { getUserByEmailForAuth: vi.fn().mockResolvedValue(null) },
			authService: {},
			mailsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createAuthController(servicesMock as any);
		const client = testClient(app);
		const response = await client["sign-in"].email.$post({ json: { email: "john@doe.test", password: "password123" } });
		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({ code: "INVALID_CREDENTIALS", error: "Invalid Credential" });
		expect(fakePasswordVerifyMock).toHaveBeenCalledWith("password123");
	});

	it("should sign in and set auth cookies", async () => {
		verifyPasswordMock.mockResolvedValue(true);
		const user = { id: "user-id", email: "john@doe.test", deletedAt: null, passwordHash: "hash", emailVerified: true, name: "John Doe" };
		const servicesMock = {
			usersService: {
				getUserByEmailForAuth: vi.fn().mockResolvedValue(user),
				sanitizeUser: vi.fn().mockReturnValue({ id: "user-id", email: "john@doe.test", name: "John Doe", emailVerified: true }),
			},
			authService: {
				createSession: vi.fn().mockResolvedValue({ id: "session-id" }),
			},
			mailsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createAuthController(servicesMock as any);
		const client = testClient(app);
		const response = await client["sign-in"].email.$post({ json: { email: "john@doe.test", password: "password123" } });
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data: { id: "user-id", email: "john@doe.test", name: "John Doe", emailVerified: true } });
		expect(setAuthCookiesMock).toHaveBeenCalled();
	});

	it("should sign out and clear cookies", async () => {
		getSignedCookieMock.mockResolvedValue("session-id");
		const servicesMock = {
			usersService: {},
			authService: { deleteSession: vi.fn().mockResolvedValue(undefined) },
			mailsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createAuthController(servicesMock as any);
		const client = testClient(app);
		const response = await client["sign-out"].$post();
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data: { success: true } });
		expect(servicesMock.authService.deleteSession).toHaveBeenCalledWith("session-id");
		expect(deleteCookieMock).toHaveBeenCalledTimes(2);
	});

	it("should return authenticated false when auth check fails", async () => {
		resolveAuthValidationMock.mockResolvedValue({ authenticated: false });
		const servicesMock = {
			usersService: {},
			authService: {},
			mailsService: {},
		};
		// biome-ignore lint/suspicious/noExplicitAny: Controller services mock kept intentionally minimal for this unit test
		const app = createAuthController(servicesMock as any);
		const client = testClient(app);
		const response = await client.check.$get();
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ data: { authenticated: false } });
		expect(clearAuthCookiesMock).toHaveBeenCalled();
	});
});
