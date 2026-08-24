/* RUNLU Deerfoot Flooring OS · Sales Desk Mobile Polish V0.3.38R
   Research branch only.
   Scoped to an OPEN Sales Desk. No global MutationObserver, no startup auto-run,
   no inventory/customer/job writes. UI-only: compact search, drawer hint, tab memory.
*/
(function(){
  'use strict';
  if(window.__runluSalesDeskPolish038R)return;
  window.__runluSalesDeskPolish038R=true;

  const TAB_KEY='runlu_deerfoot_sales_desk_last_tab_v1';
  const REP_KEY='runlu_deerfoot_sales_desk_last_rep_v1';
  const by=id=>document.getElementById(id);
  let restoring=false;

  function deskOpen(){const s=by('salesdesk');return !!(s&&s.classList.contains('active'))}
  function repName(){const t=String(by('sd037Title')?.textContent||'');return t.includes(' — ')?t.split(' — ')[0].trim():''}

  function injectStyle(){
    if(by('salesDeskPolishStyle038R'))return;
    const s=document.createElement('style');s.id='salesDeskPolishStyle038R';s.textContent=`
      #salesdesk .sd037Tabs{scroll-snap-type:x proximity;overscroll-behavior-x:contain;padding-bottom:7px}
      #salesdesk .sd037Tab{scroll-snap-align:center;flex:0 0 auto}
      #salesdesk .sd038rRailWrap{position:relative}
      #salesdesk .sd038rRailWrap:after{content:'';position:absolute;right:0;top:5px;bottom:6px;width:28px;pointer-events:none;background:linear-gradient(90deg,transparent,var(--bg,#eef4f1))}
      #salesdesk .sd038rHint{display:none;color:var(--muted);font-size:11px;margin:2px 2px 0;text-align:right}
      #salesdesk .sd038rChip{display:inline-flex;align-items:center;margin-top:7px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.13);font-size:11px;font-weight:800;color:#fff}
      #salesdesk .sd037Search input{min-width:0}
      @media(max-width:700px){
        #salesdesk .sd037Hero{padding:18px}
        #salesdesk .sd037Head h2{font-size:26px;line-height:1.05}
        #salesdesk .sd037Search input{font-size:16px}
        #salesdesk .sd037Tabs{gap:8px;margin-left:-2px;margin-right:-2px;padding-left:2px;padding-right:24px}
        #salesdesk .sd037Tab{padding:10px 14px;font-size:15px}
        #salesdesk .sd038rHint{display:block}
      }`;
    document.head.appendChild(s);
  }
  function shortenSearch(){const input=by('sd037Search');if(!input)return;input.placeholder=window.matchMedia('(max-width:700px)').matches?'Search customer, job, PO…':'Search this desk: customer, job, PO, invoice, product';input.setAttribute('aria-label','Search this Sales Desk')}
  function wrapTabs(){const tabs=by('sd037Tabs');if(!tabs||tabs.closest('.sd038rRailWrap'))return;const wrap=document.createElement('div');wrap.className='sd038rRailWrap';tabs.parentNode.insertBefore(wrap,tabs);wrap.appendChild(tabs);const hint=document.createElement('div');hint.className='sd038rHint';hint.textContent='Swipe for more drawers →';wrap.appendChild(hint)}
  function addChip(){const head=document.querySelector('#salesdesk .sd037Head > div');if(!head||head.querySelector('.sd038rChip'))return;const c=document.createElement('span');c.className='sd038rChip';c.textContent='Personal workspace · shared company data';head.appendChild(c)}
  function centerActive(){if(!deskOpen())return;const a=document.querySelector('#salesdesk .sd037Tab.active');if(!a)return;try{a.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}catch(_){a.scrollIntoView(false)}}
  function saveTab(b){const tab=b?.dataset?.sdtab,rep=repName();if(!tab||!rep)return;try{localStorage.setItem(TAB_KEY,tab);localStorage.setItem(REP_KEY,rep)}catch(_){}setTimeout(centerActive,20)}
  function restoreTab(){
    if(restoring||!deskOpen())return;const rep=repName();if(!rep)return;
    let tab='',savedRep='';try{tab=localStorage.getItem(TAB_KEY)||'';savedRep=localStorage.getItem(REP_KEY)||''}catch(_){}
    if(!tab||savedRep.toLowerCase()!==rep.toLowerCase()){centerActive();return}
    const target=document.querySelector('#salesdesk .sd037Tab[data-sdtab="'+CSS.escape(tab)+'"]');
    if(!target||target.classList.contains('active')){centerActive();return}
    restoring=true;target.click();setTimeout(()=>{restoring=false;centerActive()},30);
  }
  function polish(){if(!deskOpen())return;injectStyle();shortenSearch();wrapTabs();addChip();setTimeout(restoreTab,35)}

  document.addEventListener('click',e=>{const tab=e.target?.closest?.('#salesdesk .sd037Tab[data-sdtab]');if(tab)saveTab(tab)},true);
  window.addEventListener('resize',()=>{if(deskOpen())shortenSearch()},{passive:true});
  window.addEventListener('pageshow',()=>{if(deskOpen())setTimeout(polish,50)});
  window.runluSalesDeskPolish038R=polish;
  setTimeout(polish,0);
})();