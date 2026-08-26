/* RUNLU Deerfoot Flooring OS · V0.3.45 Payment Lifecycle Research
   Isolated payment-history module. No MutationObserver. Production V0.3.44 remains unchanged.
   Research ledger is kept in a sidecar localStorage key until explicitly applied to the Job. */
(function(){
'use strict';
if(window.__runluPaymentLifecycleV045)return;
window.__runluPaymentLifecycleV045=true;
const SIDE='runlu_flooring_payment_lifecycle_v045';
const by=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const money=n=>'$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function read(){try{return JSON.parse(localStorage.getItem(SIDE)||'{}')}catch(_){return {}}}
function write(v){localStorage.setItem(SIDE,JSON.stringify(v))}
function job(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function key(j=job()){return j?.id||j?.jobNumber||'blank'}
function methodLabel(v){return ({finance:'Finance',cash:'Cash',cheque:'Cheque',visa:'Visa',mastercard:'Master Card',interac:'Interac'})[v]||v||'—'}
function invoiceTotal(j){try{return typeof window.calc==='function'?Number(window.calc(j).total||0):0}catch(_){return 0}}
function seed(j){
  const db=read(),k=key(j);if(db[k])return db[k];
  let payments=[];
  if(Array.isArray(j?.paymentHistory)&&j.paymentHistory.length){payments=JSON.parse(JSON.stringify(j.paymentHistory))}
  else if(Number(j?.depositPaid||0)>0){payments=[{id:'legacy-'+Date.now(),type:'Deposit',amount:Number(j.depositPaid||0),date:j.invoiceDate||j.date||today(),method:j.paymentMethod||'',reference:'',note:'Imported from existing Deposit Paid field',source:'legacy-opening',createdAt:new Date().toISOString()}]}
  db[k]={jobId:j?.id||'',jobNumber:j?.jobNumber||'',payments,savedAt:new Date().toISOString()};write(db);return db[k]
}
function ledger(j=job()){if(!j)return {payments:[]};return seed(j)}
function totals(j=job()){
  const l=ledger(j),paid=(l.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0),total=invoiceTotal(j),balance=Math.max(0,total-paid);let status='Unpaid';
  if(paid>0&&paid<total)status='Partially Paid';else if(total>0&&Math.abs(paid-total)<0.005)status='Paid in Full';else if(total>0&&paid>total)status='Overpaid';
  return {total,paid,balance,status,overpaid:Math.max(0,paid-total)}
}
function saveLedger(l){const db=read();db[key()]={...l,savedAt:new Date().toISOString()};write(db)}
function render(){
  const j=job(),box=by('paymentLifecycleV045');if(!box)return;if(!j){box.innerHTML='<h3>Payment Lifecycle · V0.3.45 Research</h3><div class="muted">Select a Job / Order first.</div>';return}
  const l=ledger(j),t=totals(j),rows=(l.payments||[]).map((p,i)=>`<div style="display:grid;grid-template-columns:88px 120px 100px 110px 1fr auto;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #e5ebe8;font-size:13px"><span>${esc(p.date||'')}</span><b>${esc(p.type||'Payment')}</b><span>${money(p.amount)}</span><span>${esc(methodLabel(p.method))}</span><span>${esc([p.reference,p.note].filter(Boolean).join(' · ')||'—')}${p.source==='legacy-opening'?'<small style="display:block;color:#8a6b1b">Imported from legacy Deposit Paid</small>':''}</span><button class="action red" type="button" data-pay-remove="${i}">×</button></div>`).join('')||'<div class="muted" style="padding:10px 0">No payments recorded yet.</div>';
  const over=t.overpaid>0?`<div class="notice" style="margin-top:10px;color:#8a4b00"><b>Overpayment:</b> ${money(t.overpaid)}</div>`:'';
  box.innerHTML=`<div class="statusLine"><div><h2 style="margin:0">Payment Lifecycle</h2><div class="muted">V0.3.45 Research · sidecar ledger until you choose Apply to Job</div></div><span class="tag">${esc(t.status)}</span></div>
  <div class="summary" style="margin-top:12px"><div><small>Invoice Total</small><b>${money(t.total)}</b></div><div><small>Paid to Date</small><b>${money(t.paid)}</b></div><div><small>Balance Due</small><b>${money(t.balance)}</b></div><div><small>Status</small><b style="font-size:16px">${esc(t.status)}</b></div></div>${over}
  <div class="notice" style="margin-top:12px"><b>Research rule:</b> each payment is stored as its own record. The existing <b>Deposit Paid</b> field is not overwritten until <b>Apply Ledger to Job</b> is pressed.</div>
  <h3 style="margin-top:16px">Record a Payment</h3><div class="formgrid"><div><label>Date</label><input id="payDate045" type="date" value="${today()}"></div><div><label>Amount</label><input id="payAmount045" type="number" step="0.01" min="0" inputmode="decimal" placeholder="0.00"></div><div><label>Type</label><select id="payType045"><option>Deposit</option><option>Progress Payment</option><option>Final Payment</option></select></div><div><label>Method</label><select id="payMethod045"><option value="">—</option><option value="finance">Finance</option><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="visa">Visa</option><option value="mastercard">Master Card</option><option value="interac">Interac</option></select></div><div><label>Reference</label><input id="payReference045" placeholder="Receipt / cheque / transaction #"></div><div><label>Note</label><input id="payNote045" placeholder="Optional note"></div></div>
  <div class="actions"><button class="action blue" id="addPayment045" type="button">+ Add Payment</button><button class="action primary" id="applyPayments045" type="button">Apply Ledger to Job</button><button class="action" id="discardPayments045" type="button">Reset Research Ledger</button></div>
  <h3 style="margin-top:17px">Payment History</h3><div style="overflow-x:auto;min-width:0"><div style="min-width:720px">${rows}</div></div>`;
  by('addPayment045').onclick=addPayment;by('applyPayments045').onclick=applyToJob;by('discardPayments045').onclick=resetLedger;box.querySelectorAll('[data-pay-remove]').forEach(b=>b.onclick=()=>removePayment(Number(b.dataset.payRemove)));
}
function addPayment(){const j=job();if(!j)return;const amount=Number(by('payAmount045')?.value||0);if(!(amount>0))return alert('Enter a payment amount greater than 0.');const l=ledger(j);l.payments=l.payments||[];l.payments.push({id:'pay-'+Date.now(),type:by('payType045')?.value||'Payment',amount,date:by('payDate045')?.value||today(),method:by('payMethod045')?.value||'',reference:(by('payReference045')?.value||'').trim(),note:(by('payNote045')?.value||'').trim(),createdAt:new Date().toISOString()});saveLedger(l);render()}
function removePayment(i){const j=job();if(!j)return;const l=ledger(j);const p=l.payments?.[i];if(!p)return;if(!confirm('Remove this payment from the research ledger?'))return;l.payments.splice(i,1);saveLedger(l);render()}
function resetLedger(){const j=job();if(!j)return;if(!confirm('Reset the V0.3.45 research ledger for this Job? The V0.3.44 Job record will not be changed.'))return;const db=read();delete db[key(j)];write(db);render()}
function applyToJob(){
  const j=job();if(!j)return alert('Select a Job / Order first.');const l=ledger(j),t=totals(j);if(!confirm(`Apply ${l.payments.length} payment record(s) to Job ${j.jobNumber||''}?\n\nPaid to date: ${money(t.paid)}\nBalance due: ${money(t.balance)}\nStatus: ${t.status}`))return;
  const ps=JSON.parse(JSON.stringify(l.payments||[])),last=ps.slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).at(-1)||null;
  j.paymentHistory=ps;j.amountPaid=t.paid;j.depositPaid=t.paid;j.balanceDue=t.balance;j.paymentStatus=t.status;j.lastPaymentDate=last?.date||'';j.lastPaymentMethod=last?.method||'';if(last?.method)j.paymentMethod=last.method;j.paymentUpdatedAt=new Date().toISOString();
  try{if(typeof window.saveStore==='function')window.saveStore();if(typeof window.renderAccounting==='function')window.renderAccounting();if(typeof window.renderCommand==='function')window.renderCommand();if(typeof window.renderJobs==='function')window.renderJobs();if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(e){console.error(e)}
  const dep=by('depositPaid');if(dep)dep.value=t.paid;const pm=by('paymentMethod');if(pm&&last?.method)pm.value=last.method;render();alert('Payment Ledger applied to the active Job / Invoice. Existing invoice compatibility fields were synchronized.')
}
function install(){const sec=by('accounting');if(!sec)return false;if(!by('paymentLifecycleV045')){const box=document.createElement('div');box.id='paymentLifecycleV045';box.className='card';sec.appendChild(box)}render();return true}
window.RUNLUPaymentLifecycleV045={install,render,applyToJob};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
