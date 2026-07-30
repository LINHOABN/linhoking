import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import styles from "./InputMessage.module.css";

export default function InputMessage({ onSend, disabled, placeholder = "Écrivez un message…" }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        disabled={disabled}
        aria-label="Écrire un message"
      />
      <button type="submit" className={styles.send} disabled={disabled || !value.trim()} aria-label="Envoyer">
        <SendHorizontal size={17} strokeWidth={2} />
      </button>
    </form>
  );
}
