/* RUNLU Deerfoot Flooring OS · V0.4.07 Storage Resilience
   Browser-local critical-data safety net:
   - keeps the latest + previous valid JSON snapshot in IndexedDB
   - never replaces corrupt localStorage automatically
   - exposes explicit recovery only after user confirmation
   - warns when origin storage or localStorage footprint is becoming large
*/
(function(root){
'use strict';
if(root.__RUNLU_STORAGE_RESILIENCE_V0407__)return;
root.__RUNLU_STORAGE_RESILIENCE_V0407__=true;

const DB='runlu-flooring-resilience-v0407',STORE='snapshots',VERSION='0.4.07';
const KEYS=[
  'runlu_deerfoot_flooring_jobs_v1',
  'runlu_deerfoot_supplier_orders_v1',
  'runlu_deerfoot_po_settings_v1',
  'runlu_flooring_payment_lifecycle_v045',
  'runlu_accounting_foundation_v067',
  'runlu_vendor_invoices_v067',
  'runlu_deerfoot_service_claims_v1',
  'runlu_calendar_manual_events_v056',
  'runlu_calendar_people_v064',
  'runlu_deerfoot_sales_followups_v1'
];
let dbp=null,lastHealth=null,timer=0;
const validJSON=raw=>{if(raw==null)return false;try{JSON.parse(raw);return true}catch(_){return false}};
const bytes=s=>new Blob([String(s||'')]).size;
function openDB(){
  if(dbp)return dbp;
  dbp=new Promise((resolve,reject)=>{
    if(!root.indexedDB)return reject(new Error('IndexedDB unavailable'));
    const req=root.indexedDB.open(DB,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'key'})};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open failed'))
  });
  return dbp
}
async function getRec(key){
  const db=await openDB();return new Promise((resolve,reject)=>{const q=db.transaction(STORE,'readonly').objectStore(STORE).get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})
}
async function putRec(rec){
  const db=await openDB();return new Promise((resolve,reject)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).put(rec);q.onsuccess=()=>resolve(true);q.onerror=()=>reject(q.error)})
}
async function snapshotKey(key){
  const raw=localStorage.getItem(key);if(!validJSON(raw))return {key,saved:false,reason:raw==null?'missing':'invalid'};
  const old=await getRec(key).catch(()=>null);if(old?.raw===raw)return {key,saved:false,reason:'unchanged'};
  await putRec({key,raw,updatedAt:new Date().toISOString(),bytes:bytes(raw),previousRaw:old?.raw&&validJSON(old.raw)?old.raw:(old?.previousRaw||null),previousAt:old?.updatedAt||old?.previousAt||null});
  return {key,saved:true}
}
async function snapshotAll(){
  const out=[];for(const key of KEYS){try{out.push(await snapshotKey(key))}catch(e){out.push({key,saved:false,reason:e?.message||String(e)})}}
  await inspect();return out
}
function localBytes(){
  let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=bytes(k)+bytes(localStorage.getItem(k))}return n
}
async function inspect(){
  const bad=[],recoverable=[];
  for(const key of KEYS){
    const raw=localStorage.getItem(key);if(raw!=null&&!validJSON(raw)){bad.push(key);try{const rec=await getRec(key);if(rec&&validJSON(rec.raw))recoverable.push(key)}catch(_){}}
  }
  let estimate={usage:0,quota:0,ratio:0};try{const e=await navigator.storage?.estimate?.();estimate={usage:Number(e?.usage||0),quota:Number(e?.quota||0),ratio:e?.quota?Number(e.usage||0)/Number(e.quota):0}}catch(_){}
  lastHealth={bad,recoverable,localBytes:localBytes(),estimate,checkedAt:new Date().toISOString()};paintWarning();return lastHealth
}
async function recover(key,slot='latest'){
  if(!KEYS.includes(key))throw new Error('Recovery key is not approved');
  const rec=await getRec(key);if(!rec)throw new Error('No safe snapshot exists');
  const raw=slot==='previous'?rec.previousRaw:rec.raw;if(!validJSON(raw))throw new Error('Selected snapshot is not valid JSON');
  if(!confirm('Restore the last safe browser backup for '+key+'? The current unreadable value will be preserved under a recovery key first.'))return false;
  const current=localStorage.getItem(key);try{if(current!=null)localStorage.setItem(key+'_pre_restore_v0407',current)}catch(_){}
  localStorage.setItem(key,raw);location.reload();return true
}
async function recoverAll(){
  const h=lastHealth||await inspect();if(!h.recoverable.length)return false;
  if(!confirm('Restore safe IndexedDB backups for '+h.recoverable.length+' unreadable Flooring data store(s)? Current unreadable values will be preserved first.'))return false;
  for(const key of h.recoverable){const rec=await getRec(key);if(!rec||!validJSON(rec.raw))continue;const current=localStorage.getItem(key);try{if(current!=null)localStorage.setItem(key+'_pre_restore_v0407',current)}catch(_){}localStorage.setItem(key,rec.raw)}
  location.reload();return true
}
function paintWarning(){
  if(typeof document==='undefined'||!document.body||!lastHealth)return;
  const risky=lastHealth.bad.length||lastHealth.localBytes>3_000_000||lastHealth.estimate.ratio>.8;
  let b=document.getElementById('runluStorageSafetyV0407');
  if(!risky){b?.remove();return}
  if(!b){b=document.createElement('div');b.id='runluStorageSafetyV0407';b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;padding:9px 11px;border-radius:10px;background:#fff4d9;color:#5f4b16;border:1px solid #dfc983;box-shadow:0 4px 18px rgba(0,0,0,.16);font:700 11px/1.35 Arial,sans-serif;display:flex;gap:10px;align-items:center;justify-content:space-between';document.body.appendChild(b)}
  const mb=(lastHealth.localBytes/1048576).toFixed(2),pct=lastHealth.estimate.quota?(lastHealth.estimate.ratio*100).toFixed(0):'—';
  b.innerHTML='<span>RUNLU Storage Safety · '+(lastHealth.bad.length?lastHealth.bad.length+' unreadable critical store(s)':'browser data growth warning')+' · local '+mb+' MB · origin '+pct+'%</span>'+(lastHealth.recoverable.length?'<button id="runluStorageRecoverV0407" style="border:0;border-radius:7px;padding:7px 9px;background:#173d30;color:white;font-weight:800">Restore Safe Copy</button>':'');
  document.getElementById('runluStorageRecoverV0407')?.addEventListener('click',recoverAll)
}
function schedule(){
  clearInterval(timer);timer=setInterval(()=>{if(document.visibilityState==='visible')snapshotAll().catch(()=>{})},60000)
}
function boot(){
  setTimeout(()=>snapshotAll().catch(()=>inspect().catch(()=>{})),1500);schedule();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')snapshotAll().catch(()=>{})});
  root.addEventListener('pagehide',()=>snapshotAll().catch(()=>{}));
  root.addEventListener('storage',e=>{if(KEYS.includes(e.key))setTimeout(()=>snapshotKey(e.key).catch(()=>{}),250)})
}
root.RUNLUStorageResilienceV0407={VERSION,KEYS,snapshot:snapshotAll,health:inspect,recover,recoverAll};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
})(typeof globalThis!=='undefined'?globalThis:this);
