/*
 * ALLURE — shop page: reads filters from the URL, renders the grid, and keeps
 * the URL in sync so filtered views are shareable/bookmarkable.
 */
(function () {
  "use strict";

  var grid = document.querySelector("[data-grid]");
  var countEl = document.querySelector("[data-results-count]");
  var titleEl = document.getElementById("shopTitle");

  var inputs = {
    q: document.getElementById("filterSearch"),
    category: document.getElementById("filterCategory"),
    gender: document.getElementById("filterGender"),
    family: document.getElementById("filterFamily"),
    sort: document.getElementById("filterSort"),
  };

  var FAMILY_LABEL = {
    amber: "Amber", woody: "Earthy & Woody", floral: "Floral",
    fresh: "Fresh", fruity: "Fruity", spicy: "Warm & Spicy",
  };
  var CATEGORY_LABEL = { "new-arrivals": "New Arrivals", "gift-sets": "Gift Sets" };
  var GENDER_LABEL = { men: "Men's", women: "Women's", unisex: "Unisex" };

  // ---- seed filters from query string ----
  var params = new URLSearchParams(window.location.search);
  if (inputs.q) inputs.q.value = params.get("q") || "";
  if (inputs.category) inputs.category.value = params.get("category") || "";
  if (inputs.gender) inputs.gender.value = params.get("gender") || "";
  if (inputs.family) inputs.family.value = params.get("family") || "";
  if (inputs.sort) inputs.sort.value = params.get("sort") || "featured";

  function currentFilters() {
    return {
      q: (inputs.q.value || "").trim().toLowerCase(),
      category: inputs.category.value,
      gender: inputs.gender.value,
      family: inputs.family.value,
      sort: inputs.sort.value,
    };
  }

  function syncUrl(f) {
    var p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.category) p.set("category", f.category);
    if (f.gender) p.set("gender", f.gender);
    if (f.family) p.set("family", f.family);
    if (f.sort && f.sort !== "featured") p.set("sort", f.sort);
    var qs = p.toString();
    history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
  }

  function heading(f) {
    if (f.q) return 'Results for "' + f.q + '"';
    var parts = [];
    if (f.gender) parts.push(GENDER_LABEL[f.gender]);
    if (f.family) parts.push(FAMILY_LABEL[f.family]);
    if (f.category) parts.push(CATEGORY_LABEL[f.category]);
    return parts.length ? parts.join(" · ") : "Shop All";
  }

  function apply() {
    var f = currentFilters();
    var list = window.PRODUCTS.filter(function (p) {
      if (f.category && p.category !== f.category) return false;
      if (f.gender && p.gender !== f.gender) return false;
      if (f.family && p.family !== f.family) return false;
      if (f.q) {
        var hay = (p.name + " " + p.brand + " " + p.family).toLowerCase();
        if (hay.indexOf(f.q) === -1) return false;
      }
      return true;
    });

    if (f.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (f.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (f.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });

    window.Catalog.renderGrid(grid, list);
    if (titleEl) titleEl.textContent = heading(f);
    if (countEl) countEl.textContent = list.length + (list.length === 1 ? " product" : " products");
    syncUrl(f);
  }

  Object.keys(inputs).forEach(function (k) {
    var node = inputs[k];
    if (!node) return;
    node.addEventListener(k === "q" ? "input" : "change", apply);
  });

  // Re-render when the backend catalog replaces the static one.
  window.addEventListener("catalog:ready", apply);

  var resetBtn = document.getElementById("filterReset");
  if (resetBtn)
    resetBtn.addEventListener("click", function () {
      inputs.q.value = "";
      inputs.category.value = "";
      inputs.gender.value = "";
      inputs.family.value = "";
      inputs.sort.value = "featured";
      apply();
    });

  apply();
})();
