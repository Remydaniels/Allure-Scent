/*
 * ALLURE — checkout page. Renders the order summary from the cart, validates
 * the shipping form, and on submit shows a confirmation and clears the cart.
 */
(function () {
  "use strict";

  var SHIPPING_FLAT = 3000;          // ₦ flat-rate delivery
  var FREE_SHIPPING_OVER = 300000;   // free delivery above this subtotal

  var fmt = window.Store.formatNaira;

  var body = document.getElementById("checkoutBody");
  var emptyState = document.getElementById("emptyState");
  var confirmation = document.getElementById("confirmation");
  var form = document.getElementById("checkoutForm");

  var summaryItems = document.querySelector("[data-summary-items]");
  var subtotalEl = document.querySelector("[data-summary-subtotal]");
  var shippingEl = document.querySelector("[data-summary-shipping]");
  var totalEl = document.querySelector("[data-summary-total]");

  function shippingFor(subtotal) {
    if (subtotal <= 0) return 0;
    return subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  }

  function renderSummary() {
    var items = window.Store.getCart();

    // toggle empty state
    if (items.length === 0) {
      body.hidden = true;
      emptyState.hidden = false;
      return false;
    }
    body.hidden = false;
    emptyState.hidden = true;

    summaryItems.innerHTML = items
      .map(function (it) {
        return (
          '<div class="summary-item">' +
          '  <img src="' + it.product.image + '" alt="' + it.product.name + '">' +
          '  <div class="summary-item-info">' +
          "    <span class=\"si-name\">" + it.product.name +
            (it.size ? ' <span class="si-size">' + it.size + "</span>" : "") + "</span>" +
          '    <span class="si-qty">Qty: ' + it.qty + "</span>" +
          "  </div>" +
          '  <span class="si-price">' + fmt(it.lineTotal) + "</span>" +
          "</div>"
        );
      })
      .join("");

    var subtotal = window.Store.subtotal();
    var shipping = shippingFor(subtotal);
    subtotalEl.textContent = fmt(subtotal);
    shippingEl.textContent = shipping === 0 ? "Free" : fmt(shipping);
    totalEl.textContent = fmt(subtotal + shipping);
    return true;
  }

  // Re-render if the cart changes while on this page (e.g. via the drawer),
  // or when the backend catalog finishes loading.
  window.addEventListener("cart:changed", function () {
    if (!confirmation.hidden) return; // already ordered
    renderSummary();
  });
  window.addEventListener("catalog:ready", function () {
    if (!confirmation.hidden) return;
    renderSummary();
  });

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // simple validation
    var ok = true;
    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (field) {
      var valid = field.value.trim() !== "";
      if (field.type === "email") valid = valid && validEmail(field.value.trim());
      field.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      form.querySelector(".is-invalid").focus();
      return;
    }
    var items = window.Store.getCart();
    if (items.length === 0) return;

    var email = document.getElementById("email").value.trim();
    var subtotal = window.Store.subtotal();
    var order = {
      customer: {
        name: document.getElementById("fullName").value.trim(),
        email: email,
        phone: document.getElementById("phone").value.trim(),
        city: document.getElementById("city").value.trim(),
        address: document.getElementById("address").value.trim(),
        notes: document.getElementById("notes").value.trim(),
      },
      items: items.map(function (it) {
        return {
          id: it.product.id,
          name: it.product.name,
          size: it.size || "",
          qty: it.qty,
          price: it.unitPrice,
        };
      }),
      total: subtotal + shippingFor(subtotal),
    };

    var btn = document.getElementById("placeOrder");
    btn.disabled = true;
    btn.textContent = "Placing order…";

    function showConfirmation(ref) {
      document.querySelector("[data-confirm-email]").textContent = email;
      document.querySelector("[data-confirm-ref]").textContent = ref;
      body.hidden = true;
      emptyState.hidden = true;
      confirmation.hidden = false;
      window.Store.clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Send to the backend when available; fall back to a local reference offline.
    if (window.API && window.API.hasBackend) {
      window.API.createOrder(order)
        .then(function (res) { showConfirmation(res.ref); })
        .catch(function () {
          // backend unreachable — still confirm so the customer isn't blocked
          showConfirmation("ALR-" + Date.now().toString(36).toUpperCase());
        });
    } else {
      showConfirmation("ALR-" + Date.now().toString(36).toUpperCase());
    }
  });

  // clear the invalid mark as the user fixes a field
  form.addEventListener("input", function (e) {
    if (e.target.classList.contains("is-invalid")) e.target.classList.remove("is-invalid");
  });

  renderSummary();
})();
