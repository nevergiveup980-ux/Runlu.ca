/* RUNLU Deerfoot Flooring OS · V0.3.70.2 Navigation Dedup Guard
   Keeps the top navigation idempotent across layered incremental renderNav/install wrappers.
   No business data, storage schema, or page content changes.
   No MutationObserver; V0.3.63 remains the stable renderer rollback baseline. */
(function(){
'use strict';
if(window.__runluNavigationDedupV0702)return;
window.__runluNavigationDedupV0702=true;

function normalize(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase()}
function dedup(){
  const nav=document.getElementById('nav');
  if(!nav)return 0;
  const seen=new Set();
  let removed=0;
  Array.from(nav.querySelectorAll('button')).forEach(btn=>{
    const page=normalize(btn.dataset&&btn.dataset.page);
    const label=normalize(btn.textContent);
    const key=page?'page:'+page:'label:'+label;
    if(!label&&!page)return;
    if(seen.has(key)){btn.remove();removed++;return}
    seen.add(key);
  });
  return removed;
}

function patchRenderNav(){
  if(typeof window.renderNav!=='function')return;
  if(window.renderNav.__r702nav)return;
  const prior=window.renderNav;
  const wrapped=function(){
    const result=prior.apply(this,arguments);
    dedup();
    return result;
  };
  wrapped.__r702nav=1;
  window.renderNav=wrapped;
}

function install(){
  patchRenderNav();
  dedup();
  setTimeout(()=>{patchRenderNav();dedup()},0);
  setTimeout(()=>{patchRenderNav();dedup()},500);
}

window.RUNLUNavigationDedupV0702={install,dedup};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
