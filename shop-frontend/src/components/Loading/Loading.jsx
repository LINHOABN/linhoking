import styles from "./Loading.module.css";

export default function Loading({ label = "Chargement…" }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
