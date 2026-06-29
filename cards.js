/*
 * ALLURE — shared product card rendering + global add-to-cart / wishlist handlers.
 * Loaded after store.js. [data-add="<id>"] adds to cart; [data-wish="<id>"] toggles wishlist.
 */
(function () {
  "use strict";

  var BADGE = { "new-arrivals": "New", "gift-sets": "Gift Set" };
  var HEART =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function cardHTML(p) {
    var badge = BADGE[p.category];
    var badgeClass = p.category === "gift-sets" ? "badge-gift" : "badge-new";
    var wished = window.Store.isWished(p.id);
    return (
      '<article class="product-item">' +
      (badge ? '  <span class="cat-badge ' + badgeClass + '">' + badge + "</span>" : "") +
      '  <button type="button" class="wish-btn' + (wished ? " is-wished" : "") +
        '" data-wish="' + p.id + '" aria-label="Toggle wishlist" aria-pressed="' + wished + '">' + HEART + "</button>" +
      '  <a class="cat-img-link" href="product.html?id=' + p.id + '">' +
      '    <div class="cat-img"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy"></div>' +
      "  </a>" +
      (p.brand ? '  <p class="cat-brand">' + p.brand + "</p>" : "") +
      '  <div class="cat-text"><a href="product.html?id=' + p.id + '">' + p.name + "</a></div>" +
      '  <div class="price-list">' + window.Store.formatNaira(p.price) + "</div>" +
      '  <button type="button" class="w-100 btn btn-sm btn-dark addCart" data-add="' + p.id + '">Add to cart</button>' +
      "</article>"
    );
  }

  function renderGrid(container, list) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML = '<p class="grid-empty">No products found.</p>';
      return;
    }
    container.innerHTML = list.map(cardHTML).join("");
  }

  // Global delegated add-to-cart.
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    window.Store.addToCart(btn.dataset.add, 1);

    const original = btn.textContent;
    btn.textContent = "Added ✓";
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
    }, 900);
  });

  // Global delegated wishlist toggle.
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-wish]");
    if (!btn) return;
    e.preventDefault();
    const added = window.Store.toggleWishlist(btn.dataset.wish);
    btn.classList.toggle("is-wished", added);
    btn.setAttribute("aria-pressed", String(added));
  });

  window.Catalog = { cardHTML: cardHTML, renderGrid: renderGrid };
})();
