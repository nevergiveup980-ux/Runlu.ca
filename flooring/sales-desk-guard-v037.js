/* RUNLU Deerfoot Flooring OS · Sales Desk routing guard V0.3.37
   Synchronizes the base app's in-memory Active Job before routing from a Sales Desk drawer.
   Adds direct Open Desk actions in salesperson summaries and team lists.
*/
(function(){
  'use strict';
  if(window.__runluSalesDeskGuard037)return;window.__runluSalesDeskGuard037=true;
  function repFromDesk(){return String(document.getElementById('sd037Title')?.textContent||'').split(' — ')[0].trim()}
  function openRepDesk(rep){
    rep=String(rep||'').trim();if(!rep)return;
    if(typeof window.openRunluSalesDesk==='function')return window.openRunluSalesDesk(rep);
    const sel=document.getElementById('sales033Rep');if(sel){sel.value=rep;sel.dispatchEvent(new Event('change',{bubbles:true}))}
    document.getElementById('salesDeskLaunch037')?.click();
  }
  function makeOpenButton(name){const b=document.createElement('button');b.type='button';b.className='sd037Mini primary sd037RowOpen';b.textContent='Open Desk';b.dataset.salesRep=name;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openRepDesk(name)});return b}
  function enhanceRepRows(){
    const root=document.getElementById('sales033RepSummary');if(!root)return;
    root.querySelectorAll('.sales033RepRow').forEach(row=>{if(row.querySelector('.sd037RowOpen'))return;const name=String(row.querySelector('b')?.textContent||'').replace(/DEMO/gi,'').trim();if(!name)return;(row.lastElementChild||row).appendChild(makeOpenButton(name))});
  }
  function enhanceTeamRows(){
    ['sales033ActiveTeam','sales033InactiveTeam'].forEach(id=>{const root=document.getElementById(id);if(!root)return;root.querySelectorAll('.sales033TeamRow').forEach(row=>{if(row.querySelector('.sd037RowOpen'))return;const name=String(row.querySelector('b')?.textContent||'').trim();if(!name)return;const action=row.querySelector('button[data-off],button[data-on]');const wrap=document.createElement('span');wrap.style.display='inline-flex';wrap.style.gap='6px';wrap.style.flexWrap='wrap';wrap.appendChild(makeOpenButton(name));if(action){action.replaceWith(wrap);wrap.appendChild(action)}else row.appendChild(wrap)})})
  }
  function enhanceAll(){enhanceRepRows();enhanceTeamRows()}
  function watchRoot(id){const root=document.getElementById(id);if(!root||root.dataset.sd037Watch)return;if(!root)return;root.dataset.sd037Watch='1';new MutationObserver(enhanceAll).observe(root,{childList:true,subtree:true})}
  function watchSales(){enhanceAll();['sales033RepSummary','sales033ActiveTeam','sales033InactiveTeam'].forEach(watchRoot)}
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button');if(!b)return;
    if(b.id==='sd037NewJob'){
      e.preventDefault();e.stopImmediatePropagation();
      const rep=repFromDesk();
      if(typeof window.newJob!=='function')return alert('New Job is unavailable.');
      window.newJob();
      try{const j=typeof window.active==='function'?window.active():null;if(j){j.salesRep=rep;if(typeof window.saveStore==='function')window.saveStore();if(typeof window.loadEditor==='function')window.loadEditor()}}catch(err){console.error('Sales Desk new Job assignment failed:',err)}
      if(typeof window.go==='function')window.go('jobs');
      return;
    }
    const open=b.closest?.('[data-openjob]');if(!open||!open.closest('#salesdesk'))return;
    const id=open.dataset.openjob||'',target=open.dataset.target||'jobs';
    if(!id||typeof window.selectJob!=='function')return;
    e.preventDefault();e.stopImmediatePropagation();
    window.selectJob(id);
    if(target!=='jobs')setTimeout(()=>{try{if(target==='invoice'&&typeof window.prepareInvoice==='function')window.prepareInvoice();if(typeof window.go==='function')window.go(target)}catch(err){console.error('Sales Desk module route failed:',err)}},0);
  },true);
  document.addEventListener('click',e=>{if(e.target?.closest?.('button')?.dataset?.page==='sales')setTimeout(watchSales,0)},true);
  [250,700,1500].forEach(ms=>setTimeout(watchSales,ms));
  window.addEventListener('pageshow',watchSales);
})();