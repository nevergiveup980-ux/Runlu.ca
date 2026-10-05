/* RUNLU Flooring OS · Warehouse Receipt Acknowledgement V0.10.3 CANDIDATE
   Cross-system safety contract:
   - Warehouse remains physical execution authority.
   - Flooring PO becomes Received only from one unambiguous FULL receipt task carrying
     an explicit inventory-verification certificate produced after Warehouse stock impact.
   - The existing Orders Drawer remains authority for People TO Call routing.
   - No Job/Sales/Warehouse data is mutated here.
   This candidate is intentionally NOT loaded by a production entrypoint yet. */
(function(){
'use strict';
if(window.__runluWarehouseReceiptAckV098)return;
window.__runluWarehouseReceiptAckV098=true;

const VERSION='0.10.3';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const CALL_STORE='runlu_people_to_call_v066';
const CACHE='runlu-flooring-warehouse-work-v090';
const MAX_HISTORY=50;
const MAX_CACHE_AGE_MS=5*60*1000;
const now=()=>new Date().toISOString();
const raw=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const restore=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);return true}catch(e){console.error('[Receipt Ack V098 rollback]',k,e);return false}};
const poKey=v=>{const d=String(v??'').replace(/\D/g,'');return d&&Number(d)>0?String(Number(d)):''};
const num=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const norm=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const qtyOf=x=>num(x?.qty??x?.quantity);
const clone=x=>JSON.parse(JSON.stringify(x));

function cacheState(){const c=read(CACHE,{});return c&&typeof c==='object'?c:{}}
function cacheFresh(){const c=cacheState(),t=Date.parse(String(c.syncedAt||''));if(!Number.isFinite(t))return {ok:false,code:'WAREHOUSE_CACHE_TIME_MISSING'};const age=Date.now()-t;if(age<0||age>MAX_CACHE_AGE_MS)return {ok:false,code:'WAREHOUSE_CACHE_STALE',ageMs:age};return {ok:true,ageMs:age,syncedAt:String(c.syncedAt)}}
function tasks(){const c=cacheState();return Array.isArray(c?.tasks)?c.tasks:[]}
function pos(){const x=read(PO_STORE,[]);return Array.isArray(x)?x:[]}
function calls(){const x=read(CALL_STORE,[]);return Array.isArray(x)?x:[]}
function taskMatches(po){const k=poKey(po);return k?tasks().filter(t=>poKey(t?.po_number)===k):[]}
function poMatches(po){const k=poKey(po);return k?pos().filter(p=>poKey(p?.poNumber)===k):[]}
function equalQty(a,b){return a!=null&&b!=null&&a===b}
function lineName(x){return norm(x?.style||x?.product||x?.description||x?.sku||'')}
function lineColour(x){return norm(x?.colour||x?.color||'')}

function validateFullReceipt(po,task){
  if(!task?.id)return {ok:false,code:'TASK_ID_MISSING'};
  const terminalStatus=String(task.status||'');
  if(!['Ready','Completed'].includes(terminalStatus))return {ok:false,code:'TASK_NOT_RECEIVED'};
  const terminalAt=terminalStatus==='Completed'?String(task.completed_at||''):String(task.received_at||'');
  if(!terminalAt.trim()||!Number.isFinite(Date.parse(terminalAt)))return {ok:false,code:terminalStatus==='Completed'?'COMPLETED_TIME_MISSING':'RECEIVED_TIME_MISSING'};
  const ordered=Array.isArray(task.items)?task.items:[],received=Array.isArray(task.received_items)?task.received_items:[];
  if(!ordered.length||received.length!==ordered.length)return {ok:false,code:'RECEIPT_LINE_COUNT'};
  const local=Array.isArray(po?.items)?po.items:[];
  if(local.length&&local.length!==ordered.length)return {ok:false,code:'LOCAL_LINE_COUNT'};
  for(let i=0;i<ordered.length;i++){
    const tq=qtyOf(ordered[i]),oq=num(received[i]?.ordered_qty),rq=num(received[i]?.received_qty);
    if(!(tq>0&&oq>0&&rq>0))return {ok:false,code:'INVALID_QUANTITY',line:i};
    if(!equalQty(tq,oq)||!equalQty(oq,rq))return {ok:false,code:'NOT_FULL_RECEIPT',line:i,ordered:tq,received:rq};
    if(local.length){
      const lq=qtyOf(local[i]);if(!(lq>0)||!equalQty(lq,tq))return {ok:false,code:'LOCAL_QUANTITY_MISMATCH',line:i};
      const ln=lineName(local[i]),tn=lineName(ordered[i]);if(ln&&tn&&ln!==tn)return {ok:false,code:'LOCAL_PRODUCT_MISMATCH',line:i};
      const lc=lineColour(local[i]),tc=lineColour(ordered[i]);if(lc&&tc&&lc!==tc)return {ok:false,code:'LOCAL_COLOUR_MISMATCH',line:i};
    }
  }
  return {ok:true,ordered,received,terminalStatus,terminalAt};
}

