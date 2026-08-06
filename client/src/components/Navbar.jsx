import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { cartCount } = useStore();
  const { user, openAuth, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close the account dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const initials = user
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-mark">N</span>
            Nova Market
          </Link>

          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} end>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Shop
            </NavLink>
            <NavLink to="/shop?category=electronics" className="nav-link">
              Electronics
            </NavLink>
            <NavLink to="/shop?category=fashion" className="nav-link">
              Fashion
            </NavLink>
            <NavLink to="/shop?badge=sale" className="nav-link">
              Deals
            </NavLink>
          </nav>

          <form className="nav-search" onSubmit={submitSearch}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="nav-actions">
            <button
              className="icon-btn burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
            <button className="icon-btn" aria-label="Wishlist" onClick={() => navigate("/wishlist")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
            <button
              className="icon-btn"
              aria-label="Open cart"
              onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7z" />
                <path d="M9 10V6a3 3 0 0 1 6 0v4" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {user ? (
              <div className="user-menu-wrap" ref={userMenuRef}>
                <button
                  className="user-chip"
                  onClick={() => setUserMenu((v) => !v)}
                  aria-label="Account menu"
                >
                  <span className="avatar">{initials}</span>
                  <span className="user-chip-name">{user.name.split(" ")[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" style={{ opacity: 0.6 }}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {userMenu && (
                  <div className="user-dropdown">
                    <div className="ud-head">
                      <b>{user.name}</b>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/account" onClick={() => setUserMenu(false)}>
                      <span>👤</span> My account
                    </Link>
                    <Link to="/account?tab=orders" onClick={() => setUserMenu(false)}>
                      <span>📦</span> Order history
                    </Link>
                    <Link to="/account?tab=addresses" onClick={() => setUserMenu(false)}>
                      <span>📍</span> Saved addresses
                    </Link>
                    <button
                      className="ud-logout"
                      onClick={async () => {
                        setUserMenu(false);
                        await logout();
                        navigate("/");
                      }}
                    >
                      <span>↪</span> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={openAuth}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav">
          <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link className="nav-link" to="/shop" onClick={() => setMenuOpen(false)}>Shop all</Link>
          <Link className="nav-link" to="/shop?category=electronics" onClick={() => setMenuOpen(false)}>Electronics</Link>
          <Link className="nav-link" to="/shop?category=fashion" onClick={() => setMenuOpen(false)}>Fashion</Link>
          <Link className="nav-link" to="/shop?badge=sale" onClick={() => setMenuOpen(false)}>Deals</Link>
        </nav>
      )}
    </>
  );
}
