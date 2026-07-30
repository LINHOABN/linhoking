import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, ChevronRight, Check, Share2, Copy, Send } from "lucide-react";
import { getProductById } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { useChatWidget } from "../../hooks/useChatWidget";
import { formatPrice } from "../../utils/formatPrice";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import Button from "../../components/Button/Button";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { openChat } = useChatWidget();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    Promise.all([getProductById(id), getCategories()]).then(([productData, categoryData]) => {
      setProduct(productData);
      setCategories(categoryData);
      setLoading(false);
    });
  }, [id]);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleShareWhatsApp() {
    const text = `Découvrez ${product?.name || "ce produit"} à ${formatPrice(product?.price)} sur la boutique :\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (loading) return <Loading label="Chargement du produit…" />;

  if (!product) {
    return (
      <div className="container" style={{ padding: "64px 0" }}>
        <EmptyState
          title="Produit introuvable"
          message="Ce produit n'existe plus ou a été retiré."
          action={
            <Link to="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;

  return (
    <div className={`container ${styles.wrapper}`}>
      <nav className={styles.breadcrumb} aria-label="Fil d'ariane">
        <Link to="/">Accueil</Link>
        <ChevronRight size={14} />
        <Link to={`/?categorie=${product.category}`}>{categoryName}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <div className={styles.grid}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, index) => (
                <button
                  key={img}
                  className={`${styles.thumb} ${index === activeImage ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>

          <p className={styles.categoryLine}>
            Catégorie : <Link to={`/?categorie=${product.category}`}>{categoryName}</Link>
          </p>

          <span className={`${styles.stockBadge} ${product.stock ? styles.inStock : styles.outStock}`}>
            {product.stock && <Check size={13} />}
            {product.stock ? "En stock" : "Épuisé"}
          </span>

          <div className={styles.block}>
            <h2 className={styles.blockTitle}>Description</h2>
            <p className={styles.description}>{product.description}</p>
          </div>

          <Button
            size="lg"
            fullWidth
            icon={MessageCircle}
            onClick={() => openChat(product.id)}
          >
            Discuter avec le vendeur
          </Button>

          {/* Section Partager le produit */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border, #e5e7eb)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted, #6b7280)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <Share2 size={14} /> Partager ce produit :
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: copied ? "#ecfdf5" : "#fff",
                  color: copied ? "#059669" : "#374151",
                  borderColor: copied ? "#10b981" : "#d1d5db",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Lien copié !" : "Copier le lien"}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "none",
                  background: "#25D366",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Send size={14} /> Partager sur WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
