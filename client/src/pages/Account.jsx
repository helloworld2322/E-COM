import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, money } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";
import Img from "../components/Img.jsx";

const blankAddress = {
  label: "Home", firstName: "", lastName: "",
  address: "", city: "", zip: "", country: "United States", phone: "",
};

export default function Account() {
  const { user, ready, openAuth } = useAuth();
  const { toast } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "orders";

  const [orders, setOrders] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [form, setForm] = useState(blankAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm(blankAddress); // reset the add-address form when the user changes
    api.getMyOrders().then(setOrders).catch(() => setOrders([]));
    api.getMyAddresses().then(setAddresses).catch(() => setAddresses([]));
  }, [user]);

  if (ready && !user) {
    return (
      <div className="container empty-state" style={{ paddingTop: 80 }}>
        <span className="es-icon">🔐</span>
        <h3>Sign in to view your account</h3>
        <p>Track orders, save addresses, and checkout faster.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAuth}>
          Sign in / Create account
        </button>
      </div>
    );
  }
  if (!user) return null;

  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.zip.trim()) {
      toast("Address, city and ZIP are required", "error");
      return;
    }
    setSaving(true);
    try {
      await api.addAddress(form);
      toast("Address saved 📍");
      setForm(blankAddress);
      setAddresses(await api.getMyAddresses());
    } catch (err) {
      toast(err.message || "Could not save address", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id) => {
    try {
      await api.deleteAddress(id);
      toast("Address removed");
      setAddresses(await api.getMyAddresses());
    } catch (err) {
      toast(err.message || "Could not remove address", "error");
    }
  };

  const useAtCheckout = (id) => {
    navigate(`/checkout?address=${id}`);
  };

  return (
    <div className="container account">
      {/* ---------- Profile header ---------- */}
      <div className="account-head">
        <span className="avatar avatar-lg">{initials}</span>
        <div>
          <h1 style={{ fontSize: 28 }}>{user.name}</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            {user.email} · Member since {memberSince}
          </p>
        </div>
        <div className="account-stats">
          <div className="stat"><b>{orders ? orders.length : "…"}</b><span>Orders</span></div>
          <div className="stat"><b>{addresses ? addresses.length : "…"}</b><span>Addresses</span></div>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <div className="account-tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setParams({ tab: "orders" })}>
          📦 Order history
        </button>
        <button className={tab === "addresses" ? "active" : ""} onClick={() => setParams({ tab: "addresses" })}>
          📍 Saved addresses
        </button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setParams({ tab: "profile" })}>
          👤 Profile
        </button>
      </div>

      {/* ---------- Orders ---------- */}
      {tab === "orders" && (
        <div>
          {!orders ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40 }}>
              <span className="es-icon">📦</span>
              <h3>No orders yet</h3>
              <p>When you check out while signed in, your orders appear here.</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 14 }}>Start shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((o) => (
                <div className="order-card" key={o.id}>
                  <div className="oc-head">
                    <div>
                      <b>Order #{o.number}</b>
                      <span className="oc-date">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="oc-status">✓ {o.status}</span>
                    <b className="oc-total">{money(o.totals?.total || 0)}</b>
                  </div>
                  <div className="oc-items">
                    {o.items?.map((i) => (
                      <Link to={`/product/${i.productId}`} className="oc-item" key={i.productId}>
                        <Img src={i.image} alt={i.name} category="" />
                        <div>
                          <b>{i.name}</b>
                          <span>{i.qty} × {money(i.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- Addresses ---------- */}
      {tab === "addresses" && (
        <div className="addr-layout">
          <div>
            <h3 className="ac-title">Your saved addresses</h3>
            {!addresses ? (
              <div className="skeleton" style={{ height: 120 }} />
            ) : addresses.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <span className="es-icon">📍</span>
                <h3>No saved addresses</h3>
                <p>Save an address to fill in checkout in one click.</p>
              </div>
            ) : (
              <div className="addr-grid">
                {addresses.map((a) => (
                  <div className="addr-card" key={a.id}>
                    <span className="addr-label">{a.label || "Address"}</span>
                    <b>{(a.firstName || "") + " " + (a.lastName || "")}</b>
                    <p>{a.address}</p>
                    <p>{a.city}, {a.zip}</p>
                    <p className="addr-country">{a.country}{a.phone ? ` · ${a.phone}` : ""}</p>
                    <div className="addr-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => useAtCheckout(a.id)}>
                        Use at checkout
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeAddress(a.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="form-card addr-form" onSubmit={saveAddress}>
            <h3 style={{ marginBottom: 6 }}>Add a new address</h3>
            <p className="section-sub" style={{ fontSize: 13.5 }}>It'll be available at checkout, always.</p>
            <div className="row-2">
              <div className="field">
                <label>Label</label>
                <select value={form.label} onChange={set("label")}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Phone (optional)</label>
                <input placeholder="+1 555 000 1234" value={form.phone} onChange={set("phone")} />
              </div>
            </div>
            <div className="row-2">
              <div className="field">
                <label>First name</label>
                <input placeholder={user.name.split(" ")[0]} value={form.firstName} onChange={set("firstName")} />
              </div>
              <div className="field">
                <label>Last name</label>
                <input placeholder={user.name.split(" ").slice(1).join(" ")} value={form.lastName} onChange={set("lastName")} />
              </div>
            </div>
            <div className="field">
              <label>Street address *</label>
              <input placeholder="123 Green Street" value={form.address} onChange={set("address")} />
            </div>
            <div className="row-2">
              <div className="field">
                <label>City *</label>
                <input placeholder="San Francisco" value={form.city} onChange={set("city")} />
              </div>
              <div className="field">
                <label>ZIP / Postal code *</label>
                <input placeholder="94105" value={form.zip} onChange={set("zip")} />
              </div>
            </div>
            <div className="field">
              <label>Country</label>
              <select value={form.country} onChange={set("country")}>
                {["United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "India", "Japan", "Brazil", "Other"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={saving}>
              {saving ? "Saving…" : "+ Save address"}
            </button>
          </form>
        </div>
      )}

      {/* ---------- Profile ---------- */}
      {tab === "profile" && (
        <div style={{ maxWidth: 480 }}>
          <div className="form-card">
            <h3 style={{ marginBottom: 4 }}>Your profile</h3>
            <p className="section-sub" style={{ fontSize: 13.5 }}>This is what stores see when you order.</p>
            <div className="profile-row"><span>Name</span><b>{user.name}</b></div>
            <div className="profile-row"><span>Email</span><b>{user.email}</b></div>
            <div className="profile-row"><span>Member since</span><b>{memberSince}</b></div>
            <div className="profile-row"><span>Order count</span><b>{orders ? orders.length : "—"}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
