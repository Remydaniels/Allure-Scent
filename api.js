/*
 * ALLURE — data layer.
 *
 * This site is built to run as a PURE STATIC frontend (e.g. on Netlify), with
 * no server required. Products come from products.js (plus anything added on
 * the admin page, stored in the browser), and checkout confirms locally.
 *
 * Optional local backend:
 *   If you run the bundled Node server (npm start) and want the frontend to use
 *   it, set BACKEND_ENABLED to true below. Leave it false for static hosting.
 */
(function () {
  "use strict";

  // Backend is ON: the site talks to the serverless API at /api (Vercel) or the
  // local Express server. Over file:// (double-click) it auto-falls back to the
  // static products.js, so local preview still works without a server.
  var BACKEND_ENABLED = true;

  var isHttp = /^https?:$/.test(window.location.protocol);
  var useBackend = BACKEND_ENABLED && isHttp;

  function adminHeaders(extra) {
    var h = extra || {};
    var pw = sessionStorage.getItem("allure_admin_pw") || "";
    if (pw) h["x-admin-password"] = pw;
    return h;
  }

  function handleJson(r) {
    return r.json().then(function (data) {
      if (!r.ok) throw new Error(data && data.error ? data.error : "Request failed");
      return data;
    });
  }

  var API = {
    /** True only when a local backend is enabled AND reachable over http. */
    hasBackend: useBackend,

    setAdminPassword: function (pw) { sessionStorage.setItem("allure_admin_pw", pw || ""); },
    getAdminPassword: function () { return sessionStorage.getItem("allure_admin_pw") || ""; },

    /** Products from the server when enabled, otherwise the static catalog. */
    getProducts: function () {
      // Return COPIES of the static catalog so callers can't accidentally
      // mutate/clear window.PRODUCTS in place (see store.setProducts).
      if (!useBackend) return Promise.resolve((window.PRODUCTS || []).slice());
      return fetch("/api/products", { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .then(function (data) {
          // If the API yields nothing usable, fall back to the static catalog.
          return Array.isArray(data) && data.length ? data : (window.PRODUCTS || []).slice();
        })
        .catch(function () { return (window.PRODUCTS || []).slice(); });
    },

    addProduct: function (product) {
      return fetch("/api/products", {
        method: "POST",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(product),
      }).then(handleJson);
    },

    deleteProduct: function (id) {
      return fetch("/api/products/" + encodeURIComponent(id), {
        method: "DELETE",
        headers: adminHeaders(),
      }).then(handleJson);
    },

    uploadImage: function (file) {
      var fd = new FormData();
      fd.append("image", file);
      return fetch("/api/upload", { method: "POST", headers: adminHeaders(), body: fd }).then(handleJson);
    },

    createOrder: function (order) {
      return fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }).then(handleJson);
    },

    getOrders: function () {
      return fetch("/api/orders", { headers: adminHeaders() }).then(handleJson);
    },
  };

  window.API = API;
})();
