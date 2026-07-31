import { useEffect, useState } from "react";
import { ArrowLeft, Send, Trash2, MessageSquare, ExternalLink, Package, PhoneCall, Tag } from "lucide-react";
import { chatService } from "../services/data.js";

import { SHOP_BASE_URL } from "../config.js";

function fmt(v) { return v ? `${new Intl.NumberFormat("fr-FR").format(v)} FCFA` : ""; }

export default function Messages() {
    const [conversations, setConversations] = useState([]);
    const [active, setActive] = useState(null);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);

    function reload() { chatService.getAll().then(setConversations); }
    useEffect(reload, []);

    function openConv(cv) {
        chatService.markRead(cv.id);
        setActive(cv.id);
        setReply("");
        reload();
    }

    const activeConv = conversations.find(c => c.id === active);

    async function handleSend(e) {
        e.preventDefault();
        if (!reply.trim() || !active) return;
        setSending(true);
        const updated = await chatService.reply(active, reply.trim());
        setReply("");
        setConversations(prev => prev.map(c => c.id === active ? updated : c));
        setSending(false);
    }

    async function handleDelete(id) {
        await chatService.delete(id);
        if (active === id) setActive(null);
        reload();
    }

    const unreadCount = conversations.filter(c => c.unread).length;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Messages</h1>
                    <p className="page-subtitle">
                        {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                        {unreadCount > 0 ? ` · ${unreadCount} non-lu${unreadCount !== 1 ? "s" : ""}` : ""}
                    </p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, minHeight: 480 }}>
                {/* Liste des conversations */}
                <div className="msg-list">
                    {conversations.length === 0 ? (
                        <div className="empty-state"><MessageSquare size={32} /><p>Aucun message</p></div>
                    ) : (
                        conversations.map(cv => (
                            <div
                                key={cv.id}
                                className={`msg-card${cv.unread ? " unread" : ""}${active === cv.id ? " active" : ""}`}
                                onClick={() => openConv(cv)}
                                style={active === cv.id ? { borderColor: "var(--primary)" } : {}}
                            >
                                <div className="msg-header">
                                    <span className="msg-from">{cv.visitorName}</span>
                                    {cv.unread && <span className="badge badge-orange">Nouveau</span>}
                                </div>
                                {cv.email && (
                                    <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                        <PhoneCall size={11} /> {cv.email}
                                    </div>
                                )}
                                {cv.produitNom && (
                                    <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                                        <Package size={11} /> {cv.produitNom} {cv.produitCategorie ? `(${cv.produitCategorie})` : ""}
                                    </div>
                                )}
                                <p className="msg-preview">{cv.lastMessage}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Thread */}
                {activeConv ? (
                    <div className="msg-thread">
                        <div className="msg-thread-header">
                            <button className="icon-btn" onClick={() => setActive(null)}><ArrowLeft size={15} /></button>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{activeConv.visitorName}</div>
                                {activeConv.email && (
                                    <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                                        <PhoneCall size={13} /> WhatsApp / Contact : <span>{activeConv.email}</span>
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{activeConv.messages.length} message{activeConv.messages.length !== 1 ? "s" : ""}</div>
                            </div>
                            <button className="icon-btn danger" style={{ marginLeft: "auto" }} onClick={() => handleDelete(activeConv.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {/* Banner du produit concerné avec Nom, Catégorie, Prix et Description */}
                        {activeConv.produitNom && (
                            <div style={{
                                padding: "10px 14px",
                                background: "rgba(79, 70, 229, 0.08)",
                                border: "1px solid rgba(79, 70, 229, 0.2)",
                                borderRadius: "8px",
                                margin: "10px 0 14px 0",
                                fontSize: 13
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                                        <Package size={17} color="var(--primary)" />
                                        <span>{activeConv.produitNom}</span>
                                        {activeConv.produitCategorie && (
                                            <span style={{ fontSize: 11, background: "var(--primary)", color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                                <Tag size={10} /> {activeConv.produitCategorie}
                                            </span>
                                        )}
                                        {activeConv.produitPrix && (
                                            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>
                                                · {fmt(activeConv.produitPrix)}
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={activeConv.produitId ? `${SHOP_BASE_URL}/produits/${activeConv.produitId}` : `${SHOP_BASE_URL}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: 12,
                                            color: "var(--primary)",
                                            fontWeight: 600,
                                            textDecoration: "none"
                                        }}
                                    >
                                        Voir la fiche <ExternalLink size={13} />
                                    </a>
                                </div>

                                {activeConv.produitDescription && (
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "pre-wrap", borderTop: "1px dashed rgba(79, 70, 229, 0.2)", paddingTop: 6, marginTop: 4 }}>
                                        <strong>Description :</strong> {activeConv.produitDescription}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 200, marginBottom: 12 }}>
                            {activeConv.messages.map(m => (
                                <div key={m.id} className={`bubble ${m.sender}`}>
                                    <div className="bubble-text">{m.text}</div>
                                    <div className="bubble-time">{m.time} · {m.sender === "admin" ? "Vous" : activeConv.visitorName}</div>
                                </div>
                            ))}
                        </div>

                        <form className="reply-box" onSubmit={handleSend}>
                            <input
                                className="reply-input"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                placeholder="Votre réponse…"
                                disabled={sending}
                            />
                            <button type="submit" className="btn btn-primary" disabled={sending || !reply.trim()}>
                                <Send size={14} /> {sending ? "…" : "Envoyer"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="empty-state" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                        <MessageSquare size={32} />
                        <p>Sélectionnez une conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
