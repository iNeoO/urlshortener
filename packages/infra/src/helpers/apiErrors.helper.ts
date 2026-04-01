import type { APIError } from "@urlshortener/common/types";
import type { Context } from "hono";
import type { ResolverReturnType } from "hono-openapi";
import { resolver } from "hono-openapi";
import {
	ErrorSchema,
	ZodSafeParseErrorSchema,
} from "../schemas/apiErrors.schema.js";

type ApiErrorPayload = {
	code: APIError;
	error: string;
};

type ApiErrorDefinition = {
	status: number;
	payload: ApiErrorPayload;
};

export const API_ERRORS = {
	AUTH_EMAIL_ALREADY_EXISTS: {
		status: 409,
		payload: {
			code: "EMAIL_ALREADY_EXISTS",
			error: "Email already in use",
		},
	},
	AUTH_INVALID_CREDENTIALS: {
		status: 401,
		payload: {
			code: "INVALID_CREDENTIALS",
			error: "Invalid Credential",
		},
	},
	AUTH_EMAIL_NOT_VERIFIED: {
		status: 403,
		payload: {
			code: "EMAIL_NOT_VERIFIED",
			error: "Email not verified",
		},
	},
	AUTH_INVALID_TOKEN: {
		status: 400,
		payload: {
			code: "INVALID_TOKEN",
			error: "Invalid or expired token",
		},
	},
	AUTH_INVALID_SESSION: {
		status: 401,
		payload: {
			code: "INVALID_SESSION",
			error: "Unauthorized",
		},
	},
	AUTH_SESSION_EXPIRED: {
		status: 401,
		payload: {
			code: "SESSION_EXPIRED",
			error: "Unauthorized",
		},
	},
	AUTH_USER_NOT_FOUND: {
		status: 401,
		payload: {
			code: "USER_NOT_FOUND",
			error: "Unauthorized",
		},
	},
	GROUP_MISSING_PERMISSION: {
		status: 403,
		payload: {
			code: "MISSING_PERMISSION",
			error: "Forbidden",
		},
	},
	GROUP_NOT_FOUND: {
		status: 404,
		payload: {
			code: "GROUP_NOT_FOUND",
			error: "Not Found",
		},
	},
	GROUP_MEMBER_NOT_FOUND: {
		status: 404,
		payload: {
			code: "USER_NOT_FOUND",
			error: "Member not found",
		},
	},
	PROFILE_NOT_FOUND: {
		status: 404,
		payload: {
			code: "PROFILE_NOT_FOUND",
			error: "Profile not found",
		},
	},
	PROFILE_CURRENT_PASSWORD_INCORRECT: {
		status: 400,
		payload: {
			code: "CURRENT_PASSWORD_INCORRECT",
			error: "Current password is incorrect",
		},
	},
	INVITATION_NOT_FOUND_OR_INVALID: {
		status: 404,
		payload: {
			code: "INVITATION_NOT_FOUND",
			error: "Invitation not found or invalid",
		},
	},
	GROUP_USER_ALREADY_IN_GROUP: {
		status: 409,
		payload: {
			code: "USER_ALREADY_IN_GROUP",
			error: "User is already in this group",
		},
	},
	GROUP_INVITATION_REFUSED: {
		status: 403,
		payload: {
			code: "INVITATION_REFUSED",
			error: "Invitation has been refused",
		},
	},
	GROUP_INVITATION_ALREADY_EXISTS: {
		status: 409,
		payload: {
			code: "INVITATION_ALREADY_EXISTS",
			error: "Invitation already exists",
		},
	},
	SHORT_URL_COLLISION: {
		status: 409,
		payload: {
			code: "SHORT_URL_COLLISION",
			error: "Short URL collision. Please retry.",
		},
	},
	URL_NOT_FOUND: {
		status: 404,
		payload: {
			code: "URL_NOT_FOUND",
			error: "URL not found",
		},
	},
} as const satisfies Record<string, ApiErrorDefinition>;

export type ApiErrorKey = keyof typeof API_ERRORS;

export const apiError = (c: Context, key: ApiErrorKey) => {
	const { payload, status } = API_ERRORS[key];
	return c.json(payload, status);
};

export const apiErrorResolver = (): ResolverReturnType => resolver(ErrorSchema);
export const apiZodErrorResolver = (): ResolverReturnType =>
	resolver(ZodSafeParseErrorSchema);

export const openApi401Unauthorized = (description: string) => ({
	401: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});

export const openApi400BadRequest = (description: string) => ({
	400: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});

export const openApi400ZodError = (description: string) => ({
	400: {
		description,
		content: {
			"application/json": { schema: apiZodErrorResolver() },
		},
	},
});

export const openApi503Error = (description: string) => ({
	503: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});

export const openApi403Forbidden = (description: string) => ({
	403: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});
export const openApi404NotFound = (description: string) => ({
	404: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});

export const openApi409Conflict = (description: string) => ({
	409: {
		description,
		content: {
			"application/json": { schema: apiErrorResolver() },
		},
	},
});
