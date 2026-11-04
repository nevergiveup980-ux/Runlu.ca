/* RUNLU Campaign Tracker v1 — privacy-first attribution foundation.
   No cookies, fingerprinting, network calls, or personal data collection.
   Events are local only until an approved analytics receiver is configured. */
(function () {
  "use strict";
  const allowed = /^[a-zA-Z0-9_-]{1,80}$/;
  const params = new URLSearchParams(window.location.search);
  const attribution = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = params.get(key);
    if (value && allowed.test(value)) attribution[key] = value;
  }
  const campaign = Object.freeze(attribution);
  document.addEventListener("click", function (event) {
    const link = event.target.closest && event.target.closest("a[data-runlu-store]");
    if (!link) return;
    const detail = {
      event: "runlu_store_click",
      book: "the-glass-throne",
      store: link.dataset.runluStore,
      campaign: campaign
    };
    window.dispatchEvent(new CustomEvent("runlu:campaign", { detail: detail }));
    // Intentionally does not transmit events. Wire an approved endpoint separately.
  });
  window.RUNLU_CAMPAIGN = Object.freeze({ book: "the-glass-throne", attribution: campaign });
})();
