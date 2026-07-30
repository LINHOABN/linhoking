import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./Navbar.module.css";

const LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/?section=categories", label: "Catégories" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ search, onSearchChange }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <img src="/logo.jpg" alt="LINHOKING Logo" className={styles.logoImg} />
          LINHOKING
        </Link>

        <nav className={styles.navLinks}>
          {LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className={styles.navLink} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <SearchBar value={search} onChange={onSearchChange} className={styles.searchDesktop} />
          <button
            className={styles.menuToggle}
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.mobileMenu}>
          <SearchBar value={search} onChange={onSearchChange} />
          <nav className={styles.mobileLinks}>
            {LINKS.map((link) => (
              <NavLink key={link.label} to={link.to} onClick={() => setOpen(false)} className={styles.navLink}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
