/*
 * ALLURE — landing page extras (carousel autoplay + infinite brand strip).
 * Cart and product rendering live in store.js / cards.js.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Auto-advance the hero carousel every 7s.
  var carouselEl = document.getElementById("carouselExampleIndicators");
  if (carouselEl && window.bootstrap) {
    var carousel = new bootstrap.Carousel(carouselEl, { interval: false });
    setInterval(function () { carousel.next(); }, 5000);
  }

  // Duplicate the brand strip so the marquee loops seamlessly.
  var slide = document.querySelector(".slide-item");
  var slides = document.querySelector(".slides");
  if (slide && slides) {
    slides.appendChild(slide.cloneNode(true));
  }
});
