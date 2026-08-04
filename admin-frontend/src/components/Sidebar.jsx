import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Package, Tags, MessageSquare,
    LogOut, ExternalLink, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { SHOP_BASE_URL } from "../config.js";

export default function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const { unreadMessages, newProducts, clearMessages, clearProducts } = useNotifications();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/connexion");
    }

    function handleNavClick(to) {
        if (to === "/messages") clearMessages();
        if (to === "/produits") clearProducts();
        if (onClose) onClose();
    }

    const NAV = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, badge: 0 },
        { to: "/produits", label: "Produits", icon: Package, badge: newProducts },
        { to: "/categories", label: "Catégories", icon: Tags, badge: 0 },
        { to: "/messages", label: "Messages", icon: MessageSquare, badge: unreadMessages },
    ];

    return (
        <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
            {/* Bouton fermer (mobile uniquement) */}
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Fermer le menu">
                <X size={20} />
            </button>

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
                {NAV.map(({ to, label, icon: Icon, end, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                        onClick={() => handleNavClick(to)}
                    >
                        <span className="sidebar-link-icon">
                            <Icon size={17} strokeWidth={1.8} />
                            {badge > 0 && (
                                <span className="notif-badge">{badge > 99 ? "99+" : badge}</span>
                            )}
                        </span>
                        {label}
                    </NavLink>
                ))}

                <div className="sidebar-divider" />

                <button
                    className="sidebar-preview-btn"
                    onClick={() => { window.open(SHOP_BASE_URL, "_blank"); if (onClose) onClose(); }}
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
