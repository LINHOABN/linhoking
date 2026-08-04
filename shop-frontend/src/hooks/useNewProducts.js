import { useState, useEffect } from "react";

const SHOP_API = import.meta.env.VITE_API_URL || "https://linhoking-me6f.vercel.app/api";
const STORAGE_KEY = "lk_last_visit";

/**
 * Vérifie si de nouveaux produits ont été publiés depuis la dernière visite.
 * Retourne { hasNew, count, products, dismiss }
 */
export function useNewProducts() {
    const [info, setInfo] = useState({ hasNew: false, count: 0, products: [] });
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const lastVisit = localStorage.getItem(STORAGE_KEY);
        // Enregistre l'heure de cette visite
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());

        if (!lastVisit) return; // Première visite : ne pas afficher le toast

        const url = `${SHOP_API}/notifications/shop/?since=${encodeURIComponent(lastVisit)}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                if (data.count > 0) {
                    setInfo({ hasNew: true, count: data.count, products: data.products });
                }
            })
            .catch(() => { });
    }, []);

    function dismiss() {
        setDismissed(true);
    }

    return { ...info, show: info.hasNew && !dismissed, dismiss };
}
