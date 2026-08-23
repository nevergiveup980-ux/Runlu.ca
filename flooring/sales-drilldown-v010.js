/* RUNLU Deerfoot Flooring OS · Sales Drill-down loader
   Feature-only module. Global app version/title are owned by the main Flooring OS shell. */
(function(){
  'use strict';

  function loadCore(){
    if(document.querySelector('script[data-runlu-drilldown-core]'))return;
    const s=document.createElement('script');
    s.dataset.runluDrilldownCore='1';
    s.src='sales-drilldown-core-v011.js?v=0311-1';
    document.body.appendChild(s);
  }

  function boot(){loadCore();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();