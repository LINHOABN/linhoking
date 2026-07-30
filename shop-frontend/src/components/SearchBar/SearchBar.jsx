import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ value, onChange, placeholder = "Rechercher un produit…", className = "" }) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <Search size={17} strokeWidth={2} className={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="Rechercher un produit"
        className={styles.input}
      />
    </div>
  );
}
