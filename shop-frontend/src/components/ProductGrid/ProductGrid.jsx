import ProductCard from "../ProductCard/ProductCard";
import EmptyState from "../EmptyState/EmptyState";
import Loading from "../Loading/Loading";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products, loading }) {
  if (loading) return <Loading label="Chargement des produits…" />;
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Aucun produit trouvé"
        message="Essayez une autre recherche ou une autre catégorie."
      />
    );
  }
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
