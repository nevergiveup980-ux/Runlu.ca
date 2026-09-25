/* RUNLU Flooring OS Universal · IndexedDB Durable Mirror
   Phase 1: synchronous Local Adapter remains operational source; IndexedDB is an asynchronous durable mirror and recovery source. */
(function(){
'use strict';
const DB='runlu-flooring-universal-local',DBV=1,STORE='records',PREFIX='runlu_flooring_universal_',BACKEND='runlu_flooring_universal_data_backend',SNAP='runlu_flooring_universal_u2_recovery_points',GUARD='runlu_flooring_universal_u2_startup_guard';
let dbPromise=null,lastError=null,lastSyncAt=null,pending=0;

function supported(){return typeof indexedDB!=='undefined'}
function open(){
 if(!supported())return Promise.reject(new Error('IndexedDB is not supported by this browser.'));
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB,DBV);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'key'})};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>{lastError=req.error?.message||'IndexedDB open failed';reject(req.error||new Error(lastError))};
 });
 return dbPromise;
}
async function put(key,value){
 if(!key?.startsWith(PREFIX)||key===BACKEND||key===SNAP||key===GUARD)return;
 pending++;
 try{const db=await open();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({key,value,updatedAt:new Date().toISOString()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});lastSyncAt=new Date().toISOString();lastError=null}
 catch(e){lastError=e?.message||String(e)}finally{pending--}
}
async function remove(key){
 if(!key?.startsWith(PREFIX)||key===BACKEND||key===SNAP||key===GUARD)return;
 pending++;
 try{const db=await open();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});lastSyncAt=new Date().toISOString();lastError=null}
 catch(e){lastError=e?.message||String(e)}finally{pending--}
}
async function all(){
 const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});
}
async function seed(){
 if(window.RUNLUUniversalData?.backendConfig?.().mode!=='local'||!supported())return {ok:false,reason:'not-local-or-unsupported'};
 const adapter=window.RUNLUUniversalData.current(),keys=(adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!==BACKEND&&k!==SNAP&&k!==GUARD);
 for(const key of keys)await put(key,adapter.read(key,null));
 return {ok:true,records:keys.length};
}
async function recoverMissing(){
 if(window.RUNLUUniversalData?.backendConfig?.().mode!=='local')throw new Error('IndexedDB recovery is available only in Local Device mode.');
 const records=await all(),adapter=window.RUNLUUniversalData.current();let restored=0,skipped=0;
 window.RUNLUUniversalLocalHealth?.capture?.('Before IndexedDB recovery',{records:records.length});
 for(const r of records){if(!r.key?.startsWith(PREFIX)||r.key===BACKEND||r.key===SNAP||r.key===GUARD||key===GUARD)continue;if(adapter.raw(r.key)===null){adapter.write(r.key,r.value);restored++}else skipped++}
 return {restored,skipped,total:records.length};
}
async function replaceLocalFromMirror(){
 if(window.RUNLUUniversalData?.backendConfig?.().mode!=='local')throw new Error('IndexedDB recovery is available only in Local Device mode.');
 const records=await all();if(!records.length)throw new Error('Durable mirror is empty.');
 window.RUNLUUniversalLocalHealth?.capture?.('Before full IndexedDB mirror restore',{records:records.length});
 const adapter=window.RUNLUUniversalData.current();
 (adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!==BACKEND&&k!==SNAP&&k!==GUARD).forEach(k=>adapter.remove(k));
 records.forEach(r=>{if(r.key?.startsWith(PREFIX)&&r.key!==BACKEND&&r.key!==SNAP&&r.key!==GUARD)adapter.write(r.key,r.value)});
 return {restored:records.length};
}
async function compareWithAdapter(){
 if(window.RUNLUUniversalData?.backendConfig?.().mode!=='local')return {ok:true,comparable:false,reason:'not-local'};
 const adapter=window.RUNLUUniversalData.current(),records=await all();
 const localKeys=(adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!==BACKEND&&k!==SNAP&&k!==GUARD).sort();
 const mirror=new Map(records.filter(r=>r.key?.startsWith(PREFIX)&&r.key!==BACKEND&&r.key!==SNAP&&r.key!==GUARD).map(r=>[r.key,r.value]));
 const mirrorKeys=[...mirror.keys()].sort(),missingLocal=mirrorKeys.filter(k=>adapter.raw(k)===null),missingMirror=localKeys.filter(k=>!mirror.has(k)),different=[];
 localKeys.filter(k=>mirror.has(k)).forEach(k=>{const local=adapter.read(k,null),remote=mirror.get(k);if(JSON.stringify(local)!==JSON.stringify(remote))different.push(k)});
 return {ok:missingLocal.length===0&&missingMirror.length===0&&different.length===0,comparable:true,localRecords:localKeys.length,mirrorRecords:mirrorKeys.length,missingLocal:missingLocal.length,missingMirror:missingMirror.length,different:different.length};
}
async function status(){
 if(!supported())return {supported:false,ready:false,records:0,pending,lastSyncAt,error:'IndexedDB unsupported'};
 try{const records=await all();return {supported:true,ready:true,records:records.length,pending,lastSyncAt,error:lastError}}catch(e){return {supported:true,ready:false,records:0,pending,lastSyncAt,error:lastError||e.message}}
}
function init(){
 if(!supported())return;
 window.RUNLUUniversalData?.onMutation?.(e=>{if(e.adapter!=='local'||!e.key?.startsWith(PREFIX)||e.key===BACKEND||e.key===SNAP||key===GUARD)return;e.type==='remove'?remove(e.key):put(e.key,e.value)});
 seed().catch(e=>{lastError=e?.message||String(e)});
}
window.RUNLUUniversalDurableLocal=Object.freeze({supported,seed,status,compareWithAdapter,recoverMissing,replaceLocalFromMirror});
init();
})();