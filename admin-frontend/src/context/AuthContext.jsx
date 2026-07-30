import { createContext, useContext, useState, useCallback, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // On mount: read token from localStorage. Ignore mock tokens.
    useEffect(() => {
        const stored = localStorage.getItem("admin_token");
        if (stored && !stored.startsWith("mock-")) {
            setToken(stored);
        } else if (stored && stored.startsWith("mock-")) {
            localStorage.removeItem("admin_token");
        }
        setInitializing(false);
    }, []);

    const login = useCallback(async (identifier, password) => {
        setLoading(true);
        setError("");

        // Authentification via API backend Django (SimpleJWT)
        try {
            const res = await fetch(`${BASE_URL}/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: identifier, password }),
            });
            if (res.ok) {
                const data = await res.json();
                const tk = data.access || data.token;
                if (tk) {
                    localStorage.setItem("admin_token", tk);
                    setToken(tk);
                    setLoading(false);
                    return true;
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.detail || "Identifiant ou mot de passe incorrect.");
                setLoading(false);
                return false;
            }
        } catch (_) {
            setError("Impossible de contacter le serveur backend.");
            setLoading(false);
            return false;
        }

        setError("Identifiant ou mot de passe incorrect.");
        setLoading(false);
        return false;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("admin_token");
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), initializing, login, logout, error, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
