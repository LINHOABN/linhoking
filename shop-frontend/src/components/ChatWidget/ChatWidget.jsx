import { useChatWidget } from "../../hooks/useChatWidget";
import { useChat } from "../../hooks/useChat";
import ChatButton from "../ChatButton/ChatButton";
import ChatWindow from "../ChatWindow/ChatWindow";
import styles from "./ChatWidget.module.css";

export default function ChatWidget() {
  const { open, productId, toggleChat, closeChat } = useChatWidget();
  const { visitorProfile, registerVisitor, conversation, loading, sending, error, send } = useChat(
    open ? productId : null
  );

  return (
    <div className={styles.wrapper}>
      {open && (
        <ChatWindow
          visitorProfile={visitorProfile}
          onRegisterVisitor={registerVisitor}
          conversation={conversation}
          loading={loading}
          sending={sending}
          error={error}
          onSend={send}
          onClose={closeChat}
        />
      )}
      <ChatButton open={open} onClick={toggleChat} />
    </div>
  );
}
