import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, money } from "../api.js";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Img from "../components/Img.jsx";

// Defined at module scope: a component defined inside another component is
// recreated on every render, which unmounts/remounts inputs and loses focus.
function Field({ label, name, placeholder, type = "text", value, onChange, required, options, error, className = "" }) {
  return (
    <div className={`field ${error ? "error" : ""} ${className}`}>
      <label>{label} {required && <span style={{ color: "var(--danger)" }}>*</span>}</label>
      {type === "select" ? (
        <select value={value} onChange={onChange}>
          {(options || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", zip: "", country: "United States",
  cardName: "", cardNumber: "", expiry: "", cvc: "",
};

export default function Checkout() {
  const { cart, subtotal, shipping, tax, total, clearCart, toast } = useStore();
  const { user, openAuth } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
  }));
  const [method, setMethod] = useState("card");
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const navigate = useNavigate();

  // Session may restore after first render — backfill contact fields when the user arrives
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || user.name?.split(" ")[0] || "",
      lastName: prev.lastName || user.name?.split(" ").slice(1).join(" ") || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  // Prefill shipping from a saved address (?address=<id>), e.g. "Use at checkout"
  useEffect(() => {
    const addressId = params.get("address");
    if (!addressId || !user) return;
    api
      .getMyAddresses()
      .then((addrs) => {
        const a = addrs.find((x) => String(x.id) === String(addressId));
        if (!a) return;
        setForm((prev) => ({
          ...prev,
          firstName: a.firstName || prev.firstName,
          lastName: a.lastName || prev.lastName,
          phone: a.phone || prev.phone,
          address: a.address,
          city: a.city,
          zip: a.zip,
          country: a.country || prev.country,
        }));
        toast("Saved address applied 📍");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user]);

  if (cart.length === 0) {
    return (
      <div className="container empty-state" style={{ paddingTop: 80 }}>
        <span className="es-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add a few things before checking out.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Browse products</Link>
      </div>
    );
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.phone && !/^[+\d\s-]{7,}$/.test(form.phone)) errs.phone = "Invalid phone";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.zip.trim()) errs.zip = "Required";
    if (method === "card") {
      if (!form.cardName.trim()) errs.cardName = "Required";
      if (!/^[\d\s-]{13,19}$/.test(form.cardNumber)) errs.cardNumber = "Invalid card number";
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(form.expiry)) errs.expiry = "MM/YY";
      if (!/^\d{3,4}$/.test(form.cvc)) errs.cvc = "3–4 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the highlighted fields", "error");
      return;
    }
    setPlacing(true);
    try {
      const order = await api.createOrder({
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
        shipping: {
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
        payment: {
          method,
          last4: method === "card" ? form.cardNumber.replace(/\D/g, "").slice(-4) : "",
        },
        totals: { subtotal, shipping, tax, total },
      });
      clearCart();
      // Optionally save this shipping address to the signed-in account
      if (saveAddress && user) {
        api
          .addAddress({
            label: "Home",
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.address,
            city: form.city,
            zip: form.zip,
            country: form.country,
            phone: form.phone,
          })
          .catch(() => {});
      }
      toast(`Order ${order.number} confirmed 🎉`);
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      toast(err.message || "Could not place order", "error");
      setPlacing(false);
    }
  };

  return (
    <div className="container checkout-grid">
      <form onSubmit={placeOrder} noValidate>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          {user ? (
            <span className="signed-in-note">👋 Signed in as <b>{user.email}</b></span>
          ) : (
            <span className="signed-in-note">
              Already a member?{" "}
              <button className="link-btn" onClick={openAuth}>Sign in</button>{" "}
              to track this order & save your address.
            </span>
          )}
        </div>

        <div className="form-card">
          <h3><span className="step-num">1</span> Contact</h3>
          <div className="row-2">
            <Field label="First name" name="firstName" placeholder="Ada" value={form.firstName} onChange={set("firstName")} error={errors.firstName} required />
            <Field label="Last name" name="lastName" placeholder="Lovelace" value={form.lastName} onChange={set("lastName")} error={errors.lastName} required />
          </div>
          <div className="row-2">
            <Field label="Email" name="email" type="email" placeholder="ada@example.com" value={form.email} onChange={set("email")} error={errors.email} required />
            <Field label="Phone (optional)" name="phone" placeholder="+1 555 000 1234" value={form.phone} onChange={set("phone")} error={errors.phone} />
          </div>
        </div>

        <div className="form-card">
          <h3><span className="step-num">2</span> Shipping address</h3>
          <Field label="Street address" name="address" placeholder="123 Green Street" value={form.address} onChange={set("address")} error={errors.address} required />
          <div className="row-2">
            <Field label="City" name="city" placeholder="San Francisco" value={form.city} onChange={set("city")} error={errors.city} required />
            <Field label="ZIP / Postal code" name="zip" placeholder="94105" value={form.zip} onChange={set("zip")} error={errors.zip} required />
          </div>
          <Field
            label="Country"
            name="country"
            type="select"
            value={form.country}
            onChange={set("country")}
            options={[
              "United States", "Canada", "United Kingdom", "Germany",
              "France", "Australia", "India", "Japan", "Brazil", "Other",
            ]}
          />
        </div>

        <div className="form-card">
          <h3><span className="step-num">3</span> Payment</h3>
          <div className="pay-methods">
            <button type="button" className={`pay-method ${method === "card" ? "active" : ""}`} onClick={() => setMethod("card")}>
              <span className="pm-icon">💳</span>Card
            </button>
            <button type="button" className={`pay-method ${method === "paypal" ? "active" : ""}`} onClick={() => setMethod("paypal")}>
              <span className="pm-icon">🅿️</span>PayPal
            </button>
          </div>

          {method === "card" ? (
            <>
              <Field label="Name on card" name="cardName" placeholder="ADA LOVELACE" value={form.cardName} onChange={set("cardName")} error={errors.cardName} required />
              <Field label="Card number" name="cardNumber" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={set("cardNumber")} error={errors.cardNumber} required />
              <div className="row-2">
                <Field label="Expiry" name="expiry" placeholder="MM/YY" value={form.expiry} onChange={set("expiry")} error={errors.expiry} required />
                <Field label="CVC" name="cvc" placeholder="123" value={form.cvc} onChange={set("cvc")} error={errors.cvc} required />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>
                🔒 Demo checkout — no real payment is processed.
              </p>
              {user && (
                <label className="save-addr-check">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                  Save this shipping address to my account
                </label>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
              You'll be redirected to PayPal after placing the order (demo).
            </p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={placing}>
          {placing ? "Placing order…" : `Place order · ${money(total)}`}
        </button>
      </form>

      {/* ---------- Summary ---------- */}
      <aside className="summary-card">
        <h3>Order summary</h3>
        <div>
          {cart.map((i) => (
            <div className="sum-item" key={i.productId}>
              <Img src={i.image} alt={i.name} category="" />
              <div>
                <div className="si-name">{i.name}</div>
                <div className="si-price">{i.qty} × {money(i.price)}</div>
              </div>
              <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 14 }}>{money(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="sum-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="sum-line"><span>Shipping</span><span>{shipping === 0 ? "FREE" : money(shipping)}</span></div>
          <div className="sum-line"><span>Tax (8%)</span><span>{money(tax)}</span></div>
          <div className="sum-line total"><span>Total</span><span>{money(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
