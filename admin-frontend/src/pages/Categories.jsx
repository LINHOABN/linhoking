import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { categoryService } from "../services/data.js";

const ICONS = [
    { value: "shirt", label: "Chemises / Vêtements" },
    { value: "pants", label: "Pantalons" },
    { value: "chaussures", label: "Chaussures" },
    { value: "bag", label: "Sacs" },
    { value: "watch", label: "Montres" },
    { value: "cap", label: "Casquettes" },
    { value: "sunglasses", label: "Lunettes" },
    { value: "phone", label: "Téléphones / Smartphones" },
    { value: "laptop", label: "Ordinateurs / Laptops" },
    { value: "electronics", label: "Électronique" },
    { value: "jewelry", label: "Bijoux" },
    { value: "perfume", label: "Parfums" },
    { value: "beauty", label: "Beauté & Soins" },
    { value: "sports", label: "Sport" },
    { value: "kids", label: "Enfants" },
    { value: "home", label: "Maison & Déco" },
    { value: "tag", label: "Autre (général)" },
];

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: "", icon: "tag" });
    const [editId, setEditId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [saving, setSaving] = useState(false);

    function reload() { categoryService.getAll().then(setCategories); }
    useEffect(reload, []);

    function startEdit(c) { setEditId(c.id); setForm({ name: c.name, icon: c.icon || "tag" }); }
    function cancelEdit() { setEditId(null); setForm({ name: "", icon: "tag" }); }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        if (editId) await categoryService.update(editId, { name: form.name.trim(), icon: form.icon });
        else await categoryService.create({ name: form.name.trim(), icon: form.icon });
        cancelEdit();
        reload();
        setSaving(false);
    }

    async function handleDelete(id) {
        await categoryService.delete(id);
        setConfirmId(null);
        reload();
    }

    function iconLabel(iconKey) {
        return ICONS.find(i => i.value === iconKey)?.label || iconKey;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Catégories</h1>
                    <p className="page-subtitle">{categories.length} catégorie{categories.length !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Formulaire */}
                <div className="card">
                    <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
                        {editId ? "Modifier la catégorie" : "Ajouter une catégorie"}
                    </h2>
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Nom *</label>
                            <input
                                className="form-input"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Ex. Téléphones"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Icône</label>
                            <select
                                className="form-input"
                                value={form.icon}
                                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                            >
                                {ICONS.map(i => (
                                    <option key={i.value} value={i.value}>{i.label}</option>
                                ))}
                            </select>
                            {/* Preview badge */}
                            <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                                Sélectionné : <strong style={{ color: "var(--accent)" }}>{iconLabel(form.icon)}</strong>
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Save size={14} /> {saving ? "…" : editId ? "Mettre à jour" : "Créer"}
                            </button>
                            {editId && (
                                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                                    <X size={14} /> Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Liste */}
                <div className="table-wrap" style={{ alignSelf: "start" }}>
                    <table className="table">
                        <thead><tr><th>Nom</th><th>Icône</th><th>Actions</th></tr></thead>
                        <tbody>
                            {categories.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>
                                        <span style={{
                                            fontSize: 11.5,
                                            background: "rgba(26,122,68,0.12)",
                                            color: "var(--accent)",
                                            borderRadius: 4,
                                            padding: "2px 8px",
                                            fontWeight: 600,
                                        }}>
                                            {iconLabel(c.icon)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="icon-btn" onClick={() => startEdit(c)} aria-label="Modifier"><Pencil size={13} /></button>
                                            {confirmId === c.id ? (
                                                <div className="confirm-row">
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Supprimer</button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Annuler</button>
                                                </div>
                                            ) : (
                                                <button className="icon-btn danger" onClick={() => setConfirmId(c.id)} aria-label="Supprimer"><Trash2 size={13} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
