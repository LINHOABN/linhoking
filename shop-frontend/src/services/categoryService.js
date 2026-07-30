import { apiRequest, mockDelay, USE_MOCKS } from "./api";
import { categories as mockCategories } from "./mockData";

let store = [...mockCategories];

export function normalizeCategory(c) {
  if (!c) return null;
  return {
    ...c,
    id: c.slug || c.id,
    pk: c.id,
    name: c.nom || c.name || "",
    nom: c.nom || c.name || "",
    slug: c.slug || c.id,
    icon: c.icone || c.icon || "tag",
  };
}

// GET /categories/
export async function getCategories() {
  if (USE_MOCKS) return mockDelay([...store].map(normalizeCategory));
  const res = await apiRequest("/categories/");
  const items = Array.isArray(res) ? res : (res.results || []);
  return items.map(normalizeCategory);
}

// POST /categories/
export async function createCategory(data) {
  if (USE_MOCKS) {
    const category = { id: data.name.toLowerCase().replace(/\s+/g, "-"), icon: "tag", ...data };
    store = [...store, category];
    return mockDelay(normalizeCategory(category));
  }
  const payload = { nom: data.name || data.nom, icone: data.icon || data.icone || "tag" };
  const res = await apiRequest("/categories/", { method: "POST", body: payload });
  return normalizeCategory(res);
}

// PUT /categories/:id/
export async function updateCategory(id, data) {
  if (USE_MOCKS) {
    store = store.map((c) => (c.id === id ? { ...c, ...data } : c));
    return mockDelay(normalizeCategory(store.find((c) => c.id === id)));
  }
  const payload = { nom: data.name || data.nom, icone: data.icon || data.icone || "tag" };
  const res = await apiRequest(`/categories/${id}/`, { method: "PUT", body: payload });
  return normalizeCategory(res);
}

// DELETE /categories/:id/
export async function deleteCategory(id) {
  if (USE_MOCKS) {
    store = store.filter((c) => c.id !== id);
    return mockDelay({ success: true });
  }
  return apiRequest(`/categories/${id}/`, { method: "DELETE" });
}
