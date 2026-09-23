/* RUNLU Flooring OS Universal · Business Data Exchange
   CSV exports for office/accounting use + additive JSON package import/export. */
(function(){
'use strict';
const WS='runlu_flooring_universal_u0_workspace',FORMAT='runlu-flooring-universal-business-package',VERSION=1;
const DATASETS=[
 ['jobs','Jobs','runlu_flooring_universal_u1_jobs'],
 ['supplierOrders','Supplier POs','runlu_flooring_universal_u1_supplier_orders'],
 ['inbound','Receiving','runlu_flooring_universal_u1_inbound_tasks'],
 ['installations','Installations','runlu_flooring_universal_u1_installations'],
 ['customerInvoices','Customer Invoices','runlu_flooring_universal_u1_customer_invoices'],
 ['supplierAccounting','Supplier Accounting','runlu_flooring_universal_u1_supplier_accounting'],
 ['salesNotices','Sales Notices','runlu_flooring_universal_u1_sales_notices'],
 ['audit','Audit Trail','runlu_flooring_universal_u1_audit_events']
];
const data=()=>window.RUNLUUniversalData, workspace=()=>data().read(WS,null), org=()=>workspace()?.company?.organizationId||'';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const rows=key=>(data().read(key,[])||[]).filter(x=>x.organizationId===org());
const flatten=(v,p='',out={})=>{if(v===null||v===undefined){out[p]=v;return out}if(Array.isArray(v)){out[p]=JSON.stringify(v);return out}if(typeof v==='object'){Object.entries(v).forEach(([k,x])=>flatten(x,p?p+'.'+k:k,out));return out}out[p]=v;return out};
const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
function downloadBlob(name,text,type){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csvFor(key){const xs=rows(key).map(x=>flatten(x));if(!xs.length)return '';const headers=[...new Set(xs.flatMap(x=>Object.keys(x)))];return headers.map(csvCell).join(',')+'\r\n'+xs.map(x=>headers.map(h=>csvCell(x[h])).join(',')).join('\r\n')}
function exportCSV(key,label){const csv=csvFor(key);if(!csv)throw new Error('No '+label+' records to export.');downloadBlob('RUNLU-'+label.replace(/\s+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.csv','\ufeff'+csv,'text/csv;charset=utf-8')}
function packageData(){
 const w=workspace();if(!w?.company?.organizationId)throw new Error('Create a company workspace first.');
 const datasets={};DATASETS.forEach(([id,,key])=>datasets[id]=rows(key));
 return {format:FORMAT,version:VERSION,schemaVersion:window.RUNLUUniversalDataVersion?.status?.().workspaceVersion||0,createdAt:new Date().toISOString(),organizationId:w.company.organizationId,companyName:w.company.displayName||w.company.legalName||'',datasets};
}
function exportPackage(){const p=packageData();downloadBlob('RUNLU-Flooring-Business-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(p,null,2),'application/json');return p}
function validatePackage(p){
 if(!p||p.format!==FORMAT)return {ok:false,error:'Not a RUNLU Flooring OS Universal business package.'};
 if(p.version!==VERSION)return {ok:false,error:'Unsupported business package version.'};
 if(Number(p.schemaVersion||0)>(window.RUNLUUniversalDataVersion?.CURRENT||1))return {ok:false,error:'Business package data is newer than this app.'};
 if(!p.organizationId||p.organizationId!==org())return {ok:false,error:'This package belongs to a different company workspace.'};
 if(!p.datasets||typeof p.datasets!=='object'||Array.isArray(p.datasets))return {ok:false,error:'Business datasets are missing.'};
 const allowed=new Set(DATASETS.map(x=>x[0])),unknown=Object.keys(p.datasets).filter(k=>!allowed.has(k));
 if(unknown.length)return {ok:false,error:'Unknown dataset: '+unknown.join(', ')};
 for(const [id] of DATASETS){if(p.datasets[id]!==undefined&&!Array.isArray(p.datasets[id]))return {ok:false,error:id+' must be a record list.'};for(const r of p.datasets[id]||[]){if(r.organizationId!==org())return {ok:false,error:id+' contains a record from another company.'};if(!r.id)return {ok:false,error:id+' contains a record without an id.'}}}
 return {ok:true};
}
async function inspectFile(file){let p;try{p=JSON.parse(await file.text())}catch(_){throw new Error('Import file is not valid JSON.')}const v=validatePackage(p);if(!v.ok)throw new Error(v.error);return p}
function importPackage(p){
 const v=validatePackage(p);if(!v.ok)throw new Error(v.error);
 window.RUNLUUniversalLocalHealth?.capture('Before Business Package import',{sourceCreatedAt:p.createdAt||null});
 const summary={added:0,skipped:0,datasets:{}};
 DATASETS.forEach(([id,,key])=>{
  const all=data().read(key,[])||[],currentIds=new Set(all.filter(x=>x.organizationId===org()).map(x=>x.id)),incoming=p.datasets[id]||[],add=incoming.filter(x=>!currentIds.has(x.id)),skip=incoming.length-add.length;
  if(add.length)data().write(key,[...all,...add]);
  summary.added+=add.length;summary.skipped+=skip;summary.datasets[id]={added:add.length,skipped:skip};
 });
 window.RUNLUUniversalAudit?.log('Data Exchange',org(),'import','Business Package','Imported',{added:summary.added,skipped:summary.skipped,sourceCreatedAt:p.createdAt||null});
 return summary;
}
function render(){
 const host=document.getElementById('universalDataExchange');if(!host)return;
 host.innerHTML='<div class="card"><h2>Export / Import</h2><p class="muted">Export business ledgers to CSV for Excel/accounting, or move linked business records with a validated JSON package.</p><div class="uExchangeGrid">'+DATASETS.filter(x=>x[0]!=='salesNotices').map(([id,label,key])=>'<button data-csv="'+esc(key)+'" data-label="'+esc(label)+'"><b>'+esc(label)+'</b><span>Export CSV · '+rows(key).length+' record(s)</span></button>').join('')+'</div></div><div class="card"><h3>Portable Business Package</h3><p class="muted">Package import is additive-only: existing record IDs are skipped, never overwritten. The package must belong to this company workspace.</p><div class="uExchangeActions"><button class="primary" id="uExportPackage">Export Business Package</button><label class="uExchangeFile">Import Package<input id="uImportPackage" type="file" accept="application/json,.json"></label></div><div id="uExchangeState" class="uExchangeState">Ready.</div></div>';
 host.querySelectorAll('[data-csv]').forEach(b=>b.onclick=()=>{try{exportCSV(b.dataset.csv,b.dataset.label);state(b.dataset.label+' CSV exported.',true)}catch(e){state(e.message,false)}});
 document.getElementById('uExportPackage').onclick=()=>{try{const p=exportPackage(),n=Object.values(p.datasets).reduce((s,x)=>s+x.length,0);state('Business package exported · '+n+' records.',true)}catch(e){state(e.message,false)}};
 document.getElementById('uImportPackage').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const p=await inspectFile(file),n=Object.values(p.datasets).reduce((s,x)=>s+x.length,0);state('Validated · '+n+' records · '+esc(p.companyName||p.organizationId)+'.',true);if(!confirm('Import new records from this package? Existing IDs will be skipped and never overwritten.'))return;const r=importPackage(p);state('IMPORTED · '+r.added+' added · '+r.skipped+' existing record(s) skipped.',true)}catch(err){state(err.message,false)}};
 function state(msg,ok){const el=document.getElementById('uExchangeState');if(el){el.textContent=msg;el.className='uExchangeState '+(ok?'ok':'bad')}}
}
window.RUNLUUniversalDataExchange=Object.freeze({DATASETS,csvFor,packageData,validatePackage,inspectFile,importPackage,render});
})();