function validateLegacyInventoryCertificate(po,task,full){
  if(task?.inventory_verified!==true)return {ok:false,code:'INVENTORY_NOT_VERIFIED'};
  if(poKey(task?.inventory_verified_po_number)!==poKey(po?.poNumber))return {ok:false,code:'CERT_PO_MISMATCH'};
  if(!String(task?.inventory_verified_at||'').trim())return {ok:false,code:'CERT_TIME_MISSING'};
  const ids=Array.isArray(task?.inventory_operation_ids)?task.inventory_operation_ids.filter(x=>String(x??'').trim()):[];
  if(!ids.length)return {ok:false,code:'CERT_OPERATION_MISSING'};
  const items=Array.isArray(task?.inventory_verified_items)?task.inventory_verified_items:[];
  if(items.length!==full.ordered.length)return {ok:false,code:'CERT_LINE_COUNT'};
  for(let i=0;i<items.length;i++){
    const expected=qtyOf(full.ordered[i]),oq=num(items[i]?.ordered_qty),rq=num(items[i]?.received_qty);
    if(!(oq>0&&rq>0)||!equalQty(expected,oq)||!equalQty(oq,rq))return {ok:false,code:'CERT_QUANTITY_MISMATCH',line:i};
  }
  return {ok:true,evidenceKind:'legacy-certificate',evidenceIds:ids.map(String),operationIds:ids.map(String),verifiedAt:String(task.inventory_verified_at),items};
}

function validatePostedInventoryEvidence(po,task,full){
  if(String(task?.inventory_post_status||'')!=='Posted')return {ok:false,code:'INVENTORY_NOT_VERIFIED'};
  if(!String(task?.inventory_posted_at||'').trim())return {ok:false,code:'POSTED_TIME_MISSING'};
  const rows=Array.isArray(task?.inventory_postings)?task.inventory_postings:[];
  if(rows.length!==full.ordered.length)return {ok:false,code:'POSTED_LINE_COUNT'};
  const ids=[];
  for(let i=0;i<rows.length;i++){
    const expected=qtyOf(full.ordered[i]),q=num(rows[i]?.quantity),rq=num(rows[i]?.received_qty);
    const before=num(rows[i]?.before_quantity),after=num(rows[i]?.after_quantity),id=String(rows[i]?.inventory_id||'').trim();
    if(!id)return {ok:false,code:'POSTED_INVENTORY_ID_MISSING',line:i};
    if(!(q>0&&rq>0)||!equalQty(expected,q)||!equalQty(q,rq))return {ok:false,code:'POSTED_QUANTITY_MISMATCH',line:i};
    if(before==null||after==null||!equalQty(after-before,q))return {ok:false,code:'POSTED_STOCK_DELTA_MISMATCH',line:i};
    ids.push(id);
  }
  return {ok:true,evidenceKind:'inventory-posting',evidenceIds:ids,operationIds:ids,verifiedAt:String(task.inventory_posted_at),items:rows};
}

function validateInventoryCertificate(po,task,full){
  const purchaseType=String(task?.purchase_type||'').trim();
  const localPurchaseType=String(po?.purchaseType||'').trim();
  if(localPurchaseType&&purchaseType&&norm(localPurchaseType)!==norm(purchaseType))return {ok:false,code:'PURCHASE_TYPE_MISMATCH',localPurchaseType,warehousePurchaseType:purchaseType};
  if(purchaseType==='Job-specific'){
    return {ok:true,evidenceKind:'warehouse-terminal-receipt',evidenceIds:[String(task.id)],operationIds:[],verifiedAt:full.terminalAt,items:full.received};
  }
  if(purchaseType==='Stock'){
    if(String(task?.inventory_post_status||'')!=='Posted')return {ok:false,code:'STOCK_INVENTORY_NOT_POSTED'};
    return validatePostedInventoryEvidence(po,task,full);
  }
  if(String(task?.inventory_post_status||'')==='Posted')return validatePostedInventoryEvidence(po,task,full);
  return validateLegacyInventoryCertificate(po,task,full);
}

function evaluatePO(poNumber){
  const freshness=cacheFresh();if(!freshness.ok)return freshness;
  const k=poKey(poNumber);if(!k)return {ok:false,code:'INVALID_PO'};
  const ps=poMatches(k);if(ps.length!==1)return {ok:false,code:ps.length?'DUPLICATE_LOCAL_PO':'LOCAL_PO_NOT_FOUND',count:ps.length};
  const po=ps[0];
  const ts=taskMatches(k);if(ts.length!==1)return {ok:false,code:ts.length?'DUPLICATE_WAREHOUSE_TASK':'WAREHOUSE_TASK_NOT_FOUND',count:ts.length};
  const task=ts[0];
  const full=validateFullReceipt(po,task);if(!full.ok)return {...full,po,task};
  const cert=validateInventoryCertificate(po,task,full);if(!cert.ok)return {...cert,po,task};
  return {ok:true,po,task,full,cert};
}

