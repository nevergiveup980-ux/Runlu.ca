/* RUNLU Deerfoot Flooring OS · V0.3.70.2 Navigation Guard
   Keeps the top navigation idempotent across layered incremental renderNav/install wrappers.
   Also enforces overflow-safe responsive centering across macOS/Windows browsers.
   No business data, storage schema, or page content changes.
   No MutationObserver; V0.3.63 remains the stable renderer rollback baseline. */
(function(){
'use strict';
if(window.__runluNavigationDedupV0702)return;
window.__runluNavigationDedupV0702=true;

function normalize(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase()}
function installResponsiveNavLayout(){
  if(document.getElementById('runlu-nav-responsive-layout-v072'))return;
  const style=document.createElement('style');
  style.id='runlu-nav-responsive-layout-v072';
  style.textContent=`
    #nav{
      display:flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      gap:2px;
      overflow-x:auto!important;
      overflow-y:hidden!important;
      white-space:nowrap!important;
      -webkit-overflow-scrolling:touch;
      overscroll-behavior-x:contain;
    }
    #nav>button{
      flex:0 0 auto!important;
    }
    #nav>button:first-child{
      margin-left:auto!important;
    }
    #nav>button:last-child{
      margin-right:auto!important;
    }
  `;
  document.head.appendChild(style);
}
function dedup(){
  const nav=document.getElementById('nav');
  if(!nav)return 0;
  const pages=new Set(),labels=new Set();
  let removed=0;
  Array.from(nav.querySelectorAll('button')).forEach(btn=>{
    const page=normalize(btn.dataset&&btn.dataset.page);
    const label=normalize(btn.textContent);
    if(!page&&!label)return;
    if((page&&pages.has(page))||(label&&labels.has(label))){btn.remove();removed++;return}
    if(page)pages.add(page);
    if(label)labels.add(label);
  });
  return removed;
}
function labelVersion(){
  try{
    document.title='RUNLU Deerfoot Flooring OS V0.3.70.2 Navigation Hotfix';
    const pill=document.querySelector('header .pill');
    if(pill)pill.textContent='V0.3.70.2 Nav Hotfix';
    const brand=document.querySelector('header .brand span');
    if(brand)brand.textContent='V0.3.63 stable renderer + complete workflow + Pricing Foundation';
  }catch(_){}
}
function patchRenderNav(){
  if(typeof window.renderNav!=='function')return;
  if(window.renderNav.__r702nav)return;
  const prior=window.renderNav;
  const wrapped=function(){
    const result=prior.apply(this,arguments);
    installResponsiveNavLayout();
    dedup();
    labelVersion();
    return result;
  };
  wrapped.__r702nav=1;
  window.renderNav=wrapped;
}
function install(){
  installResponsiveNavLayout();
  patchRenderNav();
  dedup();
  labelVersion();
  setTimeout(()=>{installResponsiveNavLayout();patchRenderNav();dedup();labelVersion()},0);
  setTimeout(()=>{installResponsiveNavLayout();patchRenderNav();dedup();labelVersion()},500);
}
window.RUNLUNavigationDedupV0702={install,dedup,installResponsiveNavLayout};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
