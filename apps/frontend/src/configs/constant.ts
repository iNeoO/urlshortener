const envBackendUrl = String(
	import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api",
);

const envRedirectorUrl = String(
	import.meta.env.VITE_REDIRECTOR_URL || "http://localhost:4001",
);

export const BACKEND_URL = envBackendUrl;
export const REDIRECTOR_URL = envRedirectorUrl;
