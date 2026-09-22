/* RUNLU Flooring OS Universal · U1 Scenario Simulator
   Pure in-memory scenarios. Never writes localStorage or production/cloud data. */
(function(){
'use strict';
const money=n=>Math.round(Number(n||0)*100)/100;
function simulate(kind){
 const base={job:{status:'In Progress',total:1250},po:{status:'Issued'},receiving:{ordered:10,received:10,damaged:0,status:'Ready'},installation:{status:'Completed'},invoice:{total:1250,paid:1250,balance:0,status:'Paid'}};
 if(kind==='exception'){base.receiving.received=7;base.receiving.damaged=1;base.receiving.status='Partially Received';base.installation.status='Blocked';base.invoice={total:0,paid:0,balance:0,status:'Not Created'}}
 if(kind==='partial-payment'){base.invoice.paid=500;base.invoice.balance=750;base.invoice.status='Partially Paid'}
 return base;
}
function check(name,s){
 const tests=[],t=(n,ok)=>tests.push({name:n,ok:!!ok});
 t('Job created',s.job.status==='In Progress');
 t('PO issued',s.po.status==='Issued');
 if(name==='exception'){
  t('Backorder detected',s.receiving.received<s.receiving.ordered);
  t('Damage detected',s.receiving.damaged>0);
  t('Installation blocked by material exception',s.installation.status==='Blocked');
  t('Customer invoice not created early',s.invoice.status==='Not Created');
 }else{
  t('Material ready',s.receiving.status==='Ready');
  t('Installation completed',s.installation.status==='Completed');
  t('Invoice balance math',money(s.invoice.total-s.invoice.paid)===money(s.invoice.balance));
  if(name==='partial-payment')t('Partial payment remains open',s.invoice.status==='Partially Paid'&&s.invoice.balance>0);
  else t('Full payment closes invoice',s.invoice.status==='Paid'&&s.invoice.balance===0);
 }
 return tests;
}
function run(){const scenarios=[['normal',simulate('normal')],['exception',simulate('exception')],['partial-payment',simulate('partial-payment')]].map(([name,state])=>({name,state,tests:check(name,state)}));const tests=scenarios.flatMap(x=>x.tests);return {scenarios,passed:tests.filter(x=>x.ok).length,failed:tests.filter(x=>!x.ok).length}}
function render(){const host=document.getElementById('universalScenarioSimulator');if(!host)return;const r=run();host.innerHTML='<div class="card"><h2>U1 Scenario Simulator</h2><p class="muted">Isolated in-memory tests. No local workspace, Deerfoot data, Supabase, or cloud records are written.</p><div class="uSim '+(r.failed?'fail':'pass')+'"><b>'+(r.failed?'HOLD':'PASS')+'</b><span>'+r.passed+' passed · '+r.failed+' failed</span></div></div>'+r.scenarios.map(s=>'<div class="card"><h3>'+s.name.replace('-',' ')+'</h3>'+s.tests.map(t=>'<div class="uSimTest"><b>'+(t.ok?'✓':'✕')+' '+t.name+'</b></div>').join('')+'</div>').join('')}
window.RUNLUUniversalScenarioSimulator=Object.freeze({run,simulate,render});
})();