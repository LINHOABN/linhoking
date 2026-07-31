import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X, Plus } from "lucide-react";
import { productService, categoryService } from "../services/data.js";

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export default function AddProduct() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const editId = params.get("id");

    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: "", price: "", category: "", description: "", imageUrl: "", stock: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [extraFiles, setExtraFiles] = useState([]);
    const [extraPreviews, setExtraPreviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        categoryService.getAll().then(setCategories);
        if (editId) {
            productService.getById(editId).then(p => {
                if (p) {
                    setForm({
                        name: p.name,
                        price: String(p.price),
                        category: p.category || (categories[0]?.id || ""),
                        description: p.description || "",
                        imageUrl: p.images?.[0] || "",
                        stock: p.stock,
                    });
                    if (p.images?.[0]) setPreviewUrl(p.images[0]);
                    if (p.images && p.images.length > 1) {
                        setExtraPreviews(p.images.slice(1));
                    }
                }
            });
        }
    }, [editId]);

    function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

    function handleMainFileChange(e) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    function handleExtraFilesChange(e) {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setExtraFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(f => URL.createObjectURL(f));
            setExtraPreviews(prev => [...prev, ...newPreviews]);
        }
    }

    function handleRemoveMainImage() {
        setImageFile(null);
        setPreviewUrl("");
        set("imageUrl", "");
    }

    function handleRemoveExtraImage(index) {
        setExtraFiles(prev => prev.filter((_, i) => i !== index));
        setExtraPreviews(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!form.name.trim() || !form.price || !form.category) {
            setError("Nom, prix et catégorie sont obligatoires."); return;
        }
        setSaving(true);
        try {
            let mainImageBase64 = form.imageUrl || "";
            if (imageFile) {
                mainImageBase64 = await fileToBase64(imageFile);
            }

            let extraImagesBase64 = [];
            if (extraFiles && extraFiles.length > 0) {
                extraImagesBase64 = await Promise.all(extraFiles.map(fileToBase64));
            }

            const data = {
                name: form.name.trim(),
                price: Number(form.price),
                category: form.category,
                description: form.description.trim(),
                image_principale: mainImageBase64,
                uploaded_images_data: extraImagesBase64,
                stock: form.stock,
            };

            if (editId) await productService.update(editId, data);
            else await productService.create(data);
            navigate("/produits");
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de l'enregistrement du produit.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{editId ? "Modifier le produit" : "Nouveau produit"}</h1>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate("/produits")}>
                    <ArrowLeft size={15} /> Retour
                </button>
            </div>

            <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Nom du produit *</label>
                        <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Chemise Blanche" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Prix (FCFA) *</label>
                        <input className="form-input" type="number" min="0" value={form.price} onChange={e => set("price", e.target.value)} placeholder="15000" required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Catégorie *</label>
                        <select className="form-input" value={form.category} onChange={e => set("category", e.target.value)} required>
                            <option value="">— Choisir une catégorie —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Disponibilité</label>
                        <select className="form-input" value={form.stock ? "1" : "0"} onChange={e => set("stock", e.target.value === "1")}>
                            <option value="1">En stock (Publié)</option>
                            <option value="0">Masqué / Épuisé</option>
                        </select>
                    </div>
                </div>

                {/* Section Photos Principale & Photos Supplémentaires */}
                <div className="form-group">
                    <label className="form-label">Photo principale du produit</label>
                    <div style={{
                        border: "2px dashed var(--border-color, #333)",
                        borderRadius: "8px",
                        padding: "16px",
                        textAlign: "center",
                        backgroundColor: "rgba(255,255,255,0.02)",
                        marginBottom: "10px"
                    }}>
                        {previewUrl ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={previewUrl}
                                    alt="Principale"
                                    style={{ maxHeight: "180px", borderRadius: "6px", objectFit: "cover" }}
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveMainImage}
                                    style={{
                                        position: "absolute",
                                        top: "-8px",
                                        right: "-8px",
                                        background: "var(--danger, #ef4444)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    title="Supprimer la photo principale"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label style={{ cursor: "pointer", display: "block" }}>
                                <Upload size={32} style={{ margin: "0 auto 8px auto", color: "var(--primary, #3b82f6)" }} />
                                <div style={{ fontWeight: 500, marginBottom: 4 }}>Choisir la photo principale</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted, #888)" }}>PNG, JPG, WEBP</div>
                                <input type="file" accept="image/*" onChange={handleMainFileChange} style={{ display: "none" }} />
                            </label>
                        )}
                    </div>

                    {/* Galerie de Photos Supplémentaires */}
                    <label className="form-label" style={{ marginTop: 14, display: "block" }}>
                        Photos supplémentaires (Galerie)
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 6 }}>
                        {extraPreviews.map((url, i) => (
                            <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
                                <img src={url} alt={`Vignette ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExtraImage(i)}
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        right: 2,
                                        background: "rgba(0,0,0,0.7)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: 18,
                                        height: 18,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ))}
                        <label style={{
                            width: 72,
                            height: 72,
                            border: "2px dashed var(--border)",
                            borderRadius: 6,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: 11,
                            color: "var(--primary)"
                        }}>
                            <Plus size={20} />
                            <span>Ajouter</span>
                            <input type="file" accept="image/*" multiple onChange={handleExtraFilesChange} style={{ display: "none" }} />
                        </label>
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Description du produit</label>
                    <textarea className="form-input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Description détaillée du produit…" rows={5} />
                </div>

                {error && <p style={{ color: "var(--danger, #ef4444)", fontSize: 13, marginBottom: 10 }}>{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={15} /> {saving ? "Enregistrement en cours…" : editId ? "Mettre à jour" : "Publier le produit"}
                </button>
            </form>
        </div>
    );
}
