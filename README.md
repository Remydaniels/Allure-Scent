# ALLURE — Perfume Storefront

A perfume shopping site with a static frontend and an optional Node/Express backend.

## Two ways to run it

### 1. Simple (no backend)
Just **double-click `index.html`**. Everything works: browsing, search/filters,
product pages, cart, and checkout. Products come from `products.js`. Items added
on the admin page are saved in your browser; use **Export products.js** to make
them permanent.

### 2. Full (with backend) — recommended
Runs a real server so products, image uploads, and orders are saved to a database
(`data/db.json`) and are live for everyone.

```bash
npm install     # first time only
npm start
```

Then open **http://localhost:3000** in your browser.

- Admin page: http://localhost:3000/admin.html
- Admin password: `Aderemi01@`
  (override it by setting an env var before starting, e.g. on Windows PowerShell:
  `$env:ADMIN_PASSWORD="your-secret"; npm start`)

## What the backend does

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/products` | GET | — | List products |
| `/api/products` | POST | admin | Add a product |
| `/api/products/:id` | DELETE | admin | Remove a product |
| `/api/upload` | POST | admin | Upload a product image |
| `/api/orders` | POST | — | Place an order |
| `/api/orders` | GET | admin | List orders |

Admin requests send the password in the `x-admin-password` header (the admin
page stores it for your session after you click **Use password**).

## Files

- `index.html` / `shop.html` / `product.html` / `checkout.html` / `admin.html` — pages
- `products.js` — default catalog (used when there's no backend, and to seed the DB)
- `store.js` — cart engine + cart drawer
- `cards.js` — product card rendering + add-to-cart
- `api.js` — talks to the backend, falls back to `products.js` offline
- `server.js` — Express backend
- `data/db.json` — created on first run (products + orders); safe to delete to reset

## Brand logos

The homepage "Brands we carry" strip shows a real logo for each brand if you put
an image file in `images/brands/` (see `images/brands/README.txt` for the exact
file names). If a file is missing it tries an online logo service, and if that
fails it shows the brand name as text — so it never looks broken.

## Notes / next steps

- The admin login is a simple shared password — fine for local use. For a public
  store, deploy the backend (e.g. Render/Railway) and add proper user accounts.
- Checkout records orders but does **not** take payment yet. A payment provider
  like Paystack or Flutterwave (both support Naira) can be added next.
