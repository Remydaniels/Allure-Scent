/*
 * ALLURE — product detail page. Reads ?id= from the URL and renders the
 * product, size selector (if the product has variants), quantity selector,
 * add-to-cart, a wishlist toggle, and related products.
 * render() re-runs when the backend catalog loads (catalog:ready).
 */
(function () {
  "use strict";

  var detail = document.getElementById("productDetail");
  var crumb = document.querySelector("[data-crumb]");
  var relatedSection = document.getElementById("relatedSection");
  var relatedGrid = document.querySelector("[data-related]");
  var id = new URLSearchParams(window.location.search).get("id");

  var HEART =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function render() {
    var product = window.Store.findProduct(id);

    if (!product) {
      document.title = "Not found — ALLURE";
      detail.innerHTML =
        '<div class="not-found">' +
        "<h1>Product not found</h1>" +
        "<p>The fragrance you're looking for isn't available.</p>" +
        '<a class="btn btn-dark" href="shop.html">Back to shop</a>' +
        "</div>";
      return;
    }

    document.title = product.name + " — ALLURE";
    if (crumb) crumb.textContent = product.name;

    var n = product.notes || {};
    var hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

    // default selected size: the variant matching the base price, else the largest
    var selectedSize = null;
    if (hasSizes) {
      var def = product.sizes.filter(function (s) { return s.price === product.price; })[0] ||
        product.sizes[product.sizes.length - 1];
      selectedSize = def.label;
    }

    var wished = window.Store.isWished(product.id);

    detail.innerHTML =
      '<div class="product-detail">' +
      '  <div class="pd-image"><img src="' + product.image + '" alt="' + product.name + '"></div>' +
      '  <div class="pd-info">' +
      '    <p class="pd-brand">' + product.brand + "</p>" +
      "    <h1>" + product.name + "</h1>" +
      '    <p class="pd-meta">' + (hasSizes ? "" : product.size + " · ") +
          capitalize(product.gender) + " · " + capitalize(product.family) + "</p>" +
      '    <p class="pd-price" id="pdPrice">' +
          window.Store.formatNaira(window.Store.unitPrice(product, selectedSize)) + "</p>" +
      '    <p class="pd-desc">' + product.description + "</p>" +
      (hasSizes
        ? '    <div class="pd-sizes"><span class="pd-sizes-label">Size</span><div class="size-pills">' +
          product.sizes
            .map(function (s) {
              return '<button type="button" class="size-pill' + (s.label === selectedSize ? " is-active" : "") +
                '" data-size="' + s.label + '">' + s.label + "</button>";
            })
            .join("") +
          "</div></div>"
        : "") +
      (n.top || n.heart || n.base
        ? '    <div class="pd-notes">' +
          "      <h3>Scent notes</h3>" +
          "      <ul>" +
          (n.top ? "<li><strong>Top:</strong> " + n.top + "</li>" : "") +
          (n.heart ? "<li><strong>Heart:</strong> " + n.heart + "</li>" : "") +
          (n.base ? "<li><strong>Base:</strong> " + n.base + "</li>" : "") +
          "      </ul>" +
          "    </div>"
        : "") +
      '    <div class="pd-buy">' +
      '      <div class="qty-stepper">' +
      '        <button type="button" data-qty-minus aria-label="Decrease">−</button>' +
      '        <input type="number" id="pdQty" value="1" min="1" inputmode="numeric">' +
      '        <button type="button" data-qty-plus aria-label="Increase">+</button>' +
      "      </div>" +
      '      <button type="button" class="btn btn-dark btn-lg" id="pdAdd">Add to cart</button>' +
      '      <button type="button" class="pd-wish' + (wished ? " is-wished" : "") +
          '" id="pdWish" aria-label="Toggle wishlist" aria-pressed="' + wished + '">' +
          HEART + "<span>" + (wished ? "Saved" : "Save") + "</span></button>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    // size selector
    detail.querySelectorAll(".size-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        selectedSize = pill.dataset.size;
        detail.querySelectorAll(".size-pill").forEach(function (p) { p.classList.remove("is-active"); });
        pill.classList.add("is-active");
        document.getElementById("pdPrice").textContent =
          window.Store.formatNaira(window.Store.unitPrice(product, selectedSize));
      });
    });

    // quantity stepper
    var qtyInput = document.getElementById("pdQty");
    function clampQty() {
      var v = parseInt(qtyInput.value, 10);
      if (!v || v < 1) v = 1;
      qtyInput.value = v;
      return v;
    }
    detail.querySelector("[data-qty-minus]").addEventListener("click", function () {
      qtyInput.value = Math.max(1, clampQty() - 1);
    });
    detail.querySelector("[data-qty-plus]").addEventListener("click", function () {
      qtyInput.value = clampQty() + 1;
    });
    qtyInput.addEventListener("change", clampQty);

    document.getElementById("pdAdd").addEventListener("click", function () {
      window.Store.addToCart(product.id, clampQty(), selectedSize);
    });

    // wishlist toggle
    var pdWish = document.getElementById("pdWish");
    pdWish.addEventListener("click", function () {
      var added = window.Store.toggleWishlist(product.id);
      pdWish.classList.toggle("is-wished", added);
      pdWish.setAttribute("aria-pressed", String(added));
      pdWish.querySelector("span").textContent = added ? "Saved" : "Save";
    });

    // related: same family or category, excluding current
    var related = window.PRODUCTS.filter(function (p) {
      return p.id !== product.id && (p.family === product.family || p.category === product.category);
    }).slice(0, 6);

    if (related.length) {
      window.Catalog.renderGrid(relatedGrid, related);
      relatedSection.hidden = false;
    } else {
      relatedSection.hidden = true;
    }
  }

  render();
  window.addEventListener("catalog:ready", render);
})();
