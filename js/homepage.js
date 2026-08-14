// js/homepage.js
document.addEventListener('DOMContentLoaded', () => {

  // ✅ Safety check
  if (typeof PRODUCTS === 'undefined') {
    console.error('❌ PRODUCTS not loaded, please check data.js');
    return;
  }

  const hotGrid = document.getElementById('hot-grid');
  const featuredGrid = document.getElementById('featured-grid');
  const dealGrid = document.getElementById('deal-grid');

  if (!hotGrid || !featuredGrid) {
    console.error('❌ Product containers not found');
    return;
  }

  // ✅ Generic render function
  function render(container, list) {
    if (!list.length) {
      container.innerHTML = '<p class="text-center text-gray-400">No products available</p>';
      return;
    }

    container.innerHTML = list.map(p => `
      <article class="product-card reveal">
        <a href="product.html?id=${p.id}">
          <div class="product-image">
            <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
            ${p.badge ? `<span class="product-badge ${p.badgeType || ''}">${p.badge}</span>` : ''}
          </div>
          <div class="product-info">
            <div class="product-brand">${BRANDS[p.brand] || p.brand}</div>
            <h3 class="product-title">${p.name}</h3>
            <p class="product-desc">${(p.tagline || p.description).substring(0, 60)}...</p>
            <div class="product-footer">
              <span class="price-current">${window.formatPrice(p.price)}</span>
              ${p.originalPrice ? `<span class="price-discount">-${Math.round((1 - p.price / p.originalPrice) * 100)}%</span>` : ''}
            </div>
          </div>
        </a>
      </article>
    `).join('');

    // Scroll animation
    setTimeout(() => {
      container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 100);
  }

  // ✅ Filter logic (aligned with data.js)
  const hotProducts = PRODUCTS
    .filter(p => p.featured && p.badgeType === 'badge-hot')
    .slice(0, 3);

  const featuredProducts = PRODUCTS
    .filter(p => p.featured && p.badgeType !== 'badge-hot')
    .slice(0, 3);

  const dealProducts = PRODUCTS
    .filter(p => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 4);

  // ✅ Render
  render(hotGrid, hotProducts);
  render(featuredGrid, featuredProducts);

  if (dealGrid) {
    if (dealProducts.length) {
      render(dealGrid, dealProducts);
    } else {
      dealGrid.parentElement.style.display = 'none';
    }
  }

  console.log('✅ Homepage rendering complete');
});