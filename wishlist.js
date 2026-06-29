/*
 * ALLURE — wishlist page. Renders saved products and re-renders when the
 * wishlist changes (e.g. the user un-hearts an item here) or the catalog loads.
 */
(function () {
  "use strict";

  var grid = document.querySelector("[data-wish-grid]");
  var empty = document.getElementById("wishEmpty");
  var countEl = document.querySelector("[data-wish-results]");

  function render() {
    var list = window.Store.getWishlist();
    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      if (countEl) countEl.textContent = "";
      return;
    }
    empty.hidden = true;
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " item" : " items");
    window.Catalog.renderGrid(grid, list);
  }

  window.addEventListener("wishlist:changed", render);
  window.addEventListener("catalog:ready", render);
  render();
})();
