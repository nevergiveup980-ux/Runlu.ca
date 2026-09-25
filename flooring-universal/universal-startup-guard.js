/* RUNLU Flooring OS Universal · Startup Recovery Guard
   Detects abnormal prior exit and critical local-data startup conditions before normal workspace boot. */
(function(){
'use strict';
const STORE='runlu_flooring_universal_u2_startup_guard',WS='runlu_flooring_universal_u0_workspace';
const data=()=>window.RUNLUUniversalData;
let startup=null,readyPromise=null;

function previous(){return data().read(STORE,null)}
function write(v){data().write(STORE,v);return v}
function markClean(reason){
 const s=previous()||{};if(!s.sessionOpen)return s;
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
 const journal=window.RUNLUUniversalCrashJournal?.inspect?.()||{active:0,pending:[]}; const interrupted=window.RUNLUUniversalInterruptedResolver?.scan?.()||[];
 const issues=[];
 if(journal.active>0)issues.push({code:'INCOMPLETE_BUSINESS_OPERATION',severity:'critical',detail:journal.active+' write-ahead operation(s) were not committed'});
 if(health?.corruptKeys?.length)issues.push({code:'CORRUPT_LOCAL_JSON',severity:'critical',detail:health.corruptKeys.length+' unreadable local data group(s)'});
 if(schema&&schema.workspaceVersion>schema.currentVersion)issues.push({code:'FUTURE_SCHEMA',severity:'critical',detail:'Workspace schema v'+schema.workspaceVersion+' is newer than app v'+schema.currentVersion});
 if(hasWorkspace&&!durable?.ready)issues.push({code:'DURABLE_UNAVAILABLE',severity:'review',detail:'IndexedDB durable mirror is unavailable'});
 if(hasWorkspace&&comparison&&!comparison.ok)issues.push({code:'MIRROR_MISMATCH',severity:prior?.sessionOpen?'critical':'review',detail:'Local/mirror mismatch · missing local '+comparison.missingLocal+' · missing mirror '+comparison.missingMirror+' · different '+comparison.different});
 if(prior?.sessionOpen)issues.push({code:'UNCLEAN_EXIT',severity:'review',detail:'Previous session did not record a clean exit'});
 const critical=issues.filter(x=>x.severity==='critical');
 return {hasWorkspace,journal,interrupted,priorUnclean:!!prior?.sessionOpen,health,schema,durable,comparison,issues,critical,blocked:critical.length>0,checkedAt:new Date().toISOString()};
}
async function boot(){
 const prior=previous(),hasWorkspace=!!data().read(WS,null)?.company?.organizationId;
 if(prior?.sessionOpen&&hasWorkspace)window.RUNLUUniversalLocalHealth?.capture?.('Startup Guard · prior session ended unexpectedly',{priorSessionId:prior.sessionId||null,priorOpenedAt:prior.openedAt||null});
 markOpen(prior);
 startup=await inspect(prior);
 const s=previous()||{};write({...s,lastInspection:{checkedAt:startup.checkedAt,blocked:startup.blocked,priorUnclean:startup.priorUnclean,issueCodes:startup.issues.map(x=>x.code)}});
 renderBanner();
 return startup;
}
function ready(){if(!readyPromise)readyPromise=boot();return readyPromise}
function canProceed(){return !!startup&&!startup.blocked}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderBanner(){
 const host=document.getElementById('startupGuardBanner');if(!host||!startup)return;
 if(!startup.hasWorkspace&&!startup.issues.length){host.hidden=true;return}
 host.hidden=false;host.className='uStartupBanner '+(startup.blocked?'block':startup.priorUnclean?'review':'pass');
 host.innerHTML='<div><b>'+(startup.blocked?'STARTUP PROTECTED':startup.priorUnclean?'RECOVERY CHECK COMPLETE':'STARTUP CHECK ✓')+'</b><span>'+(startup.blocked?'Normal workspace opening is paused until critical local-data conditions are reviewed.':startup.priorUnclean?'An unexpected prior exit was detected; a Recovery Point was captured before startup.':'No critical startup condition detected.')+'</span></div><button id="uStartupOpen">Open Recovery Center</button>';
 document.getElementById('uStartupOpen').onclick=()=>{const s=document.getElementById('universalStartupGuard');s.hidden=false;render();s.scrollIntoView({behavior:'smooth'})};
}
function render(){
 const host=document.getElementById('universalStartupGuard');if(!host)return;
 if(!startup){host.innerHTML='<div class="card"><h2>Startup Recovery Guard</h2><p class="muted">Startup inspection is still running…</p></div>';return}
 host.innerHTML='<div class="card"><h2>Startup Recovery Guard</h2><p class="muted">Protects the local workspace before normal startup after an abnormal exit or critical data mismatch.</p><div class="uStartupHero '+(startup.blocked?'block':'pass')+'"><div><b>'+(startup.blocked?'WORKSPACE PAUSED':'STARTUP CLEARED')+'</b><span>'+startup.issues.length+' startup finding(s) · '+startup.critical.length+' critical</span></div><strong>'+(startup.blocked?'REVIEW':'READY')+'</strong></div></div><div class="card"><h3>Startup Findings</h3>'+(startup.issues.length?startup.issues.map(x=>'<div class="uStartupIssue"><div><b>'+esc(x.code)+'</b><span>'+esc(x.detail)+'</span></div><strong>'+esc(x.severity.toUpperCase())+'</strong></div>').join(''):'<p class="muted">No startup findings.</p>')+'<div class="uStartupActions">'+(startup.journal?.active?'<button id="uStartupInterrupted">Review Interrupted Operations</button>':'')+'<button id="uStartupSupport">Support & Recovery</button><button id="uStartupRetry">Run Startup Check Again</button></div><p class="muted">The guard never auto-rewrites business records. Recovery remains an explicit action through the existing recovery tools.</p></div>';
 const interruptedButton=document.getElementById('uStartupInterrupted');if(interruptedButton)interruptedButton.onclick=()=>{const s=document.getElementById('universalInterruptedResolver');s.hidden=false;window.RUNLUUniversalInterruptedResolver?.render();s.scrollIntoView({behavior:'smooth'})};
 document.getElementById('uStartupSupport').onclick=()=>{const s=document.getElementById('universalSupportCenter');s.hidden=false;window.RUNLUUniversalSupportCenter?.render();s.scrollIntoView({behavior:'smooth'})};
 document.getElementById('uStartupRetry').onclick=async()=>{startup=await inspect(startup?.priorUnclean?{sessionOpen:true}:null);const s=previous()||{};write({...s,lastInspection:{checkedAt:startup.checkedAt,blocked:startup.blocked,priorUnclean:startup.priorUnclean,issueCodes:startup.issues.map(x=>x.code)}});renderBanner();render()};
}
window.addEventListener('pagehide',()=>markClean('pagehide'));
window.addEventListener('beforeunload',()=>markClean('beforeunload'));
window.RUNLUUniversalStartupGuard=Object.freeze({ready,canProceed,inspect,previous,markClean,render,renderBanner});
ready();
})();