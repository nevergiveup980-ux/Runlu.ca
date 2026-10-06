/* RUNLU Flooring OS Universal · U1 Recovery / Reconciliation
   Diagnostic only: proposes repairs; never mutates business records. */
(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function scan(){
 const gate=window.RUNLUUniversalLifecycleGate?.run?.()||{issues:[]},jobs=window.RUNLUUniversalSales?.jobs?.()||[],pos=window.RUNLUUniversalPO?.pos?.()||[],inb=window.RUNLUUniversalInbound?.tasks?.()||[],inst=window.RUNLUUniversalInstallation?.rows?.()||[],bills=window.RUNLUUniversalBilling?.rows?.()||[];
 const recs=[];
 const add=(severity,code,entity,problem,source,action)=>recs.push({severity,code,entity,problem,source,action});
 gate.issues.forEach(x=>add('Review',x.code,'Lifecycle',x.msg,'Lifecycle Gate','Inspect linked records; do not auto-rewrite.'));
 pos.filter(p=>p.jobId&&!jobs.some(j=>j.id===p.jobId)).forEach(p=>add('High','ORPHAN_PO',p.poNumber||p.id,'PO points to a missing Job','Supplier PO ledger','Restore/link the originating Job or cancel the PO with an audit note.'));
 inb.filter(t=>!pos.some(p=>p.id===t.poId)).forEach(t=>add('High','ORPHAN_INBOUND',t.id,'Receiving task points to a missing PO','Inbound ledger','Restore/link the source PO before further receiving.'));
 inst.filter(i=>i.status==='Completed'&&!bills.some(b=>b.jobId===i.jobId)).forEach(i=>add('Medium','MISSING_CUSTOMER_INVOICE',i.jobNumber||i.id,'Completed installation has no customer invoice','Completed Installation','Create invoice from the completed Job totals.'));
 bills.filter(b=>b.status==='Paid'&&Number(b.balance||0)>0.01).forEach(b=>add('High','PAID_WITH_BALANCE',b.invoiceNumber||b.id,'Invoice is Paid but balance remains','Payment ledger','Recalculate paid amount and balance from payment entries; preserve original events.'));
 return recs;
}
function render(){const host=document.getElementById('universalRecovery');if(!host)return;const rs=scan();host.innerHTML='<div class="card"><h2>Recovery / Reconciliation</h2><p class="muted">Diagnostic mode only. It identifies the trusted source and a repair path; it never silently changes business data.</p></div><div class="card">'+(rs.length?rs.map(r=>'<div class="uRecovery"><div class="uRecoveryTop"><b>'+esc(r.severity)+' · '+esc(r.code)+'</b><span>'+esc(r.entity)+'</span></div><p>'+esc(r.problem)+'</p><small><b>Trusted source:</b> '+esc(r.source)+'</small><small><b>Recommended repair:</b> '+esc(r.action)+'</small></div>').join(''):'<div class="uRecoveryPass"><b>RECONCILED</b><span>No repair recommendation is required for the current workspace.</span></div>')+'</div>'}
window.RUNLUUniversalRecovery=Object.freeze({scan,render});
})();