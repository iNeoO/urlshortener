const envBackendUrl = String(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api",
);

export const BACKEND_URL = envBackendUrl;
