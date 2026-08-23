/* RUNLU Deerfoot Flooring OS · Version Authority V0.3.13 · observer-free */
(function(){
  'use strict';
  const VERSION='V0.3.13 Pricing + System Settings';
  const TITLE='RUNLU Deerfoot Flooring OS V0.3.13';

  function setVersion(){
    const pill=document.querySelector('header .pill');
    if(pill&&pill.textContent!==VERSION)pill.textContent=VERSION;
    if(document.title!==TITLE)document.title=TITLE;
  }

  function boot(){
    if(window.__runluFlooringVersionAuthority0313)return;
    window.__runluFlooringVersionAuthority0313=true;
    setVersion();
    window.addEventListener('pageshow',setVersion);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();