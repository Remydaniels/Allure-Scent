# ALLURE — Perfume Storefront

A perfume shopping site with a **full backend** that runs on **Vercel** using
**Vercel Postgres** (products + orders saved in a real database). It also runs
locally with the bundled Express server, and degrades to a static site if no
backend is reachable.

## Deploy to Vercel (with backend + Postgres)

1. **Push the project to a Git repo** (GitHub/GitLab/Bitbucket) and in Vercel
   click **Add New → Project** and import it.
   - Framework preset: **Other** · Build command: **none** · Output dir: **`./`**
     (already set in `vercel.json`).
2. **Add a database:** in your Vercel project go to **Storage → Create Database →
   Postgres**, and connect it to the project. Vercel automatically adds the
   `POSTGRES_URL` (and related) environment variables — no copying needed.
3. **Set the admin password:** Project → **Settings → Environment Variables** →
   add `ADMIN_PASSWORD` = `Aderemi01@` (or any secret you prefer).
4. **Deploy.** On first load the database auto-creates its tables and seeds the
   12 starter products from `products.js`.

That's it — your store is live with a working admin and saved orders.

- Storefront: `https://<your-app>.vercel.app/`
- Admin: `https://<your-app>.vercel.app/admin.html` (enter the admin password,
  click **Use password**, then add/remove products — changes are live instantly).

> Images are added by **URL** (paste a link to a product photo). Serverless
> hosting has no persistent disk, so file uploads aren't used in this version.

## Run locally

```bash
npm install        # first time only
npm start          # starts the Express server (uses data/db.json)
```

Then open **http://localhost:3000** (admin password `Aderemi01@`, or set
`$env:ADMIN_PASSWORD` first). Locally the data is stored in `data/db.json`; on
Vercel it's stored in Postgres. You can also just **double-click `index.html`**
to preview as a static site (no server, catalog from `products.js`).

> Want a static-only deploy instead (e.g. Netlify, no database)? Set
> `BACKEND_ENABLED = false` in `api.js`; the catalog then comes from
> `products.js` and the admin saves to the browser with an **Export** workflow.

## API endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/products` | GET | — | List products |
| `/api/products` | POST | admin | Add a product |
| `/api/products/:id` | DELETE | admin | Remove a product |
| `/api/orders` | POST | — | Place an order |
| `/api/orders` | GET | admin | List orders |

Admin requests send the password in the `x-admin-password` header (the admin
page stores it for your session after you click **Use password**). The same
routes are served by the Vercel serverless functions in `api/` (Postgres) and by
the local Express server in `server.js` (`data/db.json`).

## Files

- `index.html` / `shop.html` / `product.html` / `checkout.html` / `admin.html` — pages
- `products.js` — default catalog (used statically, and to seed the database)
- `store.js` — cart engine + cart drawer
- `cards.js` — product card rendering + add-to-cart
- `api.js` — data layer (`BACKEND_ENABLED` toggles backend vs. static)
- `api/` — Vercel serverless functions (products, orders) backed by Postgres
- `lib/db.js` / `lib/auth.js` — Postgres data layer + admin auth for the functions
- `vercel.json` — Vercel deploy config
- `server.js` — local Express server (same API, uses `data/db.json`)
- `netlify.toml` — config for an optional static-only deploy

## Brand logos

The homepage "Brands we carry" strip shows a real logo for each brand if you put
an image file in `images/brands/` (see `images/brands/README.txt` for the exact
file names). If a file is missing it tries an online logo service, and if that
fails it shows the brand name as text — so it never looks broken.

## Notes / next steps

- The admin login is a single shared password (the `ADMIN_PASSWORD` env var).
  Fine to start with; for multiple staff you'd add real user accounts later.
- Checkout saves orders to the database but does **not** take payment yet. A
  provider like Paystack or Flutterwave (both support Naira) can be added next.
- File/image uploads aren't supported on serverless hosting (no persistent
  disk) — products use an image URL. Vercel Blob storage could add uploads later.
