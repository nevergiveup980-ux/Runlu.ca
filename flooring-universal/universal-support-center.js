/* RUNLU Flooring OS Universal · Support & Recovery Center
   Customer-facing maintenance hub. Aggregates existing safety tools; does not mutate business data itself. */
(function(){
'use strict';
const TOOLS=[
 {id:'journal',title:'Crash Journal',desc:'Review unfinished write-ahead business operations.',target:'universalCrashJournal',api:'RUNLUUniversalCrashJournal'},
 {id:'startup',title:'Startup Recovery Guard',desc:'Review abnormal-exit and startup integrity findings.',target:'universalStartupGuard',api:'RUNLUUniversalStartupGuard'},
 {id:'device',title:'Device Readiness',desc:'Check whether this device is ready for Local-First work.',target:'universalDeviceReady',api:'RUNLUUniversalDeviceReady'},
 {id:'health',title:'Data Health',desc:'Inspect local JSON integrity, storage and Recovery Points.',target:'universalLocalHealth',api:'RUNLUUniversalLocalHealth'},
 {id:'backup',title:'Backup / Restore',desc:'Download an independent backup or restore a Universal backup.',target:'universalBackup',api:'RUNLUUniversalBackup'},
 {id:'durable',title:'Durable Local',desc:'Check IndexedDB mirror and local recovery options.',target:'universalDurableLocal',api:'RUNLUUniversalDurableLocalUI'},
 {id:'offline',title:'Offline / Install',desc:'Check PWA installation and offline app-shell status.',target:'universalOffline',api:'RUNLUUniversalPWA'},
 {id:'version',title:'Data Version',desc:'View schema compatibility and migration history.',target:'universalDataVersion',api:'RUNLUUniversalDataVersion'},
 {id:'diagnostics',title:'Diagnostics',desc:'Generate a privacy-safe support report.',target:'universalDiagnostics',api:'RUNLUUniversalDiagnostics'}
];
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function status(){
 const ready=await window.RUNLUUniversalDeviceReady?.run?.().catch?.(()=>null);
 const durable=await window.RUNLUUniversalDurableLocal?.status?.().catch?.(()=>null);
 const schema=window.RUNLUUniversalDataVersion?.status?.()||null;
 const pwa=window.RUNLUUniversalPWA?.status?.()||null;
 const points=window.RUNLUUniversalLocalHealth?.points?.()||[];
 const gate=window.RUNLUUniversalReleaseGate?.run?.()||null;
 const startup=window.RUNLUUniversalStartupGuard?.canProceed?.()!==false;
 return {
  startup,
  ready:!!ready?.ready,
  durable:!!durable?.ready,
  schema:!!schema?.compatible&&schema.workspaceVersion>0,
  offline:!!pwa?.supported&&!!pwa?.registered,
  recoveryPoints:points.length,
  releasePass:!!gate&&gate.failed===0,
  releaseFailed:gate?.failed??null
 };
}
function openTool(item){
 const section=document.getElementById(item.target);if(!section)return;
 section.hidden=false;
 const api=window[item.api];
 if(item.id==='durable')api?.render?.();else api?.render?.();
 section.scrollIntoView({behavior:'smooth'});
}
async function render(){
 const host=document.getElementById('universalSupportCenter');if(!host)return;
 host.innerHTML='<div class="card"><h2>Support & Recovery</h2><p class="muted">Running maintenance checks…</p></div>';
 const s=await status(),healthy=s.startup&&s.ready&&s.durable&&s.schema&&s.offline&&s.releasePass;
 host.innerHTML='<div class="card"><h2>Support & Recovery Center</h2><p class="muted">One maintenance station for device checks, recovery, backups, offline support and diagnostics.</p><div class="uSupportHero '+(healthy?'pass':'hold')+'"><div><b>'+(healthy?'SYSTEM PROTECTED ✓':'MAINTENANCE CHECK')+'</b><span>'+(healthy?'Core Local-First protection layers are ready.':'One or more protection layers need review.')+'</span></div><strong>'+(navigator.onLine!==false?'ONLINE':'OFFLINE')+'</strong></div><div class="uSupportStrip"><span>Startup <b>'+(s.startup?'READY':'REVIEW')+'</b></span><span>Device <b>'+(s.ready?'READY':'CHECK')+'</b></span><span>IndexedDB <b>'+(s.durable?'READY':'CHECK')+'</b></span><span>Schema <b>'+(s.schema?'READY':'CHECK')+'</b></span><span>Offline <b>'+(s.offline?'READY':'CHECK')+'</b></span><span>Recovery Points <b>'+esc(s.recoveryPoints)+'</b></span><span>Release Gate <b>'+(s.releasePass?'PASS':s.releaseFailed===null?'CHECK':'HOLD')+'</b></span></div></div><div class="card"><h3>Maintenance Tools</h3><div class="uSupportTools">'+TOOLS.map(x=>'<button class="uSupportTool" data-support="'+esc(x.id)+'"><b>'+esc(x.title)+'</b><span>'+esc(x.desc)+'</span></button>').join('')+'</div><p class="muted">These tools stay separate internally, but customers reach them through one support center.</p></div>';
 host.querySelectorAll('[data-support]').forEach(btn=>btn.onclick=()=>openTool(TOOLS.find(x=>x.id===btn.dataset.support)));
}
window.RUNLUUniversalSupportCenter=Object.freeze({TOOLS,status,render});
})();