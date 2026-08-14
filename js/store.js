function productCardHtml(product) {
  const stockLabel = product.inStock
    ? `<span class="stock in-stock">In Stock</span>`
    : `<span class="stock out-of-stock">Pre-order</span>`;
  const badge = product.badge
    ? `<span class="product-badge">${product.badge}</span>`
    : "";

  return `
    <article class="product-card" data-id="${product.id}">
      <a href="product.html?id=${product.id}" class="product-card-link">
        <div class="product-card-media">
          ${badge}
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="product-card-body">
          <div class="product-card-meta">
            <span>${CATEGORIES[product.category] || product.category}</span>
            <span>${product.brand}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.tagline}</p>
          <div class="product-card-footer">
            <strong class="price">${formatPrice(product.price, product.currency, product.priceNote)}</strong>
            ${stockLabel}
          </div>
        </div>
      </a>
    </article>
  `;
}

function filterProducts({ search = "", category = "all", brand = "all", sort = "featured" } = {}) {
  let list = [...PRODUCTS];

  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (CATEGORIES[item.category] || "").includes(q)
    );
  }

  if (category !== "all") {
    list = list.filter((item) => item.category === category);
  }

  if (brand !== "all") {
    list = list.filter((item) => item.brand === brand);
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name, "en"));
      break;
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return list;
}

function renderActiveFilters({ search, category, brand }) {
  const chips = [];
  if (search.trim()) chips.push({ key: "search", label: `Search: ${search.trim()}` });
  if (category !== "all") chips.push({ key: "category", label: CATEGORIES[category] });
  if (brand !== "all") chips.push({ key: "brand", label: brand });

  const bar = document.getElementById("active-filters");
  const clearBtn = document.getElementById("clear-filters");
  if (!bar) return;

  if (!chips.length) {
    bar.hidden = true;
    bar.innerHTML = "";
    if (clearBtn) clearBtn.hidden = true;
    return;
  }

  bar.hidden = false;
  bar.innerHTML = chips
    .map(
      (chip) =>
        `<button type="button" class="filter-chip" data-remove="${chip.key}">${chip.label} <span aria-hidden="true">×</span></button>`
    )
    .join("");
  if (clearBtn) clearBtn.hidden = false;
}

function initStorePage() {
  const params = new URLSearchParams(window.location.search);
  const state = {
    search: params.get("q") || "",
    category: params.get("category") || "all",
    brand: params.get("brand") || "all",
    sort: params.get("sort") || "featured",
  };

  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("filter-category");
  const brandSelect = document.getElementById("filter-brand");
  const sortSelect = document.getElementById("sort-select");
  const grid = document.getElementById("product-grid");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const clearBtn = document.getElementById("clear-filters");
  const popularTags = document.querySelectorAll("[data-popular]");

  function fillSelect(select, options, selected) {
    if (!select) return;
    select.innerHTML = Object.entries(options)
      .map(([value, label]) => `<option value="${value}"${value === selected ? " selected" : ""}>${label}</option>`)
      .join("");
  }

  fillSelect(categorySelect, CATEGORIES, state.category);
  fillSelect(brandSelect, BRANDS, state.brand);
  fillSelect(sortSelect, SORT_OPTIONS, state.sort);
  if (searchInput) searchInput.value = state.search;

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.search.trim()) next.set("q", state.search.trim());
    if (state.category !== "all") next.set("category", state.category);
    if (state.brand !== "all") next.set("brand", state.brand);
    if (state.sort !== "featured") next.set("sort", state.sort);
    const qs = next.toString();
    history.replaceState(null, "", qs ? `?${qs}` : "store.html");
  }

  function render() {
    const list = filterProducts(state);
    if (resultCount) {
      resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    }
    renderActiveFilters(state);

    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;
    grid.innerHTML = list.map(productCardHtml).join("");
  }

  function update(partial) {
    Object.assign(state, partial);
    syncUrl();
    render();
  }

  searchInput?.addEventListener(
    "input",
    debounce(() => update({ search: searchInput.value }), 200)
  );
  categorySelect?.addEventListener("change", () => update({ category: categorySelect.value }));
  brandSelect?.addEventListener("change", () => update({ brand: brandSelect.value }));
  sortSelect?.addEventListener("change", () => update({ sort: sortSelect.value }));

  clearBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    update({ search: "", category: "all", brand: "all", sort: "featured" });
    if (categorySelect) categorySelect.value = "all";
    if (brandSelect) brandSelect.value = "all";
    if (sortSelect) sortSelect.value = "featured";
  });

  document.getElementById("active-filters")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove]");
    if (!btn) return;
    const key = btn.dataset.remove;
    if (key === "search") {
      if (searchInput) searchInput.value = "";
      update({ search: "" });
    } else if (key === "category") {
      if (categorySelect) categorySelect.value = "all";
      update({ category: "all" });
    } else if (key === "brand") {
      if (brandSelect) brandSelect.value = "all";
      update({ brand: "all" });
    }
  });

  popularTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      const value = tag.dataset.popular;
      if (searchInput) searchInput.value = value;
      update({ search: value });
    });
  });

  render();
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

document.addEventListener("DOMContentLoaded", initStorePage);
