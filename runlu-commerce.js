(() => {
  const cfg = window.RUNLUCommerceConfig;
  if (!cfg || !cfg.products) return;

  function validCheckout(url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return false;
      if (cfg.provider === "stripe") {
        return parsed.hostname === "buy.stripe.com";
      }
      if (cfg.provider === "lemonsqueezy") {
        const hostOk = parsed.hostname === "lemonsqueezy.com" || parsed.hostname.endsWith(".lemonsqueezy.com");
        return hostOk && parsed.pathname.includes("/checkout/buy/");
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  function apply() {
    document.querySelectorAll("[data-commerce-buy]").forEach((el) => {
      const key = el.dataset.commerceBuy;
      const product = cfg.products[key];
      const live = !!(product && product.enabled && validCheckout(product.checkoutUrl));

      if (!live) {
        el.setAttribute("aria-disabled", "true");
        if (el.tagName === "A") el.setAttribute("href", "#");
        el.onclick = (event) => event.preventDefault();
        return;
      }

      el.setAttribute("href", product.checkoutUrl);
      el.removeAttribute("aria-disabled");
      el.onclick = null;
      el.classList.remove("disabled-buy");
      if (!el.classList.contains("button")) el.classList.add("button", "primary");
      el.dataset.en = "Buy Now · " + product.price;
      el.dataset.zh = "立即购买 · " + product.price;
      el.dataset.fr = "Acheter · " + product.price;
      el.dataset.es = "Comprar ahora · " + product.price;
      const lang = document.documentElement.dataset.runluLanguage || "en";
      el.textContent = el.dataset[lang] || el.dataset.en;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();

  window.addEventListener("runlu:languagechange", apply);
})();
