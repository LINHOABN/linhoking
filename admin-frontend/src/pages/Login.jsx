import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ShoppingCart, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
    const { login, error, loading, isAuthenticated } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    if (isAuthenticated) return <Navigate to="/" replace />;

    async function handleSubmit(e) {
        e.preventDefault();
        await login(identifier, password);
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <img src="/logo.jpg" alt="LINHOKING" className="login-logo-img" />
                <h1 className="login-title">LINHOKING Admin</h1>
                <p className="login-slogan">BUILD WEALTH • CREATE FREEDOM • LIVE YOUR LEGACY</p>
                <p className="login-subtitle">Connectez-vous pour gérer votre boutique</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Identifiant</label>
                        <input
                            className="form-input"
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="admin ou admin@boutique.cm"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
                        <label className="form-label">Mot de passe</label>
                        <div style={{ position: "relative" }}>
                            <input
                                className="form-input"
                                type={showPwd ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                style={{ paddingRight: "44px" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd((v) => !v)}
                                style={{
                                    position: "absolute", right: "12px", top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", color: "var(--text-faint)", cursor: "pointer"
                                }}
                                aria-label={showPwd ? "Masquer" : "Afficher"}
                            >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Connexion…" : <><Lock size={16} /> Se connecter</>}
                    </button>
                </form>

                <div className="login-hint">
                    Démo — identifiant : <code>admin</code> · mot de passe : <code>admin123</code>
                </div>
            </div>
        </div>
    );
}
