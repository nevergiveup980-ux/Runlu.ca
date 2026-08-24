/* RUNLU Deerfoot Flooring OS · PO Legacy Output Router V0.3.39R
   Isolated enhancement on top of the stable V0.3.38 baseline.
   Scope: PO Preview / Print routing + authoritative global build label only.
   Does not alter Sales, Claims, Estimate, Warehouse, invoice numbering, or the shared loader.
*/
(function(){
  'use strict';
  if(window.__runluPOLegacyOutput039R)return;
  window.__runluPOLegacyOutput039R=true;

  const KEY='runlu_deerfoot_po_print_preview_v039r';
  const BUILD='V0.3.39R PO Legacy Output';
  const by=id=>document.getElementById(id);

  function markBuild(){
    window.RUNLU_FLOORING_BUILD='V0.3.39R';
    const pill=document.querySelector('header .pill');
    if(pill)pill.textContent=BUILD;
    document.title='RUNLU Deerfoot Flooring OS V0.3.39R';
  }

  function activeJob(){
    try{if(typeof window.active==='function')return window.active()||{}}catch(_){}
    try{
      const jobs=JSON.parse(localStorage.getItem('runlu_deerfoot_flooring_jobs_v1')||'[]');
      const id=localStorage.getItem('runlu_deerfoot_flooring_active_job_v1');
      return (Array.isArray(jobs)?jobs:[]).find(j=>j.id===id)||{};
    }catch(_){return {}}
  }
  function field(id){return (by(id)?.value||'').trim()}
  function gatherItems(){
    return [...document.querySelectorAll('[data-po-native-row]')].map(row=>{
      const get=f=>row.querySelector(`[data-f="${f}"]`)?.value?.trim()||'';
      return {style:get('style'),colour:get('colour'),sku:get('sku'),qty:get('qty'),unit:get('unit'),unitCost:get('unitCost'),lineTotal:get('lineTotal')};
    });
  }
  function payload(){
    const j=activeJob();
    return {
      poNumber:field('poNumberSafe'),
      supplier:field('poSupplierSafe'),
      salesRep:field('poSalesRepSafe')||j.salesRep||j.clerk||'',
      orderDate:field('poOrderDateSafe'),
      expectedDate:field('poExpectedDateSafe'),
      status:field('poStatusSafe')||'Draft',
      notes:field('poNotesSafe'),
      fulfillment:field('pickupFulfillmentSafe')||'Pickup',
      requestedDate:field('pickupRequestedDateSafe'),
      purchaseType:field('pickupPurchaseTypeSafe')||'Job-specific',
      jobNumber:j.jobNumber||'',
      customerName:j.customerName||'',
      items:gatherItems(),
      generatedAt:new Date().toISOString(),
      build:'V0.3.39R'
    };
  }
  function openLegacy(){
    try{localStorage.setItem(KEY,JSON.stringify(payload()))}catch(err){console.error('RUNLU PO preview handoff failed:',err)}
    const w=window.open('deerfoot-po-v039r.html?t='+Date.now(),'_blank');
    if(!w)alert('Allow pop-ups to preview this PO.');
  }

  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button');
    if(!b||!(b.id==='poPreviewBtn'||b.id==='poPrintBtn'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openLegacy();
  },true);

  window.addEventListener('pageshow',markBuild);
  markBuild();
  window.runluPOPreview039R=openLegacy;
  window.runluPOPrint039R=openLegacy;
})();