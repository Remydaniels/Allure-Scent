/*
 * ALLURE — shared store / cart engine
 *
 * Included on every page (after products.js + api.js). Owns cart state, wishlist
 * state, localStorage persistence, the slide-out cart drawer, and the nav
 * counters. Pages talk to it through window.Store and can listen for the
 * "cart:changed" and "wishlist:changed" events.
 *
 * Cart lines are keyed by product id + size, so the same fragrance in two sizes
 * are tracked as separate lines.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "allure_cart";
  const WISH_KEY = "allure_wishlist";
  const CUSTOM_KEY = "allure_custom_products";

  // Merge owner-added products (from the admin page) into the catalog.
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

  var products = (typeof window !== "undefined" && window.PRODUCTS) || [];

  function setProducts(list) {
    var copy = list.slice(); // guard against list === products aliasing
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

  // Unit price for a product at an optional size (variant).
  function unitPrice(product, size) {
    if (!product) return 0;
    if (size && Array.isArray(product.sizes)) {
      const s = product.sizes.find((v) => v.label === size);
      if (s) return s.price;
    }
    return product.price;
  }

  function sameLine(item, id, size) {
    return item.id === id && (item.size || "") === (size || "");
  }

  /* ---------- cart ---------- */

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
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

  function addToCart(id, qty, size) {
    if (!findProduct(id)) return;
    qty = Math.max(1, parseInt(qty, 10) || 1);
    const line = cart.find((i) => sameLine(i, id, size));
    if (line) line.qty += qty;
    else cart.push(size ? { id: id, qty: qty, size: size } : { id: id, qty: qty });
    saveCart();
    notifyAdded(id, size); // subtle toast + count pulse (does NOT open the cart)
  }

  function setQty(id, qty, size) {
    const line = cart.find((i) => sameLine(i, id, size));
    if (!line) return;
    qty = parseInt(qty, 10) || 0;
    if (qty <= 0) cart = cart.filter((i) => !sameLine(i, id, size));
    else line.qty = qty;
    saveCart();
  }

  function changeQty(id, delta, size) {
    const line = cart.find((i) => sameLine(i, id, size));
    if (line) setQty(id, line.qty + delta, size);
  }

  function removeFromCart(id, size) {
    cart = cart.filter((i) => !sameLine(i, id, size));
    saveCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  function count() {
    return cart.reduce((n, i) => n + i.qty, 0);
  }

  function subtotal() {
    return cart.reduce((sum, i) => {
      const p = findProduct(i.id);
      return sum + unitPrice(p, i.size) * i.qty;
    }, 0);
  }

  function getCart() {
    return cart
      .map((i) => {
        const p = findProduct(i.id);
        if (!p) return null;
        const u = unitPrice(p, i.size);
        return { product: p, size: i.size || "", qty: i.qty, unitPrice: u, lineTotal: u * i.qty };
      })
      .filter(Boolean);
  }

  /* ---------- wishlist ---------- */

  function loadWish() {
    try {
      const raw = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
      return Array.isArray(raw) ? raw.filter((id) => findProduct(id)) : [];
    } catch (e) {
      return [];
    }
  }

  let wish = loadWish();

  function saveWish() {
    localStorage.setItem(WISH_KEY, JSON.stringify(wish));
    renderWish();
    window.dispatchEvent(new CustomEvent("wishlist:changed", { detail: { wish } }));
  }

  function isWished(id) {
    return wish.indexOf(id) !== -1;
  }

  function toggleWishlist(id) {
    if (!findProduct(id)) return false;
    const i = wish.indexOf(id);
    let added;
    if (i === -1) { wish.push(id); added = true; }
    else { wish.splice(i, 1); added = false; }
    saveWish();
    const p = findProduct(id);
    toast(
      (p ? p.name : "Item") + (added ? " saved to your wishlist" : " removed from wishlist"),
      added ? "View wishlist" : null,
      added ? function () { window.location.href = "wishlist.html"; } : null
    );
    return added;
  }

  function wishCount() {
    return wish.length;
  }

  function getWishlist() {
    return wish.map(findProduct).filter(Boolean);
  }

  /* ---------- drawer + counters UI ---------- */

  function el(sel) { return document.querySelector(sel); }

  function openDrawer() { document.body.classList.add("showCart"); }
  function closeDrawer() { document.body.classList.remove("showCart"); }
  function toggleDrawer() { document.body.classList.toggle("showCart"); }

  function notifyAdded(id, size) {
    pulseCount();
    const p = findProduct(id);
    const label = (p ? p.name : "Item") + (size ? " (" + size + ")" : "");
    toast(label + " added to your cart", "View cart", openDrawer);
  }

  function pulseCount() {
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.classList.remove("bump");
      void node.offsetWidth;
      node.classList.add("bump");
    });
  }

  function toast(message, actionLabel, actionFn) {
    let t = document.getElementById("allureToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "allureToast";
      t.className = "allure-toast";
      document.body.appendChild(t);
    }
    t.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = message;
    t.appendChild(span);
    if (actionLabel) {
      const btn = document.createElement("button");
      btn.className = "allure-toast-action";
      btn.textContent = actionLabel;
      btn.addEventListener("click", function () {
        if (actionFn) actionFn();
        t.classList.remove("show");
      });
      t.appendChild(btn);
    }
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 3000);
  }

  function renderCount() {
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      node.textContent = count();
    });
  }

  function renderWish() {
    document.querySelectorAll("[data-wish-count]").forEach((node) => {
      node.textContent = wishCount();
    });
    const link = el("[data-wish-link]");
    if (link) link.classList.toggle("has-items", wishCount() > 0);
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
            '<div class="item" data-id="' + it.product.id + '" data-size="' + it.size + '">' +
            '  <div class="image"><img src="' + it.product.image + '" alt="' + it.product.name + '"></div>' +
            '  <div class="name">' + it.product.name +
              (it.size ? ' <span class="line-size">' + it.size + "</span>" : "") + "</div>" +
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
    renderWish();
    renderDrawer();
  }

  /* ---------- wiring ---------- */

  // Inject a wishlist icon into the nav (before the cart icon) on every page,
  // so we don't have to duplicate it across each HTML file.
  function injectWishIcon() {
    const cartBtn = el("[data-cart-toggle]");
    if (!cartBtn || el("[data-wish-link]")) return;
    const a = document.createElement("a");
    a.href = "wishlist.html";
    a.className = "wish-icon";
    a.setAttribute("data-wish-link", "");
    a.setAttribute("aria-label", "Wishlist");
    a.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' +
      '<span data-wish-count>0</span>';
    cartBtn.parentNode.insertBefore(a, cartBtn);
  }

  function init() {
    injectWishIcon();

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

    // quantity controls inside the drawer (event delegation, size-aware)
    const list = el("[data-cart-list]");
    if (list)
      list.addEventListener("click", function (e) {
        const itemEl = e.target.closest(".item");
        if (!itemEl) return;
        const id = itemEl.dataset.id;
        const size = itemEl.dataset.size || "";
        if (e.target.classList.contains("plus")) changeQty(id, 1, size);
        else if (e.target.classList.contains("minus")) changeQty(id, -1, size);
      });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });

    render();
    loadFromBackend();
  }

  function loadFromBackend() {
    if (!window.API || !window.API.hasBackend) return;
    window.API.getProducts().then(function (list) {
      if (!Array.isArray(list) || !list.length) return;
      setProducts(list);
      cart = loadCart();
      wish = loadWish();
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
    unitPrice: unitPrice,
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
    // wishlist
    isWished: isWished,
    toggleWishlist: toggleWishlist,
    getWishlist: getWishlist,
    wishCount: wishCount,
  };
})();
