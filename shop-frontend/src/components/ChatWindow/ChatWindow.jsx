import { useEffect, useRef, useState } from "react";
import { X, Circle, UserCheck } from "lucide-react";
import MessageBubble from "../MessageBubble/MessageBubble";
import InputMessage from "../InputMessage/InputMessage";
import Loading from "../Loading/Loading";
import styles from "./ChatWindow.module.css";

export default function ChatWindow({
  visitorProfile,
  onRegisterVisitor,
  conversation,
  loading,
  sending,
  error,
  onSend,
  onClose,
  sellerName = "Le vendeur",
}) {
  const scrollRef = useRef(null);
  const [nameInput, setNameInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages?.length]);

  function handleRegister(e) {
    e.preventDefault();
    if (!nameInput.trim()) {
      setRegisterError("Veuillez saisir votre nom.");
      return;
    }
    setRegisterError("");
    onRegisterVisitor(nameInput.trim(), contactInput.trim());
  }

  return (
    <div className={styles.window} role="dialog" aria-label="Fenêtre de discussion">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.avatar}>{sellerName.charAt(0)}</span>
          <div>
            <p className={styles.name}>{sellerName}</p>
            <p className={styles.status}>
              <Circle size={7} className={styles.dot} /> En ligne
            </p>
          </div>
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Fermer le chat">
          <X size={18} />
        </button>
      </header>

      {!visitorProfile ? (
        <form className={styles.body} onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <UserCheck size={32} color="var(--color-primary, #4f46e5)" style={{ marginBottom: 4 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Qui êtes-vous ?</h3>
            <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              Dites-nous qui vous êtes pour démarrer la discussion avec notre équipe.
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>
              Votre Nom & Prénom <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Jean Dupont"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>
              Téléphone / WhatsApp ou Email <span style={{ fontSize: 11, color: "#888" }}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder="Ex: 699112233"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {registerError && (
            <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>⚠ {registerError}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "10px 16px",
              backgroundColor: "var(--color-primary, #4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Démarrer la discussion
          </button>
        </form>
      ) : (
        <>
          <div className={styles.body} ref={scrollRef}>
            {loading ? (
              <Loading label="Chargement de la conversation…" />
            ) : conversation?.messages?.length ? (
              conversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} isOwn={message.sender === "visitor"} />
              ))
            ) : (
              <p className={styles.hint}>
                Bonjour {visitorProfile.name} ! Écrivez votre première question, {sellerName.toLowerCase()} vous répondra rapidement.
              </p>
            )}
            {error && (
              <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", padding: "4px 8px" }}>
                ⚠ {error}
              </p>
            )}
          </div>

          <InputMessage onSend={onSend} disabled={loading || sending} />
        </>
      )}
    </div>
  );
}
