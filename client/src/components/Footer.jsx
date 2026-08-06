import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <span className="logo-mark">N</span> Nova Market
          </Link>
          <p>
            Beautiful essentials for modern living. Designed and engineered with the
            NEAR design system — clean, light, and human.
          </p>
          <div className="socials">
            <a href="#" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg></a>
            <a href="#" aria-label="GitHub"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.4 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg></a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul className="footer-links">
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop?category=electronics">Electronics</Link></li>
            <li><Link to="/shop?category=fashion">Fashion</Link></li>
            <li><Link to="/shop?category=home">Home &amp; Living</Link></li>
            <li><Link to="/shop?badge=sale">On sale</Link></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul className="footer-links">
            <li><Link to="/shop">About us</Link></li>
            <li><Link to="/shop">Careers</Link></li>
            <li><Link to="/shop">Press</Link></li>
            <li><Link to="/admin">Admin panel</Link></li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul className="footer-links">
            <li><Link to="/shop">Help center</Link></li>
            <li><Link to="/shop">Shipping &amp; returns</Link></li>
            <li><Link to="/shop">Track order</Link></li>
            <li><Link to="/shop">Contact us</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Nova Market. All rights reserved.</span>
        <span className="near-chip"><span className="n-dot" /> Styled with the NEAR design system</span>
      </div>
    </footer>
  );
}
