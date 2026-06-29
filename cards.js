/*
 * ALLURE — shared product card rendering + global add-to-cart handler.
 * Loaded after store.js. Any element with [data-add="<id>"] adds to the cart.
 */
(function () {
  "use strict";

  function cardHTML(p) {
    return (
      '<article class="product-item">' +
      '  <a class="cat-img-link" href="product.html?id=' + p.id + '">' +
      '    <div class="cat-img"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy"></div>' +
      "  </a>" +
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

  // Global delegated add-to-cart: works on every page, for cards rendered now or later.
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    window.Store.addToCart(btn.dataset.add, 1);

    // brief feedback
    const original = btn.textContent;
    btn.textContent = "Added ✓";
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
    }, 900);
  });

  window.Catalog = { cardHTML: cardHTML, renderGrid: renderGrid };
})();
