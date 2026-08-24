/* RUNLU Deerfoot Flooring OS · Supplier Pickup Save Guard V0.1.9
   Captures Supplier Pickup / Receiving metadata before PO save/issue actions.
   Prevents a new/manual PO from losing pickup date metadata during the first save/render cycle.
   Never substitutes Order Date or Expected Date for the Supplier Pickup / Receiving Date. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
  const by=id=>document.getElementById(id);

  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'');return v??fallback}catch(_){return fallback}}
  function write(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch(_){return false}}

  function editorMeta(){
    const number=(by('poNumberSafe')?.value||'').trim();
    const title=(by('poSafeEditorTitle')?.textContent||'').trim();
    const m=title.match(/^PO\s*#\s*([^\s·]+)/i);
    return {
      poNumber:number||(m?m[1].trim():''),
      requestedDate:by('pickupRequestedDateSafe')?.value||'',
      fulfillment:by('pickupFulfillmentSafe')?.value||'Pickup',
      purchaseType:by('pickupPurchaseTypeSafe')?.value||'Job-specific',
      capturedAt:new Date().toISOString()
    };
  }

  function commit(meta){
    if(!meta?.poNumber)return false;
    const snap=read(SNAP_STORE,{});
    const old=snap[meta.poNumber]||{};
    const requestedDate=meta.requestedDate||old.requestedDate||'';
    snap[meta.poNumber]={...old,requestedDate,fulfillment:meta.fulfillment||old.fulfillment||'Pickup',purchaseType:meta.purchaseType||old.purchaseType||'Job-specific',updatedAt:new Date().toISOString(),source:'po-saveguard-v019'};
    write(SNAP_STORE,snap);

    const pos=read(PO_STORE,[]);
    if(Array.isArray(pos)){
      const po=pos.find(x=>String(x.poNumber||'').trim()===meta.poNumber);
      if(po){
        if(requestedDate)po.requestedDate=requestedDate;
        po.fulfillment=meta.fulfillment||po.fulfillment||'Pickup';
        po.purchaseType=meta.purchaseType||po.purchaseType||'Job-specific';
        write(PO_STORE,pos);
      }
    }
    return true;
  }

  function captureAndReconcile(){
    const meta=editorMeta();
    if(!meta.poNumber)return;
    commit(meta);                 // snapshot before any save/render can clear the editor
    setTimeout(()=>commit(meta),0);   // attach to newly-created PO record
    setTimeout(()=>commit(meta),120); // survive the first PO re-render
  }

  function boot(){
    document.addEventListener('pointerdown',ev=>{
      const b=ev.target?.closest?.('button');
      if(!b)return;
      if(['poSaveDraftBtn','poManualBtn','poIssueBtn'].includes(b.id))captureAndReconcile();
      if(b.dataset?.page==='supplierPickupPage'||b.textContent?.trim()==='Pickup')captureAndReconcile();
    },true);

    document.addEventListener('change',ev=>{
      if(['pickupRequestedDateSafe','pickupFulfillmentSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id))commit(editorMeta());
    },true);
    document.addEventListener('input',ev=>{
      if(ev.target?.id==='pickupRequestedDateSafe')commit(editorMeta());
    },true);

    window.runluSupplierPickupSaveGuard=captureAndReconcile;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
