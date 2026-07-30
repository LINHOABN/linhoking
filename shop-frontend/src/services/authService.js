import { apiRequest, mockDelay, USE_MOCKS } from "./api";

const MOCK_ADMIN_PASS = "admin123";

// POST /login/
export async function login(emailOrUsername, password) {
  if (USE_MOCKS) {
    const identifier = (emailOrUsername || "").trim().toLowerCase();
    if ((identifier === "admin@boutique.cm" || identifier === "admin") && password === MOCK_ADMIN_PASS) {
      const token = "mock-token-admin";
      localStorage.setItem("auth_token", token);
      return mockDelay({ token, admin: { email: identifier } });
    }
    await mockDelay(null);
    throw new Error("Identifiant ou mot de passe incorrect.");
  }
  const result = await apiRequest("/login/", { method: "POST", body: { username: emailOrUsername, password } });
  const token = result.access || result.token;
  if (token) {
    localStorage.setItem("auth_token", token);
  }
  return result;
}


export function logout() {
  localStorage.removeItem("auth_token");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("auth_token"));
}
