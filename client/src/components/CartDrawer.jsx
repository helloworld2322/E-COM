import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStore,
  FREE_SHIPPING_THRESHOLD,
} from "../context/StoreContext.jsx";
import { money } from "../api.js";
import Img from "./Img.jsx";

export default function CartDrawer() {
  const {
    cart,
    subtotal,
    shipping,
    total,
    freeShipping,
    updateQty,
    removeFromCart,
    clearCart,
  } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-cart", handler);
    return () => window.removeEventListener("open-cart", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  const goCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  if (!open) return null;

  return (
    <>
      <div className="overlay" onClick={() => setOpen(false)} />
      <aside className="drawer" aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your Cart ({cart.length})</h3>
          <button className="close-btn" onClick={() => setOpen(false)} aria-label="Close cart">
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="drawer-empty">
            <div>
              <span className="de-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setOpen(false);
                  navigate("/shop");
                }}
              >
                Start shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ship-progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="ship-note">
              {freeShipping ? (
                <span className="free-badge">🎉 You've unlocked FREE shipping!</span>
              ) : (
                <>Add <b>{money(remaining)}</b> more for FREE shipping</>
              )}
            </p>

            <div className="drawer-items">
              {cart.map((item) => (
                <div className="drawer-item" key={item.productId}>
                  <Img src={item.image} alt={item.name} category="" />
                  <div className="di-body">
                    <div className="di-name">{item.name}</div>
                    <div className="di-price">{money(item.price)} each</div>
                    <div className="di-foot">
                      <div className="qty">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} aria-label="Decrease">−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className="di-remove" onClick={() => removeFromCart(item.productId)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <div className="sum-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="sum-line"><span>Shipping</span><span>{freeShipping ? "FREE" : money(shipping)}</span></div>
              <div className="sum-line total"><span>Total</span><span>{money(total)}</span></div>
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={goCheckout}>
                Checkout → 
              </button>
              <button
                className="di-remove"
                style={{ margin: "10px auto 0", display: "block", fontSize: 13 }}
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
