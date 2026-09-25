/* RUNLU Flooring OS Universal · Device Readiness
   First-run/local-device preflight. Read-only except optional storage persistence request. */
(function(){
'use strict';
const WS='runlu_flooring_universal_u0_workspace';
async function cacheCheck(){
 if(!('caches' in window))return {ok:false,detail:'Cache Storage unavailable'};
 try{
  const index=await caches.match(new URL('./index.html',location.href).href);
  const manifest=await caches.match(new URL('./manifest.webmanifest',location.href).href);
  return {ok:!!index&&!!manifest,detail:index&&manifest?'App shell cache found':'Open once online to finish app-shell cache'};
 }catch(e){return {ok:false,detail:e.message||'Cache check failed'}}
}
async function storageCheck(){
 let estimate=null,persisted=null;
 try{estimate=await navigator.storage?.estimate?.()}catch(_){}
 try{persisted=await navigator.storage?.persisted?.()}catch(_){}
 const usage=estimate?.usage||0,quota=estimate?.quota||0,ratio=quota?usage/quota:0;
 return {ok:!quota||ratio<.9,detail:quota?Math.round(ratio*100)+'% browser storage used':'Storage estimate unavailable',persisted};
}
async function run(){
 const data=window.RUNLUUniversalData,workspace=data?.read?.(WS,null),schema=window.RUNLUUniversalDataVersion?.status?.();
 const durable=await window.RUNLUUniversalDurableLocal?.status?.().catch?.(()=>null);
 const pwa=window.RUNLUUniversalPWA?.status?.()||{};
 const cache=await cacheCheck(),storage=await storageCheck(),startupOk=window.RUNLUUniversalStartupGuard?.canProceed?.()!==false;
 const checks=[
  {id:'startup',name:'Startup Recovery Guard',ok:startupOk,detail:startupOk?'Startup cleared':'Critical startup condition requires review'},
  {id:'workspace',name:'Company Workspace',ok:!!workspace?.company?.organizationId,detail:workspace?.company?.organizationId?'Company identity ready':'Complete Company Setup'},
  {id:'adapter',name:'Data Adapter',ok:!!data?.current?.()?.health?.()?.ok,detail:data?.current?.()?.health?.()?.detail||'Unavailable'},
  {id:'schema',name:'Data Version',ok:!!schema?.compatible&&schema.workspaceVersion>0,detail:schema?'Workspace v'+schema.workspaceVersion+' · App v'+schema.currentVersion:'Schema unavailable'},
  {id:'indexeddb',name:'Durable Local',ok:!!durable?.ready,detail:durable?.ready?durable.records+' mirrored data group(s)':durable?.error||'IndexedDB initializing'},
  {id:'serviceworker',name:'Offline Worker',ok:!!pwa.supported&&!!pwa.registered,detail:pwa.registered?'Service Worker registered':pwa.supported?'Registration pending':'Service Worker unsupported'},
  {id:'cache',name:'Offline App Shell',ok:cache.ok,detail:cache.detail},
  {id:'backup',name:'Backup / Restore',ok:typeof window.RUNLUUniversalBackup?.collect==='function'&&typeof window.RUNLUUniversalBackup?.restore==='function',detail:'Portable backup contract'},
  {id:'storage',name:'Storage Capacity',ok:storage.ok,detail:storage.detail}
 ];
 const critical=['workspace','adapter','schema','indexeddb','serviceworker','cache','backup','storage'];
 const failed=checks.filter(x=>critical.includes(x.id)&&!x.ok);
 return {ready:failed.length===0,checks,failed,online:navigator.onLine!==false,installed:!!pwa.installed,persisted:storage.persisted,checkedAt:new Date().toISOString()};
}
async function requestPersistence(){
 if(!navigator.storage?.persist)return {ok:false,detail:'Persistent storage request unavailable'};
 try{const granted=await navigator.storage.persist();return {ok:granted,detail:granted?'Browser granted persistent storage':'Browser kept default storage policy'}}catch(e){return {ok:false,detail:e.message||'Persistence request failed'}}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function renderMini(){
 const host=document.getElementById('deviceReadyMini');if(!host)return;
 const r=await run();host.className='uReadyMini '+(r.ready?'pass':'hold');host.innerHTML='<b>'+(r.ready?'DEVICE READY ✓':'DEVICE SETUP CHECK')+'</b><span>'+(r.ready?'Local-First protection is ready on this device.':r.failed.length+' required check(s) pending · open Device Readiness')+'</span>';
}
async function render(){
 const host=document.getElementById('universalDeviceReady');if(!host)return;
 host.innerHTML='<div class="card"><h2>Device Readiness</h2><p class="muted">Running Local-First preflight…</p></div>';
 const r=await run();
 host.innerHTML='<div class="card"><h2>Device Readiness</h2><p class="muted">One screen to confirm this device can operate the Universal Local-First workspace.</p><div class="uReadyHero '+(r.ready?'pass':'hold')+'"><div><b>'+(r.ready?'DEVICE READY ✓':'SETUP CHECK')+'</b><span>'+(r.ready?'Local workspace, durable data, offline shell and recovery are ready.':r.failed.length+' required check(s) need attention.')+'</span></div><strong>'+(r.online?'ONLINE':'OFFLINE')+'</strong></div></div><div class="card">'+r.checks.map(x=>'<div class="uReadyRow"><div><b>'+(x.ok?'✓':'○')+' '+esc(x.name)+'</b><span>'+esc(x.detail)+'</span></div><strong class="'+(x.ok?'good':'wait')+'">'+(x.ok?'READY':'CHECK')+'</strong></div>').join('')+'<div class="uReadyActions"><button id="uReadyRefresh">Run Check Again</button><button id="uReadyPersist">Protect Local Storage</button></div><p class="muted">Persistent-storage protection depends on browser policy. Downloaded backups remain the independent disaster-recovery copy.</p></div>';
 document.getElementById('uReadyRefresh').onclick=render;
 document.getElementById('uReadyPersist').onclick=async()=>{const x=await requestPersistence();alert(x.detail);render()};
}
window.RUNLUUniversalDeviceReady=Object.freeze({run,requestPersistence,render,renderMini});
setTimeout(renderMini,900);window.addEventListener('online',renderMini);window.addEventListener('offline',renderMini);
})();