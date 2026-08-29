/* RUNLU Deerfoot Flooring OS · V0.3.70 Pricing Link Safety
   V0.3.70.2 production hotfix loader also attaches the Navigation Dedup Guard.
   Pricing snapshot semantics remain unchanged; original V0.3.70 copy is preserved separately. */
(function(){
'use strict';
if(window.__runluPricingLinkSafetyV070)return;
window.__runluPricingLinkSafetyV070=true;
function active(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function installLinkSafety(){
  if(window.__runluPricingLinkSafetyListenerV070)return;
  window.__runluPricingLinkSafetyListenerV070=true;
  document.addEventListener('change',ev=>{
    const s=ev.target?.closest?.('[data-r70-link]');if(!s)return;
    const j=active(),i=Number(s.dataset.r70Link);if(!j||!Array.isArray(j.items)||!j.items[i])return;
    const item=j.items[i],next=String(s.value||''),prev=String(item.productId||'');
    if(next!==prev)delete item.pricingSnapshotV070;
  },true);
}
function loadNavGuard(){
  if(window.RUNLUNavigationDedupV0702){window.RUNLUNavigationDedupV0702.install?.();return}
  if(document.getElementById('runlu-nav-dedup-v0702'))return;
  const s=document.createElement('script');
  s.id='runlu-nav-dedup-v0702';
  s.src='navigation-dedup-v0702.js?v=0702&t='+Date.now();
  s.onload=()=>window.RUNLUNavigationDedupV0702?.install?.();
  s.onerror=()=>console.error('V0.3.70.2 Navigation Dedup Guard failed to load.');
  document.body.appendChild(s);
}
function install(){installLinkSafety();loadNavGuard()}
window.RUNLUPricingLinkSafetyV070={install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
