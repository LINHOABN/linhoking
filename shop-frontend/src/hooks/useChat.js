import { useState, useCallback, useEffect } from "react";
import * as chatService from "../services/chatService";

const VISITOR_NAME_KEY = "visitor_name";
const VISITOR_CONTACT_KEY = "visitor_contact";

export function getVisitorProfile() {
  const name = localStorage.getItem(VISITOR_NAME_KEY);
  const contact = localStorage.getItem(VISITOR_CONTACT_KEY);
  if (!name || name.trim() === "" || name.trim() === "Visiteur") return null;
  return { name: name.trim(), contact: contact ? contact.trim() : "" };
}


export function saveVisitorProfile(name, contact = "") {
  if (name && name.trim()) {
    localStorage.setItem(VISITOR_NAME_KEY, name.trim());
    if (contact && contact.trim()) {
      localStorage.setItem(VISITOR_CONTACT_KEY, contact.trim());
    }
  }
}

function getConvoStorageKey(productId) {
  return `chat_conv_${productId || "general"}`;
}

function getSavedConvoId(productId) {
  return localStorage.getItem(getConvoStorageKey(productId));
}

function saveConvoId(productId, id) {
  localStorage.setItem(getConvoStorageKey(productId), String(id));
}

function clearSavedConvoId(productId) {
  localStorage.removeItem(getConvoStorageKey(productId));
}

function normalizeMessages(messages = []) {
  return messages.map((m) => ({
    id: m.id,
    sender: m.expediteur === "ADMIN" ? "admin" : "visitor",
    text: m.message || m.text || "",
    time: m.date_envoi
      ? new Date(m.date_envoi).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : m.time || "",
  }));
}

// Gère une conversation unique côté visiteur : chargement + envoi de message + identification.
export function useChat(productId) {
  const [visitorProfile, setVisitorProfile] = useState(() => getVisitorProfile());
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (profileToUse, forceNew = false) => {
      if (!productId) return;
      const currentProfile = profileToUse || visitorProfile;
      if (!currentProfile || !currentProfile.name) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const displayName = currentProfile.contact
          ? `${currentProfile.name} (${currentProfile.contact})`
          : currentProfile.name;

        if (forceNew) {
          clearSavedConvoId(productId);
        }

        const savedId = getSavedConvoId(productId);

        let convo;
        if (savedId && !forceNew) {
          try {
            convo = await chatService.getConversation(savedId);
          } catch (_) {
            convo = null;
          }
        }

        if (!convo) {
          convo = await chatService.getOrCreateVisitorConversation(
            productId,
            displayName,
            currentProfile.contact
          );
          if (convo?.id) saveConvoId(productId, convo.id);
        }

        const normalized = {
          ...convo,
          id: convo.id,
          visitorName: convo.nom_visiteur || convo.visitorName || displayName,
          email: convo.email || currentProfile.contact,
          produitNom: convo.produit_nom || null,
          messages: normalizeMessages(convo.messages || []),
        };
        setConversation(normalized);
        if (convo?.id) {
          import("../utils/push.js").then((m) => m.registerClientPushSubscription(convo.id));
        }
      } catch (err) {
        setError(err.message || "Impossible d'ouvrir la conversation.");
      } finally {
        setLoading(false);
      }
    },
    [productId, visitorProfile]
  );

  useEffect(() => {
    load();
  }, [load]);

  const registerVisitor = useCallback(
    (name, contact) => {
      saveVisitorProfile(name, contact);
      const newProfile = { name: name.trim(), contact: (contact || "").trim() };
      setVisitorProfile(newProfile);
      load(newProfile, true); // Force creating fresh conversation with registered profile
    },
    [load]
  );

  const send = useCallback(
    async (text) => {
      if (!text.trim() || !conversation) return;
      setSending(true);
      setError(null);
      try {
        await chatService.sendMessage(conversation.id, text, "visitor");
        const newMsg = {
          id: Date.now(),
          sender: "visitor",
          text,
          time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };
        setConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, newMsg],
        }));
      } catch (err) {
        setError(err.message || "Votre message n'a pas pu être envoyé.");
      } finally {
        setSending(false);
      }
    },
    [conversation]
  );

  return { visitorProfile, registerVisitor, conversation, loading, sending, error, send };
}
