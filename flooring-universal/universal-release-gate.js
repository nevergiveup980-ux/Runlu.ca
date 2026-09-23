/* RUNLU Flooring OS Universal · U1 Release Gate
   Non-destructive regression harness over live U1 module contracts. */
(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function run(){
 const tests=[],t=(name,ok,detail)=>tests.push({name,ok:!!ok,detail});
 const mods=['RUNLUUniversalData','RUNLUUniversalPWA','RUNLUUniversalDurableLocal','RUNLUUniversalDataVersion','RUNLUUniversalLocalHealth','RUNLUUniversalBackup','RUNLUUniversalDataExchange','RUNLUUniversalSales','RUNLUUniversalPO','RUNLUUniversalInbound','RUNLUUniversalInstallation','RUNLUUniversalBilling','RUNLUUniversalAccounting','RUNLUUniversalAudit','RUNLUUniversalLifecycleGate','RUNLUUniversalRecovery','RUNLUUniversalGuards'];
 mods.forEach(m=>t('Module · '+m,!!window[m],window[m]?'loaded':'missing'));
 const data=window.RUNLUUniversalData,health=data?.current?.()?.health?.();
 t('Data Adapter · active',!!data&&!!health?.ok,health?.detail||'unavailable');
 t('Data Adapter · default local',data?.backendConfig?.().mode==='local','cloud remains optional');
 const pwa=window.RUNLUUniversalPWA;
 if(pwa){
  const ps=pwa.status();
  t('Offline / PWA · API available',typeof pwa.register==='function'&&typeof pwa.status==='function','service worker registration API ready');
  t('Offline / PWA · browser capability',ps.supported,'service worker support required for offline shell');
 }
 const durable=window.RUNLUUniversalDurableLocal;
 if(durable){
  t('Durable Local · IndexedDB capability',typeof durable.status==='function'&&typeof durable.seed==='function','mirror API ready');
  t('Durable Local · recovery API',typeof durable.recoverMissing==='function'&&typeof durable.replaceLocalFromMirror==='function','missing + full recovery ready');
 }
 const version=window.RUNLUUniversalDataVersion;
 const exchange=window.RUNLUUniversalDataExchange;
 if(exchange){
  const oid=data?.read?.('runlu_flooring_universal_u0_workspace',null)?.company?.organizationId||'';
  const fixture={format:'runlu-flooring-universal-business-package',version:1,schemaVersion:version?.CURRENT||1,createdAt:new Date(0).toISOString(),organizationId:oid,companyName:'Test',datasets:{jobs:[]}};
  t('Data Exchange · valid package',exchange.validatePackage(fixture).ok,'same-company package accepted');
  t('Data Exchange · rejects unknown dataset',!exchange.validatePackage({...fixture,datasets:{unknown:[]}}).ok,'unknown dataset blocked');
  t('Data Exchange · rejects foreign organization',!exchange.validatePackage({...fixture,organizationId:'foreign-org'}).ok,'cross-company import blocked');
 }
 if(version){
  const vs=version.status();
  t('Data Version · compatible',vs.compatible,'workspace v'+vs.workspaceVersion+' / app v'+vs.currentVersion);
  t('Data Version · migration registry',typeof version.register==='function'&&typeof version.migrate==='function','registry + runner ready');
  t('Data Version · no downgrade',version.CURRENT>=vs.workspaceVersion,'future data must not be downgraded');
 }
 const localHealth=window.RUNLUUniversalLocalHealth;
 if(localHealth){
  t('Recovery Points · bounded history',localHealth.MAX===12,'maximum 12 checkpoints');
  t('Recovery Points · API available',typeof localHealth.capture==='function'&&typeof localHealth.restore==='function','capture + restore ready');
 }
 const backup=window.RUNLUUniversalBackup;
 if(backup){
  const fixture={format:'runlu-flooring-universal-backup',version:1,schemaVersion:version?.CURRENT||1,createdAt:new Date(0).toISOString(),product:'RUNLU Flooring OS Universal',data:{runlu_flooring_universal_test:{ok:true}}};
  t('Backup · valid Universal payload',backup.validate(fixture).ok,'Universal namespace accepted');
  t('Backup · rejects foreign keys',!backup.validate({...fixture,data:{foreign_key:{}}}).ok,'foreign namespace blocked');
  t('Backup · rejects foreign format',!backup.validate({...fixture,format:'other-product'}).ok,'foreign product blocked');
 }
 const g=window.RUNLUUniversalGuards;
 if(g){
  t('Guard · Paid invoice is terminal',!g.transition('invoice','Paid','Issued').ok,'Paid → Issued must be blocked');
  t('Guard · Completed installation is terminal',!g.transition('installation','Completed','Scheduled').ok,'Completed → Scheduled must be blocked');
  t('Guard · forward invoice transition',g.transition('invoice','Issued','Partially Paid').ok,'Issued → Partially Paid must pass');
 }
 const gate=window.RUNLUUniversalLifecycleGate?.run?.();
 t('Lifecycle Gate executes',!!gate,gate?'issues='+gate.issues.length:'unavailable');
 const rec=window.RUNLUUniversalRecovery?.scan?.();
 t('Recovery scanner executes',Array.isArray(rec),Array.isArray(rec)?'recommendations='+rec.length:'unavailable');
 const bills=window.RUNLUUniversalBilling?.rows?.()||[];
 bills.forEach(b=>{const paid=(b.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);t('Invoice ledger · '+(b.invoiceNumber||b.id),Math.abs(paid-Number(b.paidAmount||0))<=.01,'payment ledger equals paid amount')});
 const pos=window.RUNLUUniversalPO?.pos?.()||[],seen=new Set();pos.filter(p=>p.poNumber).forEach(p=>{const unique=!seen.has(p.poNumber);t('PO number · '+p.poNumber,unique,'issued number unique in workspace');seen.add(p.poNumber)});
 return {passed:tests.filter(x=>x.ok).length,failed:tests.filter(x=>!x.ok).length,tests};
}
function render(){const host=document.getElementById('universalReleaseGate');if(!host)return;const r=run(),ok=r.failed===0;host.innerHTML='<div class="card"><h2>U1 Release Gate</h2><p class="muted">Non-destructive regression harness. Runs module, lifecycle, ledger, and recovery contract checks.</p><div class="uRelease '+(ok?'pass':'fail')+'"><b>'+(ok?'PASS':'HOLD')+'</b><span>'+r.passed+' passed · '+r.failed+' failed</span></div></div><div class="card">'+r.tests.map(x=>'<div class="uReleaseTest"><b>'+(x.ok?'✓':'✕')+' '+esc(x.name)+'</b><span>'+esc(x.detail)+'</span></div>').join('')+'</div>'}
window.RUNLUUniversalReleaseGate=Object.freeze({run,render});
})();