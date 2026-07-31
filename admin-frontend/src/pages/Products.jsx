import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Share2, Check } from "lucide-react";
import { productService, categoryService } from "../services/data.js";

import { SHOP_BASE_URL } from "../config.js";

function fmt(v) { return `${new Intl.NumberFormat("fr-FR").format(v)} FCFA`; }

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmId, setConfirmId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    function reload() {
        setLoading(true);
        productService.getAll().then(data => { setProducts(data); setLoading(false); });
    }

    useEffect(() => {
        reload();
        categoryService.getAll().then(setCategories);
    }, []);

    function catName(id) { return categories.find(c => c.id === id)?.name || id; }

    function handleCopyLink(p) {
        const link = `${SHOP_BASE_URL}/produits/${p.id}`;
        navigator.clipboard.writeText(link);
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    async function handleDelete(id) {
        await productService.delete(id);
        setConfirmId(null);
        reload();
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Produits</h1>
                    <p className="page-subtitle">{products.length} produit{products.length !== 1 ? "s" : ""} enregistré{products.length !== 1 ? "s" : ""}</p>
                </div>
                <Link to="/produits/nouveau" className="btn btn-primary">
                    <Plus size={15} /> Ajouter un produit
                </Link>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <p>Aucun produit. Ajoutez votre premier produit.</p>
                    <Link to="/produits/nouveau" className="btn btn-primary">
                        <Plus size={15} /> Ajouter
                    </Link>
                </div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td><img src={p.images?.[0]} alt={p.name} className="table-thumb" /></td>
                                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td className="table-muted">{catName(p.category)}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>

                                    <td>
                                        <span className={`badge ${p.stock ? "badge-green" : "badge-red"}`}>
                                            {p.stock ? "En stock" : "Épuisé"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleCopyLink(p)}
                                                title={copiedId === p.id ? "Lien copié !" : "Copier le lien de la publication"}
                                                style={copiedId === p.id ? { color: "#10b981", borderColor: "#10b981" } : {}}
                                            >
                                                {copiedId === p.id ? <Check size={14} /> : <Share2 size={14} />}
                                            </button>
                                            <Link to={`/produits/nouveau?id=${p.id}`} className="icon-btn" aria-label="Modifier" title="Modifier">
                                                <Pencil size={14} />
                                            </Link>
                                            {confirmId === p.id ? (
                                                <div className="confirm-row">
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Confirmer</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Annuler</button>
                                                </div>
                                            ) : (
                                                <button className="icon-btn danger" aria-label="Supprimer" title="Supprimer" onClick={() => setConfirmId(p.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
