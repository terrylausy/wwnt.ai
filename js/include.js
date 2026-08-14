/**
 * 加载 partials/header.html 与 partials/footer.html 并注入到页面。
 * 各页面在 <body> 上设置 data-page="home|store" 以高亮当前导航。
 * 需通过本地静态服务器访问（file:// 下 fetch 不可用）。
 */
async function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const response = await fetch(url + "?v=20260840");
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  target.innerHTML = await response.text();
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;

  // Highlight every matching nav control (desktop toggle + mobile toggle)
  const matches = document.querySelectorAll(`[data-nav="${page}"]`);
  matches.forEach((el) => el.classList.add("is-active"));
}

function setupHelpDropdown() {
  /* ---- Desktop dropdown: hover + click ---- */
  const desktopDropdown = document.querySelector(".main-nav .nav-dropdown");
  if (desktopDropdown) {
    const toggle = desktopDropdown.querySelector(".nav-dropdown-toggle");
    let hoverTimer = null;

    const open = () => {
      clearTimeout(hoverTimer);
      desktopDropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      desktopDropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    // Click toggles (useful on touch laptops)
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      desktopDropdown.classList.contains("is-open") ? close() : open();
    });

    // Hover to open
    desktopDropdown.addEventListener("mouseenter", open);
    desktopDropdown.addEventListener("mouseleave", () => {
      hoverTimer = setTimeout(close, 150);
    });

    // Close when a menu link is clicked
    desktopDropdown.querySelectorAll(".nav-dropdown-item").forEach((item) => {
      item.addEventListener("click", () => close());
    });
  }

  /* ---- Click outside closes desktop dropdown ---- */
  document.addEventListener("click", (e) => {
    if (desktopDropdown && !desktopDropdown.contains(e.target)) {
      desktopDropdown.classList.remove("is-open");
      const t = desktopDropdown.querySelector(".nav-dropdown-toggle");
      if (t) t.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- Mobile accordion toggle ---- */
  document.querySelectorAll(".mobile-nav-dropdown").forEach((dd) => {
    const toggle = dd.querySelector(".mobile-nav-dropdown-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      const open = dd.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---- AI Live Chat trigger (desktop dropdown + mobile sidebar) ---- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest('[data-action="open-chat"]');
    if (!btn) return;
    e.preventDefault();

    // Close desktop dropdown
    if (desktopDropdown) desktopDropdown.classList.remove("is-open");

    // Close mobile sidebar if open
    if (window.__mobileMenu && window.__mobileMenu.close) {
      window.__mobileMenu.close();
    }

    // Open the chat widget (event + global fallback)
    document.dispatchEvent(new CustomEvent("wwnt:chat:open"));
    if (typeof window.wwntOpenChat === "function") window.wwntOpenChat();
  });
}

function setupScrollEffects() {
  const header = document.querySelector(".site-header");
  const backToTopBtn = document.getElementById("back-to-top");

  if (!header) return;

  let ticking = false;
  let lastScrollY = 0;
  const headerHeight = header.offsetHeight;

  const updateEffects = () => {
    const scrollY = window.scrollY;
    const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
    const isMobile = document.documentElement.classList.contains('mobile-active');

    // Mobile: header always visible, does not hide on scroll
    if (isMobile) {
      header.classList.add('visible');
      header.classList.remove('hidden');
    } else {
      // Header smart scroll: hide on scroll down, show immediately on scroll up
      if (scrollY > 50) {
        if (scrollDirection === 'up') {
          // Scrolling up, show header immediately
          header.classList.add('visible');
          header.classList.remove('hidden');
        } else {
          // Scrolling down, hide header
          header.classList.add('hidden');
          header.classList.remove('visible');
        }
      } else {
        // Near the top, always show header
        header.classList.add('visible');
        header.classList.remove('hidden');
      }
    }

    // Header scroll style
    if (scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Back to top button
    if (backToTopBtn) {
      if (scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateEffects);
      ticking = true;
    }
  }, { passive: true });

  // Back to top button click handler
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
}

async function includeLayout() {
  await Promise.all([
    loadPartial("partials/header.html", "site-header"),
    loadPartial("partials/footer.html", "site-footer"),
  ]);
  setActiveNav();
  setupHelpDropdown();
  setupScrollEffects();
  document.dispatchEvent(new CustomEvent("layout:ready"));

  // Auto-inject AI Live Chat widget on all pages (loaded once)
  if (!document.getElementById("wwnt-chat-widget")) {
    const s = document.createElement("script");
    s.src = "js/chat.js?v=20260840";
    s.defer = true;
    document.body.appendChild(s);
  }
}

includeLayout().catch((error) => {
  console.error("[include.js]", error.message);
  console.info("Please preview using a local static server, e.g.: python -m http.server 8080");
});