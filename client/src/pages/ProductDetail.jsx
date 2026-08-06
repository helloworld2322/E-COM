import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";
import Img from "../components/Img.jsx";
import Stars from "../components/Stars.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const { addToCart, toggleWishlist, inWishlist } = useStore();

  useEffect(() => {
    setProduct(null);
    setError("");
    api
      .getProduct(id)
      .then(async (p) => {
        setProduct(p);
        const rel = await api.getProducts({ category: p.category }).catch(() => []);
        setRelated(rel.filter((r) => r.id !== p.id).slice(0, 4));
      })
      .catch((e) => setError(e.message));
    window.scrollTo({ top: 0 });
  }, [id]);

  if (error) {
    return (
      <div className="container empty-state" style={{ paddingTop: 80 }}>
        <span className="es-icon">😕</span>
        <h3>Product not found</h3>
        <p>{error}</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Back to shop</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    );
  }

  const isSale = product.oldPrice && product.oldPrice > product.price;
  const wished = inWishlist(product.id);
  const lowStock = product.stock != null && product.stock <= 30;

  return (
    <div className="container detail">
      <nav className="crumbs">
        <Link to="/">Home</Link> <span>›</span>
        <Link to="/shop">Shop</Link> <span>›</span>
        <Link to={`/shop?category=${product.category}`} style={{ textTransform: "capitalize" }}>
          {product.category}
        </Link>
      </nav>

      <div className="detail-grid">
        <div className="detail-media">
          <Img src={product.image} alt={product.name} category={product.category} />
        </div>

        <div className="detail-info">
          <div>
            <span className="card-cat">{product.category}</span>
            <h1>{product.name}</h1>
          </div>

          <Stars rating={product.rating} reviews={product.reviews} />

          <div className="detail-price">
            {money(product.price)}
            {isSale && <span className="old">{money(product.oldPrice)}</span>}
            {isSale && (
              <span className="save-chip">
                Save {money(product.oldPrice - product.price)}
              </span>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          <ul className="specs">
            {product.specs?.map((s) => <li key={s}>{s}</li>)}
          </ul>

          <div className="qty-row">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            {lowStock ? (
              <span className="stock-pill low">Only {product.stock} left in stock</span>
            ) : (
              <span className="stock-pill">In stock, ships in 24h</span>
            )}
          </div>

          <div className="detail-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => addToCart(product, qty)}>
              Add to cart — {money(product.price * qty)}
            </button>
            <button
              className="btn btn-outline btn-lg"
              style={{ width: 52, padding: 0 }}
              aria-label="Toggle wishlist"
              onClick={() => toggleWishlist(product)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>

          <div className="detail-meta">
            <span>🚚 <b>Free shipping</b> on orders over $150 — this item qualifies</span>
            <span>↩️ <b>30-day returns</b>, no questions asked</span>
            <span>🔒 <b>Secure checkout</b> with encrypted payment</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <h2 className="section-title">You may also like</h2>
          <p className="section-sub">More from {product.category}.</p>
          <div className="grid">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 60} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
