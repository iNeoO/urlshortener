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
	code?: string;
	error?: string;
};

const getDataResponse = (
	data: unknown,
): data is Cause => {
	if (typeof data !== "object" || data === null) return false;

	const d = data as Record<string, unknown>;

	if (d.code !== undefined && typeof d.code !== "string") return false;
	if (d.error !== undefined && typeof d.error !== "string") return false;

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
			d = data;
			finalMessage = data.error ?? message;
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
