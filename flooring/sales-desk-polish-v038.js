/* RUNLU Deerfoot Flooring OS · Sales Desk Mobile Polish V0.3.38
   Small UX layer only: responsive search text, drawer tab memory, active-tab centering,
   and mobile-safe drawer navigation. No business-data duplication or inventory writes.
*/
(function(){
  'use strict';
  if(window.__runluSalesDeskPolish038)return;
  window.__runluSalesDeskPolish038=true;

  const TAB_KEY='runlu_deerfoot_sales_desk_last_tab_v1';
  const REP_KEY='runlu_deerfoot_sales_desk_last_rep_v1';
  const $=id=>document.getElementById(id);
  let restoring=false;

  function markVersion(){
    const globalBuild=String(window.RUNLU_FLOORING_BUILD||'');
    if(globalBuild==='V0.3.39R'){
      const pill=document.querySelector('header .pill');
      if(pill)pill.textContent='V0.3.39R PO Legacy Output';
      document.title='RUNLU Deerfoot Flooring OS V0.3.39R';
      return;
    }
    const pill=document.querySelector('header .pill');
    if(pill)pill.textContent='V0.3.38 Sales Desk Mobile Polish';
    document.title='RUNLU Deerfoot Flooring OS V0.3.38';
  }

  function injectStyle(){
    if($('salesDeskPolishStyle038'))return;
    const s=document.createElement('style');
    s.id='salesDeskPolishStyle038';
    s.textContent=`
      #salesdesk .sd037Tabs{scroll-snap-type:x proximity;overscroll-behavior-x:contain;padding-bottom:7px}
      #salesdesk .sd037Tab{scroll-snap-align:center;flex:0 0 auto}
      #salesdesk .sd038RailWrap{position:relative}
      #salesdesk .sd038RailWrap:after{content:'';position:absolute;right:0;top:5px;bottom:6px;width:28px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--bg,#eef4f1))}
      #salesdesk .sd038DrawerHint{display:none;color:var(--muted);font-size:11px;margin:2px 2px 0;text-align:right}
      #salesdesk .sd038CurrentRep{display:inline-flex;align-items:center;gap:6px;margin-top:7px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.13);font-size:11px;font-weight:800;color:#fff}
      #salesdesk .sd037Search input{min-width:0}
      @media(max-width:700px){
        #salesdesk .sd037Hero{padding:18px}
        #salesdesk .sd037Head h2{font-size:26px;line-height:1.05}
        #salesdesk .sd037Search{gap:9px}
        #salesdesk .sd037Search input{font-size:16px}
        #salesdesk .sd037Tabs{gap:8px;margin-left:-2px;margin-right:-2px;padding-left:2px;padding-right:24px}
        #salesdesk .sd037Tab{padding:10px 14px;font-size:15px}
        #salesdesk .sd038DrawerHint{display:block}
      }
    `;
    document.head.appendChild(s);
  }

  function repName(){
    const title=String($('sd037Title')?.textContent||'');
    return title.includes(' — ')?title.split(' — ')[0].trim():'';
  }

  function shortenSearch(){
    const input=$('sd037Search');if(!input)return;
    input.placeholder=window.matchMedia('(max-width:700px)').matches?'Search customer, job, PO…':'Search this desk: customer, job, PO, invoice, product';
    input.setAttribute('aria-label','Search this Sales Desk');
  }

  function wrapTabs(){
    const tabs=$('sd037Tabs');if(!tabs||tabs.closest('.sd038RailWrap'))return;
    const wrap=document.createElement('div');wrap.className='sd038RailWrap';
    tabs.parentNode.insertBefore(wrap,tabs);wrap.appendChild(tabs);
    const hint=document.createElement('div');hint.className='sd038DrawerHint';hint.textContent='Swipe for more drawers →';
    wrap.appendChild(hint);
  }

  function addRepChip(){
    const head=document.querySelector('#salesdesk .sd037Head > div');if(!head||head.querySelector('.sd038CurrentRep'))return;
    const chip=document.createElement('span');chip.className='sd038CurrentRep';chip.textContent='Personal workspace · shared company data';head.appendChild(chip);
  }

  function centerActive(){
    const active=document.querySelector('#salesdesk .sd037Tab.active');
    if(!active)return;
    try{active.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}catch(_){active.scrollIntoView(false)}
  }

  function saveTabFromButton(b){
    const tab=b?.dataset?.sdtab;if(!tab)return;
    const rep=repName();
    try{localStorage.setItem(TAB_KEY,tab);if(rep)localStorage.setItem(REP_KEY,rep)}catch(_){}
    setTimeout(centerActive,20);
  }

  function restoreTab(){
    if(restoring)return;
    const sec=$('salesdesk');if(!sec?.classList.contains('active'))return;
    const rep=repName();if(!rep)return;
    let savedTab='',savedRep='';
    try{savedTab=localStorage.getItem(TAB_KEY)||'';savedRep=localStorage.getItem(REP_KEY)||''}catch(_){}
    if(!savedTab||!savedRep||savedRep.toLowerCase()!==rep.toLowerCase()){centerActive();return}
    const escTab=window.CSS?.escape?CSS.escape(savedTab):savedTab.replace(/[^a-z0-9_-]/gi,'');
    const target=sec.querySelector('.sd037Tab[data-sdtab="'+escTab+'"]');
    if(!target||target.classList.contains('active')){centerActive();return}
    restoring=true;target.click();setTimeout(()=>{restoring=false;centerActive()},30);
  }

  function polish(){
    markVersion();injectStyle();shortenSearch();wrapTabs();addRepChip();setTimeout(restoreTab,40);
  }

  document.addEventListener('click',e=>{
    const tab=e.target?.closest?.('#salesdesk .sd037Tab[data-sdtab]');if(tab)saveTabFromButton(tab);
    const open=e.target?.closest?.('#salesDeskLaunch037,.sd037RowOpen');if(open)setTimeout(polish,80);
  },true);
  window.addEventListener('resize',shortenSearch,{passive:true});
  window.addEventListener('pageshow',()=>setTimeout(polish,80));

  const observer=new MutationObserver(()=>{if($('salesdesk'))polish()});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  [100,350,900].forEach(ms=>setTimeout(polish,ms));
})();