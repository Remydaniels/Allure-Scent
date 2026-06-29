/*
 * ALLURE — Postgres data layer for the Vercel serverless API.
 *
 * Uses @vercel/postgres, which reads its connection from the POSTGRES_URL env
 * var that Vercel injects automatically when you attach a Postgres store.
 * Tables are created on first use and seeded once from products.js.
 */
const { sql } = require("@vercel/postgres");

let readyPromise = null;

function ensureReady() {
  if (!readyPromise) readyPromise = init();
  return readyPromise;
}

async function init() {
  await sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, doc JSONB NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    ref TEXT PRIMARY KEY,
    doc JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM products`;
  if (rows[0].n === 0) {
    let seed = [];
    try {
      seed = require("../products.js"); // exports the PRODUCTS array under Node
    } catch (e) {
      seed = [];
    }
    for (const p of seed) {
      await sql`INSERT INTO products (id, doc)
                VALUES (${p.id}, ${JSON.stringify(p)}::jsonb)
                ON CONFLICT (id) DO NOTHING`;
    }
  }
}

async function getProducts() {
  await ensureReady();
  const { rows } = await sql`SELECT doc FROM products ORDER BY doc->>'name'`;
  return rows.map((r) => r.doc);
}

async function addProduct(product) {
  await ensureReady();
  await sql`INSERT INTO products (id, doc)
            VALUES (${product.id}, ${JSON.stringify(product)}::jsonb)`;
  return product;
}

async function deleteProduct(id) {
  await ensureReady();
  const { rowCount } = await sql`DELETE FROM products WHERE id = ${id}`;
  return rowCount > 0;
}

async function addOrder(order) {
  await ensureReady();
  await sql`INSERT INTO orders (ref, doc)
            VALUES (${order.ref}, ${JSON.stringify(order)}::jsonb)`;
  return order;
}

async function getOrders() {
  await ensureReady();
  const { rows } = await sql`SELECT doc FROM orders ORDER BY created_at DESC`;
  return rows.map((r) => r.doc);
}

module.exports = { getProducts, addProduct, deleteProduct, addOrder, getOrders };
