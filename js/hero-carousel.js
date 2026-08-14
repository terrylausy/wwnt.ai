/**
 * hero-carousel.js — Full-screen hero carousel
 * Features: auto-play / arrow nav / dot nav / keyboard / touch / cursor glow / counter animation
 */
(function () {
  "use strict";

  // ===== DOM =====
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-slide-dots .dot");
  var prevBtn = document.getElementById("carousel-prev");
  var nextBtn = document.getElementById("carousel-next");
  var contentEl = document.getElementById("hero-content");
  var banner = document.getElementById("hero-banner");
  var cursorGlow = document.getElementById("cursor-glow");
  var slideData = JSON.parse(
    document.getElementById("slide-data").textContent
  );

  // ===== State =====
  var current = 0;
  var timer = null;
  var INTERVAL = 6000;
  var touchStartX = 0;
  var isTransitioning = false;

  // ===== Core switch =====
  function goTo(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    slides[current].classList.remove("active");
    dots[current].classList.remove("active");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("active");
    dots[current].classList.add("active");

    updateContent(current);

    // Wait for CSS transition to finish
    setTimeout(function () {
      isTransitioning = false;
    }, 1300);
  }

  // ===== Update copy =====
  function updateContent(i) {
    var d = slideData[i];
    contentEl.querySelector(".slide-eyebrow").textContent = d.eyebrow;
    contentEl.querySelector("h1").innerHTML = d.title;
    contentEl.querySelector(".artistic-subtitle").textContent = d.artistic;
    contentEl.querySelector("p").textContent = d.desc;

    var badgesContainer = contentEl.querySelector(".slide-tech-badges");
    badgesContainer.innerHTML = d.badges
      .map(function (b) {
        if (b.value) {
          return (
            '<span class="tech-badge">' +
            b.label +
            ' <span class="badge-value">' +
            b.value +
            "</span></span>"
          );
        }
        return '<span class="tech-badge">' + b.label + "</span>";
      })
      .join("");
  }

  // ===== Auto-play =====
  function startTimer() {
    stopTimer();
    timer = setInterval(function () {
      goTo(current + 1);
    }, INTERVAL);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // ===== Event binding =====
  prevBtn.addEventListener("click", function () {
    goTo(current - 1);
    startTimer();
  });

  nextBtn.addEventListener("click", function () {
    goTo(current + 1);
    startTimer();
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goTo(parseInt(this.dataset.index, 10));
      startTimer();
    });
  });

  // Keyboard
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      goTo(current - 1);
      startTimer();
    } else if (e.key === "ArrowRight") {
      goTo(current + 1);
      startTimer();
    }
  });

  // Touch
  banner.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  banner.addEventListener(
    "touchend",
    function (e) {
      var diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
        startTimer();
      }
    },
    { passive: true }
  );

  // Pause on hover
  banner.addEventListener("mouseenter", stopTimer);
  banner.addEventListener("mouseleave", startTimer);

  // ===== Cursor glow follow =====
  if (cursorGlow) {
    banner.addEventListener("mousemove", function (e) {
      var rect = banner.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      cursorGlow.style.left = x + "px";
      cursorGlow.style.top = y + "px";
      cursorGlow.classList.add("visible");
    });

    banner.addEventListener("mouseleave", function () {
      cursorGlow.classList.remove("visible");
    });
  }

  // ===== Counter animation =====
  function animateCounters() {
    var counters = document.querySelectorAll("[data-count]");
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var duration = 2000; // 2 seconds
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // easeOutQuart
        var eased = 1 - Math.pow(1 - progress, 4);
        var currentVal = Math.floor(eased * target);
        el.textContent = currentVal;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Trigger once with IntersectionObserver
  var statsEl = document.querySelector(".hero-banner .hero-stats");
  if (statsEl) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounters();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsEl);
  }

  // ===== Start =====
  startTimer();
})();