function queueHasPO(po){
  const k=poKey(po.poNumber),jid=String(po.jobId||''),jnum=String(po.jobNumber||'');
  return calls().some(q=>q&&q.status!=='Done'&&(jid&&String(q.orderId||'')===jid||!jid&&jnum&&String(q.orderNumber||'')===jnum)&&Array.isArray(q.sourcePOs)&&q.sourcePOs.some(x=>poKey(x)===k));
}

function acknowledgePO(poNumber){
  const check=evaluatePO(poNumber);if(!check.ok)return check;
  const {po,task,cert}=check;
  if(['Received','Completed'].includes(String(po.status||''))){
    const same=String(po.warehouseReceiptTaskId||'')===String(task.id||'');
    return {ok:true,changed:false,code:same?'ALREADY_ACKNOWLEDGED':'ALREADY_RECEIVED',po:clone(po),task:clone(task)};
  }
  if(!window.RUNLUOrdersDrawerV066||typeof window.RUNLUOrdersDrawerV066.syncPeopleToCall!=='function')return {ok:false,code:'PEOPLE_TO_CALL_AUTHORITY_UNAVAILABLE'};

  const beforePO=raw(PO_STORE),beforeCALL=raw(CALL_STORE),all=pos(),idx=all.findIndex(x=>x&&String(x.id||'')===String(po.id||'')&&poKey(x.poNumber)===poKey(po.poNumber));
  if(idx<0)return {ok:false,code:'LOCAL_PO_CHANGED'};
  const at=now(),audit={at,taskId:String(task.id),taskStatus:String(task.status||''),inventoryVerifiedAt:cert.verifiedAt,inventoryOperationIds:cert.operationIds.slice(),decision:'WAREHOUSE_VERIFIED_FULL_RECEIPT'};
  const history=Array.isArray(all[idx].warehouseReceiptHistory)?all[idx].warehouseReceiptHistory.slice():[];
  audit.inventoryEvidenceKind=cert.evidenceKind||'legacy-certificate';audit.inventoryEvidenceIds=(cert.evidenceIds||cert.operationIds||[]).slice();
  history.push(audit);
  all[idx]={...all[idx],status:'Received',receivedDate:all[idx].receivedDate||at.slice(0,10),warehouseReceiptAcknowledgedAt:at,warehouseReceiptTaskId:String(task.id),warehouseReceiptStatus:String(task.status||''),warehouseReceiptInventoryVerifiedAt:cert.verifiedAt,warehouseReceiptInventoryOperationIds:cert.operationIds.slice(),warehouseReceiptInventoryEvidenceKind:cert.evidenceKind||'legacy-certificate',warehouseReceiptInventoryEvidenceIds:(cert.evidenceIds||cert.operationIds||[]).slice(),warehouseReceiptHistory:history.slice(-MAX_HISTORY),updatedAt:at};
  try{localStorage.setItem(PO_STORE,JSON.stringify(all))}catch(e){restore(PO_STORE,beforePO);return {ok:false,code:'PO_WRITE_FAILED',error:e?.message||String(e)}}
  try{
    window.RUNLUOrdersDrawerV066.syncPeopleToCall();
    if(!queueHasPO(all[idx]))throw new Error('People TO Call queue did not confirm the received PO.');
  }catch(e){
    const poBack=restore(PO_STORE,beforePO),callBack=restore(CALL_STORE,beforeCALL);
    return {ok:false,code:'PEOPLE_TO_CALL_COMMIT_FAILED',error:e?.message||String(e),rollback:{po:poBack,peopleToCall:callBack}};
  }
  try{window.RUNLUOrdersDrawerV066.refresh?.()}catch(_){}
  return {ok:true,changed:true,code:'ACKNOWLEDGED',po:clone(all[idx]),task:clone(task)};
}

function reconcile(){
  const seen=new Set(),results=[];
  for(const t of tasks()){
    const k=poKey(t?.po_number);if(!k||seen.has(k))continue;seen.add(k);results.push({poNumber:k,...acknowledgePO(k)});
  }
  return results;
}

window.RUNLUWarehouseReceiptAckV098={
  version:VERSION,evaluatePO,acknowledgePO,reconcile,poKey,
  requiresInventoryCertificate:true,supportsPostedInventoryEvidence:true,purchaseTypeAwareEvidence:true,requiresPurchaseTypeAgreement:true,jobSpecificInventoryPostingRequired:false,requiresTerminalWarehouseTimestamp:true,requiresFreshWarehouseCache:true,maxWarehouseCacheAgeMs:MAX_CACHE_AGE_MS,requiresFullReceipt:true,duplicateEvidenceFailsClosed:true,
  atomicPOAndPeopleToCall:true,warehouseReadOnly:true,jobStateReadOnly:true,salesStateReadOnly:true,
  productionAutoInstall:false
};
})();
