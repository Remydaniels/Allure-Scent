# ALLURE — Perfume Storefront

A perfume shopping site that runs as a **pure static frontend** (host it anywhere —
Netlify, GitHub Pages, etc.). An optional Node/Express backend is included for
local use, but it is **not required**.

## Deploy to Netlify (static — recommended)

This site needs **no build step**. Deploy it one of two ways:

1. **Drag & drop:** zip the whole project folder (or just drag the folder) into
   the Netlify "Deploys" page. That's it.
2. **Git:** connect the repo. `netlify.toml` already sets it up
   (publish directory = project root, no build command).

Once live, everything works: browsing, search/filters, product pages, cart, and
checkout. Products come from `products.js`.

### Adding products on a static site
On the live site, open **`/admin.html`**, add your perfumes (saved in your
browser), then click **Export products.js**. Replace the `products.js` file in
the project with the downloaded one and redeploy — the new products are now live
for everyone. (This is the static-hosting workflow: there's no server database,
so the catalog lives in `products.js`.)

You can also just **double-click `index.html`** locally to preview without any
server.

## Optional: run the local Node backend

If you want a real database, image uploads, and saved orders **while developing
locally**, you can run the bundled server. (Netlify can't host this part.)

```bash
npm install        # first time only
# turn the backend on for the frontend:
#   in api.js set  BACKEND_ENABLED = true
npm start
```

Then open **http://localhost:3000**.

- Admin page: http://localhost:3000/admin.html
- Admin password: `Aderemi01@`
  (override with an env var, e.g. PowerShell: `$env:ADMIN_PASSWORD="your-secret"; npm start`)

## Optional backend — what it does

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
- `api.js` — data layer; static by default (set `BACKEND_ENABLED = true` to use the local server)
- `server.js` — optional Express backend (local only; not used on Netlify)
- `netlify.toml` — Netlify static deploy config
- `data/db.json` — created when the backend runs (products + orders); safe to delete to reset

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
