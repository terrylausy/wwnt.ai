(function () {
  'use strict';

  var MOBILE_BREAKPOINT = 768;
  var initialized = false;
  var menuInitialized = false;
  var carouselReady = false;
  var backToTopReady = false;
  var pollTimer = null;
  var isMenuOpen = false;

  function isMobileDevice() {
    var isNarrow = window.innerWidth <= MOBILE_BREAKPOINT;
    var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    var isMobileUA = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
    return isNarrow || (isMobileUA && isTouchDevice);
  }

  function applyMobileState() {
    var html = document.documentElement;
    if (isMobileDevice()) {
      if (!html.classList.contains('mobile-active')) {
        html.classList.add('mobile-active');
      }
    } else {
      if (html.classList.contains('mobile-active')) {
        html.classList.remove('mobile-active');
      }
    }
  }

  function openMenu() {
    var sidebar = document.getElementById('mobile-sidebar');
    var overlay = document.getElementById('mobile-sidebar-overlay');
    var menuBtn = document.getElementById('mobile-menu-btn');
    if (!sidebar || !overlay) return;
    
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.classList.add('no-scroll');
    if (menuBtn) {
      menuBtn.classList.add('menu-open');
      menuBtn.setAttribute('aria-label', 'Close menu');
    }
    isMenuOpen = true;
  }

  function closeMenu() {
    var sidebar = document.getElementById('mobile-sidebar');
    var overlay = document.getElementById('mobile-sidebar-overlay');
    var menuBtn = document.getElementById('mobile-menu-btn');
    if (!sidebar || !overlay) return;
    
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    if (menuBtn) {
      menuBtn.classList.remove('menu-open');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }
    isMenuOpen = false;
  }

  function toggleMenu() {
    if (!document.documentElement.classList.contains('mobile-active')) return;
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function setupHamburgerMenu() {
    if (menuInitialized) return true;

    var menuBtn = document.getElementById('mobile-menu-btn');
    var sidebar = document.getElementById('mobile-sidebar');
    var overlay = document.getElementById('mobile-sidebar-overlay');
    
    if (!menuBtn || !sidebar || !overlay) {
      return false;
    }

    // Use event delegation: listen on document to avoid duplicate binding
    document.addEventListener('click', function (e) {
      var target = e.target;

      // Hamburger menu button click
      if (target.closest && target.closest('#mobile-menu-btn')) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
        return;
      }

      // Close button click
      if (target.closest && target.closest('#mobile-sidebar-close')) {
        e.preventDefault();
        closeMenu();
        return;
      }

      // Overlay click
      if (target.id === 'mobile-sidebar-overlay') {
        e.preventDefault();
        closeMenu();
        return;
      }

      // In-menu nav link click
      var navLink = target.closest && target.closest('.mobile-nav .nav-link');
      if (navLink) {
        closeMenu();
        return;
      }
    });

    // ESC key to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    });

    // Expose API
    window.__mobileMenu = {
      open: openMenu,
      close: closeMenu,
      toggle: toggleMenu
    };

    menuInitialized = true;
    return true;
  }

  function setupMobileCarousel() {
    if (carouselReady) return;
    if (!document.documentElement.classList.contains('mobile-active')) return;

    var banner = document.getElementById('hero-banner');
    if (!banner) return;

    var touchStartX = 0;
    var touchStartY = 0;
    var isSwiping = false;
    var hasMoved = false;

    banner.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
      hasMoved = false;
    }, { passive: true });

    banner.addEventListener('touchmove', function (e) {
      if (!isSwiping) return;
      var dx = e.touches[0].clientX - touchStartX;
      var dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        hasMoved = true;
        e.preventDefault();
      }
    }, { passive: false });

    banner.addEventListener('touchend', function () {
      if (!isSwiping) return;
      isSwiping = false;
      if (!hasMoved) return;

      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        var direction = dx > 0 ? 'prev' : 'next';
        var event = new CustomEvent('hero-slide-change', { detail: { direction: direction } });
        document.dispatchEvent(event);
      }
    });

    carouselReady = true;
  }

  function setupBackToTop() {
    if (backToTopReady) return;

    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      requestAnimationFrame(function () {
        if (window.scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });

    backToTopReady = true;
  }

  // Footer accordion
  function setupFooterAccordion() {
    var footer = document.querySelector('.site-footer');
    if (!footer) return;

    var headings = footer.querySelectorAll('.footer-grid > div:not(.footer-brand) h4');
    headings.forEach(function (h4) {
      // Do not collapse the contact section
      if (h4.parentElement.querySelector('.footer-copyright')) return;

      h4.addEventListener('click', function () {
        var parent = h4.parentElement;
        var isExpanded = parent.classList.contains('expanded');

        // Close other expanded items
        footer.querySelectorAll('.footer-grid > div.expanded').forEach(function (item) {
          if (item !== parent) {
            item.classList.remove('expanded');
          }
        });

        // Toggle current item
        parent.classList.toggle('expanded');
      });
    });
  }

  function tryInitialize() {
    applyMobileState();
    var ok = setupHamburgerMenu();
    if (!ok) {
      if (!pollTimer) {
        pollTimer = setInterval(function () {
          var ok = setupHamburgerMenu();
          if (ok) {
            clearInterval(pollTimer);
            pollTimer = null;
            if (document.documentElement.classList.contains('mobile-active')) {
              setupMobileCarousel();
              setupBackToTop();
              setupFooterAccordion();
            }
          }
        }, 100);
      }
    } else {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (document.documentElement.classList.contains('mobile-active')) {
        setupMobileCarousel();
        setupBackToTop();
        setupFooterAccordion();
      }
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;

    tryInitialize();

    document.addEventListener('layout:ready', function () {
      // Do not reset menuInitialized to avoid duplicate binding
      carouselReady = false;
      backToTopReady = false;
      tryInitialize();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      applyMobileState();
    }, 200);
  });

  window.__mobileDebug = {
    reset: function () {
      initialized = false;
      menuInitialized = false;
      carouselReady = false;
      backToTopReady = false;
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }
  };
})();
