/* RUNLU Flooring OS · Warehouse Verified Receipt Acknowledgement V0.9.8 · Safe Reintroduction
   Historical V0.9.8 was a fail-closed candidate and never production-loaded.
   Safe restoration rules:
   - Warehouse remains physical execution authority.
   - This module reads current flooring_supplier_tasks evidence only after an explicit user check.
   - A Pickup PO may become Received only after one unambiguous task proves full receiving
     AND completed inventory posting using the current inventory_post_* schema.
   - Supplier Delivery remains blocked here; its downstream authority is separate.
   - No Warehouse/cloud mutation occurs. Only the local Flooring PO + People TO Call queue
     may change, and only after an explicit Acknowledge action.
*/
(function(root){
'use strict';
if(root.__runluWarehouseReceiptAckV098Safe)return;
root.__runluWarehouseReceiptAckV098Safe=true;

const VERSION='0.9.8-safe';
const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const ENV='training';
const PAGE='receiptAck098';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const CALL_STORE='runlu_people_to_call_v066';
const MAX_HISTORY=50;
let sb=null,lastRows=[],lastCheck=null,busy=false;

const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const raw=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const restore=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);return true}catch(e){console.error('[Receipt Ack V098 rollback]',k,e);return false}};
const now=()=>new Date().toISOString();
const localDate=v=>{const d=v?new Date(v):new Date();if(Number.isNaN(d.getTime()))return '';return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const poKey=v=>{const d=String(v??'').replace(/\D/g,'');return d&&Number(d)>0?String(Number(d)):''};
const num=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const norm=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const qtyOf=x=>num(x?.qty??x?.quantity);
const clone=x=>JSON.parse(JSON.stringify(x));
const pos=()=>{const x=read(PO_STORE,[]);return Array.isArray(x)?x:[]};
const calls=()=>{const x=read(CALL_STORE,[]);return Array.isArray(x)?x:[]};
const lineName=x=>norm(x?.style||x?.product||x?.description||x?.sku||'');
const lineColour=x=>norm(x?.colour||x?.color||'');

async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!root.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,150));
  if(!root.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=root.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});
  return sb
}
async function fetchEvidence(poNumber){
  const k=poKey(poNumber);if(!k)throw new Error('Enter a valid PO number.');
  const c=await client(),s=(await c.auth.getSession()).data?.session||null;
  if(!s)throw new Error('Staff sign-in required.');
  const q=await c.from('flooring_supplier_tasks').select('*').eq('environment',ENV).eq('po_number',Number(k)).order('updated_at',{ascending:false}).limit(5);
  if(q.error)throw q.error;
  lastRows=Array.isArray(q.data)?q.data:[];
  return lastRows
}
function localMatches(poNumber){
  const k=poKey(poNumber);return k?pos().filter(p=>poKey(p?.poNumber)===k):[]
}
function taskMatches(poNumber,rows=lastRows){
  const k=poKey(poNumber);return k?(Array.isArray(rows)?rows:[]).filter(t=>poKey(t?.po_number)===k):[]
}
function postingForLine(postings,index){
  const n=index+1;
  return postings.filter(p=>Number(p?.line)===n)
}
function evaluateEvidence(po,task){
  if(!po||!task)return {ok:false,code:'EVIDENCE_MISSING'};
  const method=String(task.fulfillment_method||po.fulfillment||'Pickup');
  if(/deliver/i.test(method))return {ok:false,code:'SUPPLIER_DELIVERY_NOT_AUTHORIZED'};
  if(!/pickup/i.test(method))return {ok:false,code:'FULFILLMENT_NOT_SUPPORTED'};
  if(!String(task.received_at||'').trim())return {ok:false,code:'WAREHOUSE_RECEIPT_TIME_MISSING'};
  if(String(task.inventory_post_status||'')!=='Posted')return {ok:false,code:'INVENTORY_NOT_POSTED'};
  if(!String(task.inventory_posted_at||'').trim())return {ok:false,code:'INVENTORY_POST_TIME_MISSING'};

  const ordered=Array.isArray(task.items)?task.items:[];
  const received=Array.isArray(task.received_items)?task.received_items:[];
  const postings=Array.isArray(task.inventory_postings)?task.inventory_postings:[];
  if(!ordered.length||received.length!==ordered.length)return {ok:false,code:'RECEIPT_LINE_COUNT'};
  if(!postings.length)return {ok:false,code:'INVENTORY_POSTINGS_MISSING'};

  const local=Array.isArray(po.items)?po.items:[];
  if(local.length&&local.length!==ordered.length)return {ok:false,code:'LOCAL_LINE_COUNT'};
  for(let i=0;i<ordered.length;i++){
    const tq=qtyOf(ordered[i]),oq=num(received[i]?.ordered_qty),rq=num(received[i]?.received_qty);
    if(!(tq>0&&oq>0&&rq>0))return {ok:false,code:'INVALID_QUANTITY',line:i};
    if(tq!==oq||oq!==rq)return {ok:false,code:'NOT_FULL_RECEIPT',line:i,ordered:tq,received:rq};
    const ps=postingForLine(postings,i);
    if(!ps.length)return {ok:false,code:'POSTING_LINE_MISSING',line:i};
    const posted=ps.reduce((a,p)=>a+(num(p?.quantity)??num(p?.received_qty)??0),0);
    if(posted!==tq)return {ok:false,code:'POSTING_QUANTITY_MISMATCH',line:i,ordered:tq,posted};
    if(ps.some(p=>!String(p?.inventory_id||p?.master_id||'').trim()))return {ok:false,code:'POSTING_IDENTITY_MISSING',line:i};
    if(local.length){
      const lq=qtyOf(local[i]);if(!(lq>0)||lq!==tq)return {ok:false,code:'LOCAL_QUANTITY_MISMATCH',line:i};
      const ln=lineName(local[i]),tn=lineName(ordered[i]);if(ln&&tn&&ln!==tn)return {ok:false,code:'LOCAL_PRODUCT_MISMATCH',line:i};
      const lc=lineColour(local[i]),tc=lineColour(ordered[i]);if(lc&&tc&&lc!==tc)return {ok:false,code:'LOCAL_COLOUR_MISMATCH',line:i};
    }
  }
  return {
    ok:true,code:'VERIFIED_FULL_RECEIPT',ordered,received,postings,
    receivedAt:String(task.received_at),inventoryPostedAt:String(task.inventory_posted_at)
  }
}
function evaluatePO(poNumber,rows=lastRows){
  const k=poKey(poNumber);if(!k)return {ok:false,code:'INVALID_PO'};
  const ps=localMatches(k);if(ps.length!==1)return {ok:false,code:ps.length?'DUPLICATE_LOCAL_PO':'LOCAL_PO_NOT_FOUND',count:ps.length};
  const ts=taskMatches(k,rows);if(ts.length!==1)return {ok:false,code:ts.length?'DUPLICATE_WAREHOUSE_TASK':'WAREHOUSE_TASK_NOT_FOUND',count:ts.length};
  const po=ps[0],task=ts[0],proof=evaluateEvidence(po,task);
  return proof.ok?{ok:true,code:proof.code,po,task,proof}:{...proof,po,task}
}
function queueHasPO(po){
  const k=poKey(po.poNumber),jid=String(po.jobId||''),jnum=String(po.jobNumber||'');
  return calls().some(q=>q&&q.status!=='Done'&&(jid&&String(q.orderId||'')===jid||!jid&&jnum&&String(q.orderNumber||'')===jnum)&&Array.isArray(q.sourcePOs)&&q.sourcePOs.some(x=>poKey(x)===k))
}
function acknowledgePO(poNumber,rows=lastRows){
  const check=evaluatePO(poNumber,rows);if(!check.ok)return check;
  const {po,task,proof}=check;
  if(['Received','Completed'].includes(String(po.status||''))){
    const same=String(po.warehouseReceiptTaskId||'')===String(task.id||'');
    return {ok:true,changed:false,code:same?'ALREADY_ACKNOWLEDGED':'ALREADY_RECEIVED',po:clone(po),task:clone(task)}
  }
  if(!root.RUNLUOrdersDrawerV066||typeof root.RUNLUOrdersDrawerV066.syncPeopleToCall!=='function')return {ok:false,code:'PEOPLE_TO_CALL_AUTHORITY_UNAVAILABLE'};

  const beforePO=raw(PO_STORE),beforeCALL=raw(CALL_STORE),all=pos();
  const idx=all.findIndex(x=>x&&String(x.id||'')===String(po.id||'')&&poKey(x.poNumber)===poKey(po.poNumber));
  if(idx<0)return {ok:false,code:'LOCAL_PO_CHANGED'};
  const at=now(),audit={
    at,decision:'WAREHOUSE_VERIFIED_FULL_RECEIPT',
    taskId:String(task.id||''),taskStatus:String(task.status||''),
    receivedAt:proof.receivedAt,inventoryPostedAt:proof.inventoryPostedAt,
    inventoryPostStatus:String(task.inventory_post_status||''),
    postingIds:proof.postings.map(p=>String(p?.inventory_id||p?.master_id||'')).filter(Boolean)
  };
  const history=Array.isArray(all[idx].warehouseReceiptHistory)?all[idx].warehouseReceiptHistory.slice():[];
  history.push(audit);
  all[idx]={
    ...all[idx],status:'Received',
    receivedDate:all[idx].receivedDate||localDate(proof.receivedAt)||localDate(),
    warehouseReceiptAcknowledgedAt:at,
    warehouseReceiptTaskId:String(task.id||''),
    warehouseReceiptStatus:String(task.status||''),
    warehouseReceiptReceivedAt:proof.receivedAt,
    warehouseReceiptInventoryPostedAt:proof.inventoryPostedAt,
    warehouseReceiptPostStatus:String(task.inventory_post_status||''),
    warehouseReceiptHistory:history.slice(-MAX_HISTORY),updatedAt:at
  };
  try{localStorage.setItem(PO_STORE,JSON.stringify(all))}catch(e){restore(PO_STORE,beforePO);return {ok:false,code:'PO_WRITE_FAILED',error:e?.message||String(e)}}
  try{
    root.RUNLUOrdersDrawerV066.syncPeopleToCall();
    if(!queueHasPO(all[idx]))throw new Error('People TO Call queue did not confirm the received Pickup PO.');
  }catch(e){
    const poBack=restore(PO_STORE,beforePO),callBack=restore(CALL_STORE,beforeCALL);
    return {ok:false,code:'PEOPLE_TO_CALL_COMMIT_FAILED',error:e?.message||String(e),rollback:{po:poBack,peopleToCall:callBack}}
  }
  try{root.RUNLUOrdersDrawerV066.refresh?.()}catch(_){}
  return {ok:true,changed:true,code:'ACKNOWLEDGED',po:clone(all[idx]),task:clone(task)}
}

