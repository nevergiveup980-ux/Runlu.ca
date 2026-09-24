/* RUNLU Flooring OS Universal · Privacy-Safe Local Diagnostics
   Support report contains system state and counts only — never business record contents. */
(function(){
'use strict';
const FORMAT='runlu-flooring-universal-diagnostics',VERSION=1;
const STORES=[
 ['jobs','runlu_flooring_universal_u1_jobs'],['supplierOrders','runlu_flooring_universal_u1_supplier_orders'],
 ['inbound','runlu_flooring_universal_u1_inbound_tasks'],['installations','runlu_flooring_universal_u1_installations'],
 ['customerInvoices','runlu_flooring_universal_u1_customer_invoices'],['supplierAccounting','runlu_flooring_universal_u1_supplier_accounting'],
 ['auditEvents','runlu_flooring_universal_u1_audit_events'],['salesNotices','runlu_flooring_universal_u1_sales_notices']
];
const data=()=>window.RUNLUUniversalData;
const clean=s=>String(s??'').replace(/https?:\/\/\S+/gi,'[url]').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[email]').slice(0,240);
function counts(){const out={};STORES.forEach(([name,key])=>{const v=data()?.read?.(key,[]);out[name]=Array.isArray(v)?v.length:0});return out}
async function collect(){
 const schema=window.RUNLUUniversalDataVersion?.status?.()||null;
 const durable=await window.RUNLUUniversalDurableLocal?.status?.().catch?.(()=>null);
 const pwa=window.RUNLUUniversalPWA?.status?.()||null;
 const ready=await window.RUNLUUniversalDeviceReady?.run?.().catch?.(()=>null);
 const gate=window.RUNLUUniversalReleaseGate?.run?.()||null;
 let storage=null;try{storage=await navigator.storage?.estimate?.()}catch(_){}
 const adapter=data()?.current?.(),health=adapter?.health?.()||null;
 return {
  format:FORMAT,version:VERSION,createdAt:new Date().toISOString(),
  product:'RUNLU Flooring OS Universal',
  privacy:{businessContentsIncluded:false,customerNamesIncluded:false,companyIdentityIncluded:false,recordIdsIncluded:false,cloudCredentialsIncluded:false},
  app:{schemaSupported:schema?.currentVersion??null,workspaceSchema:schema?.workspaceVersion??null,schemaCompatible:schema?.compatible??null,dataMode:data()?.backendConfig?.().mode||'local',provider:data()?.backendConfig?.().provider||'local'},
  device:{online:navigator.onLine!==false,language:navigator.language||null,standalone:!!pwa?.installed,serviceWorkerSupported:!!pwa?.supported,indexedDBSupported:!!window.RUNLUUniversalDurableLocal?.supported?.(),persistentStorage:ready?.persisted??null},
  storage:{usageBytes:storage?.usage??null,quotaBytes:storage?.quota??null,durableMirrorRecords:durable?.records??null,durableReady:durable?.ready??false,recoveryPoints:window.RUNLUUniversalLocalHealth?.points?.().length??null},
  adapter:{id:adapter?.id||null,healthy:!!health?.ok,detail:clean(health?.detail||'')},
  recordCounts:counts(),
  deviceReadiness:ready?{ready:!!ready.ready,checks:ready.checks.map(x=>({id:x.id,ok:!!x.ok,detail:clean(x.detail)}))}:null,
  releaseGate:gate?{passed:gate.passed,failed:gate.failed,tests:gate.tests.map(x=>({name:clean(x.name),ok:!!x.ok,detail:clean(x.detail)}))}:null,
  errors:{pwa:clean(pwa?.error||''),durable:clean(durable?.error||'')}
 };
}
function validate(r){return !!r&&r.format===FORMAT&&r.version===VERSION&&r.privacy?.businessContentsIncluded===false}
function download(report){
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='RUNLU-Flooring-Diagnostics-'+report.createdAt.slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function render(){
 const host=document.getElementById('universalDiagnostics');if(!host)return;
 host.innerHTML='<div class="card"><h2>Diagnostics</h2><p class="muted">Building privacy-safe support report…</p></div>';
 const r=await collect(),total=Object.values(r.recordCounts).reduce((a,b)=>a+b,0);
 host.innerHTML='<div class="card"><h2>Local Diagnostics</h2><p class="muted">Support information without customer names, company identity, record IDs, business record contents, or cloud credentials.</p><div class="uDiagHero '+((r.deviceReadiness?.ready&&r.releaseGate?.failed===0)?'pass':'hold')+'"><div><b>'+((r.deviceReadiness?.ready&&r.releaseGate?.failed===0)?'SYSTEM CHECK PASS':'SYSTEM REVIEW')+'</b><span>Schema v'+esc(r.app.workspaceSchema)+' · '+total+' business/support records counted · contents excluded</span></div><strong>'+esc(r.releaseGate?.passed||0)+' / '+esc((r.releaseGate?.passed||0)+(r.releaseGate?.failed||0))+'</strong></div><div class="uDiagFacts"><span>Device Readiness <b>'+(r.deviceReadiness?.ready?'READY':'CHECK')+'</b></span><span>Release Gate <b>'+(r.releaseGate?.failed===0?'PASS':'HOLD')+'</b></span><span>Durable Mirror <b>'+(r.storage.durableReady?'READY':'CHECK')+'</b></span><span>Offline Worker <b>'+(r.device.serviceWorkerSupported?'SUPPORTED':'CHECK')+'</b></span></div><button class="primary" id="uDiagDownload">Generate Diagnostics</button><p class="muted">The downloaded JSON contains counts and technical status only. Review it before sharing with support if desired.</p></div><div class="card"><h3>Privacy Boundary</h3><div class="uDiagPrivacy">✓ No customer names<br>✓ No company identity<br>✓ No invoice / PO / job IDs<br>✓ No business record contents<br>✓ No cloud credentials</div></div>';
 document.getElementById('uDiagDownload').onclick=()=>download(r);
}
window.RUNLUUniversalDiagnostics=Object.freeze({FORMAT,VERSION,counts,collect,validate,download,render});
})();