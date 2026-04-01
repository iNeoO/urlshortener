import { API_ERROR } from "@urlshortener/common/constants";
import type { APIError } from "@urlshortener/common/types";
import { triggerUnauthorized } from "../../contexts/authEvents";

type ApiErrorCause = {
	code: APIError;
	error: string;
};

type ApiErrorResponse = ApiErrorCause;

const API_ERROR_MESSAGES: Partial<Record<APIError, string>> = {
	CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",
	EMAIL_ALREADY_EXISTS: "This email is already used. Try signing in instead.",
	EMAIL_NOT_VERIFIED: "Please verify your email to continue.",
	INVALID_CREDENTIALS: "Invalid email or password.",
	INVALID_TOKEN: "This link is invalid or expired.",
	INVALID_SESSION: "Your session is invalid. Please sign in again.",
	SESSION_EXPIRED: "Your session expired. Please sign in again.",
	MISSING_PERMISSION: "You do not have permission to perform this action.",
	PROFILE_NOT_FOUND: "Profile not found.",
	USER_NOT_FOUND: "User not found.",
	URL_NOT_FOUND: "URL not found.",
	INVITATION_NOT_FOUND: "Invitation not found.",
	INVITATION_ALREADY_EXISTS: "Invitation already exists.",
	USER_ALREADY_IN_GROUP: "User is already in this group.",
	SHORT_URL_COLLISION: "Short URL already exists. Please try again.",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isApiErrorCode = (value: unknown): value is APIError =>
	typeof value === "string" && value in API_ERROR;

const parseApiErrorResponse = (data: unknown): ApiErrorResponse | undefined => {
	if (!isRecord(data)) return;
	if (!isApiErrorCode(data.code)) return;
	if (typeof data.error !== "string") return;
	return { code: data.code, error: data.error };
};

export class ApiError extends Error {
	status: number;
	code?: APIError;
	raw: unknown;

	constructor(message: string, status: number, code?: APIError, raw?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.raw = raw;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export async function toApiError(
	res: Response,
	fallbackMessage: string,
): Promise<ApiError> {
	const status = res.status as number;
	if (status === 401) {
		triggerUnauthorized();
	}

	let raw: unknown = null;
	try {
		raw = await res.clone().json();
	} catch {
		try {
			raw = await res.clone().text();
		} catch {
			raw = null;
		}
	}

	const parsed = parseApiErrorResponse(raw);
	const code = parsed?.code;
	const mappedMessage = code ? API_ERROR_MESSAGES[code] : undefined;
	const message = mappedMessage ?? parsed?.error ?? fallbackMessage;

	return new ApiError(message, status, code, raw);
}
