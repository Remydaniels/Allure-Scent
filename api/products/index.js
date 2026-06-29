/*
 * /api/products  — GET (list)  ·  POST (add, admin)
 * Vercel serverless function.
 */
const db = require("../../lib/db");
const { requireAdmin } = require("../../lib/auth");

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const products = await db.getProducts();
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;

      const b = req.body || {};
      if (!b.name || !b.brand || !b.image || !(b.price > 0)) {
        return res
          .status(400)
          .json({ error: "name, brand, image and a positive price are required." });
      }

      const existing = await db.getProducts();
      const taken = new Set(existing.map((p) => p.id));
      const base = slugify(b.name) || "product";
      let id = base;
      let n = 2;
      while (taken.has(id)) id = base + "-" + n++;

      const product = {
        id: id,
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

      await db.addProduct(product);
      return res.status(201).json(product);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
