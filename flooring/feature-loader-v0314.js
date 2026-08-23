/* RUNLU Deerfoot Flooring OS · Feature Loader V0.3.14
   Keep the base workspace interactive first, then attach feature modules sequentially.
   This mirrors the stable module-isolation test and prevents parser-blocking add-ons from freezing the desktop shell. */
(function(){
  'use strict';
  if(window.__runluFeatureLoader0314)return;
  window.__runluFeatureLoader0314=true;

  const FEATURES=[
    'invoice-checks-v022.js?v=024',
    'showroom-v010.js?v=010',
    'po-supplier-orders-v010.js?v=010',
    'po-training-reset-v011.js?v=013',
    'supplier-pickup-v010.js?v=010',
    'sales-v010.js?v=010',
    'sales-handover-v012.js?v=013',
    'sales-handover-sync-v013.js?v=018',
    'service-claims-v010.js?v=012',
    'sales-drilldown-v010.js?v=0312-2',
    'system-settings-v010.js?v=010',
    'flooring-version-v0313.js?v=001'
  ];

  const state={loaded:[],failed:[],current:''};
  window.runluFeatureLoadState=state;

  function loadOne(src){
    return new Promise(resolve=>{
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.dataset.runluFeatureLoader='0314';
      state.current=src;
      s.onload=()=>{state.loaded.push(src);state.current='';resolve();};
      s.onerror=()=>{state.failed.push(src);state.current='';console.error('RUNLU feature failed to load:',src);resolve();};
      document.body.appendChild(s);
    });
  }

  async function start(){
    // Yield once so the base app can paint and accept input before add-ons begin.
    await new Promise(r=>setTimeout(r,0));
    for(const src of FEATURES){
      await loadOne(src);
      // Give Safari an event-loop turn between modules.
      await new Promise(r=>setTimeout(r,0));
    }
    window.dispatchEvent(new CustomEvent('runlu-flooring-features-ready',{detail:state}));
  }

  start();
})();