import { PackageSearch } from "lucide-react";
import styles from "./EmptyState.module.css";

export default function EmptyState({ title, message, icon: Icon = PackageSearch, action }) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.iconWrap}>
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  );
}
