import { createContext, useContext, useState, useCallback } from "react";

const ChatWidgetContext = createContext(null);

export function ChatWidgetProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("general");

  const openChat = useCallback((pid = "general") => {
    setProductId(pid);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => setOpen(false), []);
  const toggleChat = useCallback(() => setOpen((v) => !v), []);

  return (
    <ChatWidgetContext.Provider value={{ open, productId, openChat, closeChat, toggleChat }}>
      {children}
    </ChatWidgetContext.Provider>
  );
}

export function useChatWidget() {
  const ctx = useContext(ChatWidgetContext);
  if (!ctx) throw new Error("useChatWidget doit être utilisé dans un ChatWidgetProvider");
  return ctx;
}
