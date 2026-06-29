/*
 * ALLURE — admin page.
 *
 * Two modes, chosen automatically:
 *   • Backend mode (site served from the Node server): products and image
 *     uploads are saved to the server (data/db.json) and are instantly live for
 *     everyone. Requires the admin password.
 *   • Offline mode (file:// — opened by double-click): products are saved in
 *     this browser only; use "Export products.js" to make them permanent.
 */
(function () {
  "use strict";

  var CUSTOM_KEY = "allure_custom_products";
  var fmt = window.Store.formatNaira;
  var backend = !!(window.API && window.API.hasBackend);

  var form = document.getElementById("productForm");
  var addedList = document.getElementById("addedList");
  var addedCount = document.getElementById("addedCount");
  var modeEl = document.getElementById("adminMode");
  var clearBtn = document.getElementById("clearAllBtn");
  var exportBtn = document.getElementById("exportBtn");

  var f = {
    name: document.getElementById("name"),
    brand: document.getElementById("brand"),
    price: document.getElementById("price"),
    size: document.getElementById("size"),
    category: document.getElementById("category"),
    gender: document.getElementById("gender"),
    family: document.getElementById("family"),
    image: document.getElementById("image"),
    imageFile: document.getElementById("imageFile"),
    noteTop: document.getElementById("noteTop"),
    noteHeart: document.getElementById("noteHeart"),
    noteBase: document.getElementById("noteBase"),
    description: document.getElementById("description"),
  };

  var serverProducts = []; // populated in backend mode

  /* ---------- mode setup ---------- */
  var intro = document.getElementById("adminIntro");
  var addedTitle = document.getElementById("addedTitle");
  var addedHint = document.getElementById("addedHint");

  if (backend) {
    document.getElementById("adminAuth").hidden = false;
    document.getElementById("uploadRow").hidden = false;
    clearBtn.hidden = true; // not relevant when saving to the server
    modeEl.innerHTML = '<span class="mode-pill mode-online">Backend connected</span> Products save to the server and go live for everyone.';
    intro.innerHTML =
      "Fill in the details and click <strong>Add product</strong> — it saves to your server and goes live " +
      "for everyone instantly. Enter the admin password below first.";
    addedTitle.textContent = "Products on your store";
    addedHint.innerHTML =
      "Every product on your storefront is listed here. Use <strong>Export products.js</strong> any time to " +
      "download a full backup of the catalog.";
  } else {
    modeEl.innerHTML = '<span class="mode-pill mode-offline">Offline mode</span> Saved in this browser only — use “Export products.js” to make changes permanent.';
    // intro / addedTitle / addedHint keep their default (offline) wording from the HTML
  }

  /* ---------- admin password ---------- */
  if (backend) {
    var pwInput = document.getElementById("adminPw");
    var authState = document.getElementById("authState");
    pwInput.value = window.API.getAdminPassword();
    if (pwInput.value) authState.textContent = "Password set ✓";
    document.getElementById("savePw").addEventListener("click", function () {
      window.API.setAdminPassword(pwInput.value);
      authState.textContent = pwInput.value ? "Password set ✓" : "Cleared";
      flash("Admin password saved for this session.");
    });
  }

  /* ---------- offline storage helpers ---------- */
  function loadCustom() {
    try {
      var c = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      return Array.isArray(c) ? c : [];
    } catch (e) {
      return [];
    }
  }
  function saveCustom(list) {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
  }
  function uniqueId(base, taken) {
    var id = base || "product";
    var n = 2;
    while (taken.has(id)) id = base + "-" + n++;
    return id;
  }

  /* ---------- live preview ---------- */
  function updatePreview() {
    document.getElementById("previewName").textContent = f.name.value || "Product name";
    document.getElementById("previewPrice").textContent = fmt(parseInt(f.price.value, 10) || 0);
    document.getElementById("previewImg").src = f.image.value || "";
  }
  ["name", "price", "image"].forEach(function (k) {
    f[k].addEventListener("input", updatePreview);
  });

  /* ---------- image upload (backend) ---------- */
  if (backend && f.imageFile) {
    f.imageFile.addEventListener("change", function () {
      var file = f.imageFile.files[0];
      if (!file) return;
      if (!window.API.getAdminPassword()) {
        flash("Enter the admin password first, then choose the file again.");
        return;
      }
      flash("Uploading image…");
      window.API.uploadImage(file)
        .then(function (res) {
          f.image.value = res.url;
          updatePreview();
          flash("Image uploaded ✓");
        })
        .catch(function (err) {
          flash("Upload failed: " + err.message);
        });
    });
  }

  /* ---------- render the product list ---------- */
  function renderList(list) {
    addedCount.textContent = list.length;
    if (!list.length) {
      addedList.innerHTML = '<p class="admin-hint">No products yet.</p>';
      return;
    }
    addedList.innerHTML = list
      .map(function (p) {
        return (
          '<div class="added-row" data-id="' + p.id + '">' +
          '  <img src="' + p.image + '" alt="">' +
          '  <div class="added-info"><strong>' + p.name + "</strong><span>" + p.brand + " · " + fmt(p.price) + "</span></div>" +
          '  <button class="btn btn-sm btn-outline-danger" data-remove="' + p.id + '">Remove</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function refreshList() {
    if (backend) {
      window.API.getProducts().then(function (list) {
        serverProducts = list;
        renderList(list);
      });
    } else {
      renderList(loadCustom());
    }
  }

  /* ---------- remove ---------- */
  addedList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-remove]");
    if (!btn) return;
    var id = btn.dataset.remove;
    if (backend) {
      if (!window.confirm("Remove this product from the server?")) return;
      window.API.deleteProduct(id)
        .then(function () { refreshList(); flash("Product removed from the server."); })
        .catch(function (err) { flash("Could not remove: " + err.message); });
    } else {
      saveCustom(loadCustom().filter(function (p) { return p.id !== id; }));
      refreshList();
    }
  });

  /* ---------- add product ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var ok = true;
    [f.name, f.brand, f.price, f.image].forEach(function (field) {
      var valid = field.value.trim() !== "";
      if (field === f.price) valid = valid && parseInt(field.value, 10) > 0;
      field.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      form.querySelector(".is-invalid").focus();
      return;
    }

    var base = {
      name: f.name.value.trim(),
      brand: f.brand.value.trim(),
      price: parseInt(f.price.value, 10),
      image: f.image.value.trim(),
      category: f.category.value,
      gender: f.gender.value,
      family: f.family.value,
      size: f.size.value.trim() || "—",
      notes: { top: f.noteTop.value.trim(), heart: f.noteHeart.value.trim(), base: f.noteBase.value.trim() },
      description: f.description.value.trim(),
    };

    if (backend) {
      if (!window.API.getAdminPassword()) {
        flash("Enter the admin password first.");
        document.getElementById("adminPw").focus();
        return;
      }
      window.API.addProduct(base)
        .then(function (product) {
          form.reset();
          updatePreview();
          refreshList();
          flash("“" + product.name + "” saved to the server — it’s live now.");
        })
        .catch(function (err) { flash("Could not save: " + err.message); });
    } else {
      var taken = new Set((window.PRODUCTS || []).map(function (p) { return p.id; }));
      loadCustom().forEach(function (p) { taken.add(p.id); });
      base.id = uniqueId(slugify(base.name), taken);
      var list = loadCustom();
      list.push(base);
      saveCustom(list);
      if (!window.PRODUCTS.some(function (p) { return p.id === base.id; })) window.PRODUCTS.push(base);
      form.reset();
      updatePreview();
      refreshList();
      flash("“" + base.name + "” added — live on the shop in this browser.");
    }
  });

  /* ---------- export (works in both modes; a handy backup) ---------- */
  exportBtn.addEventListener("click", function () {
    var catalog = backend ? serverProducts : window.PRODUCTS;
    var header =
      "/*\n * ALLURE — product catalog (single source of truth)\n" +
      " * Generated by the admin page on " + new Date().toLocaleString() + ".\n" +
      " * Replace products.js with this file to set the default catalog.\n */\n";
    var body =
      "const PRODUCTS = " + JSON.stringify(catalog, null, 2) + ";\n\n" +
      'if (typeof window !== "undefined") window.PRODUCTS = PRODUCTS;\n' +
      'if (typeof module !== "undefined" && module.exports) module.exports = PRODUCTS;\n';

    var blob = new Blob([header + body], { type: "text/javascript" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    flash("products.js downloaded (" + catalog.length + " products).");
  });

  /* ---------- clear (offline only) ---------- */
  clearBtn.addEventListener("click", function () {
    if (!loadCustom().length) return;
    if (!window.confirm("Remove all products added in this browser?")) return;
    localStorage.removeItem(CUSTOM_KEY);
    refreshList();
    flash("Cleared browser-added products.");
  });

  /* ---------- tiny toast ---------- */
  function flash(msg) {
    var t = document.getElementById("adminToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "adminToast";
      t.className = "admin-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  updatePreview();
  refreshList();
})();
