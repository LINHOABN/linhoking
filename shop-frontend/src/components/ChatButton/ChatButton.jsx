import { MessageCircle, X } from "lucide-react";
import styles from "./ChatButton.module.css";

export default function ChatButton({ open, onClick, hasUnread }) {
  return (
    <button className={styles.button} onClick={onClick} aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}>
      {open ? <X size={22} /> : <MessageCircle size={22} />}
      {!open && hasUnread && <span className={styles.dot} />}
    </button>
  );
}
