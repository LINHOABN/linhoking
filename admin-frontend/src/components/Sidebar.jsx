import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, Tags, MessageSquare,
    LogOut, ShoppingBag, ExternalLink, ShoppingCart
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/produits", label: "Produits", icon: Package },
    { to: "/categories", label: "Catégories", icon: Tags },
    { to: "/messages", label: "Messages", icon: MessageSquare },
];

import { SHOP_BASE_URL } from "../config.js";

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/connexion");
    }

    return (
        <aside className="sidebar">
            {/* Marque */}
            <div className="sidebar-brand">
                <img src="/logo.jpg" alt="LINHOKING Logo" className="sidebar-logo-img" />
                <div className="sidebar-brand-text">
                    <span className="sidebar-logo-text">LINHOKING</span>
                    <span className="sidebar-logo-sub">ADMIN</span>
                </div>
            </div>

            {/* Navigation principale */}
            <nav className="sidebar-nav">
                {NAV.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                    >
                        <Icon size={17} strokeWidth={1.8} />
                        {label}
                    </NavLink>
                ))}

                <div className="sidebar-divider" />

                {/* Bouton Prévisualiser la boutique */}
                <button
                    className="sidebar-preview-btn"
                    onClick={() => window.open(SHOP_BASE_URL, "_blank")}
                    title="Ouvrir la boutique dans un nouvel onglet"
                >
                    <ExternalLink size={16} strokeWidth={1.8} />
                    Voir la boutique
                </button>
            </nav>

            {/* Déconnexion */}
            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={handleLogout}>
                    <LogOut size={17} strokeWidth={1.8} />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
