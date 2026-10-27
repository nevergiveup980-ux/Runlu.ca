/* RUNLU Flooring OS Universal · Startup Recovery Guard
   Detects abnormal prior exit and critical local-data startup conditions before normal workspace boot. */
(function(){
'use strict';
const STORE='runlu_flooring_universal_u2_startup_guard',WS='runlu_flooring_universal_u0_workspace';
const data=()=>window.RUNLUUniversalData;
let startup=null,readyPromise=null;

function previous(){return data().read(STORE,null)}
function write(v){data().write(STORE,v);return v}
function journalRawValid(){
 try{
  const raw=data().current()?.raw?.('runlu_flooring_universal_u2_crash_journal');
  // An untouched journal has no stored key yet; inspect() must still be available.
  if(raw===null||raw===undefined)return true;
  if(typeof raw!=='string')return false;
  const value=JSON.parse(raw);
  const validTx=tx=>!!tx&&typeof tx==='object'&&!Array.isArray(tx)&&typeof tx.id==='string'&&tx.id.length>0&&typeof tx.type==='string'&&typeof tx.action==='string'&&typeof tx.startedAt==='string';
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&Array.isArray(value.active)&&Array.isArray(value.history)&&value.active.every(validTx)&&new Set(value.active.map(tx=>tx.id)).size===value.active.length;
 }catch(_){return false}
}
function markClean(reason){
 const s=previous()||{};if(!s.sessionOpen)return s;
 // A pagehide is not a clean exit while a recovery transaction remains unresolved.
 let active;
 try{active=window.RUNLUUniversalCrashJournal?.inspect?.()?.active}catch(_){active=null}
 let storedActive=null;
 try{const adapter=data().current();if(typeof adapter?.raw==='function'){const raw=adapter.raw('runlu_flooring_universal_u2_crash_journal');storedActive=raw===null||raw===undefined?0:JSON.parse(raw).active.length}}catch(_){}
 if(!journalRawValid()||!Number.isInteger(active)||active!==0||storedActive!==0)return s;
 return write({...s,sessionOpen:false,cleanExitAt:new Date().toISOString(),cleanExitReason:reason||'pagehide'});
}
function markOpen(prior){
 const now=new Date().toISOString();
 return write({sessionId:'sg-'+Date.now().toString(36),sessionOpen:true,openedAt:now,priorUnclean:!!prior?.sessionOpen,priorSessionId:prior?.sessionId||null,priorOpenedAt:prior?.openedAt||null,lastInspection:null});
}
async function inspect(prior){
 const workspace=data().read(WS,null),hasWorkspace=!!workspace?.company?.organizationId;
 const health=await window.RUNLUUniversalLocalHealth?.health?.().catch?.(()=>null);
 const schema=window.RUNLUUniversalDataVersion?.status?.()||null;
 let durable=null,comparison=null;
 try{durable=await window.RUNLUUniversalDurableLocal?.status?.();if(durable?.ready){await new Promise(r=>setTimeout(r,120));comparison=await window.RUNLUUniversalDurableLocal?.compareWithAdapter?.()}}catch(_){}
 let journal=null;
 try{journal=window.RUNLUUniversalCrashJournal?.inspect?.()||null}catch(_){}
 const interrupted=window.RUNLUUniversalInterruptedResolver?.scan?.()||[];
 const issues=[];
 // The journal summary must agree with the persisted active transactions.
 let persistedActive=null;
 try{const raw=data().current()?.raw?.('runlu_flooring_universal_u2_crash_journal');persistedActive=raw===null||raw===undefined?0:JSON.parse(raw).active.length}catch(_){}
 if(hasWorkspace&&journal&&persistedActive!==null&&journal.active!==persistedActive)issues.push({code:'RECOVERY_JOURNAL_MISMATCH',severity:'critical',detail:'Recovery journal summary differs from stored active transactions'});
 if(hasWorkspace&&(!journalRawValid()||!journal||!Number.isInteger(journal.active)||journal.active<0))issues.push({code:'RECOVERY_JOURNAL_UNAVAILABLE',severity:'critical',detail:'Recovery journal cannot be verified; startup remains paused'});
 if(journal?.active>0)issues.push({code:'INCOMPLETE_BUSINESS_OPERATION',severity:'critical',detail:journal.active+' write-ahead operation(s) were not committed'});
 if(health?.corruptKeys?.length)issues.push({code:'CORRUPT_LOCAL_JSON',severity:'critical',detail:health.corruptKeys.length+' unreadable local data group(s)'});
 if(schema&&schema.workspaceVersion>schema.currentVersion)issues.push({code:'FUTURE_SCHEMA',severity:'critical',detail:'Workspace schema v'+schema.workspaceVersion+' is newer than app v'+schema.currentVersion});
 if(hasWorkspace&&!durable?.ready)issues.push({code:'DURABLE_UNAVAILABLE',severity:'review',detail:'IndexedDB durable mirror is unavailable'});
 if(hasWorkspace&&comparison&&!comparison.ok){const localLoss=comparison.missingLocal>0||comparison.different>0;issues.push({code:'MIRROR_MISMATCH',severity:(prior?.sessionOpen||localLoss)?'critical':'review',detail:'Local/mirror mismatch · missing local '+comparison.missingLocal+' · missing mirror '+comparison.missingMirror+' · different '+comparison.different})}
 if(prior?.sessionOpen)issues.push({code:'UNCLEAN_EXIT',severity:'review',detail:'Previous session did not record a clean exit'});
 const critical=issues.filter(x=>x.severity==='critical');
 return {hasWorkspace,journal,interrupted,priorUnclean:!!prior?.sessionOpen,health,schema,durable,comparison,issues,critical,blocked:critical.length>0,checkedAt:new Date().toISOString()};
}
async function boot(){
 const prior=previous(),hasWorkspace=!!data().read(WS,null)?.company?.organizationId;
 let startupRecoveryPoint=null;
 if(prior?.sessionOpen&&hasWorkspace){
  try{startupRecoveryPoint=await window.RUNLUUniversalLocalHealth?.capture?.('Startup Guard · prior session ended unexpectedly',{priorSessionId:prior.sessionId||null,priorOpenedAt:prior.openedAt||null})||null}catch(_){startupRecoveryPoint=null}
 }
 markOpen(prior);
 startup={...(await inspect(prior)),recoveryPointCaptured:!!startupRecoveryPoint};
 if(prior?.sessionOpen&&hasWorkspace&&!startupRecoveryPoint){
  const issue={code:'STARTUP_RECOVERY_POINT_FAILED',severity:'critical',detail:'Previous session ended unexpectedly and a startup recovery point could not be captured'};
  startup.issues.push(issue);startup.critical.push(issue);startup.blocked=true;
 }
 const s=previous()||{};write({...s,lastInspection:{checkedAt:startup.checkedAt,blocked:startup.blocked,priorUnclean:startup.priorUnclean,recoveryPointCaptured:startup.recoveryPointCaptured,issueCodes:startup.issues.map(x=>x.code)}});
 renderBanner();
 return startup;
}
function ready(){if(!readyPromise)readyPromise=boot();return readyPromise}
async function recheck(){startup=await inspect(startup?.priorUnclean?{sessionOpen:true}:null);const s=previous()||{};write({...s,lastInspection:{checkedAt:startup.checkedAt,blocked:startup.blocked,priorUnclean:startup.priorUnclean,issueCodes:startup.issues.map(x=>x.code)}});renderBanner();return startup}
function canProceed(){return !!startup&&!startup.blocked}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function openSupportCenter(){const s=document.getElementById('universalSupportCenter');if(!s)return;s.hidden=false;Promise.resolve(window.RUNLUUniversalSupportCenter?.render?.()).finally(()=>requestAnimationFrame(()=>s.scrollIntoView({behavior:'smooth',block:'start'})))}
function renderBanner(){
 const host=document.getElementById('startupGuardBanner');if(!host||!startup)return;
 if(!startup.hasWorkspace&&!startup.issues.length){host.hidden=true;return}
 host.hidden=false;host.className='uStartupBanner '+(startup.blocked?'block':startup.priorUnclean?'review':'pass');
 const priorExitMessage=startup.recoveryPointCaptured?'An unexpected prior exit was detected; a Recovery Point was captured before startup.':startup.hasWorkspace?'An unexpected prior exit was detected; no Recovery Point was captured. Review startup findings before continuing.':'An unexpected prior exit was detected; no workspace data was present, so no Recovery Point was needed.';
 host.innerHTML='<div><b>'+(startup.blocked?'STARTUP PROTECTED':startup.priorUnclean?'RECOVERY CHECK COMPLETE':'STARTUP CHECK ✓')+'</b><span>'+(startup.blocked?'Normal workspace opening is paused until critical local-data conditions are reviewed.':startup.priorUnclean?priorExitMessage:'No critical startup condition detected.')+'</span></div><button id="uStartupOpen">Open Recovery Center</button>';
 document.getElementById('uStartupOpen').onclick=openSupportCenter;
}
function render(){
 const host=document.getElementById('universalStartupGuard');if(!host)return;
 if(!startup){host.innerHTML='<div class="card"><h2>Startup Recovery Guard</h2><p class="muted">Startup inspection is still running…</p></div>';return}
 host.innerHTML='<div class="card"><h2>Startup Recovery Guard</h2><p class="muted">Protects the local workspace before normal startup after an abnormal exit or critical data mismatch.</p><div class="uStartupHero '+(startup.blocked?'block':'pass')+'"><div><b>'+(startup.blocked?'WORKSPACE PAUSED':'STARTUP CLEARED')+'</b><span>'+startup.issues.length+' startup finding(s) · '+startup.critical.length+' critical</span></div><strong>'+(startup.blocked?'REVIEW':'READY')+'</strong></div></div><div class="card"><h3>Startup Findings</h3>'+(startup.issues.length?startup.issues.map(x=>'<div class="uStartupIssue"><div><b>'+esc(x.code)+'</b><span>'+esc(x.detail)+'</span></div><strong>'+esc(x.severity.toUpperCase())+'</strong></div>').join(''):'<p class="muted">No startup findings.</p>')+'<div class="uStartupActions">'+(startup.journal?.active?'<button id="uStartupInterrupted">Review Interrupted Operations</button>':'')+'<button id="uStartupSupport">Support & Recovery</button><button id="uStartupRetry">Run Startup Check Again</button></div><p class="muted">The guard never auto-rewrites business records. Recovery remains an explicit action through the existing recovery tools.</p></div>';
 const interruptedButton=document.getElementById('uStartupInterrupted');if(interruptedButton)interruptedButton.onclick=()=>{const s=document.getElementById('universalInterruptedResolver');s.hidden=false;window.RUNLUUniversalInterruptedResolver?.render();s.scrollIntoView({behavior:'smooth'})};
 document.getElementById('uStartupSupport').onclick=openSupportCenter;
 document.getElementById('uStartupRetry').onclick=async()=>{await recheck();render()};
}
window.addEventListener('pagehide',()=>markClean('pagehide'));
window.addEventListener('beforeunload',()=>markClean('beforeunload'));
window.RUNLUUniversalStartupGuard=Object.freeze({ready,recheck,canProceed,inspect,previous,markClean,render,renderBanner});
ready();
})();