import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_DB = { products: [], orders: [], users: [], sessions: [] };

// Serverless platforms (Vercel, etc.) run on a read-only filesystem. When disk
// writes fail we transparently fall back to an in-memory store so the app keeps
// working — data just won't persist across cold starts there.
let memoryDb = null;

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
    }
  } catch {
    memoryDb = { products: [], orders: [], users: [], sessions: [] };
  }
}

function readDB() {
  if (memoryDb) return memoryDb;
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    return { ...DEFAULT_DB, ...data };
  } catch {
    return { ...DEFAULT_DB };
  }
}

function writeDB(db) {
  try {
    ensureFile();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    memoryDb = db; // keep serving from memory for this instance
  }
}

export function getProducts() {
  return readDB().products;
}

export function getProduct(id) {
  const products = readDB().products;
  return products.find((p) => p.id === Number(id) || p.id === id) || null;
}

export function getCategories() {
  const products = readDB().products;
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.category)) map.set(p.category, { name: p.category, count: 0 });
    map.get(p.category).count += 1;
  }
  return Array.from(map.values());
}

// Atomic bulk write — used by the seeder so a fresh install can't lose
// products to interleaved single writes from multiple processes.
export function bulkReplaceProducts(products) {
  const db = readDB();
  db.products = products;
  writeDB(db);
  return products;
}

export function saveProduct(product) {
  const db = readDB();
  if (product.id == null) {
    product.id = db.products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
    db.products.push(product);
  } else {
    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...product, id: db.products[idx].id };
  }
  writeDB(db);
  return product;
}

export function deleteProduct(id) {
  const db = readDB();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== Number(id) && p.id !== id);
  writeDB(db);
  return db.products.length < before;
}

export function getOrders() {
  return readDB().orders;
}

export function getOrder(id) {
  const orders = readDB().orders;
  return orders.find((o) => Number(o.id) === Number(id)) || null;
}

// True only before the DB file has ever been created — used by the seeder
// so a store deliberately emptied by an admin is not resurrected on restart.
export function isFreshDB() {
  return !fs.existsSync(DB_FILE);
}

export function createOrder(order) {
  const db = readDB();
  const id = db.orders.reduce((m, o) => Math.max(m, Number(o.id) || 0), 0) + 1;
  const created = {
    id,
    number: `NM-${String(100000 + id)}`,
    ...order,
    createdAt: new Date().toISOString(),
    status: "confirmed",
  };
  db.orders.unshift(created);

  // Decrement stock so the store reflects real purchases
  for (const item of created.items || []) {
    const product = db.products.find((p) => p.id === item.productId);
    if (product && Number.isFinite(Number(item.qty))) {
      product.stock = Math.max(0, (Number(product.stock) || 0) - Number(item.qty));
    }
  }
  writeDB(db);
  return created;
}

export function createOrderForUser(order, userId) {
  return createOrder({ ...order, userId });
}

export function getOrdersByUser(userId) {
  return readDB().orders.filter((o) => Number(o.userId) === Number(userId));
}

// ---------- Users ----------
export function getUsers() {
  return readDB().users || [];
}

export function findUserByEmail(email) {
  const e = String(email || "").toLowerCase();
  return getUsers().find((u) => (u.email || "").toLowerCase() === e) || null;
}

export function findUserById(id) {
  return getUsers().find((u) => Number(u.id) === Number(id)) || null;
}

export function createUser(data) {
  const db = readDB();
  const id = db.users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
  const user = { id, addresses: [], createdAt: new Date().toISOString(), ...data, id };
  db.users.push(user);
  writeDB(db);
  return user;
}

export function addAddress(userId, address) {
  const db = readDB();
  const user = db.users.find((u) => Number(u.id) === Number(userId));
  if (!user) return null;
  const id = (user.addresses || []).reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1;
  user.addresses.push({ id, ...address });
  writeDB(db);
  return user.addresses.find((a) => a.id === id);
}

export function removeAddress(userId, addressId) {
  const db = readDB();
  const user = db.users.find((u) => Number(u.id) === Number(userId));
  if (!user) return false;
  const before = (user.addresses || []).length;
  user.addresses = (user.addresses || []).filter((a) => Number(a.id) !== Number(addressId));
  writeDB(db);
  return user.addresses.length < before;
}

// ---------- Sessions (server-side, token-based) ----------
export function createSession(userId) {
  const db = readDB();
  const token = crypto.randomBytes(32).toString("hex");
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  writeDB(db);
  return token;
}

export function findSession(token) {
  const db = readDB();
  const session = (db.sessions || []).find((s) => s.token === token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    db.sessions = db.sessions.filter((s) => s.token !== token);
    writeDB(db);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  const db = readDB();
  db.sessions = (db.sessions || []).filter((s) => s.token !== token);
  writeDB(db);
}
