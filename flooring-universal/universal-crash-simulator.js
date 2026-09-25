/* RUNLU Flooring OS Universal · Crash Simulation Harness
   In-memory only. Exercises interrupted-operation classification without writing business stores. */
(function(){
'use strict';
function fixtureReader(map){return key=>structuredClone(map[key]||[])}
function classify(tx,map){
 const m=tx.meta||{},read=fixtureReader(map),audits=read('audit').filter(e=>e.entityId&&(e.entityId===m.poId||e.entityId===m.inboundId||e.entityId===m.installationId||e.entityId===m.invoiceId||e.entityId===m.accountingId));
 let record=null,applied=false,notApplied=false;
 if(tx.type==='Supplier PO'){record=m.poId?read('po').find(x=>x.id===m.poId):null;if(m.poId){applied=!!record;notApplied=!record}}
 else if(tx.type==='Receiving'){record=read('inbound').find(x=>x.id===m.inboundId);applied=!!record?.receivedAt;notApplied=!!record&&!record.receivedAt}
 else if(tx.type==='Installation'){record=read('install').find(x=>x.id===m.installationId);applied=record?.status==='Completed'&&!!record.completedAt;notApplied=!!record&&record.status!=='Completed'}
 else if(tx.type==='Customer Invoice'){record=read('invoice').find(x=>x.id===m.invoiceId);applied=!!record?.invoiceNumber&&record.status!=='Draft';notApplied=!!record&&record.status==='Draft'}
 else if(tx.type==='Customer Payment'){record=read('invoice').find(x=>x.id===m.invoiceId);if(m.paymentId){applied=!!record&&(record.payments||[]).some(p=>p.id===m.paymentId);notApplied=!!record&&!applied}}
 else if(tx.type==='Supplier Accounting'){record=read('accounting').find(x=>x.id===m.accountingId);applied=record?.status==='Paid'&&!!record.paidAt;notApplied=!!record&&record.status!=='Paid'}
 return applied?'LIKELY_APPLIED':notApplied?'LIKELY_NOT_APPLIED':'UNCERTAIN';
}
const tx=(type,action,meta)=>({id:'sim',type,action,startedAt:'2026-01-01T00:00:00.000Z',meta});
function scenarios(){
 return [
  {name:'PO · crash before business write',tx:tx('Supplier PO','create',{jobId:'j1',poId:'po-new'}),map:{po:[]},want:'LIKELY_NOT_APPLIED'},
  {name:'PO · crash after exact PO write',tx:tx('Supplier PO','create',{jobId:'j1',poId:'po-new'}),map:{po:[{id:'po-new',jobId:'j1',status:'Draft'}]},want:'LIKELY_APPLIED'},
  {name:'Payment · crash before ledger write',tx:tx('Customer Payment','record',{invoiceId:'inv1',paymentId:'pay-new'}),map:{invoice:[{id:'inv1',payments:[]}]},want:'LIKELY_NOT_APPLIED'},
  {name:'Payment · crash after exact ledger write',tx:tx('Customer Payment','record',{invoiceId:'inv1',paymentId:'pay-new'}),map:{invoice:[{id:'inv1',payments:[{id:'pay-new',amount:100}]}]},want:'LIKELY_APPLIED'},
  {name:'Payment · unrelated later payment must not match',tx:tx('Customer Payment','record',{invoiceId:'inv1',paymentId:'pay-new'}),map:{invoice:[{id:'inv1',payments:[{id:'pay-other',amount:100}]}]},want:'LIKELY_NOT_APPLIED'},
  {name:'Legacy payment · no exact id stays uncertain',tx:tx('Customer Payment','record',{invoiceId:'inv1'}),map:{invoice:[{id:'inv1',payments:[{id:'pay-other'}]}]},want:'UNCERTAIN'},
  {name:'Receiving · crash before reconciliation write',tx:tx('Receiving','reconcile',{inboundId:'in1'}),map:{inbound:[{id:'in1',status:'Pending',receivedAt:null}]},want:'LIKELY_NOT_APPLIED'},
  {name:'Receiving · crash after reconciliation write',tx:tx('Receiving','reconcile',{inboundId:'in1'}),map:{inbound:[{id:'in1',status:'Ready',receivedAt:'2026-01-01T00:00:01Z'}]},want:'LIKELY_APPLIED'},
  {name:'Installation · crash after completion write',tx:tx('Installation','complete',{installationId:'ins1'}),map:{install:[{id:'ins1',status:'Completed',completedAt:'2026-01-01'}]},want:'LIKELY_APPLIED'},
  {name:'Supplier payment · crash before paid write',tx:tx('Supplier Accounting','mark-paid',{accountingId:'a1'}),map:{accounting:[{id:'a1',status:'Ready to Pay'}]},want:'LIKELY_NOT_APPLIED'}
 ];
}
function run(){
 const results=scenarios().map(s=>{const got=classify(s.tx,s.map);return {name:s.name,want:s.want,got,ok:got===s.want}});
 return {passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,total:results.length,results,nonDestructive:true};
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){const host=document.getElementById('universalCrashSimulator');if(!host)return;const r=run();host.innerHTML='<div class="card"><h2>Crash Simulation Harness</h2><p class="muted">Synthetic, in-memory crash tests. No customer or business data is created, changed, or deleted.</p><div class="uCrashSimHero '+(r.failed?'fail':'pass')+'"><div><b>'+(r.failed?'SIMULATION HOLD':'CRASH TESTS PASS ✓')+'</b><span>'+r.passed+' passed · '+r.failed+' failed · '+r.total+' scenarios</span></div><strong>NON-DESTRUCTIVE</strong></div></div><div class="card">'+r.results.map(x=>'<div class="uCrashSimRow"><b>'+(x.ok?'✓':'✕')+' '+esc(x.name)+'</b><span>'+esc(x.got)+' · expected '+esc(x.want)+'</span></div>').join('')+'</div>'}
window.RUNLUUniversalCrashSimulator=Object.freeze({run,scenarios,render});
})();