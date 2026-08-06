import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";
import Img from "../components/Img.jsx";
import { useStore } from "../context/StoreContext.jsx";

const CATS = [
  { name: "electronics", emoji: "📱", tag: "Gadgets & audio" },
  { name: "fashion", emoji: "👟", tag: "Sneakers & style" },
  { name: "home", emoji: "🪴", tag: "Modern living" },
  { name: "beauty", emoji: "🧴", tag: "Glow & scent" },
  { name: "sports", emoji: "🏃", tag: "Train harder" },
  { name: "accessories", emoji: "⌚", tag: "Finish the look" },
];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [deals, setDeals] = useState(null);
  const { toast } = useStore();

  useEffect(() => {
    api.getProducts({ badge: "Bestseller" }).then((p) => setFeatured(p.slice(0, 4)));
    api.getProducts({ badge: "Sale" }).then((p) => setDeals(p.slice(0, 4)));
  }, []);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">✦ Trusted by 120k+ shoppers</span>
            <h1>
              Everything you need,{" "}
              <span className="gradient-text">beautifully simple.</span>
            </h1>
            <p className="lead">
              Curated essentials across electronics, fashion, home and more —
              delivered free on orders over {money(150)}. Fresh picks, real
              prices, zero fuss.
            </p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Shop now →
              </Link>
              <Link to="/shop?badge=sale" className="btn btn-outline btn-lg">
                🔥 View deals
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><b>32+</b><span>Curated products</span></div>
              <div className="stat"><b>4.7★</b><span>Average rating</span></div>
              <div className="stat"><b>24h</b><span>Fast dispatch</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-img tall">
              <Img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80&auto=format&fit=crop" alt="Premium headphones" category="electronics" />
            </div>
            <div>
              <div className="hero-img short">
                <Img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop" alt="Minimalist watch" category="accessories" />
              </div>
              <div className="hero-img short">
                <Img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop" alt="Sneakers" category="fashion" />
              </div>
            </div>

            <div className="float-card fc-1">
              <span className="fc-icon green">📦</span>
              <div><b>Free shipping</b><span>On orders over $150</span></div>
            </div>
            <div className="float-card fc-2">
              <span className="fc-icon blue">🛡️</span>
              <div><b>2-year warranty</b><span>On all electronics</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Marquee ---------- */}
      <div className="strip">
        <div className="strip-track">
          <span>Free shipping over $150 <span className="dot">●</span> 30-day returns <span className="dot">●</span> 24h dispatch <span className="dot">●</span> Secure checkout <span className="dot">●</span></span>
          <span>Free shipping over $150 <span className="dot">●</span> 30-day returns <span className="dot">●</span> 24h dispatch <span className="dot">●</span> Secure checkout <span className="dot">●</span></span>
        </div>
      </div>

      {/* ---------- Categories ---------- */}
      <section className="section tight container">
        <Reveal>
          <span className="eyebrow">Browse</span>
          <h2 className="section-title">Shop by category</h2>
          <p className="section-sub">Whatever you're into, we've curated it.</p>
        </Reveal>
        <Reveal>
          <div className="cat-grid">
            {CATS.map((c, i) => (
              <Link
                key={c.name}
                to={`/shop?category=${c.name}`}
                className="cat-tile"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="cat-emoji">{c.emoji}</span>
                <b>{c.name}</b>
                <span>{c.tag}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- Featured ---------- */}
      <section className="section container">
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="eyebrow">Most loved</span>
              <h2 className="section-title">Bestsellers this week</h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>The products everyone's talking about.</p>
            </div>
            <Link to="/shop" className="btn btn-ghost">View all →</Link>
          </div>
        </Reveal>
        <div className="grid" style={{ marginTop: 28 }}>
          {featured
            ? featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 70} />)
            : [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 340 }} />)}
        </div>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="section tight container">
        <Reveal>
          <div className="props">
            <div className="prop"><span className="prop-icon">🚚</span><div><b>Free & fast shipping</b><span>Free over $150, delivered in 24–48h</span></div></div>
            <div className="prop"><span className="prop-icon">↩️</span><div><b>30-day returns</b><span>Changed your mind? Send it back free</span></div></div>
            <div className="prop"><span className="prop-icon">🔒</span><div><b>Secure checkout</b><span>256-bit encrypted payments</span></div></div>
            <div className="prop"><span className="prop-icon">🎧</span><div><b>24/7 support</b><span>Real humans, any time</span></div></div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Promo ---------- */}
      <section className="section tight container">
        <Reveal>
          <div className="promo">
            <div>
              <span className="eyebrow" style={{ background: "rgba(255,255,255,0.85)" }}>Limited time</span>
              <h3>Summer Sale — up to 25% off</h3>
              <p>Score big on audio, sneakers and style. Selected favorites marked down, while stock lasts.</p>
            </div>
            <Link to="/shop?badge=sale" className="btn btn-lg">Grab the deals</Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Deals grid ---------- */}
      {deals && deals.length > 0 && (
        <section className="section container">
          <Reveal>
            <span className="eyebrow">On sale</span>
            <h2 className="section-title">Hot right now</h2>
            <p className="section-sub">Limited-time price drops.</p>
          </Reveal>
          <div className="grid">
            {deals.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 70} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- Newsletter ---------- */}
      <section className="section tight container">
        <Reveal>
          <div className="newsletter">
            <span className="eyebrow">Stay in the loop</span>
            <h3>Get 10% off your first order</h3>
            <p>Join 40,000+ subscribers for early access to drops, sales and style notes.</p>
            <form
              className="news-form"
              onSubmit={(e) => {
                e.preventDefault();
                toast("Welcome aboard! Check your inbox for 10% off 🎉");
                e.target.reset();
              }}
            >
              <input type="email" placeholder="you@example.com" required />
              <button className="btn btn-primary" type="submit">Subscribe</button>
            </form>
          </div>
        </Reveal>
      </section>
    </>
  );
}
