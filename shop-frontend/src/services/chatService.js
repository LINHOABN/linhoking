import { apiRequest, mockDelay, USE_MOCKS } from "./api";
import { conversations as mockConversations } from "./mockData";

let store = mockConversations.map((c) => ({ ...c, messages: [...(c.messages || [])] }));

function currentTime() {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// GET /chat/conversations/
export async function getConversations() {
  if (USE_MOCKS) return mockDelay(store.map((c) => ({ ...c })));
  const res = await apiRequest("/chat/conversations/");
  return Array.isArray(res) ? res : (res.results || []);
}

// GET /chat/conversations/:id/
export async function getConversation(id) {
  if (USE_MOCKS) {
    const convo = store.find((c) => c.id === id);
    return mockDelay(convo ? { ...convo, messages: [...convo.messages] } : null);
  }
  return apiRequest(`/chat/conversations/${id}/`);
}

// Trouve ou crée la conversation liée à un produit pour le visiteur courant.
export async function getOrCreateVisitorConversation(productId, visitorName = "Visiteur", email = "") {
  if (USE_MOCKS) {
    let convo = store.find((c) => c.productId === productId && c.visitorName === visitorName);
    if (!convo) {
      convo = {
        id: `c${store.length + 1}`,
        visitorName,
        productId,
        lastMessage: "",
        unread: false,
        messages: [],
      };
      store = [...store, convo];
    }
    return mockDelay({ ...convo, messages: [...convo.messages] });
  }
  // Créer une nouvelle conversation sur le backend Django avec le produit lié
  const body = {
    nom_visiteur: visitorName || "Visiteur",
    email: email || "",
  };
  if (productId && productId !== "general") {
    body.produit_id = productId;
  }
  const res = await apiRequest("/chat/conversations/", {
    method: "POST",
    body,
  });
  return res;
}


// POST /chat/messages/ (lier le message à une conversation via le champ conversation)
export async function sendMessage(conversationId, text, sender = "visitor") {
  if (USE_MOCKS) {
    const message = { id: `m${Date.now()}`, sender, text, time: currentTime() };
    store = store.map((c) =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message], lastMessage: text, unread: sender === "visitor" }
        : c
    );
    return mockDelay(message);
  }
  const res = await apiRequest("/chat/messages/", {
    method: "POST",
    body: { conversation: conversationId, message: text },
  });
  return res;
}

export async function markAsRead(conversationId) {
  if (USE_MOCKS) {
    store = store.map((c) => (c.id === conversationId ? { ...c, unread: false } : c));
    return mockDelay({ success: true });
  }
  try {
    return await apiRequest(`/chat/messages/?conversation=${conversationId}`);
  } catch (_) { }
}
