/*
 * ALLURE — product detail page. Reads ?id= from the URL and renders the
 * product, a quantity selector, an add-to-cart button, and related products.
 * render() re-runs when the backend catalog loads (catalog:ready).
 */
(function () {
  "use strict";

  var detail = document.getElementById("productDetail");
  var crumb = document.querySelector("[data-crumb]");
  var relatedSection = document.getElementById("relatedSection");
  var relatedGrid = document.querySelector("[data-related]");
  var id = new URLSearchParams(window.location.search).get("id");

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
    detail.innerHTML =
      '<div class="product-detail">' +
      '  <div class="pd-image"><img src="' + product.image + '" alt="' + product.name + '"></div>' +
      '  <div class="pd-info">' +
      '    <p class="pd-brand">' + product.brand + "</p>" +
      "    <h1>" + product.name + "</h1>" +
      '    <p class="pd-meta">' + product.size +
          " · " + capitalize(product.gender) +
          " · " + capitalize(product.family) + "</p>" +
      '    <p class="pd-price">' + window.Store.formatNaira(product.price) + "</p>" +
      '    <p class="pd-desc">' + product.description + "</p>" +
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
      "    </div>" +
      "  </div>" +
      "</div>";

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
      window.Store.addToCart(product.id, clampQty());
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
