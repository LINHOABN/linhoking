import { useNewProducts } from "../../hooks/useNewProducts.js";
import styles from "./NewProductToast.module.css";
import { Sparkles, X, ArrowRight } from "lucide-react";

export default function NewProductToast() {
    const { show, count, dismiss } = useNewProducts();

    if (!show) return null;

    return (
        <div className={styles.toast} role="alert" aria-live="polite">
            <div className={styles.iconWrap}>
                <Sparkles size={20} />
            </div>
            <div className={styles.content}>
                <p className={styles.title}>
                    {count === 1
                        ? "🎉 Un nouveau produit vient d'arriver !"
                        : `🎉 ${count} nouveaux produits disponibles !`}
                </p>
                <p className={styles.subtitle}>Découvrez les dernières nouveautés dans la boutique.</p>
                <a href="/" className={styles.link}>
                    Voir les nouveautés <ArrowRight size={13} />
                </a>
            </div>
            <button
                className={styles.close}
                onClick={dismiss}
                aria-label="Fermer la notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}
