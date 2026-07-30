export const BASE_URL = import.meta.env.VITE_API_URL || "https://linhoking-me6f.vercel.app/api";

export async function apiRequest(path, { method = "GET", body, token } = {}) {
    const headers = {};
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const storedToken = token || localStorage.getItem("admin_token") || localStorage.getItem("auth_token");
    if (storedToken && !storedToken.startsWith("mock-")) {
        headers.Authorization = `Bearer ${storedToken}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => response.statusText);
        throw new Error(message || `Erreur API (${response.status})`);
    }

    if (response.status === 204) return null;
    return response.json();
}
