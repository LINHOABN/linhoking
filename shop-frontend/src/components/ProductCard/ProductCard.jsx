import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatPrice";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const imageUrl = product.image_principale || product.images?.[0] || "";


  return (
    <article className={styles.card}>
      <Link to={`/produits/${product.id}`} className={styles.imageLink}>
        <img src={imageUrl} alt={product.name} className={styles.image} loading="lazy" />
        {!product.stock && <span className={styles.badge}>Épuisé</span>}
      </Link>
      <div className={styles.footer}>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
        <Link to={`/produits/${product.id}`} className={styles.viewButton}>
          Voir
        </Link>
      </div>
    </article>
  );
}
