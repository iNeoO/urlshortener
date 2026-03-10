import type { APIError } from "@urlshortener/common/types";
import { HTTPException } from "hono/http-exception";
import type { ResolverReturnType } from "hono-openapi";
import { resolver } from "hono-openapi";
import {
	ErrorSchema,
	ZodSafeParseErrorSchema,
} from "../schemas/apiErrors.schema.js";

export type Cause = {
	code: APIError;
	message?: string;
};

type ErrorOptions = {
	cause?: Cause;
	res?: Response;
};

const getParamsOptions = (
	status: number,
	message: string,
	options: ErrorOptions,
) => {
	const { cause, res: baseResponse } = options;
	const params: { message: string; cause?: Cause } = {
		message,
		...(cause ? { cause } : {}),
	};
	const headers = {
		...(baseResponse ? Object.fromEntries(baseResponse.headers) : {}),
		"Content-Type": "application/json",
	};
	const res = new Response(JSON.stringify(params), {
		status,
		headers,
	});

	return { ...params, res };
};

export const throwHTTPException400BadRequest = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 400;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
};

export const throwHTTPException401Unauthorized = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 401;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
};

export const throwHTTPException403Forbidden = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 403;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
};

export const throwHTTPException404NotFound = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 404;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
};

export const throwHTTPException409Conflict = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 409;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
};

export const throwHTTPException503ServiceUnavailable = (
	msg: string,
	options: ErrorOptions,
) => {
	const status = 503;
	const params = getParamsOptions(status, msg, options);
	throw new HTTPException(status, params);
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