function ensureStyle(){
  if(by('ra098style'))return;
  const s=document.createElement('style');s.id='ra098style';s.textContent=`
#receiptAck098 .ra098head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.ra098state{font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#edf3f0;color:#245841}.ra098state.warn{background:#fff1d8;color:#7a5600}.ra098controls{display:grid;grid-template-columns:minmax(160px,220px) auto auto;gap:8px;align-items:end;margin:14px 0}.ra098controls label{display:grid;gap:5px;font-size:10px;font-weight:800;color:#53645d}.ra098controls input{width:100%;padding:10px 11px;border:1px solid #cbd8d2;border-radius:8px;background:#fff}.ra098result{border:1px solid #dce5e0;border-radius:10px;padding:12px;background:#fff;min-height:90px}.ra098result.good{border-left:5px solid #2f7658}.ra098result.bad{border-left:5px solid #a96d18}.ra098facts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.ra098fact{padding:9px;border-radius:8px;background:#f6f9f7}.ra098fact b{display:block;color:#214b3b}.ra098fact small{display:block;margin-top:3px;color:#718078}.ra098note{margin-top:10px;padding:9px 10px;border-radius:8px;background:#fff7e8;color:#795a16;font-size:10px;font-weight:800}@media(max-width:700px){.ra098controls{grid-template-columns:1fr}.ra098controls input,.ra098controls button{min-height:48px;font-size:16px}.ra098facts{grid-template-columns:1fr}.ra098controls button{font-size:14px}}
`;document.head.appendChild(s)
}
function ensurePage(){
  ensureStyle();if(by(PAGE))return;
  const main=document.querySelector('main');if(!main)return;
  const p=document.createElement('section');p.id=PAGE;p.className='page';
  p.innerHTML=`<div class="card"><div class="ra098head"><div><h2>Verified Receipt Acknowledgement</h2><p class="muted">Pickup PO only. Warehouse receiving + inventory posting must both be proven before Flooring can mark the PO Received.</p></div><span id="ra098state" class="ra098state">MANUAL CHECK</span></div><div class="ra098controls"><label>PO Number<input id="ra098po" inputmode="numeric" autocomplete="off" placeholder="e.g. 181700"></label><button type="button" class="action" id="ra098check">Check Warehouse Proof</button><button type="button" class="action primary" id="ra098ack" disabled>Acknowledge Received</button></div><div id="ra098result" class="ra098result"><b>No PO checked yet.</b><div class="muted" style="margin-top:4px">Nothing changes until you explicitly press Acknowledge Received.</div></div><div class="ra098note">Supplier Delivery is intentionally blocked in this module. This phase never writes Warehouse or Supabase data.</div></div>`;
  main.appendChild(p);
  by('ra098check')?.addEventListener('click',checkFromUI);
  by('ra098ack')?.addEventListener('click',ackFromUI)
}
function paintResult(r){
  const el=by('ra098result'),ack=by('ra098ack'),state=by('ra098state');if(!el)return;
  const ok=!!r?.ok;el.classList.toggle('good',ok);el.classList.toggle('bad',!ok);
  if(ack)ack.disabled=!ok;
  if(state){state.textContent=ok?'PROOF VERIFIED':'CHECK REQUIRED';state.classList.toggle('warn',!ok)}
  if(!r){el.innerHTML='<b>No PO checked yet.</b>';return}
  const po=r.po||{},task=r.task||{},proof=r.proof||r;
  const facts=[
    ['PO',po.poNumber||'—'],['Warehouse Task',task.id||'—'],['Task Status',task.status||'—'],
    ['Received At',task.received_at?new Date(task.received_at).toLocaleString():'—'],
    ['Inventory Post',task.inventory_post_status||'—'],
    ['Posted At',task.inventory_posted_at?new Date(task.inventory_posted_at).toLocaleString():'—']
  ];
  el.innerHTML=`<b>${ok?'Verified full Pickup receipt':'Not ready to acknowledge'}</b><div class="muted" style="margin-top:4px">Code: ${esc(r.code||'UNKNOWN')}</div><div class="ra098facts">${facts.map(x=>`<div class="ra098fact"><b>${esc(x[1])}</b><small>${esc(x[0])}</small></div>`).join('')}</div>`;
}
async function checkFromUI(){
  if(busy)return;const po=by('ra098po')?.value||'';busy=true;
  const b=by('ra098check');if(b){b.disabled=true;b.textContent='Checking…'}
  try{const rows=await fetchEvidence(po);lastCheck=evaluatePO(po,rows);paintResult(lastCheck)}
  catch(e){lastCheck={ok:false,code:'CHECK_FAILED',error:e?.message||String(e)};paintResult(lastCheck)}
  finally{busy=false;if(b){b.disabled=false;b.textContent='Check Warehouse Proof'}}
}
function ackFromUI(){
  const po=by('ra098po')?.value||'';
  if(!lastCheck?.ok||poKey(lastCheck?.po?.poNumber)!==poKey(po)){paintResult({ok:false,code:'RECHECK_REQUIRED'});return}
  const r=acknowledgePO(po,lastRows);lastCheck=r;paintResult(r);
  if(r.ok&&r.changed){const state=by('ra098state');if(state){state.textContent='ACKNOWLEDGED';state.classList.remove('warn')}}
}
function open(){
  ensurePage();
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE));
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE));
  window.scrollTo({top:0,behavior:'smooth'})
}
function install(){
  ensurePage();
  const nav=by('nav');
  if(nav&&!nav.querySelector('[data-page="'+PAGE+'"]')){const b=document.createElement('button');b.type='button';b.dataset.page=PAGE;b.textContent='Receipt Check';b.addEventListener('click',open);const f=nav.querySelector('[data-page="warehouseFulfillment"]');f?f.insertAdjacentElement('afterend',b):nav.appendChild(b)}
}
root.RUNLUWarehouseReceiptAckV098Safe={
  version:VERSION,install,open,fetchEvidence,evaluateEvidence,evaluatePO,acknowledgePO,poKey,
  productionAutoAcknowledge:false,cloudReadOnly:true,warehouseReadOnly:true,
  requiresFullReceipt:true,requiresInventoryPost:true,supplierDeliveryBlocked:true,
  atomicPOAndPeopleToCall:true
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
