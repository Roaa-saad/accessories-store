import { Link } from "react-router-dom";
import { useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div className="navbar">
        {/* Menu */}
        <span
          className="nav-icon"
          onClick={() => setOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </span>

        {/* Logo */}
        <div className="brand">
          <img
            src="/lumie-logo.png"
            alt="Lumie Jewelry Boutique"
            className="logo-img"
          />
        </div>

        {/* Cart */}
        <Link to="/cart" className="nav-cart" style={{ position: 'relative' }}>
          <FaShoppingBag />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#8b7355',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          className="menu-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ================= SIDE MENU ================= */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        {/* ===== MAIN LINKS ===== */}
        <nav className="side-menu-links main-links">
          <Link to="/" onClick={() => setOpen(false)}>
            Home
          </Link>
        </nav>

        {/* ===== DIVIDER ===== */}
        <div className="side-menu-divider" />

        {/* ===== CATEGORIES (TOGGLE) ===== */}
        <h3
          className="side-menu-title clickable"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
        >
          Categories
          <span className="arrow">
            {categoriesOpen ? "−" : "+"}
          </span>
        </h3>

        <nav
          className={`side-menu-links categories-links ${
            categoriesOpen ? "show" : ""
          }`}
        >
          <Link to="/category/necklaces" onClick={() => setOpen(false)}>
            Necklaces
          </Link>
          <Link to="/category/bracelets" onClick={() => setOpen(false)}>
            Bracelets
          </Link>
          <Link to="/category/rings" onClick={() => setOpen(false)}>
            Rings
          </Link>
          <Link to="/category/earrings" onClick={() => setOpen(false)}>
            Earrings
          </Link>
          <Link to="/category/hair-clips" onClick={() => setOpen(false)}>
            Hair Clips
          </Link>

          <Link
            to="/category/sale"
            onClick={() => setOpen(false)}
            className="sale-link"
          >
            Sets on sale ✨
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
