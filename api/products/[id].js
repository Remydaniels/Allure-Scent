/*
 * /api/products/:id  — DELETE (admin)
 * Vercel serverless function (dynamic route).
 */
const db = require("../../lib/db");
const { requireAdmin } = require("../../lib/auth");

module.exports = async (req, res) => {
  try {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", "DELETE");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!requireAdmin(req, res)) return;

    const id = req.query.id;
    const ok = await db.deleteProduct(id);
    if (!ok) return res.status(404).json({ error: "Not found." });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
