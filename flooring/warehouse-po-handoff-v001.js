/* RUNLU Deerfoot Flooring OS · Warehouse PO Handoff V0.1.1
   Adds a PO-driven handoff from Supplier Pickup / Receiving into Warehouse OS.
   Includes compact PO item-line payloads so Warehouse can prefill stock receiving.
   Also separates Completed from Ready in Supplier Pickup summary stats. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const LAST_PO='runlu_deerfoot_last_po_v1';
  const by=id=>document.getElementById(id);
  const readPOs=()=>{try{const x=JSON.parse(localStorage.getItem(PO_STORE)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}};
  const statusFor=po=>{if(!po)return '';if(po.status==='Cancelled')return 'Cancelled';if(po.status==='Completed')return 'Completed';if(po.status==='Received')return 'Ready';if(po.status==='Partially Received')return 'In Progress';return po.poNumber&&po.status!=='Draft'?'Scheduled':'Draft'};
  function rememberPO(num){if(num)localStorage.setItem(LAST_PO,String(num))}
  function visiblePONumber(){return (by('poNumberSafe')?.value||'').trim()}
  function selectedPO(){
    const pos=readPOs();
    const num=visiblePONumber()||localStorage.getItem(LAST_PO)||'';
    let po=num?pos.find(x=>String(x.poNumber||'').trim()===String(num).trim()):null;
    if(!po&&pos.length===1)po=pos[0];
    if(!po)po=pos.find(x=>['Completed','Received','Partially Received'].includes(x.status))||pos.find(x=>x.poNumber&&x.status!=='Draft')||null;
    if(po?.poNumber)rememberPO(po.poNumber);
    return po;
  }
  function activeJobSafe(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function handoffData(){
    const po=selectedPO(),j=activeJobSafe();
    const items=(po?.items?.length?po.items:j?.items)||[];
    return {po,j,items};
  }
  function compactItems(items,po){
    return (Array.isArray(items)?items:[]).map(x=>({
      style:x?.style||x?.product||'',
      colour:x?.colour||x?.color||'',
      sku:x?.sku||'',
      qty:x?.qty??x?.quantity??'',
      unit:x?.unit||'',
      supplier:x?.supplier||po?.supplier||''
    })).filter(x=>x.style||x.sku||x.qty);
  }
  function handoffTextPO(){
    const {po,j,items}=handoffData();
    if(!po&&!j)return 'No active Job or supplier PO.';
    return [
      'RUNLU DEERFOOT FLOORING → WAREHOUSE RECEIVING',
      'PO: '+(po?.poNumber||j?.supplierPO||''),
      'Supplier: '+(po?.supplier||''),
      'PO Status: '+(po?.status||''),
      'Pickup Status: '+statusFor(po),
      'Supplier Pickup / Receiving Date: '+(po?.requestedDate||''),
      'Fulfillment: '+(po?.fulfillment||''),
      'Purchase Type: '+(po?.purchaseType||''),
      'Job / Order: '+(po?.jobNumber||j?.jobNumber||''),
      'Customer: '+(po?.customerName||j?.customerName||''),
      'Items:',
      ...(items.length?items.map((x,i)=>`${i+1}. ${x.qty||''} ${x.unit||''} | ${x.style||''} | ${x.colour||''} | ${x.sku||''}`):['(No item lines on this PO yet)']),
      'Notes: '+(po?.notes||j?.notes||'')
    ].join('\n');
  }
  function warehouseUrlPO(){
    const {po,j,items}=handoffData();
    const itemPayload=compactItems(items,po);
    const p=new URLSearchParams({
      from:'flooring',
      po:po?.poNumber||j?.supplierPO||'',
      supplier:po?.supplier||'',
      pickup:po?.requestedDate||'',
      poStatus:po?.status||'',
      pickupStatus:statusFor(po),
      fulfillment:po?.fulfillment||'',
      purchaseType:po?.purchaseType||'',
      job:po?.jobNumber||j?.jobNumber||'',
      customer:po?.customerName||j?.customerName||'',
      items:JSON.stringify(itemPayload),
      itemCount:String(itemPayload.length)
    });
    return 'https://warehouse.runlu.ca/?'+p.toString();
  }
  function renderWarehousePO(){const el=by('handoff');if(el)el.textContent=handoffTextPO();const f=by('warehouseFrame');if(f)f.src=warehouseUrlPO()}
  function refreshWarehousePO(){const f=by('warehouseFrame');if(f)f.src=warehouseUrlPO()}
  function openWarehousePO(){window.open(warehouseUrlPO(),'_blank')}
  async function copyHandoffPO(){try{await navigator.clipboard.writeText(handoffTextPO());alert('Warehouse receiving handoff copied.')}catch(_){alert('Copy is unavailable in this browser.')}}

  function ensureCompletedStat(){
    const stats=document.querySelector('.pickupSafeStats');if(!stats)return;
    let box=by('pickupCompletedSafe');
    if(!box){box=document.createElement('div');box.innerHTML='<b id="pickupCompletedSafe">0</b><span>Completed</span>';const total=by('pickupTotalSafe')?.parentElement;total?stats.insertBefore(box,total):stats.appendChild(box)}
    const pos=readPOs().filter(x=>x.poNumber&&x.status!=='Draft');
    const scheduled=pos.filter(x=>statusFor(x)==='Scheduled').length;
    const progress=pos.filter(x=>statusFor(x)==='In Progress').length;
    const ready=pos.filter(x=>statusFor(x)==='Ready').length;
    const completed=pos.filter(x=>statusFor(x)==='Completed').length;
    if(by('pickupScheduledSafe'))by('pickupScheduledSafe').textContent=scheduled;
    if(by('pickupInProgressSafe'))by('pickupInProgressSafe').textContent=progress;
    if(by('pickupReadySafe'))by('pickupReadySafe').textContent=ready;
    if(by('pickupCompletedSafe'))by('pickupCompletedSafe').textContent=completed;
    if(by('pickupTotalSafe'))by('pickupTotalSafe').textContent=pos.length;
  }
  function injectStyle(){if(by('runluWarehousePOBridgeStyle'))return;const s=document.createElement('style');s.id='runluWarehousePOBridgeStyle';s.textContent='.pickupSafeStats{grid-template-columns:repeat(5,minmax(0,1fr))}@media(max-width:760px){.pickupSafeStats{grid-template-columns:repeat(2,minmax(0,1fr))}}';document.head.appendChild(s)}
  function boot(){
    injectStyle();ensureCompletedStat();
    window.handoffText=handoffTextPO;window.warehouseUrl=warehouseUrlPO;window.renderWarehouse=renderWarehousePO;window.refreshWarehouse=refreshWarehousePO;window.openWarehouse=openWarehousePO;window.copyHandoff=copyHandoffPO;
    document.addEventListener('click',ev=>{
      const open=ev.target?.closest?.('[data-po-open]');
      if(open){const po=readPOs().find(x=>x.id===open.dataset.poOpen);if(po?.poNumber)rememberPO(po.poNumber)}
      const nav=ev.target?.closest?.('button');if(nav?.dataset?.page==='supplierPickupPage'||nav?.textContent?.trim()==='Pickup')setTimeout(ensureCompletedStat,0);
      if(nav?.dataset?.page==='warehouse'||nav?.textContent?.trim()==='Warehouse')setTimeout(renderWarehousePO,0);
    },true);
    ['change','input'].forEach(type=>document.addEventListener(type,ev=>{if(ev.target?.id==='poNumberSafe')rememberPO(ev.target.value)},true));
    window.addEventListener('storage',ev=>{if(ev.key===PO_STORE){ensureCompletedStat();renderWarehousePO()}});
    const oldRender=window.runluPickupSafeRender;if(typeof oldRender==='function')window.runluPickupSafeRender=function(){oldRender();ensureCompletedStat()};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
