import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loading from "../../components/Loading/Loading";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import styles from "./Home.module.css";

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("recherche") || "";
  const activeCategory = searchParams.get("categorie") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ search, category: activeCategory }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, activeCategory]);

  const showAll = searchParams.get("tous") === "1" || !!search || !!activeCategory;
  const displayedProducts = showAll ? products : products.slice(0, 8);


  return (
    <div className={styles.page}>
      {/* ─── Hero ─── */}
      <section className={styles.heroWrapper}>
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Découvrez nos<br />nouveaux produits
            </h1>
            <p className={styles.heroSubtitle}>
              Qualité, style et confort<br />au meilleur prix.
            </p>
            <a href="#produits" className={styles.heroBtn}>
              Voir les produits
            </a>
          </div>
          <div className={styles.heroImageWrap}>
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"
              alt="Découvrez nos nouveaux produits"
              className={styles.heroImg}
            />
          </div>
        </div>
      </section>

      {/* ─── Catégories ─── */}
      <section className={`container ${styles.section}`} id="categories">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Catégories</h2>
          <Link to="/?section=categories" className={styles.seeAll}>
            Voir toutes <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* ─── Tous les produits ─── */}
      <section className={`container ${styles.section}`} id="produits">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tous les produits</h2>
          <Link to="/?tous=1" className={styles.seeAll}>
            Voir tous <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className={styles.productGrid}>
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination dots under product grid matching mockup */}
            <div className={styles.paginationDots}>
              <span className={`${styles.dot} ${styles.activeDot}`} />
              <span className={styles.dot} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
