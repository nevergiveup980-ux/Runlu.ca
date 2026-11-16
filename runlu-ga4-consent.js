/* RUNLU GROWTH OS — privacy-first GA4 opt-in, homepage pilot. */
(function () {
  'use strict';
  var KEY = 'runlu_analytics_consent_v1';
  var ID = 'G-KVRWEFJMCR';
  var loaded = false;
  var scriptElement = null;
  var labels = {
    en: { description: 'RUNLU uses optional Google Analytics to understand website traffic. Analytics is off unless you agree.', accept: 'Accept', reject: 'Reject', privacy: 'Privacy', settings: 'Analytics choices' },
    zh: { description: '润庐使用可选的 Google Analytics 了解网站访问情况。只有您同意后才启用统计。', accept: '同意', reject: '拒绝', privacy: '隐私', settings: '统计设置' },
    fr: { description: 'RUNLU utilise Google Analytics uniquement avec votre accord pour mesurer les visites du site.', accept: 'Accepter', reject: 'Refuser', privacy: 'Confidentialité', settings: 'Choix analytiques' },
    es: { description: 'RUNLU utiliza Google Analytics solo con su consentimiento para medir las visitas al sitio.', accept: 'Aceptar', reject: 'Rechazar', privacy: 'Privacidad', settings: 'Opciones de análisis' }
  };
  function language() { var l = document.documentElement.lang || 'en'; return labels[l.split('-')[0]] ? l.split('-')[0] : 'en'; }
  function tr() { return labels[language()]; }
  function getChoice() { try { return localStorage.getItem(KEY); } catch (_) { return null; } }
  function saveChoice(value) { try { localStorage.setItem(KEY, value); } catch (_) {} }
  function loadAnalytics() {
    if (loaded || getChoice() !== 'granted') return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    scriptElement = document.createElement('script');
    scriptElement.async = true;
    scriptElement.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(scriptElement);
  }
  function revokeAnalytics() {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    }
    window['ga-disable-' + ID] = true;
    if (scriptElement && scriptElement.parentNode) scriptElement.parentNode.removeChild(scriptElement);
    /* Existing GA4 data already transmitted cannot be recalled. Reload to fully reset in-memory state. */
    if (loaded) window.location.reload();
  }
  function makeButton(label, callback) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.style.cssText = 'font:inherit;padding:9px 14px;border:1px solid currentColor;border-radius:7px;cursor:pointer;background:#fff;color:#182b3b';
    b.addEventListener('click', callback); return b;
  }
  function renderBanner() {
    if (document.getElementById('runlu-analytics-consent')) return;
    var panel = document.createElement('section'); panel.id = 'runlu-analytics-consent';
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', tr().settings);
    panel.style.cssText = 'position:fixed;z-index:2147483000;bottom:12px;left:12px;right:12px;max-width:540px;margin:auto;background:#fdfcf8;color:#182b3b;border:1px solid #a6adb1;border-radius:12px;padding:16px;box-shadow:0 4px 24px #0003;font:15px/1.5 system-ui,sans-serif';
    var p = document.createElement('p'); p.style.margin = '0 0 12px';
    p.textContent = tr().description;
    var links = document.createElement('div'); links.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;align-items:center';
    function choose(v) { saveChoice(v); panel.remove(); if (v === 'granted') loadAnalytics(); else revokeAnalytics(); }
    links.appendChild(makeButton(tr().accept, function () { choose('granted'); }));
    links.appendChild(makeButton(tr().reject, function () { choose('denied'); }));
    var policy = document.createElement('a'); policy.href = '/privacy.html'; policy.textContent = tr().privacy; policy.style.color = '#174c91'; links.appendChild(policy);
    panel.appendChild(p); panel.appendChild(links); document.body.appendChild(panel);
  }
  function addSettings() {
    var footer = document.querySelector('footer'); if (!footer || document.getElementById('runlu-analytics-settings')) return;
    var btn = makeButton(tr().settings, function () { renderBanner(); });
    btn.id = 'runlu-analytics-settings'; btn.style.margin = '8px'; footer.appendChild(btn);
  }
  function init() {
    addSettings();
    if (getChoice() === 'granted') loadAnalytics();
    else { window['ga-disable-' + ID] = true; if (getChoice() !== 'denied') renderBanner(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
