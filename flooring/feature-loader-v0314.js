/* RUNLU Deerfoot Flooring OS · Lazy Feature Loader V0.3.15
   Core-first rule: do not load business add-ons during startup.
   The base workspace remains interactive; feature scripts are loaded only when the user opens that workspace. */
(function(){
  'use strict';
  if(window.__runluLazyFeatures0315)return;
  window.__runluLazyFeatures0315=true;

  const loaded=new Set();
  const pending=new Map();
  const BASE=new Set(['command','estimate','jobs','warehouse','install','accounting']);
  const bundles={
    showroom:['showroom-v010.js?v=010'],
    purchasing:['po-supplier-orders-v010.js?v=010','po-training-reset-v011.js?v=013'],
    pickup:['po-supplier-orders-v010.js?v=010','supplier-pickup-v010.js?v=010'],
    invoice:['invoice-checks-v022.js?v=024'],
    sales:['sales-v010.js?v=010'],
    serviceclaims:['service-claims-v010.js?v=012'],
    systemsettings:['system-settings-v010.js?v=010'],
    pricing:['sales-v010.js?v=010','sales-handover-sync-v013.js?v=018']
  };

  const state={loaded:[],failed:[],current:'',mode:'lazy'};
  window.runluFeatureLoadState=state;

  function directGo(id){
    const target=document.getElementById(id);
    if(!target)return false;
    document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id));
    document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));
    try{
      if(id==='estimate'){
        const f=document.getElementById('estimateFrame');
        if(f&&!f.getAttribute('src'))f.setAttribute('src',f.dataset.src||'estimate-assessment.html');
      }
      if(id==='jobs'&&typeof window.loadEditor==='function')window.loadEditor();
      if(id==='warehouse'&&typeof window.renderWarehouse==='function')window.renderWarehouse();
      if(id==='install'&&typeof window.loadInstall==='function')window.loadInstall();
      if(id==='accounting'&&typeof window.loadAccounting==='function')window.loadAccounting();
    }catch(e){console.error('RUNLU base navigation hook failed:',id,e)}
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}
    return true;
  }

  function loadOne(src){
    if(loaded.has(src))return Promise.resolve(true);
    if(pending.has(src))return pending.get(src);
    const p=new Promise(resolve=>{
      const existing=[...document.scripts].find(s=>s.src&&s.src.includes(src.split('?')[0]));
      if(existing){loaded.add(src);resolve(true);return}
      const s=document.createElement('script');
      s.src=src;
      s.async=true;
      s.dataset.runluLazyFeature='0315';
      state.current=src;
      s.onload=()=>{loaded.add(src);state.loaded.push(src);state.current='';pending.delete(src);resolve(true)};
      s.onerror=()=>{state.failed.push(src);state.current='';pending.delete(src);console.error('RUNLU lazy feature failed:',src);resolve(false)};
      document.body.appendChild(s);
    });
    pending.set(src,p);return p;
  }

  async function ensureBundle(id){
    const list=bundles[id]||[];
    for(const src of list){await loadOne(src);await new Promise(r=>setTimeout(r,0));}
  }

  function ensureNavButton(id,label,before){
    const nav=document.getElementById('nav');if(!nav||nav.querySelector(`[data-page="${id}"]`))return;
    const b=document.createElement('button');b.type='button';b.dataset.page=id;b.textContent=label;
    const anchor=before?nav.querySelector(`[data-page="${before}"]`):null;
    anchor?anchor.insertAdjacentElement('beforebegin',b):nav.appendChild(b);
  }

  function ensureNavShell(){
    ensureNavButton('sales','Sales','showroom');
    ensureNavButton('pickup','Pickup','warehouse');
    ensureNavButton('serviceclaims','Service / Claims','accounting');
    ensureNavButton('pricing','Pricing','systemsettings');
    ensureNavButton('systemsettings','Settings');
  }

  async function route(id){
    if(!id)return;
    if(BASE.has(id)){directGo(id);return}
    if(id==='showroom'){
      await ensureBundle(id);
      try{if(typeof window.renderShowroom==='function')window.renderShowroom()}catch(e){console.error(e)}
      directGo(id);return;
    }
    if(id==='invoice'){
      await ensureBundle(id);
      try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(e){console.error(e)}
      directGo(id);return;
    }
    await ensureBundle(id);
    // Some feature modules create their page during boot. Give them one turn before navigating.
    await new Promise(r=>setTimeout(r,20));
    if(document.getElementById(id)){directGo(id);return}
    // Feature modules that wrap go() may create the page only when first opened.
    try{if(typeof window.go==='function')window.go(id)}catch(e){console.error('RUNLU feature navigation failed:',id,e)}
  }
  window.runluLazyRoute=route;

  function targetPage(el){
    const navBtn=el.closest?.('#nav button[data-page]');if(navBtn)return navBtn.dataset.page;
    const actionable=el.closest?.('[onclick]');if(!actionable)return '';
    const code=actionable.getAttribute('onclick')||'';
    const m=code.match(/go\(['\"]([^'\"]+)['\"]\)/);return m?m[1]:'';
  }

  document.addEventListener('click',ev=>{
    const id=targetPage(ev.target);if(!id)return;
    // Capture navigation before legacy inline handlers / wrappers can interfere.
    ev.preventDefault();ev.stopPropagation();
    if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();
    route(id);
  },true);

  // Keep startup intentionally idle. No feature script is loaded here.
  ensureNavShell();
  setTimeout(ensureNavShell,50);
  window.addEventListener('pageshow',ensureNavShell);
})();