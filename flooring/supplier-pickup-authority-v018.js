/* RUNLU Deerfoot Flooring OS · Supplier Pickup Authority V0.1.8
   Makes the PO record authoritative for Supplier Pickup / Receiving metadata.
   Prevents an older snapshot from masking a newly saved PO pickup date after refresh. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
  const by=id=>document.getElementById(id);
  function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'');return v??fallback}catch(_){return fallback}}
  function write(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true}catch(_){return false}}
  function editor(){
    const num=(by('poNumberSafe')?.value||'').trim();
    const title=(by('poSafeEditorTitle')?.textContent||'').trim();
    const m=title.match(/^PO\s*#\s*([^\s·]+)/i);
    return {
      poNumber:num||(m?m[1].trim():''),
      requestedDate:by('pickupRequestedDateSafe')?.value||'',
      fulfillment:by('pickupFulfillmentSafe')?.value||'Pickup',
      purchaseType:by('pickupPurchaseTypeSafe')?.value||'Job-specific'
    };
  }
  function persist(){
    const ed=editor();
    if(!ed.poNumber||!ed.requestedDate)return false;
    const pos=read(PO_STORE,[]);
    const po=Array.isArray(pos)?pos.find(x=>String(x.poNumber||'').trim()===ed.poNumber):null;
    if(po){
      po.requestedDate=ed.requestedDate;
      po.fulfillment=ed.fulfillment;
      po.purchaseType=ed.purchaseType;
      write(PO_STORE,pos);
    }
    const snap=read(SNAP_STORE,{});
    snap[ed.poNumber]={requestedDate:ed.requestedDate,fulfillment:ed.fulfillment,purchaseType:ed.purchaseType,updatedAt:new Date().toISOString(),source:'po-editor-v018'};
    write(SNAP_STORE,snap);
    return true;
  }
  function reconcile(){
    const pos=read(PO_STORE,[]),snap=read(SNAP_STORE,{});
    if(!Array.isArray(pos))return;
    let changed=false;
    pos.forEach(po=>{
      const num=String(po.poNumber||'').trim();
      if(!num||!po.requestedDate)return;
      const s=snap[num]||{};
      if(s.requestedDate!==po.requestedDate||s.fulfillment!==(po.fulfillment||'Pickup')||s.purchaseType!==(po.purchaseType||'Job-specific')){
        snap[num]={...s,requestedDate:po.requestedDate,fulfillment:po.fulfillment||'Pickup',purchaseType:po.purchaseType||'Job-specific',updatedAt:new Date().toISOString(),source:'po-record-v018'};
        changed=true;
      }
    });
    if(changed)write(SNAP_STORE,snap);
  }
  function refreshPickup(){try{window.runluPickupSafeRender?.()}catch(_){}}
  function boot(){
    reconcile();
    document.addEventListener('input',ev=>{if(['pickupRequestedDateSafe','pickupFulfillmentSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id))persist()},true);
    document.addEventListener('change',ev=>{if(['pickupRequestedDateSafe','pickupFulfillmentSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id)){persist();refreshPickup()}},true);
    document.addEventListener('pointerdown',ev=>{const b=ev.target?.closest?.('button');if(b?.dataset?.page==='supplierPickupPage'||b?.textContent?.trim()==='Pickup')persist()},true);
    window.addEventListener('pagehide',persist);
    window.runluPersistSupplierPickupAuthoritative=persist;
    refreshPickup();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();