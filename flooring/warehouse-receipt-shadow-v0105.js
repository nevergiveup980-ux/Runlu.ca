/* RUNLU Flooring OS · Warehouse Receipt Shadow V0.10.5
   Read-only observer. It never acknowledges a PO and never writes PO, Job,
   People TO Call, Supplier Master, Warehouse task, or inventory data.
*/
(()=>{'use strict';
if(window.RUNLUWarehouseReceiptShadowV0105)return;
const PO_STORE='runlu_deerfoot_supplier_orders_v1',CACHE='runlu-flooring-warehouse-work-v090';
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const key=v=>String(v??'').replace(/\D/g,'');
function report(){
  const ack=window.RUNLUWarehouseReceiptAckV098;
  if(!ack?.evaluatePO)return {ok:false,code:'ACK_EVALUATOR_UNAVAILABLE',rows:[]};
  const cache=read(CACHE,{}),tasks=Array.isArray(cache?.tasks)?cache.tasks:[],pos=read(PO_STORE,[]);
  const poRows=Array.isArray(pos)?pos.filter(p=>p?.poNumber):[];
  const rows=poRows.map(po=>{
    const number=key(po.poNumber),taskCount=tasks.filter(t=>key(t?.po_number)===number).length;
    const result=ack.evaluatePO(number);
    return {poNumber:String(po.poNumber),poId:String(po.id||''),taskCount,ready:result?.ok===true,code:String(result?.code||'READY'),warehouseStatus:String(result?.task?.status||''),purchaseType:String(result?.task?.purchase_type||po.purchaseType||'')};
  });
  return {ok:true,readOnly:true,generatedAt:new Date().toISOString(),cacheSyncedAt:String(cache?.syncedAt||''),rows,readyCount:rows.filter(r=>r.ready).length,blockedCount:rows.filter(r=>!r.ready).length};
}
function print(){
  const r=report();
  try{console.table(r.rows||[])}catch(_){}
  return r;
}
window.RUNLUWarehouseReceiptShadowV0105=Object.freeze({version:'0.10.5',readOnly:true,report,print});
})();