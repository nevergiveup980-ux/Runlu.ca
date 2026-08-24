/* RUNLU Deerfoot Flooring OS · Sales Desk routing guard V0.3.37
   Synchronizes the base app's in-memory Active Job before routing from a Sales Desk drawer.
*/
(function(){
  'use strict';
  if(window.__runluSalesDeskGuard037)return;window.__runluSalesDeskGuard037=true;
  function repFromDesk(){return String(document.getElementById('sd037Title')?.textContent||'').split(' — ')[0].trim()}
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
})();