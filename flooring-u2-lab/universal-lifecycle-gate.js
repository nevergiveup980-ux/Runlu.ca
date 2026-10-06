/* RUNLU Flooring OS Universal · U1 Lifecycle Gate
   Read-only integrity checks across the local Universal lifecycle. */
(function(){
'use strict';
const WS='runlu_flooring_universal_u0_workspace',read=(k,d)=>window.RUNLUUniversalData.read(k,d),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function run(){
 const org=read(WS,null)?.company?.organizationId||'',jobs=window.RUNLUUniversalSales?.jobs()||[],pos=window.RUNLUUniversalPO?.pos()||[],inb=window.RUNLUUniversalInbound?.tasks()||[],inst=window.RUNLUUniversalInstallation?.rows()||[],bills=window.RUNLUUniversalBilling?.rows()||[],acct=window.RUNLUUniversalAccounting?.rows()||[],audit=window.RUNLUUniversalAudit?.events()||[];
 const issues=[],warn=(code,msg)=>issues.push({code,msg});
 const dup=(xs,key,label)=>{const seen=new Set();xs.forEach(x=>{const v=x[key];if(v&&seen.has(v))warn('DUP_'+key.toUpperCase(),label+' duplicated: '+v);if(v)seen.add(v)})};
 [jobs,pos,inb,inst,bills,acct].forEach((xs,i)=>xs.forEach(x=>{if(x.organizationId!==org)warn('TENANT_LEAK','Cross-organization record visible in dataset '+i);if(!x.organizationId)warn('NO_ORG','Record missing organizationId')}));
 dup(pos,'poNumber','PO number');dup(bills,'invoiceNumber','Invoice number');
 pos.forEach(p=>{if(p.jobId&&!jobs.some(j=>j.id===p.jobId))warn('ORPHAN_PO','PO '+(p.poNumber||p.id)+' has no Job')});
 inb.forEach(t=>{if(!pos.some(p=>p.id===t.poId))warn('ORPHAN_INBOUND','Inbound task has no PO');if(t.status==='Ready'&&(t.exceptions||[]).length)warn('READY_WITH_EXCEPTION','Ready material still has receiving exceptions')});
 inst.forEach(i=>{if(!jobs.some(j=>j.id===i.jobId))warn('ORPHAN_INSTALL','Installation has no Job');if(i.status==='Completed'&&(!i.installDate||!i.installer))warn('BAD_INSTALL_COMPLETE','Completed installation missing date/installer')});
 bills.forEach(b=>{const paid=(b.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);if(Math.abs(paid-Number(b.paidAmount||0))>.01)warn('PAYMENT_TOTAL','Payment ledger does not match paid amount');if(b.status==='Paid'&&Number(b.balance||0)>.01)warn('PAID_WITH_BALANCE','Paid invoice still has balance');if(!inst.some(i=>i.jobId===b.jobId&&i.status==='Completed'))warn('EARLY_INVOICE','Customer invoice exists before completed installation')});
 acct.forEach(a=>{if(a.status==='Paid'&&a.matchStatus!=='Matched')warn('SUPPLIER_PAID_UNMATCHED','Supplier payment marked Paid without a matched invoice')});
 const paidIds=new Set(bills.filter(x=>x.status==='Paid').map(x=>x.id));paidIds.forEach(id=>{if(!audit.some(e=>e.entityType==='Customer Payment'&&e.entityId===id))warn('MISSING_PAYMENT_AUDIT','Paid customer invoice has no payment audit event')});return {org,counts:{jobs:jobs.length,pos:pos.length,inbound:inb.length,installations:inst.length,customerInvoices:bills.length,supplierAccounting:acct.length,auditEvents:audit.length},issues};
}
function render(){const host=document.getElementById('universalLifecycleGate');if(!host)return;const r=run(),ok=!r.issues.length;host.innerHTML='<div class="card"><h2>U1 Lifecycle Gate</h2><p class="muted">Read-only integrity check. No business data is changed.</p><div class="uGate '+(ok?'pass':'fail')+'"><b>'+(ok?'PASS':'REVIEW')+'</b><span>'+r.issues.length+' issue(s)</span></div><div class="uGateCounts">'+Object.entries(r.counts).map(([k,v])=>'<span>'+esc(k)+' <b>'+v+'</b></span>').join('')+'</div></div><div class="card"><h3>Integrity Results</h3>'+(ok?'<p>No tenant, linkage, duplicate-number, receiving, installation, or payment integrity issue detected in the current workspace.</p>':r.issues.map(x=>'<div class="uGateIssue"><b>'+esc(x.code)+'</b><span>'+esc(x.msg)+'</span></div>').join(''))+'</div>'}
window.RUNLUUniversalLifecycleGate=Object.freeze({run,render});
})();