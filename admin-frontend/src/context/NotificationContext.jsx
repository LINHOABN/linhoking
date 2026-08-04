import { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiRequest } from "../services/api.js";

const NotificationContext = createContext({
    unreadMessages: 0,
    newProducts: 0,
    clearMessages: () => { },
    clearProducts: () => { },
});

export function NotificationProvider({ children }) {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [newProducts, setNewProducts] = useState(0);
    const intervalRef = useRef(null);

    async function fetchNotifications() {
        try {
            const data = await apiRequest("/notifications/");
            setUnreadMessages(data.unread_messages ?? 0);
            setNewProducts(data.new_products ?? 0);
        } catch {
            // silently ignore (ex: non connecté)
        }
    }

    useEffect(() => {
        // Lancement immédiat puis toutes les 30s
        fetchNotifications();
        intervalRef.current = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(intervalRef.current);
    }, []);

    function clearMessages() {
        setUnreadMessages(0);
    }

    function clearProducts() {
        setNewProducts(0);
    }

    return (
        <NotificationContext.Provider value={{ unreadMessages, newProducts, clearMessages, clearProducts }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
