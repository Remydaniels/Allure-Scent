/*
 * ALLURE — shared store / cart engine
 *
 * Included on every page (after products.js). Owns cart state, localStorage
 * persistence, the slide-out cart drawer, and the nav cart count. Pages talk to
 * it through window.Store and can listen for the "cart:changed" event.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "allure_cart";
  const CUSTOM_KEY = "allure_custom_products";

  // Merge owner-added products (from the admin page) into the catalog.
  // Deduped by id so re-exporting into products.js never creates duplicates.
  (function mergeCustomProducts() {
    try {
      const base = window.PRODUCTS || [];
      const baseIds = new Set(base.map((p) => p.id));
      const custom = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      if (Array.isArray(custom)) {
        const extra = custom.filter((p) => p && p.id && !baseIds.has(p.id));
        window.PRODUCTS = base.concat(extra);
      }
    } catch (e) {
      /* ignore malformed data */
    }
  })();

  // NOTE: kept as a single array reference that we mutate in place, so closures
  // (findProduct, getCart, …) and other scripts always see the latest catalog.
  var products = (typeof window !== "undefined" && window.PRODUCTS) || [];

  function setProducts(list) {
    // Copy first: `list` may BE the same array as `products`/window.PRODUCTS
    // (e.g. the API fallback returns window.PRODUCTS), and clearing in place
    // would otherwise wipe the source before we copy it.
    var copy = list.slice();
    products.length = 0;
    for (var i = 0; i < copy.length; i++) products.push(copy[i]);
    window.PRODUCTS = products;
  }

  /* ---------- data helpers ---------- */

  function findProduct(id) {
    return products.find((p) => p.id === id) || null;
  }

  function formatNaira(amount) {
    return "₦" + Number(amount || 0).toLocaleString("en-NG");
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      // keep only entries that still map to a real product
      return Array.isArray(parsed)
        ? parsed.filter((i) => i && i.id && findProduct(i.id) && i.qty > 0)
        : [];
    } catch (e) {
      return [];
    }
  }

  let cart = loadCart();

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    render();
    window.dispatchEvent(new CustomEvent("cart:changed", { detail: { cart } }));
  }

  /* ---------- mutations ---------- */

  function addToCart(id, qty) {
    if (!findProduct(id)) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const line = cart.find((i) => i.id === id);
    if (line) line.qty += qty;
    else cart.push({ id: id, qty: qty });
    saveCart();
    openDrawer();
  }

  function setQty(id, qty) {
    const line = cart.find((i) => i.id === id);
    if (!line) return;
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) cart = cart.filter((i) => i.id !== id);
    else line.qty = qty;
    saveCart();
  }

  function changeQty(id, delta) {
    const line = cart.find((i) => i.id === id);
    if (line) setQty(id, line.qty + delta);
  }

  function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  /* ---------- totals ---------- */

  function count() {
    return cart.reduce((n, i) => n + i.qty, 0);
  }

  function subtotal() {
    return cart.reduce((sum, i) => {
      const p = findProduct(i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }

  function getCart() {
    // hydrated copy: cart lines joined with product data
    return cart
      .map((i) => {
        const p = findProduct(i.id);
        return p ? { product: p, qty: i.qty, lineTotal: p.price * i.qty } : null;
      })
      .filter(Boolean);
  }

  /* ---------- drawer UI ---------- */

  function el(sel) {
    return document.querySelector(sel);
  }

  function openDrawer() {
    document.body.classList.add("showCart");
  }
  function closeDrawer() {
    document.body.classList.remove("showCart");
  }
  function toggleDrawer() {
    document.body.classList.toggle("showCart");
  }

  function renderCount() {
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = count();
    });
  }

  function renderDrawer() {
    const list = el("[data-cart-list]");
    if (!list) return;
    const items = getCart();

    if (items.length === 0) {
      list.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    } else {
      list.innerHTML = items
        .map(function (it) {
          return (
            '<div class="item" data-id="' + it.product.id + '">' +
            '  <div class="image"><img src="' + it.product.image + '" alt="' + it.product.name + '"></div>' +
            '  <div class="name">' + it.product.name + "</div>" +
            '  <div class="totalprice">' + formatNaira(it.lineTotal) + "</div>" +
            '  <div class="quantity">' +
            '    <span class="minus" aria-label="Decrease quantity">−</span>' +
            "    <span>" + it.qty + "</span>" +
            '    <span class="plus" aria-label="Increase quantity">+</span>' +
            "  </div>" +
            "</div>"
          );
        })
        .join("");
    }

    const totalNode = el("[data-cart-total]");
    if (totalNode) totalNode.textContent = formatNaira(subtotal());

    const checkoutBtn = el("[data-checkout]");
    if (checkoutBtn) checkoutBtn.disabled = items.length === 0;
  }

  function render() {
    renderCount();
    renderDrawer();
  }

  /* ---------- wiring ---------- */

  function init() {
    // open via any cart icon
    document.querySelectorAll("[data-cart-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleDrawer);
    });

    const closeBtn = el("[data-cart-close]");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    const overlay = el("[data-cart-overlay]");
    if (overlay) overlay.addEventListener("click", closeDrawer);

    const checkoutBtn = el("[data-checkout]");
    if (checkoutBtn)
      checkoutBtn.addEventListener("click", function () {
        if (getCart().length) window.location.href = "checkout.html";
      });

    // quantity controls inside the drawer (event delegation)
    const list = el("[data-cart-list]");
    if (list)
      list.addEventListener("click", function (e) {
        const itemEl = e.target.closest(".item");
        if (!itemEl) return;
        const id = itemEl.dataset.id;
        if (e.target.classList.contains("plus")) changeQty(id, 1);
        else if (e.target.classList.contains("minus")) changeQty(id, -1);
      });

    // close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    render();
    loadFromBackend();
  }

  // If a backend is available, replace the static catalog with the live one and
  // let pages know (catalog:ready) so they can re-render with server data.
  function loadFromBackend() {
    if (!window.API || !window.API.hasBackend) return;
    window.API.getProducts().then(function (list) {
      if (!Array.isArray(list) || !list.length) return;
      setProducts(list);
      cart = loadCart(); // re-filter cart against the fresh catalog
      render();
      window.dispatchEvent(new CustomEvent("catalog:ready", { detail: { products: products } }));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- public API ---------- */
  window.Store = {
    products: products,
    findProduct: findProduct,
    formatNaira: formatNaira,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    setQty: setQty,
    changeQty: changeQty,
    clearCart: clearCart,
    getCart: getCart,
    count: count,
    subtotal: subtotal,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
  };
})();
