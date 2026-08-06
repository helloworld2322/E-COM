import express from "express";
import cors from "cors";
import {
  getProducts,
  getProduct,
  getCategories,
  saveProduct,
  deleteProduct,
  getOrders,
  getOrder,
  createOrder,
  createOrderForUser,
  getOrdersByUser,
  findUserByEmail,
  findUserById,
  createUser,
  addAddress,
  removeAddress,
  createSession,
  findSession,
  deleteSession,
} from "./db.js";
import { hashPassword, verifyPassword, publicUser } from "./auth.js";
import { seedIfEmpty } from "./seed.js";

const app = express();
// Fixed port so the Vite dev proxy (client/vite.config.js) always finds us.
// Override only via NOVA_PORT — ambient PORT env vars are ignored.
const PORT = Number(process.env.NOVA_PORT) || 4000;

app.use(cors());
app.use(express.json());

// Seed the store with products on first boot
seedIfEmpty();

// ---------- Products ----------
// GET /api/products?category=&search=&sort=&maxPrice=&minPrice=
app.get("/api/products", (req, res) => {
  let products = [...getProducts()];
  const { category, search, sort, maxPrice, minPrice, badge } = req.query;

  if (category && category !== "all") {
    products = products.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (badge) {
    products = products.filter((p) => (p.badge || "").toLowerCase() === String(badge).toLowerCase());
  }
  if (maxPrice) products = products.filter((p) => p.price <= Number(maxPrice));
  if (minPrice) products = products.filter((p) => p.price >= Number(minPrice));

  switch (sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      products.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    default: // featured
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/categories", (_req, res) => {
  res.json(getCategories());
});

// ---------- Orders ----------
app.get("/api/orders", (_req, res) => {
  res.json(getOrders());
});

app.get("/api/orders/:id", (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.post("/api/orders", (req, res) => {
  const { items, customer, shipping, payment, totals } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }
  if (!customer || !customer.email) {
    return res.status(400).json({ error: "Customer email is required" });
  }
  const orderPayload = {
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      qty: i.qty,
      image: i.image,
    })),
    customer,
    shipping: shipping || {},
    payment: payment ? { method: payment.method, last4: payment.last4 } : {},
    totals: totals || { subtotal: 0, shipping: 0, tax: 0, total: 0 },
  };

  // Link the order to the signed-in user when a valid session is present
  const session = findSession(getToken(req));
  const order = session ? createOrderForUser(orderPayload, session.userId) : createOrder(orderPayload);
  res.status(201).json(order);
});

// ---------- Admin: manage products ----------
app.post("/api/products", (req, res) => {
  const p = req.body;
  if (!p || !p.name || p.price == null || !p.category || !p.image) {
    return res.status(400).json({ error: "name, category, price and image are required" });
  }
  const product = saveProduct({
    name: p.name,
    category: p.category.toLowerCase(),
    price: Number(p.price),
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.image,
    description: p.description || "",
    specs: Array.isArray(p.specs) ? p.specs : [],
    rating: Number(p.rating) || 4.5,
    reviews: Number(p.reviews) || 0,
    stock: Number(p.stock) || 50,
    badge: p.badge || "",
    featured: !!p.featured,
  });
  res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const existing = getProduct(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const b = req.body || {};
  const updated = saveProduct({
    ...existing,
    ...b,
    // Coerce numeric fields so string form values can't break comparisons
    price: b.price != null ? Number(b.price) : existing.price,
    oldPrice: b.oldPrice ? Number(b.oldPrice) : null,
    stock: b.stock != null ? Number(b.stock) : existing.stock,
    rating: b.rating != null ? Number(b.rating) : existing.rating,
    reviews: b.reviews != null ? Number(b.reviews) : existing.reviews,
    category: b.category ? String(b.category).toLowerCase() : existing.category,
    id: existing.id,
  });
  res.json(updated);
});

app.delete("/api/products/:id", (req, res) => {
  const ok = deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

// ---------- Auth ----------
const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Pulls the bearer token out of the Authorization header
function getToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

// Express middleware: requires a valid session, attaches req.user + req.session
function requireAuth(req, res, next) {
  const session = findSession(getToken(req));
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  const user = findUserById(session.userId);
  if (!user) return res.status(401).json({ error: "Account no longer exists" });
  req.user = user;
  req.session = session;
  next();
}

function sanitizeAuthBody({ name, email, password }) {
  return { name: String(name || "").trim(), email: String(email || "").trim(), password: String(password || "") };
}

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = sanitizeAuthBody(req.body);
  if (!name) return res.status(400).json({ error: "Name is required" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Enter a valid email address" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (findUserByEmail(email)) return res.status(409).json({ error: "An account with that email already exists" });

  const passwordHash = await hashPassword(password);
  const user = createUser({ name, email: email.toLowerCase(), passwordHash });
  const token = createSession(user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

// Constant-time-ish login: unknown emails still run a scrypt verification so
// response timing doesn't reveal whether an account exists.
const DUMMY_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = sanitizeAuthBody(req.body);
  const user = findUserByEmail(email);
  const ok = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, DUMMY_HASH);
  if (!user || !ok) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }
  const token = createSession(user.id);
  res.json({ token, user: publicUser(user) });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getToken(req);
  if (token) deleteSession(token);
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ---------- Account (requires auth) ----------
app.get("/api/users/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user), addresses: req.user.addresses || [] });
});

app.get("/api/users/me/orders", requireAuth, (req, res) => {
  res.json(getOrdersByUser(req.user.id));
});

app.get("/api/users/me/addresses", requireAuth, (req, res) => {
  res.json(req.user.addresses || []);
});

app.post("/api/users/me/addresses", requireAuth, (req, res) => {
  const { label, firstName, lastName, address, city, zip, country, phone } = req.body || {};
  if (!address || !city || !zip) {
    return res.status(400).json({ error: "Address, city and ZIP are required" });
  }
  const addr = String(address).trim();
  const cty = String(city).trim();
  const zp = String(zip).trim();
  const duplicate = (req.user.addresses || []).some(
    (a) => a.address === addr && a.city === cty && a.zip === zp
  );
  if (duplicate) return res.status(409).json({ error: "That address is already saved" });

  const nameParts = (req.user.name || "").split(" ");
  const saved = addAddress(req.user.id, {
    label: label || "Default",
    firstName: firstName || nameParts[0] || "",
    lastName: lastName || nameParts.slice(1).join(" ") || "",
    address: addr,
    city: cty,
    zip: zp,
    country: country || "United States",
    phone: phone || "",
  });
  res.status(201).json(saved);
});

app.delete("/api/users/me/addresses/:id", requireAuth, (req, res) => {
  if (!removeAddress(req.user.id, req.params.id)) {
    return res.status(404).json({ error: "Address not found" });
  }
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true, store: "Nova Market" }));

app.listen(PORT, () => {
  console.log(`🛍️  Nova Market API running on http://localhost:${PORT}`);
});
