/* RUNLU Flooring OS Universal · Interrupted Operation Resolver
   Read-only evidence engine for unfinished Crash Journal operations. Never replays a business mutation. */
(function(){
'use strict';
const data=()=>window.RUNLUUniversalData;
const KEYS={
 po:'runlu_flooring_universal_u1_supplier_orders',
 inbound:'runlu_flooring_universal_u1_inbound_tasks',
 install:'runlu_flooring_universal_u1_installations',
 invoice:'runlu_flooring_universal_u1_customer_invoices',
 accounting:'runlu_flooring_universal_u1_supplier_accounting',
 audit:'runlu_flooring_universal_u1_audit_events'
};
const arr=k=>data()?.read?.(k,[])||[];
const find=(xs,id)=>id?xs.find(x=>x.id===id):null;
function auditMatch(tx){
 const events=arr(KEYS.audit),m=tx.meta||{};
 return events.filter(e=>{
  if(tx.action==='issue'&&e.action!=='issue'&&e.action!=='status')return false;
  if(tx.action==='record'&&e.action!=='record')return false;
  if(tx.action==='reconcile'&&e.action!=='reconcile')return false;
  if(tx.action==='complete'&&e.action!=='status')return false;
  if(tx.action==='mark-paid'&&e.action!=='status')return false;
  if(tx.type==='Supplier PO')return e.entityType==='Supplier PO'&&!!m.poId&&e.entityId===m.poId;
  if(tx.type==='Receiving')return e.entityType==='Receiving'&&e.entityId===m.inboundId;
  if(tx.type==='Installation')return e.entityType==='Installation'&&e.entityId===m.installationId;
  if(tx.type==='Customer Invoice')return e.entityType==='Customer Invoice'&&e.entityId===m.invoiceId;
  if(tx.type==='Customer Payment')return e.entityType==='Customer Payment'&&e.entityId===m.invoiceId&&(!m.paymentId||e.meta?.paymentId===m.paymentId);
  if(tx.type==='Supplier Accounting')return e.entityType==='Supplier Accounting'&&e.entityId===m.accountingId;
  return false;
 }).filter(e=>!tx.startedAt||!e.createdAt||e.createdAt>=tx.startedAt);
}
function classify(tx){
 const m=tx.meta||{},audits=auditMatch(tx),base={txId:tx.id,type:tx.type,action:tx.action,startedAt:tx.startedAt,meta:m,auditEvents:audits.length};
 let record=null,applied=false,notApplied=false,evidence=[];
 if(tx.type==='Supplier PO'){
  const xs=arr(KEYS.po);
  if(tx.action==='create'){record=m.poId?find(xs,m.poId):null;if(m.poId){applied=!!record;notApplied=!record;evidence.push(record?'The exact Supplier PO created by this operation exists.':'The exact Supplier PO id from this operation is absent.')}else{evidence.push('Legacy journal entry has no exact PO id; Job-level evidence is not sufficient for automatic classification.')}}
  else {record=find(xs,m.poId);applied=!!record&&record.status!=='Draft';notApplied=!!record&&record.status==='Draft';evidence.push(record?'PO status: '+record.status+'.':'PO record not found.')}
 }else if(tx.type==='Receiving'){
  record=find(arr(KEYS.inbound),m.inboundId);applied=!!record?.receivedAt;notApplied=!!record&&!record.receivedAt;evidence.push(record?.receivedAt?'Receiving timestamp exists; status '+record.status+'.':record?'Receiving record has no received timestamp.':'Receiving record not found.');
 }else if(tx.type==='Installation'){
  record=find(arr(KEYS.install),m.installationId);applied=record?.status==='Completed'&&!!record.completedAt;notApplied=!!record&&record.status!=='Completed';evidence.push(record?'Installation status: '+record.status+(record.completedAt?' with completion timestamp.':'.'):'Installation record not found.');
 }else if(tx.type==='Customer Invoice'){
  record=find(arr(KEYS.invoice),m.invoiceId);applied=!!record?.invoiceNumber&&record.status!=='Draft';notApplied=!!record&&record.status==='Draft';evidence.push(record?'Invoice status: '+record.status+(record.invoiceNumber?' · #'+record.invoiceNumber:' · no invoice number')+'.':'Invoice record not found.');
 }else if(tx.type==='Customer Payment'){
  record=find(arr(KEYS.invoice),m.invoiceId);if(m.paymentId){applied=!!record&&(record.payments||[]).some(p=>p.id===m.paymentId);notApplied=!!record&&!applied;evidence.push(record?(applied?'The exact payment ledger entry from this operation exists.':'The exact payment id from this operation is absent.'):'Invoice record not found.')}else{evidence.push(record?'Legacy payment journal has no exact payment id; timestamp evidence is intentionally not used to auto-classify.':'Invoice record not found.');}
 }else if(tx.type==='Supplier Accounting'){
  record=find(arr(KEYS.accounting),m.accountingId);applied=record?.status==='Paid'&&!!record.paidAt;notApplied=!!record&&record.status!=='Paid';evidence.push(record?'Supplier accounting status: '+record.status+(record.paidAt?' with paid timestamp.':'.'):'Supplier accounting record not found.');
 }
 if(audits.length)evidence.push(audits.length+' matching Audit event(s) exist at/after operation start.');
 let verdict='UNCERTAIN',confidence='REVIEW';
 if(applied){verdict='LIKELY_APPLIED';confidence=audits.length?'HIGH':'MEDIUM'}
 else if(notApplied){verdict='LIKELY_NOT_APPLIED';confidence='MEDIUM'}
 return {...base,verdict,confidence,evidence};
}
function scan(){return (window.RUNLUUniversalCrashJournal?.pending?.()||[]).map(classify)}
function acknowledge(id,note){
 const r=scan().find(x=>x.txId===id);if(!r)throw new Error('Interrupted operation not found.');
 if(r.verdict==='UNCERTAIN')throw new Error('Uncertain operation cannot be cleared automatically. Review business records first.');
 return window.RUNLUUniversalCrashJournal?.resolve?.(id,r.verdict,note);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){
 const host=document.getElementById('universalInterruptedResolver');if(!host)return;const rs=scan();
 host.innerHTML='<div class="card"><h2>Interrupted Operation Resolver</h2><p class="muted">Read-only evidence review for operations left open after an unexpected stop. It never replays payments, receiving, PO issue, installation completion, or supplier payment.</p></div><div class="card">'+(rs.length?rs.map(r=>'<div class="uResolverRow '+(r.verdict==='UNCERTAIN'?'review':'ready')+'"><div><b>'+esc(r.type)+' · '+esc(r.action)+'</b><span>'+esc(r.verdict)+' · confidence '+esc(r.confidence)+'</span>'+r.evidence.map(x=>'<small>'+esc(x)+'</small>').join('')+'</div>'+(r.verdict!=='UNCERTAIN'?'<button data-resolve="'+esc(r.txId)+'">Acknowledge Review</button>':'<strong>MANUAL REVIEW</strong>')+'</div>').join(''):'<p class="muted">No interrupted operation needs review.</p>')+'<p class="muted">Acknowledge Review clears only the Crash Journal marker after evidence review. It never changes the business record itself.</p></div>';
 host.querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>{if(!confirm('Clear this Crash Journal marker after reviewing the evidence? Business records will not be changed.'))return;acknowledge(b.dataset.resolve);render();window.RUNLUUniversalStartupGuard?.recheck?.().then(()=>window.RUNLUUniversalStartupGuard?.renderBanner?.())});
}
window.RUNLUUniversalInterruptedResolver=Object.freeze({classify,scan,acknowledge,render,auditMatch});
})();