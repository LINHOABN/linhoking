// Configuration globale des URLs pour l'Admin LINHOKING

export const SHOP_BASE_URL = import.meta.env.VITE_SHOP_URL || (
    typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://localhost:5173"
        : "https://linhoking.vercel.app"
);
