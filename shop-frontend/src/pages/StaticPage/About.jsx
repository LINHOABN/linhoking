import styles from "./StaticPage.module.css";

export default function About() {
  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>À propos</h1>
      <p className={styles.text}>
        Mon E-commerce propose une sélection de chemises, pantalons, chaussures et accessoires choisis pour
        leur qualité et leur style. Chaque produit est publié et suivi personnellement, et vous pouvez discuter
        directement avec nous via le chat intégré sur chaque fiche produit.
      </p>
    </div>
  );
}
