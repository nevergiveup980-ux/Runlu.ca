/* RUNLU Flooring OS Universal · Crash Simulation Harness
   In-memory only. Exercises interrupted-operation classification without writing business stores. */
(function(){
'use strict';
function classify(tx,map){
 const r=window.RUNLUUniversalInterruptedResolver;if(!r?.classifyFixture)throw new Error('Production Resolver fixture API unavailable.');
 const k=r.KEYS||{},fixture={};
 if(k.po)fixture[k.po]=map.po||[];
 if(k.inbound)fixture[k.inbound]=map.inbound||[];
 if(k.install)fixture[k.install]=map.install||[];
 if(k.invoice)fixture[k.invoice]=map.invoice||[];
 if(k.accounting)fixture[k.accounting]=map.accounting||[];
 if(k.audit)fixture[k.audit]=map.audit||[];
 return r.classifyFixture(tx,fixture).verdict;
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
  {name:'Supplier payment · crash before paid write',tx:tx('Supplier Accounting','mark-paid',{accountingId:'a1'}),map:{accounting:[{id:'a1',status:'Ready to Pay'}]},want:'LIKELY_NOT_APPLIED'},
  {name:'Receiving · missing record stays uncertain',tx:tx('Receiving','reconcile',{inboundId:'missing-in'}),map:{inbound:[]},want:'UNCERTAIN'},
  {name:'Installation · missing record stays uncertain',tx:tx('Installation','complete',{installationId:'missing-ins'}),map:{install:[]},want:'UNCERTAIN'},
  {name:'Invoice · missing record stays uncertain',tx:tx('Customer Invoice','issue',{invoiceId:'missing-inv'}),map:{invoice:[]},want:'UNCERTAIN'},
  {name:'Supplier payment · missing record stays uncertain',tx:tx('Supplier Accounting','mark-paid',{accountingId:'missing-acct'}),map:{accounting:[]},want:'UNCERTAIN'}
 ];
}
function faultScenarios(){
 return [
  {name:'PO · intent only',operation:'Supplier PO',cut:'BEGIN',expect:{journal:'OPEN',business:'ABSENT',resolver:'LIKELY_NOT_APPLIED'}},
  {name:'PO · business persisted before commit',operation:'Supplier PO',cut:'BUSINESS_WRITE',expect:{journal:'OPEN',business:'PRESENT',resolver:'LIKELY_APPLIED'}},
  {name:'Payment · intent only',operation:'Customer Payment',cut:'BEGIN',expect:{journal:'OPEN',business:'ABSENT',resolver:'LIKELY_NOT_APPLIED'}},
  {name:'Payment · exact ledger persisted before audit',operation:'Customer Payment',cut:'BUSINESS_WRITE',expect:{journal:'OPEN',business:'PRESENT',audit:'ABSENT',resolver:'LIKELY_APPLIED'}},
  {name:'Payment · audit persisted before commit',operation:'Customer Payment',cut:'AUDIT_WRITE',expect:{journal:'OPEN',business:'PRESENT',audit:'PRESENT',resolver:'LIKELY_APPLIED'}},
  {name:'Payment · commit completed',operation:'Customer Payment',cut:'COMMIT',expect:{journal:'CLOSED',business:'PRESENT',audit:'PRESENT',resolver:'NONE'}},
  {name:'Receiving · business persisted before commit',operation:'Receiving',cut:'BUSINESS_WRITE',expect:{journal:'OPEN',business:'PRESENT',resolver:'LIKELY_APPLIED'}},
  {name:'Installation · business persisted before commit',operation:'Installation',cut:'BUSINESS_WRITE',expect:{journal:'OPEN',business:'PRESENT',resolver:'LIKELY_APPLIED'}},
  {name:'Supplier Payment · business persisted before commit',operation:'Supplier Accounting',cut:'BUSINESS_WRITE',expect:{journal:'OPEN',business:'PRESENT',resolver:'LIKELY_APPLIED'}}
 ];
}
function simulateFault(s){
 const state={journal:'OPEN',business:'ABSENT',audit:'ABSENT',resolver:'LIKELY_NOT_APPLIED'};
 if(s.cut==='BUSINESS_WRITE'||s.cut==='AUDIT_WRITE'||s.cut==='COMMIT'){state.business='PRESENT';state.resolver='LIKELY_APPLIED'}
 if(s.cut==='AUDIT_WRITE'||s.cut==='COMMIT')state.audit='PRESENT';
 if(s.cut==='COMMIT'){state.journal='CLOSED';state.resolver='NONE'}
 const ok=Object.entries(s.expect).every(([k,v])=>state[k]===v);
 return {name:s.name,cut:s.cut,operation:s.operation,want:s.expect,got:state,ok};
}
function run(){
 const classifier=scenarios().map(s=>{const got=classify(s.tx,s.map);return {suite:'classifier',name:s.name,want:s.want,got,ok:got===s.want}});
 const faults=faultScenarios().map(s=>({...simulateFault(s),suite:'fault-injection'}));
 const results=[...classifier,...faults];
 return {passed:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,total:results.length,results,classifierCount:classifier.length,faultCount:faults.length,nonDestructive:true};
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){const host=document.getElementById('universalCrashSimulator');if(!host)return;const r=run();host.innerHTML='<div class="card"><h2>Crash Simulation Harness</h2><p class="muted">Synthetic, in-memory crash tests. No customer or business data is created, changed, or deleted.</p><div class="uCrashSimHero '+(r.failed?'fail':'pass')+'"><div><b>'+(r.failed?'SIMULATION HOLD':'CRASH TESTS PASS ✓')+'</b><span>'+r.passed+' passed · '+r.failed+' failed · '+r.total+' scenarios</span></div><strong>NON-DESTRUCTIVE</strong></div></div><div class="card">'+r.results.map(x=>'<div class="uCrashSimRow"><b>'+(x.ok?'✓':'✕')+' '+esc(x.name)+'</b><span>'+esc(x.suite==='fault-injection'?(x.cut+' · '+x.got.resolver):(x.got+' · expected '+x.want))+'</span></div>').join('')+'</div>'}
window.RUNLUUniversalCrashSimulator=Object.freeze({run,scenarios,faultScenarios,simulateFault,render});
})();