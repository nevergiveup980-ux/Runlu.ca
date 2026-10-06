/* RUNLU Flooring OS Universal · U2 Scenario Simulator
   Pure in-memory business-chain regression. Never writes workspace or cloud data. */
(function(){
'use strict';
const money=n=>Math.round(Number(n||0)*100)/100;
function simulate(kind){
 const base={
  job:{quoteStatus:'Ready',orderStatus:'Confirmed',status:'In Progress',financialStatus:'Open',total:1250},
  purchaseOrders:[{status:'Issued',received:'Ready',financialStatus:'Open'},{status:'Issued',received:'Ready',financialStatus:'Open'}],
  warehouse:{jobMaterialReady:true},installation:{status:'Completed'},
  customerInvoice:{total:1250,paid:1250,balance:0,status:'Paid'},
  supplierAccounting:[{matchStatus:'Matched',status:'Paid'},{matchStatus:'Matched',status:'Paid'}]
 };
 if(kind==='backorder'){base.purchaseOrders[1].received='Partially Received';base.warehouse.jobMaterialReady=false;base.installation.status='Blocked';base.customerInvoice={status:'Not Created',total:0,paid:0,balance:0}}
 if(kind==='partial-payment'){base.customerInvoice.paid=500;base.customerInvoice.balance=750;base.customerInvoice.status='Partially Paid'}
 if(kind==='normal'){base.job.status='Completed';base.job.financialStatus='Paid';base.purchaseOrders.forEach(x=>x.financialStatus='Paid')}
 return base;
}
function check(name,s){
 const tests=[],t=(n,ok)=>tests.push({name:n,ok:!!ok});
 t('Customer order confirmed before purchasing',s.job.orderStatus==='Confirmed');
 t('All supplier POs issued',s.purchaseOrders.every(x=>x.status==='Issued'));
 if(name==='backorder'){
  t('Partial receiving detected',s.purchaseOrders.some(x=>x.received==='Partially Received'));
  t('Whole-job material readiness blocked',s.warehouse.jobMaterialReady===false);
  t('Installation blocked until all material ready',s.installation.status==='Blocked');
  t('Customer invoice not created early',s.customerInvoice.status==='Not Created');
 }else{
  t('All PO material ready',s.purchaseOrders.every(x=>x.received==='Ready'));
  t('Whole-job material readiness passed',s.warehouse.jobMaterialReady===true);
  t('Installation completed',s.installation.status==='Completed');
  t('Customer balance math',money(s.customerInvoice.total-s.customerInvoice.paid)===money(s.customerInvoice.balance));
  if(name==='partial-payment'){
   t('Partial customer payment keeps job open',s.customerInvoice.status==='Partially Paid'&&s.customerInvoice.balance>0&&s.job.status!=='Completed');
  }else{
   t('Full customer payment closes job',s.customerInvoice.status==='Paid'&&s.customerInvoice.balance===0&&s.job.status==='Completed'&&s.job.financialStatus==='Paid');
   t('Supplier invoices matched',s.supplierAccounting.every(x=>x.matchStatus==='Matched'));
   t('Supplier payments close PO finance',s.supplierAccounting.every(x=>x.status==='Paid')&&s.purchaseOrders.every(x=>x.financialStatus==='Paid'));
  }
 }
 return tests;
}
function run(){const scenarios=['normal','backorder','partial-payment'].map(name=>{const state=simulate(name);return{name,state,tests:check(name,state)}});const tests=scenarios.flatMap(x=>x.tests);return{scenarios,passed:tests.filter(x=>x.ok).length,failed:tests.filter(x=>!x.ok).length}}
function render(){const host=document.getElementById('universalScenarioSimulator');if(!host)return;const r=run();host.innerHTML='<div class="card"><h2>U2 Business Chain Simulator</h2><p class="muted">Isolated end-to-end regression: confirmed order → purchasing → receiving → whole-job readiness → installation → customer payment + supplier payment. No workspace or cloud records are written.</p><div class="uSim '+(r.failed?'fail':'pass')+'"><b>'+(r.failed?'HOLD':'PASS')+'</b><span>'+r.passed+' passed · '+r.failed+' failed</span></div></div>'+r.scenarios.map(s=>'<div class="card"><h3>'+s.name.replace('-',' ')+'</h3>'+s.tests.map(t=>'<div class="uSimTest"><b>'+(t.ok?'✓':'✕')+' '+t.name+'</b></div>').join('')+'</div>').join('')}
window.RUNLUUniversalScenarioSimulator=Object.freeze({run,simulate,render});
})();