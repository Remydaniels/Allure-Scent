/*
 * ALLURE — frontend API helper.
 *
 * Talks to the Express backend when the site is served over http(s). When the
 * site is opened directly from disk (file://) or the server is unreachable, the
 * catalog falls back to the static products.js, so the site always works.
 *
 * The admin password (for write operations) is kept in sessionStorage so it
 * isn't re-typed on every action; it never leaves this browser except as the
 * x-admin-password header to your own server.
 */
(function () {
  "use strict";

  var isHttp = /^https?:$/.test(window.location.protocol);

  function adminHeaders(extra) {
    var h = extra || {};
    var pw = sessionStorage.getItem("allure_admin_pw") || "";
    if (pw) h["x-admin-password"] = pw;
    return h;
  }

  var API = {
    /** True when a backend could be available (served over http). */
    hasBackend: isHttp,

    setAdminPassword: function (pw) {
      sessionStorage.setItem("allure_admin_pw", pw || "");
    },
    getAdminPassword: function () {
      return sessionStorage.getItem("allure_admin_pw") || "";
    },

    /** Products from the server, or the static catalog as a fallback. */
    getProducts: function () {
      if (!isHttp) return Promise.resolve(window.PRODUCTS || []);
      return fetch("/api/products", { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .catch(function () {
          return window.PRODUCTS || [];
        });
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
      return fetch("/api/upload", {
        method: "POST",
        headers: adminHeaders(),
        body: fd,
      }).then(handleJson);
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

  function handleJson(r) {
    return r.json().then(function (data) {
      if (!r.ok) throw new Error(data && data.error ? data.error : "Request failed");
      return data;
    });
  }

  window.API = API;
})();
