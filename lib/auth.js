/*
 * ALLURE — admin auth for the serverless API.
 * Checks the x-admin-password header against the ADMIN_PASSWORD env var.
 * On Vercel, set ADMIN_PASSWORD in Project Settings → Environment Variables.
 */
function requireAdmin(req, res) {
  const expected = process.env.ADMIN_PASSWORD || "Aderemi01@";
  if ((req.headers["x-admin-password"] || "") !== expected) {
    res.status(401).json({ error: "Unauthorized — wrong admin password." });
    return false;
  }
  return true;
}

module.exports = { requireAdmin };
