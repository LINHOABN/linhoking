import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AdminLayout() {
    const { isAuthenticated, initializing } = useAuth();

    // Wait for localStorage token to be read before redirecting
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
            <Sidebar />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
