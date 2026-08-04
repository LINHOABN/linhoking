import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { registerPushSubscription } from "../utils/push.js";
import Sidebar from "./Sidebar.jsx";

export default function AdminLayout() {
    const { isAuthenticated, initializing } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            registerPushSubscription(true);
        }
    }, [isAuthenticated]);

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
                <button
                    className="mobile-hamburger"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={22} />
                </button>
            </header>

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
