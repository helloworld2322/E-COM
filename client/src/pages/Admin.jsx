import React, { useEffect, useState } from "react";
import { api, money } from "../api.js";
import Img from "../components/Img.jsx";
import { useStore } from "../context/StoreContext.jsx";

const blank = {
  name: "", category: "electronics", price: "", oldPrice: "",
  image: "", description: "", stock: "50", badge: "", rating: "4.5", reviews: "0",
};

const CATEGORIES = ["electronics", "fashion", "home", "beauty", "sports", "accessories"];
const BADGES = ["", "Bestseller", "New", "Sale"];

export default function Admin() {
  const [products, setProducts] = useState(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // null | {edit:false} | {edit:true, product}
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const { toast } = useStore();

  const load = () => api.getProducts().then(setProducts);
  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(blank);
    setModal({ edit: false });
  };
  const openEdit = (p) => {
    setForm({
      name: p.name, category: p.category, price: p.price, oldPrice: p.oldPrice || "",
      image: p.image, description: p.description || "", stock: p.stock ?? 50,
      badge: p.badge || "", rating: p.rating, reviews: p.reviews || 0,
    });
    setModal({ edit: true, product: p });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.image.trim()) {
      toast("Name, price and image are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (modal.edit) {
        await api.updateProduct(modal.product.id, form);
        toast("Product updated");
      } else {
        await api.addProduct(form);
        toast("Product added to the store");
      }
      setModal(null);
      await load();
    } catch (err) {
      toast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await api.deleteProduct(p.id);
      toast("Product deleted");
      await load();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container admin">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Store management</span>
          <h1 style={{ fontSize: 30 }}>Admin panel</h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            Add, edit, or remove products — changes persist to the server database.
          </p>
        </div>
        <div className="admin-tools">
          <input
            className="admin-search"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openAdd}>+ Add product</button>
        </div>
      </div>

      {!products ? (
        <div className="skeleton" style={{ height: 420 }} />
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="at-prod">
                      <Img src={p.image} alt={p.name} category={p.category} />
                      <div>
                        <b>{p.name}</b>
                        <span>{p.badge ? `${p.badge} · ` : ""}ID #{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                  <td><b>{money(p.price)}</b></td>
                  <td>{p.stock}</td>
                  <td>★ {p.rating}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="icon-btn small" onClick={() => openEdit(p)} aria-label="Edit">✏️</button>
                      <button className="icon-btn small danger" onClick={() => remove(p)} aria-label="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 40 }}>
              <h3>No products match “{query}”</h3>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>{modal.edit ? "Edit product" : "Add a new product"}</h3>

            <div className="field">
              <label>Product name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Wireless Noise-Cancelling Headphones" />
            </div>

            <div className="row-2">
              <div className="field">
                <label>Category *</label>
                <select value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Badge</label>
                <select value={form.badge} onChange={set("badge")}>
                  {BADGES.map((b) => <option key={b || "none"} value={b}>{b || "— none —"}</option>)}
                </select>
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label>Price (USD) *</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={set("price")} placeholder="99.99" />
              </div>
              <div className="field">
                <label>Old price (for sale)</label>
                <input type="number" step="0.01" min="0" value={form.oldPrice} onChange={set("oldPrice")} placeholder="129.99" />
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label>Stock</label>
                <input type="number" min="0" value={form.stock} onChange={set("stock")} />
              </div>
              <div className="field">
                <label>Rating (0–5)</label>
                <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={set("rating")} />
              </div>
            </div>

            <div className="field">
              <label>Image URL *</label>
              <input value={form.image} onChange={set("image")} placeholder="https://images.unsplash.com/photo-…" />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea value={form.description} onChange={set("description")} placeholder="Short, punchy product description…" />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : modal.edit ? "Save changes" : "Add product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
