# 🛍️ Nova Market — Full-Stack E-Commerce (NEAR UI Style)

A complete, production-style e-commerce store built as a full-stack app with a
**light, NEAR-designed** interface — the NEAR green `#00EC97`, NEAR blue
`#0072FF`, soft neutrals and Inter typography, and **zero dark theme**.

## ✨ Features

- 🏠 **Home** — hero with gradient headline, product collage, category tiles, bestsellers, deals, value props, newsletter
- 🛒 **Shop** — search, category/price/deal filters, sorting, live result counts
- 💚 **Wishlist** — save favorites from any product card
- 📦 **Product pages** — real photos, ratings, specs, quantity stepper, related products
- 🧺 **Cart** — slide-in drawer, quantity controls, free-shipping progress bar
- 💳 **Checkout** — validated multi-step form → order persists to the backend
- ✅ **Order confirmation** — receipt with order number
- 🔐 **User accounts** — sign up / sign in with hashed passwords (scrypt) and server-side sessions
- 📍 **Saved addresses** — save, remove, and one-click “Use at checkout” prefill
- 📦 **Order history** — every signed-in purchase is linked to your account
- 🛠️ **Admin panel** — add / edit / delete products with a live product table
- 🔥 32 seeded products with **realistic names, prices and real photos** across
  electronics, fashion, home, beauty, sports and accessories

## 🏗️ Architecture

```
├── server/            Express + JSON-database REST API (port 4000)
│   ├── index.js       Routes: products, categories, orders, admin CRUD
│   ├── db.js          File-backed data store (server/data/db.json)
│   └── seed.js        Seeds 32 products on first boot
├── client/            React + Vite SPA (port 5173)
│   └── src/           Components, pages, store (cart/wishlist/toasts), styles
└── package.json       Root scripts to run everything with one command
```

- **Client → API:** Vite proxies `/api` to `http://localhost:4000`.
- **Persistence:** products, orders, users and sessions live in `server/data/db.json`.
- **Auth:** passwords are hashed with `crypto.scrypt` + per-user salt; sessions are
  server-side bearer tokens (30-day expiry) sent as `Authorization: Bearer <token>`.
- **Cart & wishlist:** persisted in the browser (localStorage).

## 🚀 Getting started

```bash
# 1. Install dependencies (server, client, root)
npm run install:all

# 2. Run both servers together
npm run dev
```

Then open **http://localhost:5173**.

Run them separately if you prefer:

```bash
npm run dev:server   # API on http://localhost:4000
npm run dev:client   # frontend on http://localhost:5173
```

> **Note:** the API port is fixed at `4000` so the frontend proxy always works.
> Override only with `NOVA_PORT` (ambient `PORT` env vars are ignored).

## 📚 API reference

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/products` | List products (`?category=&search=&sort=&maxPrice=&badge=`) |
| GET | `/api/products/:id` | Single product |
| GET | `/api/categories` | Categories with counts |
| GET | `/api/orders` | All orders |
| GET | `/api/orders/:id` | Single order |
| POST | `/api/orders` | Create an order (links to user if signed in) |
| POST | `/api/auth/signup` | Create account → `{ token, user }` |
| POST | `/api/auth/login` | Sign in → `{ token, user }` |
| POST | `/api/auth/logout` | Invalidate the session |
| GET | `/api/auth/me` | Current user (auth) |
| GET | `/api/users/me` | Profile + addresses (auth) |
| GET | `/api/users/me/orders` | Order history for the signed-in user (auth) |
| GET | `/api/users/me/addresses` | Saved addresses (auth) |
| POST | `/api/users/me/addresses` | Add a saved address (auth) |
| DELETE | `/api/users/me/addresses/:id` | Remove a saved address (auth) |
| POST | `/api/products` | Add a product (admin) |
| PUT | `/api/products/:id` | Update a product (admin) |
| DELETE | `/api/products/:id` | Delete a product (admin) |

## 🎨 Design system

Styled with the **NEAR design system** in mind — light, airy, and human:

| Token | Value |
| ----- | ----- |
| NEAR Green | `#00EC97` |
| NEAR Blue | `#0072FF` |
| Ink (text) | `#2C2C2C` |
| Backgrounds | `#FFFFFF` / `#F6F7F9` |
| Signature gradient | `linear-gradient(120deg, #00EC97, #0072FF)` |
| Typeface | Inter |

---

Built with ❤️ and the NEAR color palette. *Photos courtesy of Unsplash.*
