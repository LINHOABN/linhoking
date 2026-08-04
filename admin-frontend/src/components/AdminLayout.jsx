import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Menu, Bell, BellRing } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { registerPushSubscription, getPushPermissionState } from "../utils/push.js";
import Sidebar from "./Sidebar.jsx";

export default function AdminLayout() {
    const { isAuthenticated, initializing } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pushState, setPushState] = useState(() => getPushPermissionState());
    const [pushLoading, setPushLoading] = useState(false);

    useEffect(() => {
        setPushState(getPushPermissionState());
        if (isAuthenticated) {
            registerPushSubscription(true).then(() => {
                setPushState(getPushPermissionState());
            });
        }
    }, [isAuthenticated]);

    async function handleEnablePush() {
        setPushLoading(true);
        const res = await registerPushSubscription(true);
        setPushState(getPushPermissionState());
        setPushLoading(false);
        if (res.success) {
            alert("✅ Notifications Push activées avec succès ! Vous recevrez des alertes même site fermé.");
        } else if (res.reason === "denied") {
            alert("⚠️ Les notifications ont été bloquées dans votre navigateur. Cliquez sur le cadenas à côté de l'URL pour autoriser.");
        }
    }

    if (initializing) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                fontSize: 14,
                color: "#888"
            }}>
                Chargement…
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/connexion" replace />;
    }

    return (
        <div className="admin-shell">
            {/* Topbar mobile */}
            <header className="mobile-topbar">
                <div className="mobile-topbar-brand">
                    <img src="/logo.jpg" alt="LINHOKING" className="mobile-topbar-logo" />
                    <span className="mobile-topbar-name">LINHOKING</span>
                    <span className="mobile-topbar-sub">ADMIN</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                        onClick={handleEnablePush}
                        disabled={pushLoading}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 20,
                            border: "none",
                            background: pushState === "granted" ? "rgba(34, 197, 94, 0.2)" : "#f59e0b",
                            color: pushState === "granted" ? "#22c55e" : "#0f172a",
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: "pointer"
                        }}
                    >
                        {pushState === "granted" ? <BellRing size={15} /> : <Bell size={15} />}
                        {pushState === "granted" ? "Push Actif" : "Activer Push 🔔"}
                    </button>
                    <button
                        className="mobile-hamburger"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Ouvrir le menu"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </header>

            {/* Banner desktop sous forme de bandeau si les notifications ne sont pas encore autorisées */}
            {pushState !== "granted" && (
                <div style={{
                    background: "linear-gradient(90deg, #f59e0b, #d97706)",
                    color: "#0f172a",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontWeight: 600,
                    zIndex: 90
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Bell size={18} />
                        <span>Activer les notifications push pour recevoir les messages clients même quand ton navigateur est fermé !</span>
                    </div>
                    <button
                        onClick={handleEnablePush}
                        disabled={pushLoading}
                        style={{
                            background: "#0f172a",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: 12
                        }}
                    >
                        {pushLoading ? "Activation…" : "Activer les Notifications 🔔"}
                    </button>
                </div>
            )}

            {/* Overlay fond quand sidebar ouverte */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar — passe isOpen pour gestion classe */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
