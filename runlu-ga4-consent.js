/* RUNLU GROWTH OS — privacy-first GA4 opt-in, homepage pilot. */
(function () {
  'use strict';
  var KEY = 'runlu_analytics_consent_v1';
  var ID = 'G-KVRWEFJMCR';
  var loaded = false;
  function getChoice() { try { return localStorage.getItem(KEY); } catch (_) { return null; } }
  function saveChoice(value) { try { localStorage.setItem(KEY, value); } catch (_) {} }
  function loadAnalytics() {
    if (loaded || getChoice() !== 'granted') return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(script);
  }
  function makeButton(label, callback) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.style.cssText = 'font:inherit;padding:9px 14px;border:1px solid currentColor;border-radius:7px;cursor:pointer;background:#fff;color:#182b3b';
    b.addEventListener('click', callback); return b;
  }
  function renderBanner() {
    if (document.getElementById('runlu-analytics-consent')) return;
    var panel = document.createElement('section'); panel.id = 'runlu-analytics-consent';
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Analytics privacy choices');
    panel.style.cssText = 'position:fixed;z-index:2147483000;bottom:12px;left:12px;right:12px;max-width:540px;margin:auto;background:#fdfcf8;color:#182b3b;border:1px solid #a6adb1;border-radius:12px;padding:16px;box-shadow:0 4px 24px #0003;font:15px/1.5 system-ui,sans-serif';
    var p = document.createElement('p'); p.style.margin = '0 0 12px';
    p.textContent = 'RUNLU uses optional Google Analytics to understand website traffic. We only enable it if you agree. / 润庐仅在您同意后启用可选的 Google Analytics 访问统计。';
    var links = document.createElement('div'); links.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;align-items:center';
    function choose(v) { saveChoice(v); panel.remove(); if (v === 'granted') loadAnalytics(); }
    links.appendChild(makeButton('Accept / 同意', function () { choose('granted'); }));
    links.appendChild(makeButton('Reject / 拒绝', function () { choose('denied'); }));
    var policy = document.createElement('a'); policy.href = '/privacy.html'; policy.textContent = 'Privacy / 隐私'; policy.style.color = '#174c91'; links.appendChild(policy);
    panel.appendChild(p); panel.appendChild(links); document.body.appendChild(panel);
  }
  function addSettings() {
    var footer = document.querySelector('footer'); if (!footer || document.getElementById('runlu-analytics-settings')) return;
    var btn = makeButton('Analytics choices / 统计设置', function () { renderBanner(); });
    btn.id = 'runlu-analytics-settings'; btn.style.margin = '8px'; footer.appendChild(btn);
  }
  function init() { addSettings(); if (getChoice() === 'granted') loadAnalytics(); else if (getChoice() !== 'denied') renderBanner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
