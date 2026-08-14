function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProductById(id);

  const root = document.getElementById("product-root");
  const notFound = document.getElementById("product-not-found");

  if (!product) {
    if (root) root.hidden = true;
    if (notFound) notFound.hidden = false;
    document.title = "Product Not Found · WWNT Robotics";
    return;
  }

  document.title = `${product.name} · WWNT Robotics`;

  const mainImage = document.getElementById("main-image");
  const thumbs = document.getElementById("image-thumbs");
  const title = document.getElementById("product-title");
  const tagline = document.getElementById("product-tagline");
  const price = document.getElementById("product-price");
  const description = document.getElementById("product-description");
  const specs = document.getElementById("product-specs");
  const githubLink = document.getElementById("github-link");
  const contactBlock = document.getElementById("contact-block");
  const stockBadge = document.getElementById("stock-badge");
  const categoryLabel = document.getElementById("product-category");
  const brandLabel = document.getElementById("product-brand");

  if (mainImage) {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
  }

  if (thumbs) {
    thumbs.innerHTML = product.images
      .map(
        (src, index) =>
          `<button type="button" class="thumb${index === 0 ? " is-active" : ""}" data-src="${src}" aria-label="View image ${index + 1}">
            <img src="${src}" alt="" />
          </button>`
      )
      .join("");

    thumbs.addEventListener("click", (event) => {
      const btn = event.target.closest(".thumb");
      if (!btn || !mainImage) return;
      mainImage.src = btn.dataset.src;
      thumbs.querySelectorAll(".thumb").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  }

  // 视频展示区域：只有产品有 video 字段时才显示
  const videoShowcase = document.getElementById("video-showcase");
  const videoContainer = document.getElementById("video-container");
  if (videoShowcase && videoContainer && product.video) {
    const poster = product.videoPoster || product.images[0];
    videoContainer.innerHTML = `
      <video 
        src="${product.video}"
        poster="${poster}"
        controls
        playsinline
        preload="metadata"
        class="showcase-video"
      ></video>
    `;
    videoShowcase.hidden = false;
  }

  if (title) title.textContent = product.name;
  if (tagline) tagline.textContent = product.tagline;
  if (price) price.textContent = formatPrice(product.price, product.currency, product.priceNote);
  if (description) description.textContent = product.description;
  if (categoryLabel) categoryLabel.textContent = CATEGORIES[product.category];
  if (brandLabel) brandLabel.textContent = product.brand;

  if (stockBadge) {
    stockBadge.textContent = product.inStock ? "In Stock – Ready to Ship" : "Pre-Order";
    stockBadge.className = `pill ${product.inStock ? "pill-success" : "pill-warn"}`;
  }

  if (specs) {
    specs.innerHTML = product.specs
      .map((item) => `<div class="spec-row"><span>${item.label}</span><strong>${item.value}</strong></div>`)
      .join("");
  }

  if (githubLink) {
    githubLink.href = product.github;
    githubLink.textContent = product.github.replace(/^https?:\/\//, "");
  }

  const inquiryBtn = document.querySelector('.product-actions .btn-primary');
  if (inquiryBtn) {
    inquiryBtn.href = `inquiry.html?product=${encodeURIComponent(product.name)}`;
  }

  const inquiryInput = document.getElementById("inquiry-product");
  if (inquiryInput) {
    inquiryInput.value = product.name;
  }

  const githubSecondary = document.getElementById("github-link-secondary");
  if (githubSecondary) {
    githubSecondary.href = product.github;
    githubSecondary.textContent = product.github;
  }

  if (contactBlock) {
    contactBlock.innerHTML = `
      <a href="mailto:${product.contact.email}" class="contact-item">
        <span class="contact-label">Email</span>
        <strong>${product.contact.email}</strong>
      </a>
      <a href="tel:${product.contact.phone.replace(/\s/g, "")}" class="contact-item">
        <span class="contact-label">Phone</span>
        <strong>${product.contact.phone}</strong>
      </a>
      <div class="contact-item">
        <span class="contact-label">WhatsApp</span>
        <strong>${product.contact.whatsapp}</strong>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderProductPage);

function submitInquiry() {
  const form = document.getElementById("inquiry-form");
  if (form) {
    form.submit();
  }
}
