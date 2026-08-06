const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "nova-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// Called when any API request comes back 401 (e.g. expired session)
export let onUnauthorized = null;
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path.replace("/api", "")}`, {
  ...options,
  headers,
});
  // A 401 from a login attempt just means "wrong credentials" — don't treat it
  // as a session expiry (which would wipe a valid logged-in session).
  if (res.status === 401 && onUnauthorized && !path.startsWith("/api/auth")) onUnauthorized();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getProducts: (params = {}) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== "")
    ).toString();
    return request(`/api/products${q ? `?${q}` : ""}`);
  },
  getProduct: (id) => request(`/api/products/${id}`),
  getCategories: () => request("/api/categories"),
  createOrder: (payload) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: () => request("/api/orders"),
  getOrder: (id) => request(`/api/orders/${id}`),
  // Auth
  signup: (payload) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () =>
    request("/api/auth/logout", { method: "POST" }).catch(() => ({ ok: true })),
  me: () => request("/api/auth/me"),
  getAccount: () => request("/api/users/me"),
  getMyOrders: () => request("/api/users/me/orders"),
  getMyAddresses: () => request("/api/users/me/addresses"),
  addAddress: (payload) =>
    request("/api/users/me/addresses", { method: "POST", body: JSON.stringify(payload) }),
  deleteAddress: (id) =>
    request(`/api/users/me/addresses/${id}`, { method: "DELETE" }),
  // Admin
  addProduct: (p) =>
    request("/api/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id, p) =>
    request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
};

export const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(n) || 0);
