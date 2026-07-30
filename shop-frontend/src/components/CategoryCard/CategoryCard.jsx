import { Link } from "react-router-dom";
import { getCategoryIcon } from "../../utils/categoryIcons.jsx";
import styles from "./CategoryCard.module.css";

export default function CategoryCard({ category }) {
  const Icon = getCategoryIcon(category.icon);
  return (
    <Link to={`/?categorie=${category.id}`} className={styles.card}>
      <span className={styles.iconWrap}>
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <span className={styles.name}>{category.name}</span>
    </Link>
  );
}
