/*
 * ALLURE — backend server (Node + Express)
 *
 * Serves the static site and a small REST API backed by a JSON file
 * (data/db.json). On first run it seeds products from products.js.
 *
 *   GET    /api/products          list products
 *   POST   /api/products          add a product            (admin)
 *   DELETE /api/products/:id      remove a product         (admin)
 *   POST   /api/upload            upload a product image   (admin)
 *   POST   /api/orders            place an order           (public)
 *   GET    /api/orders            list orders              (admin)
 *
 * Admin endpoints require the header  x-admin-password.
 * Default password is "allure-admin" — override with ADMIN_PASSWORD env var.
 */
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
// Admin password. Override at launch with an env var if you prefer not to keep
// it in source, e.g. (PowerShell):  $env:ADMIN_PASSWORD="…"; npm start
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Aderemi01@";

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");

/* ---------- storage ---------- */
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function seedProducts() {
  try {
    return require("./products.js"); // exports the PRODUCTS array under Node
  } catch (e) {
    return [];
  }
}

function loadDB() {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const seeded = { products: seedProducts(), orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (e) {
    return { products: [], orders: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();

/* ---------- helpers ---------- */
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
function uniqueId(base, taken) {
  let id = base || "product";
  let n = 2;
  while (taken.has(id)) id = base + "-" + n++;
  return id;
}
function requireAdmin(req, res, next) {
  if ((req.headers["x-admin-password"] || "") !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized — wrong admin password." });
  }
  next();
}

/* ---------- middleware ---------- */
app.use(express.json());

// image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + ext);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    cb(null, /^image\//.test(file.mimetype));
  },
});

/* ---------- product API ---------- */
app.get("/api/products", function (req, res) {
  res.json(db.products);
});

app.post("/api/products", requireAdmin, function (req, res) {
  const b = req.body || {};
  if (!b.name || !b.brand || !b.image || !(b.price > 0)) {
    return res.status(400).json({ error: "name, brand, image and a positive price are required." });
  }
  const taken = new Set(db.products.map((p) => p.id));
  const product = {
    id: uniqueId(slugify(b.name), taken),
    name: String(b.name).trim(),
    brand: String(b.brand).trim(),
    price: parseInt(b.price, 10),
    image: String(b.image).trim(),
    category: b.category === "gift-sets" ? "gift-sets" : "new-arrivals",
    gender: ["men", "women", "unisex"].includes(b.gender) ? b.gender : "unisex",
    family: b.family || "fresh",
    size: (b.size && String(b.size).trim()) || "—",
    notes: {
      top: (b.notes && b.notes.top) || "",
      heart: (b.notes && b.notes.heart) || "",
      base: (b.notes && b.notes.base) || "",
    },
    description: (b.description && String(b.description).trim()) || "",
  };
  db.products.push(product);
  saveDB(db);
  res.status(201).json(product);
});

app.delete("/api/products/:id", requireAdmin, function (req, res) {
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== req.params.id);
  if (db.products.length === before) return res.status(404).json({ error: "Not found." });
  saveDB(db);
  res.json({ ok: true });
});

/* ---------- image upload ---------- */
app.post("/api/upload", requireAdmin, upload.single("image"), function (req, res) {
  if (!req.file) return res.status(400).json({ error: "No image uploaded." });
  res.json({ url: "/uploads/" + req.file.filename });
});

/* ---------- order API ---------- */
app.post("/api/orders", function (req, res) {
  const b = req.body || {};
  if (!Array.isArray(b.items) || !b.items.length || !b.customer) {
    return res.status(400).json({ error: "Order needs items and customer details." });
  }
  const order = {
    ref: "ALR-" + Date.now().toString(36).toUpperCase(),
    date: new Date().toISOString(),
    customer: b.customer,
    items: b.items,
    total: b.total || 0,
  };
  db.orders.push(order);
  saveDB(db);
  res.status(201).json({ ref: order.ref });
});

app.get("/api/orders", requireAdmin, function (req, res) {
  res.json(db.orders);
});

/* ---------- static site ---------- */
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(__dirname));

app.listen(PORT, function () {
  console.log("ALLURE backend running at http://localhost:" + PORT);
  console.log("Admin password: " + ADMIN_PASSWORD + (process.env.ADMIN_PASSWORD ? " (from env)" : " (default)"));
});
