(function () {
  /* Counter animation */
  function animateValue(el, start, end, duration) {
    const obj = document.getElementById(el);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Scroll-triggered animation */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".timeline-item").forEach((item) => {
    observer.observe(item);
  });

  /* Start */
  window.addEventListener("DOMContentLoaded", () => {
    animateValue("stat-sku", 0, 12, 1200);
    animateValue("stat-delivery", 0, 48, 1200);
    animateValue("stat-repos", 0, 18, 1400);
    animateValue("stat-years", 0, 4, 1000);
  });
})();