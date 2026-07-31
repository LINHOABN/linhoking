import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Tags, MessageSquare, Eye, Award, Sparkles } from "lucide-react";
import { productService, categoryService, chatService } from "../services/data.js";

import { SHOP_BASE_URL } from "../config.js";

function fmt(v) {
    return v ? `${new Intl.NumberFormat("fr-FR").format(v)} FCFA` : "0 FCFA";
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [topVisited, setTopVisited] = useState([]);
    const [totalViews, setTotalViews] = useState(0);

    useEffect(() => {
        Promise.all([
            productService.getAll(),
            categoryService.getAll(),
            chatService.getAll(),
            productService.getStats(),
        ]).then(([products, categories, conversations, apiStats]) => {
            const unread = conversations.filter(c => c.unread).length;
            setStats({ products: products.length, categories: categories.length, conversations: conversations.length, unread });

            if (apiStats && apiStats.top_visited && apiStats.top_visited.length > 0) {
                setTopVisited(apiStats.top_visited);
                setTotalViews(apiStats.total_views || 0);
            } else {
                // Fallback client calculation if backend stats empty
                const sorted = [...products].sort((a, b) => (b.vues_count || 0) - (a.vues_count || 0)).slice(0, 5);
                setTopVisited(sorted.map(p => ({
                    id: p.id,
                    nom: p.name,
                    prix: p.price,
                    vues_count: p.vues_count || 0,
                    categorie_nom: "",
                    image: p.images?.[0]
                })));
                const sum = products.reduce((acc, p) => acc + (p.vues_count || 0), 0);
                setTotalViews(sum);
            }
        });
    }, []);

    if (!stats) return <p style={{ color: "var(--text-muted)", padding: "40px" }}>Chargement du tableau de bord…</p>;

    const maxViews = topVisited.length > 0 ? Math.max(...topVisited.map(p => p.vues_count || 1), 1) : 1;

    const cards = [
        { label: "Produits", value: stats.products, icon: Package, to: "/produits", color: "#22c55e" },
        { label: "Catégories", value: stats.categories, icon: Tags, to: "/categories", color: "#60a5fa" },
        {
            label: "Messages", value: stats.conversations, icon: MessageSquare, to: "/messages", color: "#f59e0b",
            badge: stats.unread > 0 ? `${stats.unread} non-lus` : null
        },
        { label: "Vues Totales", value: totalViews, icon: Eye, to: "/produits", color: "#a855f7" },
    ];

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tableau de bord</h1>
                    <p className="page-subtitle">Aperçu général et statistiques des activités visiteurs 👋</p>
                </div>
            </div>

            {/* Cartes de Statistiques */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                {cards.map(({ label, value, icon: Icon, to, color, badge }) => (
                    <Link to={to} className="stat-card" key={label}>
                        <span className="stat-icon" style={{ background: `${color}18`, color }}>
                            <Icon size={20} strokeWidth={1.8} />
                        </span>
                        <div>
                            <p className="stat-value">{value}</p>
                            <p className="stat-label">{label}{badge ? ` · ${badge}` : ""}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Section Produits les Plus Visités */}
            <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <Award size={18} color="var(--primary)" /> 🔥 Produits les plus visités
                    </h2>
                    <span style={{ fontSize: 12, color: "var(--text-faint)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 12 }}>
                        Statistiques en temps réel
                    </span>
                </div>

                {topVisited.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                        Aucune visite enregistrée pour le moment.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {topVisited.map((item, index) => {
                            const percent = Math.min(Math.round(((item.vues_count || 0) / maxViews) * 100), 100);
                            return (
                                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "36px 48px 1fr 110px 100px", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        fontWeight: 800,
                                        fontSize: 14,
                                        color: index === 0 ? "#f59e0b" : index === 1 ? "#94a3b8" : index === 2 ? "#d97706" : "var(--text-faint)",
                                        textAlign: "center"
                                    }}>
                                        #{index + 1}
                                    </div>
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"}
                                        alt={item.nom}
                                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.nom}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                            {item.categorie_nom && <span>{item.categorie_nom}</span>}
                                            <span>{fmt(item.prix)}</span>
                                        </div>
                                        {/* Barre de popularité */}
                                        <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                                            <div style={{ width: `${percent}%`, height: "100%", background: "var(--primary, #4f46e5)", borderRadius: 2 }} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(79,70,229,0.12)", color: "var(--primary)", padding: "3px 10px", borderRadius: 12 }}>
                                            <Eye size={13} /> {item.vues_count || 0} vue{(item.vues_count || 0) !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <a
                                            href={`${SHOP_BASE_URL}/produits/${item.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
                                        >
                                            Voir fiche ↗
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Activité récente */}
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px 0", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Sparkles size={16} /> Suivi des activités visiteurs
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                    Toutes les visites sur les fiches produits et les nouveaux messages envoyés par vos visiteurs sont suivis automatiquement en temps réel pour alimenter ce tableau de bord.
                </p>
            </div>
        </div>
    );
}
