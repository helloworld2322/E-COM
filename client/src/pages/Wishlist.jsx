import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext.jsx";
import ProductCard from "../components/ProductCard.jsx";

export default function Wishlist() {
  const { wishlist } = useStore();

  return (
    <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
      <span className="eyebrow">Saved for later</span>
      <h1 style={{ fontSize: 30, marginBottom: 4 }}>Your wishlist</h1>
      <p className="section-sub" style={{ marginBottom: 0 }}>
        {wishlist.length === 0
          ? "Nothing saved yet."
          : `${wishlist.length} item${wishlist.length === 1 ? "" : "s"} waiting for you.`}
      </p>

      {wishlist.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <span className="es-icon">💚</span>
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 14 }}>
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 28 }}>
          {wishlist.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}
