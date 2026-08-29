/* RUNLU Deerfoot Flooring OS · V0.3.70 Pricing Link Safety
   Invalidates a captured pricing snapshot immediately when its Product Link changes.
   Loaded after Pricing Foundation; no schema changes. */
(function(){
'use strict';
if(window.__runluPricingLinkSafetyV070)return;
window.__runluPricingLinkSafetyV070=true;
function active(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function install(){
  document.addEventListener('change',ev=>{
    const s=ev.target?.closest?.('[data-r70-link]');if(!s)return;
    const j=active(),i=Number(s.dataset.r70Link);if(!j||!Array.isArray(j.items)||!j.items[i])return;
    const item=j.items[i],next=String(s.value||''),prev=String(item.productId||'');
    if(next!==prev)delete item.pricingSnapshotV070;
  },true);
}
window.RUNLUPricingLinkSafetyV070={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();