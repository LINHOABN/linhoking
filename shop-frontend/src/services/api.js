// Point d'entrée unique pour les appels réseau.
export const BASE_URL = import.meta.env.VITE_API_URL || "https://linhoking-me6f.vercel.app/api";
export const USE_MOCKS = false;

const MOCK_DELAY = 350;

export function mockDelay(payload, delay = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(() => resolve(payload), delay));
}

// Wrapper fetch générique pour le backend réel (auth par token JWT Bearer, JSON / FormData, gestion d'erreurs).
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const storedToken = token || localStorage.getItem("auth_token");
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
