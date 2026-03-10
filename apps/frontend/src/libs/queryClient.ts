import { QueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/auth.context";
import { router } from "./router";

declare global {
	interface Window {
		__TANSTACK_QUERY_CLIENT__: QueryClient;
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
		mutations: {
			onError: (error) => {
				console.error(error);
			},
		},
	},
});

// Devtools
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

type Cause = {
	name?: string;
	message?: string;
	stack?: string;
};

const getDataResponse = (
	data: unknown,
): data is { cause?: Cause; message: string } => {
	if (typeof data !== "object" || data === null) return false;

	const d = data as Record<string, unknown>;

	if (d.message === undefined || typeof d.message !== "string") return false;
	if (d.cause !== undefined && !getCauseResponse(d.cause)) return false;

	return true;
};

const getCauseResponse = (cause: unknown): cause is Cause => {
	if (typeof cause !== "object" || cause === null) return false;

	const d = cause as Record<string, unknown>;

	if (d.name !== undefined && typeof d.name !== "string") return false;
	if (d.message !== undefined && typeof d.message !== "string") return false;
	if (d.stack !== undefined && typeof d.stack !== "string") return false;

	return true;
};

export class HttpError extends Error {
	status: number;
	rawData: unknown;
	data: Cause | undefined;

	constructor(message: string, status: number, data?: unknown) {
		let finalMessage = message;
		let d: Cause | undefined;
		if (getDataResponse(data)) {
			if (data.cause) {
				d = data.cause;
			}
			finalMessage = data.message;
		}
		super(finalMessage);
		this.name = "HttpError";
		this.status = status;
		this.rawData = data;
		if (d) this.data = d;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export const handleRequestErrors = async (res: Response) => {
	const auth = useAuth();
	if (res.ok) return;

	if (res.status === 401) {
		auth.disconnect();
		router.navigate({
			to: "/login",
			search: { redirect: window.location.pathname },
		});
	}

	let data: unknown;
	try {
		data = await res.clone().json();
	} catch {
		try {
			data = await res.clone().text();
		} catch {
			data = null;
		}
	}

	throw new HttpError(`HTTP ${res.status}`, res.status, data);
};
