import { apiRequest } from "./api.js";

// ─── Fallback Mock Data ────────────────────────────────────────────────────────
export let mockCategories = [];
export let mockProducts = [];
export let mockConversations = [];


// Helper to normalize Django Category to Admin UI
export function normalizeCategory(c) {
    if (!c) return null;
    const catPk = c.pk || c.id;
    return {
        ...c,
        id: catPk,
        pk: catPk,
        name: c.nom || c.name || "",
        slug: c.slug || String(catPk),
        icon: c.icone || c.icon || "tag",
    };
}

// Helper to normalize Django Product to Admin UI
export function normalizeProduct(p) {
    if (!p) return null;
    const mainImg = p.image_principale || null;
    const extraImgs = (p.images && p.images.length > 0)
        ? p.images.map(img => typeof img === 'string' ? img : (img ? img.image : "")).filter(Boolean)
        : [];

    let imgList = [];
    if (mainImg) {
        imgList = [mainImg, ...extraImgs.filter(i => i !== mainImg)];
    } else if (extraImgs.length > 0) {
        imgList = extraImgs;
    } else {
        imgList = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
    }

    return {
        ...p,
        id: p.id,
        slug: p.slug,
        name: p.nom || p.name || "",
        price: p.prix !== undefined ? Number(p.prix) : (p.price || 0),
        category: p.categorie ? (typeof p.categorie === 'object' ? (p.categorie.id || p.categorie.slug) : p.categorie) : (p.category || 1),
        stock: p.est_publie !== undefined ? p.est_publie : (p.stock ?? true),
        images: imgList,
        image_principale: imgList[0],
    };
}


// Helper to normalize Django Conversation/Messages to Admin UI
export function normalizeConversation(c) {
    if (!c) return null;
    const msgs = (c.messages || []).map(m => ({
        id: m.id,
        sender: (m.expediteur === "ADMIN" || m.sender === "admin") ? "admin" : "visitor",
        text: m.message || m.text || "",
        time: m.date_envoi ? new Date(m.date_envoi).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : (m.time || ""),
    }));
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : (c.lastMessage || "");
    const unread = msgs.some(m => m.sender === "visitor" && !m.lu);

    return {
        id: c.id,
        visitorName: c.nom_visiteur || c.visitorName || "Visiteur",
        email: c.email || "",
        produitNom: c.produit_nom || c.produitNom || null,
        produitCategorie: c.produit_categorie || c.produitCategorie || null,
        produitPrix: c.produit_prix || c.produitPrix || null,
        produitDescription: c.produit_description || c.produitDescription || null,
        produitId: c.produit_pk || c.produit_id || c.produitId || null,
        lastMessage: lastMsg,
        unread: unread,
        messages: msgs,
    };
}




async function getCategoryId(catInput) {
    if (!catInput) return 1;
    if (typeof catInput === 'number' || (typeof catInput === 'string' && /^\d+$/.test(catInput))) {
        return Number(catInput);
    }
    try {
        const cats = await categoryService.getAll();
        const found = cats.find(c => String(c.slug) === String(catInput) || String(c.name) === String(catInput) || String(c.id) === String(catInput) || String(c.pk) === String(catInput));
        if (found) return found.pk || found.id;
        return cats[0]?.pk || cats[0]?.id || 1;
    } catch (_) {
        return 1;
    }
}

// ─── Real + Fallback Services ─────────────────────────────────────────────────
export const productService = {
    getAll: async () => {
        try {
            const res = await apiRequest("/products/");
            const items = Array.isArray(res) ? res : (res.results || []);
            return items.map(normalizeProduct);
        } catch (_) {
            return mockProducts.map(normalizeProduct);
        }
    },
    getById: async (id) => {
        try {
            const res = await apiRequest(`/products/${id}/`);
            return normalizeProduct(res);
        } catch (_) {
            return normalizeProduct(mockProducts.find(p => p.id === Number(id) || p.slug === id));
        }
    },
    getStats: async () => {
        try {
            const res = await apiRequest("/products/stats/");
            return res;
        } catch (_) {
            return { total_products: 0, total_views: 0, top_visited: [] };
        }
    },
    create: async (data) => {
        const catId = await getCategoryId(data.categoryId || data.category);
        const payload = {
            nom: data.name || data.nom,
            description: data.description || "",
            prix: data.price || data.prix,
            categorie_id: catId,
            est_publie: data.stock !== undefined ? data.stock : true,
            image_principale: data.image_principale || (data.images?.[0] || ""),
            uploaded_images_data: data.uploaded_images_data || [],
        };
        const res = await apiRequest("/products/", { method: "POST", body: payload });
        return normalizeProduct(res);
    },
    update: async (id, data) => {
        const catId = data.category ? await getCategoryId(data.category) : undefined;
        const payload = {};
        if (data.name !== undefined) payload.nom = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.price !== undefined) payload.prix = data.price;
        if (catId !== undefined) payload.categorie_id = catId;
        if (data.stock !== undefined) payload.est_publie = data.stock;
        if (data.image_principale !== undefined) payload.image_principale = data.image_principale;
        if (data.uploaded_images_data !== undefined) payload.uploaded_images_data = data.uploaded_images_data;

        const res = await apiRequest(`/products/${id}/`, { method: "PATCH", body: payload });
        return normalizeProduct(res);
    },
    delete: async (id) => {
        await apiRequest(`/products/${id}/`, { method: "DELETE" });
        return true;
    },
};

export const categoryService = {
    getAll: async () => {
        try {
            const res = await apiRequest("/categories/");
            const items = Array.isArray(res) ? res : (res.results || []);
            return items.map(normalizeCategory);
        } catch (_) {
            return mockCategories.map(normalizeCategory);
        }
    },
    create: async (data) => {
        const payload = { nom: data.name || data.nom, icone: data.icon || data.icone || "tag" };
        const res = await apiRequest("/categories/", { method: "POST", body: payload });
        return normalizeCategory(res);
    },
    update: async (id, data) => {
        const payload = { nom: data.name || data.nom };
        if (data.icon !== undefined || data.icone !== undefined) payload.icone = data.icon || data.icone;
        const res = await apiRequest(`/categories/${id}/`, { method: "PATCH", body: payload });
        return normalizeCategory(res);
    },
    delete: async (id) => {
        await apiRequest(`/categories/${id}/`, { method: "DELETE" });
        return true;
    },
};

export const chatService = {
    getAll: async () => {
        try {
            const res = await apiRequest("/chat/conversations/");
            const items = Array.isArray(res) ? res : (res.results || []);
            return items.map(normalizeConversation);
        } catch (_) {
            return mockConversations.map(normalizeConversation);
        }
    },
    reply: async (conversationId, text) => {
        await apiRequest("/chat/messages/", {
            method: "POST",
            body: { conversation: conversationId, message: text },
        });
        const res = await apiRequest(`/chat/conversations/${conversationId}/`);
        return normalizeConversation(res);
    },
    markRead: async (id) => {
        try {
            await apiRequest(`/chat/messages/?conversation=${id}`);
        } catch (_) { }
    },
    delete: async (id) => {
        await apiRequest(`/chat/conversations/${id}/`, { method: "DELETE" });
        return true;
    },
};
