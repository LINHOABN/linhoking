import { MessageCircle } from "lucide-react";
import { useChatWidget } from "../../hooks/useChatWidget";
import Button from "../../components/Button/Button";
import styles from "./StaticPage.module.css";

export default function Contact() {
  const { openChat } = useChatWidget();

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Contact</h1>
      <p className={styles.text}>
        La façon la plus rapide de nous joindre est le chat intégré au site : posez votre question, nous
        répondons directement.
      </p>
      <Button icon={MessageCircle} onClick={() => openChat("general")}>
        Ouvrir le chat
      </Button>
    </div>
  );
}
