/**
 * Help Center interactions:
 *  - Sidebar topic navigation + scroll-spy active state
 *  - Search filter across FAQ items
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const sidebarLinks = Array.from(
      document.querySelectorAll(".help-sidebar-link")
    );
    const topicBlocks = Array.from(
      document.querySelectorAll(".help-topic-block")
    );
    const searchInput = document.getElementById("help-search-input");
    const faqItems = Array.from(document.querySelectorAll(".faq-item"));
    const quickCards = Array.from(document.querySelectorAll(".help-quick-card"));

    /* ---- Sidebar click: smooth scroll + active state ---- */
    sidebarLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const headerH =
              document.querySelector(".site-header")?.offsetHeight || 72;
            const y =
              target.getBoundingClientRect().top +
              window.pageYOffset -
              headerH -
              12;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }
      });
    });

    /* ---- Scroll-spy: highlight active sidebar link ---- */
    if ("IntersectionObserver" in window && topicBlocks.length) {
      const spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const topic = entry.target.dataset.topic;
              sidebarLinks.forEach(function (l) {
                l.classList.toggle(
                  "is-active",
                  l.dataset.topic === topic
                );
              });
            }
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      topicBlocks.forEach(function (b) {
        spy.observe(b);
      });
    }

    /* ---- Search filter ---- */
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const q = searchInput.value.trim().toLowerCase();
        let anyVisible = false;

        faqItems.forEach(function (item) {
          const text = item.textContent.toLowerCase();
          const match = q === "" || text.indexOf(q) !== -1;
          item.style.display = match ? "" : "none";
          if (match) anyVisible = true;
        });

        // Hide topic blocks whose all FAQ items are filtered out
        topicBlocks.forEach(function (block) {
          const visible = block.querySelectorAll(
            '.faq-item:not([style*="display: none"])'
          );
          block.style.display = visible.length ? "" : "none";
        });

        // Quick cards: dim non-matching
        quickCards.forEach(function (card) {
          const text = card.textContent.toLowerCase();
          card.style.opacity = q === "" || text.indexOf(q) !== -1 ? "1" : "0.4";
        });

        // Empty state
        let msg = document.getElementById("help-empty-state");
        if (!anyVisible && q !== "") {
          if (!msg) {
            msg = document.createElement("p");
            msg.id = "help-empty-state";
            msg.className = "help-empty-state";
            msg.innerHTML =
              'No results for "' +
              q +
              '". Try the AI chat in the corner or <a href="mailto:Support@wwntAI.com">email us</a>.';
            const content = document.querySelector(".help-content");
            if (content) content.appendChild(msg);
          }
          msg.style.display = "";
        } else if (msg) {
          msg.style.display = "none";
        }
      });
    }
  });
})();
