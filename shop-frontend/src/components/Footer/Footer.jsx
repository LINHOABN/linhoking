import { Link } from "react-router-dom";
import { Camera, Globe, MessageCircle } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logoRow}>
            <img src="/logo.jpg" alt="LINHOKING Logo" className={styles.logoImg} />
            <span className={styles.logo}>LINHOKING</span>
          </div>
          <p className={styles.slogan}>BUILD WEALTH • CREATE FREEDOM • LIVE YOUR LEGACY</p>
          <p className={styles.tagline}>Chemises, pantalons, chaussures et accessoires, sélectionnés avec soin.</p>
        </div>

        <div className={styles.column}>
          <h4 className={styles.heading}>Boutique</h4>
          <Link to="/">Accueil</Link>
          <Link to="/?section=categories">Catégories</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className={styles.column}>
          <h4 className={styles.heading}>Suivez-nous</h4>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram"><Camera size={18} /></a>
            <a href="#" aria-label="Facebook"><Globe size={18} /></a>
            <a href="#" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">© {new Date().getFullYear()} LINHOKING. Tous droits réservés.</div>
      </div>
    </footer>
  );
}
