/* RUNLU Deerfoot Flooring OS · Sales Drill-down Loader + Version Authority V0.3.11
   Keeps legacy feature modules from overwriting the current app version label. */
(function(){
  'use strict';
  const VERSION='V0.3.11 Sales Drill-down';
  const TITLE='RUNLU Deerfoot Flooring OS V0.3.11';

  function enforce(){
    const pill=document.querySelector('header .pill');
    if(pill && pill.textContent!==VERSION) pill.textContent=VERSION;
    if(document.title!==TITLE) document.title=TITLE;
  }

  function installAuthority(){
    if(window.__runluFlooringVersionAuthority0311){enforce();return;}
    window.__runluFlooringVersionAuthority0311=true;
    enforce();
    const pill=document.querySelector('header .pill');
    if(pill) new MutationObserver(enforce).observe(pill,{childList:true,subtree:true,characterData:true});
    const title=document.querySelector('title');
    if(title) new MutationObserver(enforce).observe(title,{childList:true,subtree:true,characterData:true});
    [350,700,1000,1400,2200].forEach(ms=>setTimeout(enforce,ms));
  }

  function loadCore(){
    if(document.querySelector('script[data-runlu-drilldown-core]'))return;
    const s=document.createElement('script');
    s.dataset.runluDrilldownCore='1';
    s.src='sales-drilldown-core-v011.js?v=0311-1';
    document.body.appendChild(s);
  }

  function boot(){installAuthority();loadCore();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
