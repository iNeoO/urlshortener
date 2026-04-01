const envBackendUrl = String(import.meta.env.VITE_BACKEND_URL);

const envRedirectorUrl = String(import.meta.env.VITE_REDIRECTOR_URL);

export const BACKEND_URL = envBackendUrl;
export const REDIRECTOR_URL = envRedirectorUrl;
