import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, money } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";

const MAX_PRICE = 1300;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = params.get("category") || "all";
  const search = params.get("search") || "";
  const badge = params.get("badge") || "";
  const sort = params.get("sort") || "featured";
  const maxPrice = params.get("maxPrice") || "";

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ category, search, badge, sort, maxPrice })
      .then((p) => {
        setProducts(p);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, search, badge, sort, maxPrice]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const counts = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.name] = c.count));
    return map;
  }, [categories]);

  return (
    <div className="container shop-layout">
      {/* ---------- Filters ---------- */}
      <aside className="filters">
        <div>
          <h3>Categories</h3>
          <ul className="filter-list">
            <li>
              <button className={category === "all" ? "active" : ""} onClick={() => setParam("category", "all")}>
                All products <span>{categories.reduce((s, c) => s + c.count, 0)}</span>
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.name}>
                <button className={category === c.name ? "active" : ""} onClick={() => setParam("category", c.name)}>
                  <span style={{ textTransform: "capitalize" }}>{c.name}</span>
                  <span>{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="filter-group">
          <h3>Deals</h3>
          <ul className="filter-list">
            <li>
              <button className={badge === "sale" ? "active" : ""} onClick={() => setParam("badge", badge === "sale" ? "" : "sale")}>
                On sale only
              </button>
            </li>
            <li>
              <button className={badge === "new" ? "active" : ""} onClick={() => setParam("badge", badge === "new" ? "" : "new")}>
                New arrivals
              </button>
            </li>
          </ul>
        </div>

        <div className="filter-group">
          <h3>Max price</h3>
          <input
            type="range"
            className="price-range"
            min={30}
            max={MAX_PRICE}
            step={10}
            value={maxPrice || MAX_PRICE}
            onChange={(e) => setParam("maxPrice", e.target.value === String(MAX_PRICE) ? "" : e.target.value)}
          />
          <div className="price-labels">
            <span>{money(30)}</span>
            <b style={{ color: "var(--ink)" }}>{money(maxPrice || MAX_PRICE)}</b>
          </div>
        </div>
      </aside>

      {/* ---------- Products ---------- */}
      <div>
        <div className="sort-row">
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 2 }}>Shop</h1>
            <span className="count">
              {loading ? "Loading…" : `${products?.length || 0} product${products?.length === 1 ? "" : "s"}`}
              {search ? ` for “${search}”` : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <form
              className="nav-search shop-search"
              style={{ maxWidth: 260, marginLeft: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                setParam("search", searchInput.trim());
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
            <select className="sort-select" value={sort} onChange={(e) => setParam("sort", e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {error && <div className="empty-state"><span className="es-icon">⚠️</span><h3>Something went wrong</h3><p>{error}</p></div>}

        {!error && products?.length === 0 && !loading && (
          <div className="empty-state">
            <span className="es-icon">🔍</span>
            <h3>No products found</h3>
            <p>Try a different category or clear your filters.</p>
            <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => setParams(new URLSearchParams())}>
              Clear all filters
            </button>
          </div>
        )}

        {!error && (loading ? (
          <div className="grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 340 }} />
            ))}
          </div>
        ) : (
          <div className="grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 55} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
