import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, money } from "../api.js";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getOrder(id)
      .then((o) => setOrder(o))
      .catch(() => setError("Could not load order"));
  }, [id]);

  return (
    <div className="container">
      <div className="success">
        <div className="success-ring">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1>Order confirmed! 🎉</h1>
        <p>Thanks for shopping with Nova Market. A confirmation email is on its way.</p>

        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

        {order && (
          <div className="order-receipt">
            <div style={{ textAlign: "center" }}>
              <span className="order-num">Order #{order.number}</span>
            </div>
            {order.items?.map((i) => (
              <div className="or-line" key={i.productId}>
                <span>{i.name} <b>× {i.qty}</b></span>
                <b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <div className="or-line"><span>Subtotal</span><span>{money(order.totals?.subtotal || 0)}</span></div>
            <div className="or-line"><span>Shipping</span><span>{order.totals?.shipping === 0 ? "FREE" : money(order.totals?.shipping || 0)}</span></div>
            <div className="or-line"><span>Tax</span><span>{money(order.totals?.tax || 0)}</span></div>
            <div className="or-line" style={{ fontWeight: 800 }}><span>Total</span><span>{money(order.totals?.total || 0)}</span></div>
            <div className="or-line">
              <span>Shipping to</span>
              <span style={{ textAlign: "right" }}>
                {order.customer?.firstName} {order.customer?.lastName}
                <br />
                <span style={{ color: "var(--muted)", fontSize: 12.5 }}>
                  {order.shipping?.address}, {order.shipping?.city} {order.shipping?.zip}
                </span>
              </span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/shop" className="btn btn-primary btn-lg">Continue shopping</Link>
          <Link to="/" className="btn btn-outline btn-lg">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
