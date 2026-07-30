import { apiRequest, mockDelay, USE_MOCKS } from "./api";
import { products as mockProducts } from "./mockData";

let store = [...mockProducts];
let nextId = store.length + 1;

export function normalizeProduct(p) {
  if (!p) return null;
  const mainImg = p.image_principale || (p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].image) : null);
  const imgList = p.images && p.images.length > 0
    ? p.images.map(img => typeof img === 'string' ? img : img.image)
    : (mainImg ? [mainImg] : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"]);

  return {
    ...p,
    id: p.id,
    slug: p.slug,
    name: p.nom || p.name || "",
    price: p.prix !== undefined ? Number(p.prix) : (p.price || 0),
    category: p.categorie ? (typeof p.categorie === 'object' ? p.categorie.slug : p.categorie) : (p.category || ""),
    categoryName: p.categorie ? (typeof p.categorie === 'object' ? p.categorie.nom : p.categorie) : "",
    stock: p.est_publie !== undefined ? p.est_publie : (p.stock ?? true),
    images: imgList,
    image_principale: mainImg,
  };
}

// GET /products/
export async function getProducts({ search = "", category = "" } = {}) {
  if (USE_MOCKS) {
    let results = [...store];
    if (search) {
      const q = search.trim().toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category) {
      results = results.filter((p) => p.category === category);
    }
    return mockDelay(results.map(normalizeProduct));
  }
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (category) queryParams.append("categorie__slug", category);
  const path = queryParams.toString() ? `/products/?${queryParams.toString()}` : "/products/";
  const res = await apiRequest(path);
  const items = Array.isArray(res) ? res : (res.results || []);
  return items.map(normalizeProduct);
}

// GET /products/:id/
export async function getProductById(id) {
  if (USE_MOCKS) {
    const product = store.find((p) => p.id === id);
    return mockDelay(normalizeProduct(product));
  }
  const res = await apiRequest(`/products/${id}/`);
  return normalizeProduct(res);
}

// POST /products/
export async function createProduct(data) {
  if (USE_MOCKS) {
    const product = { id: `p${nextId++}`, stock: true, images: [], ...data };
    store = [product, ...store];
    return mockDelay(normalizeProduct(product));
  }
  const payload = {
    nom: data.name || data.nom,
    description: data.description || "",
    prix: data.price || data.prix,
    categorie_id: data.categoryId || data.categorie_id || 1,
    est_publie: data.stock !== undefined ? data.stock : true,
  };
  const res = await apiRequest("/products/", { method: "POST", body: payload });
  return normalizeProduct(res);
}

// PUT /products/:id/
export async function updateProduct(id, data) {
  if (USE_MOCKS) {
    store = store.map((p) => (p.id === id ? { ...p, ...data } : p));
    return mockDelay(normalizeProduct(store.find((p) => p.id === id)));
  }
  const payload = {};
  if (data.name !== undefined || data.nom !== undefined) payload.nom = data.name || data.nom;
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined || data.prix !== undefined) payload.prix = data.price || data.prix;
  if (data.stock !== undefined || data.est_publie !== undefined) payload.est_publie = data.stock !== undefined ? data.stock : data.est_publie;
  const res = await apiRequest(`/products/${id}/`, { method: "PATCH", body: payload });
  return normalizeProduct(res);
}

// DELETE /products/:id/
export async function deleteProduct(id) {
  if (USE_MOCKS) {
    store = store.filter((p) => p.id !== id);
    return mockDelay({ success: true });
  }
  return apiRequest(`/products/${id}/`, { method: "DELETE" });
}
