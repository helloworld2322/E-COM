import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext.jsx";
import { money } from "../api.js";
import Img from "./Img.jsx";
import Stars from "./Stars.jsx";

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const wished = inWishlist(product.id);
  const isSale = product.oldPrice && product.oldPrice > product.price;
  const lowStock = product.stock != null && product.stock <= 30;

  return (
    <article
      className="card"
      style={{ animation: `fadeUp 0.5s ease both`, animationDelay: `${delay}ms` }}
    >
      <div className="card-media">
        {product.badge && (
          <span className={`card-badge ${product.badge.toLowerCase()}`}>{product.badge}</span>
        )}
        <button
          className={`heart ${wished ? "active" : ""}`}
          aria-label="Toggle wishlist"
          onClick={() => toggleWishlist(product)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
        <Link to={`/product/${product.id}`}>
          <Img src={product.image} alt={product.name} category={product.category} />
        </Link>
      </div>

      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <Stars rating={product.rating} reviews={product.reviews} />
        <div className="card-foot">
          <span className="price">
            {money(product.price)}
            {isSale && <span className="old">{money(product.oldPrice)}</span>}
          </span>
          <button
            className="add-btn"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addToCart(product)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
        {lowStock && <span className="stock-pill low">Only {product.stock} left</span>}
        {!lowStock && product.stock != null && <span className="stock-pill">In stock</span>}
      </div>
    </article>
  );
}
