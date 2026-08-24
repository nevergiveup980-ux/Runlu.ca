/* RUNLU Deerfoot Flooring OS · PO Legacy Output Router V0.3.39R2
   Isolated diagnostic enhancement built directly on stable V0.3.37.
   Scope: intercept PO Preview / Print and hand current PO data to a standalone renderer.
   No Sales Desk polish, no global MutationObserver, no build-label mutation, no business-data writes.
*/
(function(){
  'use strict';
  if(window.__runluPOLegacyOutput039R2)return;
  window.__runluPOLegacyOutput039R2=true;

  const KEY='runlu_deerfoot_po_print_preview_v039r2';
  const by=id=>document.getElementById(id);

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
      poNumber:field('poNumberSafe'),supplier:field('poSupplierSafe'),salesRep:field('poSalesRepSafe')||j.salesRep||j.clerk||'',
      orderDate:field('poOrderDateSafe'),expectedDate:field('poExpectedDateSafe'),status:field('poStatusSafe')||'Draft',notes:field('poNotesSafe'),
      fulfillment:field('pickupFulfillmentSafe')||'Pickup',requestedDate:field('pickupRequestedDateSafe'),purchaseType:field('pickupPurchaseTypeSafe')||'Job-specific',
      jobNumber:j.jobNumber||'',customerName:j.customerName||'',items:gatherItems(),generatedAt:new Date().toISOString(),build:'V0.3.39R2'
    };
  }
  function openLegacy(){
    try{localStorage.setItem(KEY,JSON.stringify(payload()))}catch(err){console.error('RUNLU PO preview handoff failed:',err);return}
    const w=window.open('deerfoot-po-v039r2.html?t='+Date.now(),'_blank');
    if(!w)alert('Allow pop-ups to preview this PO.');
  }

  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('button');
    if(!b||!(b.id==='poPreviewBtn'||b.id==='poPrintBtn'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openLegacy();
  },true);

  window.runluPOPreview039R2=openLegacy;
  window.runluPOPrint039R2=openLegacy;
})();