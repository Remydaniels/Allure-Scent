/*
 * /api/orders  — POST (place order)  ·  GET (list, admin)
 * Vercel serverless function.
 */
const db = require("../../lib/db");
const { requireAdmin } = require("../../lib/auth");

module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
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
      await db.addOrder(order);
      return res.status(201).json({ ref: order.ref });
    }

    if (req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      const orders = await db.getOrders();
      return res.status(200).json(orders);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
};
