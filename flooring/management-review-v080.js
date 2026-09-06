/* RUNLU Deerfoot Flooring OS · V0.3.80 Management Review
   Adds company-level A/R first review and configurable quarterly Commission Report.
   - A/R is an operational review over existing Invoice/Payment/Accounting records.
   - Commission defaults to a WORKING ASSUMPTION of 10% of gross profit before commission;
     the company policy is explicitly unconfirmed and every core rule is configurable.
   - No G/L posting, payroll posting, tax filing or historical record rewrite occurs here.
*/
(function(){
'use strict';
if(window.__RUNLU_MANAGEMENT_REVIEW_V080__)return;
window.__RUNLU_MANAGEMENT_REVIEW_V080__=true;

const JOBS='runlu_deerfoot_flooring_jobs_v1';
const PAY='runlu_flooring_payment_lifecycle_v045';
const SIDE='runlu_accounting_foundation_v067';
const SETTINGS='runlu_commission_settings_v080';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=v=>{const x=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(x)?x:0};
const r=x=>Math.round((n(x)+Number.EPSILON)*100)/100;
const money=x=>r(x).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
const dateOk=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const datePart=v=>{const s=String(v||'');return /^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):''};
const plusDays=(d,k)=>{if(!dateOk(d))return'';const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+Number(k||0));return x.toISOString().slice(0,10)};
const jobs=()=>{const x=read(JOBS,[]);return Array.isArray(x)?x:[]};
const payDB=()=>{const x=read(PAY,{});return x&&typeof x==='object'?x:{}};
const sideDB=()=>{const x=read(SIDE,{});return x&&typeof x==='object'?x:{}};
const key=j=>j?.id||j?.jobNumber||'blank';
let tab='ar';

function defaults(){return {version:1,basis:'grossProfit',defaultRate:10,eligibility:'invoice',dateBasis:'invoiceDate',minimumMargin:'',repRates:{},policyStatus:'Working assumption · company policy not confirmed',updatedAt:''}}
function settings(){const x=read(SETTINGS,{});return {...defaults(),...(x&&typeof x==='object'?x:{}),repRates:{...(x?.repRates||{})}}}
function saveSettings(next){next={...settings(),...next,updatedAt:new Date().toISOString()};write(SETTINGS,next);return next}
function side(j,sdb=sideDB()){const x=sdb[key(j)]||sdb[String(j?.jobNumber||'')]||{};return {invoiceDate:datePart(x.invoiceDate||j?.invoiceDate||j?.date),terms:x.terms==null?30:n(x.terms),dueDate:datePart(x.dueDate),commission:n(x.commission)}}
function paymentRows(j,pdb=payDB()){const x=pdb[key(j)]||pdb[String(j?.jobNumber||'')]||{};return Array.isArray(x.payments)?x.payments:[]}
function paid(j,pdb=payDB()){return r(paymentRows(j,pdb).reduce((s,p)=>s+n(p.amount),0))}
function lastPayment(j,pdb=payDB()){
  return paymentRows(j,pdb).slice().sort((a,b)=>String(a.date||a.createdAt||'').localeCompare(String(b.date||b.createdAt||''))).at(-1)||null;
}
function invoiceCalc(j){try{if(typeof window.calc==='function')return window.calc(j)||{}}catch(_){}const sub=(j?.items||[]).reduce((s,x)=>s+n(x.total),0)+n(j?.deliveryCharge);return {subtotal:r(sub),taxableSubtotal:r(sub),gst:r(sub*.05),total:r(sub*1.05)}}
function arRow(j,pdb=payDB(),sdb=sideDB()){
  const s=side(j,sdb),c=invoiceCalc(j),p=paid(j,pdb),total=n(c.total),balance=Math.max(0,r(total-p));
  const due=s.dueDate||plusDays(s.invoiceDate,s.terms),today=new Date();today.setHours(12,0,0,0);let age=0,bucket=balance?'Current':'Paid';
  if(balance&&dateOk(due)){age=Math.floor((today-new Date(due+'T12:00:00'))/86400000);if(age>90)bucket='90+';else if(age>60)bucket='61–90';else if(age>30)bucket='31–60';else if(age>0)bucket='1–30'}
  const lp=lastPayment(j,pdb),missingDate=balance>0&&(!s.invoiceDate||!due),priority=bucket==='90+'?5:bucket==='61–90'?4:bucket==='31–60'?3:bucket==='1–30'?2:missingDate?2:1;
  return {j,total,p,balance,invoiceDate:s.invoiceDate,due,age,bucket,lastPayment:lp,missingDate,priority};
}
function openReceivables(){const pdb=payDB(),sdb=sideDB();return jobs().filter(j=>j&&j.status!=='Cancelled').map(j=>arRow(j,pdb,sdb)).filter(x=>x.balance>.004)}
function arMetrics(rows){const out={total:0,Current:0,'1–30':0,'31–60':0,'61–90':0,'90+':0,review:0};rows.forEach(x=>{out.total+=x.balance;out[x.bucket]=(out[x.bucket]||0)+x.balance;if(x.priority>=3||x.missingDate)out.review++});Object.keys(out).forEach(k=>typeof out[k]==='number'&&(out[k]=r(out[k])));return out}
function pill(bucket){return bucket==='90+'||bucket==='61–90'?'red':bucket==='31–60'||bucket==='1–30'?'gold':'green'}
function arHtml(){
  const rows=openReceivables().sort((a,b)=>b.priority-a.priority||b.balance-a.balance),m=arMetrics(rows);
  const table=rows.length?`<div class="v080table"><div class="v080tr head"><span>ACCOUNT / ORDER</span><span>INVOICE</span><span>DUE</span><span>AGING</span><span>PAID</span><span>BALANCE</span><span>LAST PAYMENT</span></div>${rows.slice(0,100).map(x=>`<div class="v080tr"><span><b>${esc(x.j.customerName||'Unnamed customer')}</b><small>#${esc(x.j.jobNumber||'—')} · ${esc(x.j.salesRep||'Unassigned')}</small></span><span>${esc(x.invoiceDate||'MISSING')}</span><span>${esc(x.due||'MISSING')}</span><span><i class="v080pill ${pill(x.bucket)}">${esc(x.missingDate?'DATE REVIEW':x.bucket)}</i></span><span>${money(x.p)}</span><span><b>${money(x.balance)}</b></span><span>${x.lastPayment?esc(datePart(x.lastPayment.date||x.lastPayment.createdAt)||'—')+' · '+money(x.lastPayment.amount):'—'}</span></div>`).join('')}</div>`:'<div class="v080empty">No open A/R is recorded in the current Flooring OS dataset.</div>';
  return `<div class="v080summary">${metric('TOTAL A/R',money(m.total),'Open customer balance')}${metric('CURRENT',money(m.Current),'Not past due','green')}${metric('1–30',money(m['1–30']),'Past due','gold')}${metric('31–60',money(m['31–60']),'Review','gold')}${metric('61–90',money(m['61–90']),'Priority','red')}${metric('90+',money(m['90+']),'Priority','red')}</div><div class="v080note"><b>First-review rule:</b> ${m.review} account${m.review===1?'':'s'} currently need management attention because they are 31+ days past due or have missing invoice/due-date data. This is an operational review, not a replacement for the formal A/R subledger.</div>${table}`;
}
function metric(label,value,sub,cls=''){return `<div class="v080metric ${cls}"><small>${esc(label)}</small><b>${esc(value)}</b><span>${esc(sub||'')}</span></div>`}
function currentQuarter(){const d=new Date(),q=Math.floor(d.getMonth()/3)+1;return {year:d.getFullYear(),quarter:q}}
function quarterRange(year,q){const m=(Number(q)-1)*3,start=`${year}-${String(m+1).padStart(2,'0')}-01`,endDate=new Date(Number(year),m+3,0),end=`${year}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;return {start,end}}
function completionDate(j){return datePart(j?.completedDate||j?.completionDate||j?.completedAt||j?.closedDate||j?.closedAt)}
function commissionDate(j,cfg,pdb=payDB(),sdb=sideDB()){
  if(cfg.dateBasis==='completionDate')return completionDate(j);
  if(cfg.dateBasis==='paymentDate'){const p=lastPayment(j,pdb);return datePart(p?.date||p?.createdAt)}
  return side(j,sdb).invoiceDate;
}
function economics(j){
  try{const e=window.RUNLUAccountingOrderEconomicsV069?.economics?.(j);if(e)return e}catch(_){}
  const c=invoiceCalc(j),rev=n(c.taxableSubtotal!=null?c.taxableSubtotal:c.subtotal),known=(j?.items||[]).reduce((s,x)=>s+(n(x.costTotal)||n(x.qty)*n(x.cost)),0),profit=r(rev-known);return {revenue:r(rev),forecastCost:r(known),profit,margin:rev?profit/rev*100:0};
}
function commissionRow(j,cfg,pdb=payDB(),sdb=sideDB()){
  const e=economics(j),s=side(j,sdb),a=arRow(j,pdb,sdb),rep=String(j?.salesRep||'').trim()||'Unassigned';
  const gpBefore=r(n(e.profit)+s.commission),margin=e.revenue?gpBefore/n(e.revenue)*100:0,total=a.total,collectionRatio=total>0?Math.min(1,a.p/total):0,collectedRevenue=r(n(e.revenue)*collectionRatio);
  let base=cfg.basis==='salesRevenue'?n(e.revenue):cfg.basis==='collectedRevenue'?collectedRevenue:gpBefore;
  const rateRaw=cfg.repRates&&cfg.repRates[rep]!=null&&String(cfg.repRates[rep])!==''?n(cfg.repRates[rep]):n(cfg.defaultRate),rate=Math.max(0,rateRaw);
  const date=commissionDate(j,cfg,pdb,sdb),status=String(j?.status||'');
  let eligible=true,why='Eligible';
  if(cfg.eligibility==='completed'&&!['Completed','Closed','Archived'].includes(status)){eligible=false;why='Order not completed'}
  if(cfg.eligibility==='paid'&&a.balance>.004){eligible=false;why='Balance outstanding'}
  const min=String(cfg.minimumMargin??'').trim()===''?null:n(cfg.minimumMargin);if(min!=null&&margin<min){eligible=false;why='Below minimum margin'}
  if(!date){eligible=false;why='Quarter date missing'}
  if(base<0)base=0;
  const commission=eligible?r(base*rate/100):0;
  return {j,rep,date,revenue:r(e.revenue),gpBefore,margin,collectedRevenue,base:r(base),rate,commission,profitAfter:r(gpBefore-commission),eligible,why,balance:a.balance};
}
function reps(){return [...new Set(jobs().map(j=>String(j?.salesRep||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function settingsForm(cfg){
  const repInputs=reps().map(name=>`<label>${esc(name)} %<input data-v080-rep="${esc(name)}" type="number" min="0" step="0.1" value="${esc(cfg.repRates?.[name]??'')}" placeholder="Default ${esc(cfg.defaultRate)}"></label>`).join('')||'<span class="v080muted">Salesperson overrides will appear after Sales records exist.</span>';
  return `<details class="v080settings"><summary>Commission Settings</summary><div class="v080form"><label>Commission Basis<select id="v080basis"><option value="grossProfit"${cfg.basis==='grossProfit'?' selected':''}>Gross Profit Before Commission</option><option value="salesRevenue"${cfg.basis==='salesRevenue'?' selected':''}>Sales Revenue Before Tax</option><option value="collectedRevenue"${cfg.basis==='collectedRevenue'?' selected':''}>Collected Revenue (net-sales proportion)</option></select></label><label>Default Rate %<input id="v080rate" type="number" min="0" step="0.1" value="${esc(cfg.defaultRate)}"></label><label>Eligibility<select id="v080elig"><option value="invoice"${cfg.eligibility==='invoice'?' selected':''}>Invoice recorded</option><option value="completed"${cfg.eligibility==='completed'?' selected':''}>Order completed</option><option value="paid"${cfg.eligibility==='paid'?' selected':''}>Paid in full</option></select></label><label>Quarter Date Basis<select id="v080datebasis"><option value="invoiceDate"${cfg.dateBasis==='invoiceDate'?' selected':''}>Invoice Date</option><option value="completionDate"${cfg.dateBasis==='completionDate'?' selected':''}>Completion Date</option><option value="paymentDate"${cfg.dateBasis==='paymentDate'?' selected':''}>Latest Payment Date</option></select></label><label>Minimum Gross Margin %<input id="v080minmargin" type="number" step="0.1" value="${esc(cfg.minimumMargin??'')}" placeholder="Blank = none"></label></div><h4>Salesperson Rate Overrides</h4><div class="v080repRates">${repInputs}</div><div class="v080actions"><button type="button" class="action primary" data-v080="save-settings">Save Commission Settings</button></div><div class="v080warn"><b>Policy status:</b> ${esc(cfg.policyStatus)}. The 10% default is a working setup value only, not a confirmed Deerfoot compensation rule.</div></details>`;
}
function commissionHtml(){
  const cfg=settings(),cq=currentQuarter(),year=n(by('v080year')?.value)||cq.year,q=n(by('v080quarter')?.value)||cq.quarter,range=quarterRange(year,q),pdb=payDB(),sdb=sideDB();
  const all=jobs().filter(j=>j&&j.status!=='Cancelled').map(j=>commissionRow(j,cfg,pdb,sdb)),rows=all.filter(x=>x.date&&x.date>=range.start&&x.date<=range.end),eligible=rows.filter(x=>x.eligible);
  const groups=new Map();rows.forEach(x=>{const g=groups.get(x.rep)||{rep:x.rep,sales:0,gp:0,commission:0,orders:0,eligible:0};g.sales+=x.revenue;g.gp+=x.gpBefore;g.commission+=x.commission;g.orders++;if(x.eligible)g.eligible++;groups.set(x.rep,g)});
  const totalSales=r(rows.reduce((s,x)=>s+x.revenue,0)),totalGP=r(rows.reduce((s,x)=>s+x.gpBefore,0)),totalCommission=r(rows.reduce((s,x)=>s+x.commission,0));
  const groupHtml=[...groups.values()].sort((a,b)=>b.commission-a.commission).map(g=>`<div class="v080rep"><span><b>${esc(g.rep)}</b><small>${g.eligible}/${g.orders} eligible orders</small></span><span>${money(g.sales)}<small>Sales</small></span><span>${money(g.gp)}<small>GP before commission</small></span><span><b>${money(g.commission)}</b><small>Draft commission</small></span></div>`).join('')||'<div class="v080empty">No commission-dated Orders fall in this quarter under the selected rule.</div>';
  const details=rows.length?`<div class="v080table"><div class="v080ctr head"><span>REP / ORDER</span><span>DATE</span><span>SALES</span><span>GP BEFORE COMM.</span><span>MARGIN</span><span>BASE</span><span>RATE</span><span>COMMISSION</span><span>STATUS</span></div>${rows.sort((a,b)=>a.rep.localeCompare(b.rep)||a.date.localeCompare(b.date)).map(x=>`<div class="v080ctr"><span><b>${esc(x.rep)}</b><small>#${esc(x.j.jobNumber||'—')} · ${esc(x.j.customerName||'')}</small></span><span>${esc(x.date)}</span><span>${money(x.revenue)}</span><span>${money(x.gpBefore)}</span><span>${x.margin.toFixed(1)}%</span><span>${money(x.base)}</span><span>${x.rate.toFixed(1)}%</span><span><b>${money(x.commission)}</b></span><span><i class="v080pill ${x.eligible?'green':'gold'}">${esc(x.eligible?'ELIGIBLE':x.why)}</i></span></div>`).join('')}</div>`:'';
  const missing=all.filter(x=>!x.date).length;
  return `<div class="v080quarter"><label>Year<input id="v080year" type="number" min="2020" max="2100" value="${year}"></label><label>Quarter<select id="v080quarter">${[1,2,3,4].map(i=>`<option value="${i}"${i===q?' selected':''}>Q${i}</option>`).join('')}</select></label><button class="action" data-v080="quarter-refresh">Refresh Quarter</button><button class="action" data-v080="commission-csv">Export CSV</button></div>${settingsForm(cfg)}<div class="v080summary">${metric(`Q${q} SALES`,money(totalSales),`${rows.length} dated orders`)}${metric('GROSS PROFIT BEFORE COMM.',money(totalGP),'Commission excluded from this base','green')}${metric('DRAFT COMMISSION',money(totalCommission),`${eligible.length} eligible orders`,'blue')}${metric('PROFIT AFTER DRAFT COMM.',money(r(totalGP-totalCommission)),'Management preview','green')}</div><div class="v080warn"><b>Draft only:</b> ${missing} Order${missing===1?'':'s'} currently lack the date required by the selected quarter-basis rule and are excluded. Confirm the real company commission policy before payroll use.</div><div class="v080repList">${groupHtml}</div>${details}`;
}
function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function exportCommissionCSV(){
  const cfg=settings(),cq=currentQuarter(),year=n(by('v080year')?.value)||cq.year,q=n(by('v080quarter')?.value)||cq.quarter,range=quarterRange(year,q),pdb=payDB(),sdb=sideDB();
  const rows=jobs().filter(j=>j&&j.status!=='Cancelled').map(j=>commissionRow(j,cfg,pdb,sdb)).filter(x=>x.date&&x.date>=range.start&&x.date<=range.end);
  const data=[['Sales Rep','Order','Customer','Date','Sales Revenue','Gross Profit Before Commission','Gross Margin %','Commission Base','Rate %','Commission','Eligible','Reason'],...rows.map(x=>[x.rep,x.j.jobNumber||'',x.j.customerName||'',x.date,x.revenue,x.gpBefore,x.margin.toFixed(2),x.base,x.rate,x.commission,x.eligible?'Yes':'No',x.why])];
  const blob=new Blob([data.map(row=>row.map(csvEscape).join(',')).join('\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`RUNLU_Commission_${year}_Q${q}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function saveCommissionForm(){
  const cfg=settings(),repRates={...cfg.repRates};document.querySelectorAll('[data-v080-rep]').forEach(el=>{const v=String(el.value||'').trim();if(v==='')delete repRates[el.dataset.v080Rep];else repRates[el.dataset.v080Rep]=Math.max(0,n(v))});
  saveSettings({basis:by('v080basis')?.value||'grossProfit',defaultRate:Math.max(0,n(by('v080rate')?.value||10)),eligibility:by('v080elig')?.value||'invoice',dateBasis:by('v080datebasis')?.value||'invoiceDate',minimumMargin:String(by('v080minmargin')?.value||'').trim(),repRates});render(true);
}
function ensureStyle(){if(by('v080style'))return;const s=document.createElement('style');s.id='v080style';s.textContent=`
#v080management{border:1px solid #dce4e0;border-left:5px solid #173d30;border-radius:12px;background:#fff;margin:0 0 14px;overflow:hidden}.v080head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:13px 14px;background:#f7faf8;border-bottom:1px solid #e1e8e4}.v080head h2{margin:0;color:#173d30;font-size:17px}.v080head p{margin:4px 0 0;color:#68766f;font-size:10px}.v080tabs{display:flex;gap:6px;flex-wrap:wrap}.v080tabs button{border:1px solid #d4ded9;background:#fff;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:900;color:#315d49}.v080tabs button.on{background:#173d30;color:#fff}.v080body{padding:12px}.v080summary{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}.v080metric{border:1px solid #dfe7e3;border-radius:9px;padding:9px;background:#fafcfb}.v080metric.green{border-left:4px solid #1f5a45}.v080metric.gold{border-left:4px solid #a97816}.v080metric.red{border-left:4px solid #8b3a32}.v080metric.blue{border-left:4px solid #315f82}.v080metric small{display:block;color:#6d7973;font-size:7.5px;font-weight:900}.v080metric b{display:block;color:#173d30;font-size:13px;margin-top:4px}.v080metric span{display:block;color:#6d7973;font-size:8px;margin-top:3px}.v080note,.v080warn{margin-top:10px;padding:9px 10px;border-left:4px solid #315f82;background:#edf4f8;border-radius:0 8px 8px 0;color:#496273;font-size:9.5px;line-height:1.45}.v080warn{border-left-color:#a97816;background:#fff7e2;color:#6a571d}.v080table{margin-top:10px;border:1px solid #dfe7e3;border-radius:9px;overflow:auto}.v080tr,.v080ctr{display:grid;grid-template-columns:minmax(150px,1.25fr) 90px 90px 100px 100px 110px minmax(120px,1fr);gap:7px;align-items:center;padding:8px 9px;border-top:1px solid #e8edeb;font-size:9px;min-width:820px}.v080ctr{grid-template-columns:minmax(150px,1.25fr) 86px 95px 110px 72px 100px 68px 100px minmax(100px,1fr);min-width:1000px}.v080tr.head,.v080ctr.head{border-top:0;background:#f7f9f8;color:#6b7871;font-size:8px;font-weight:900}.v080tr b,.v080ctr b{color:#173d30}.v080tr small,.v080ctr small,.v080rep small{display:block;color:#6d7973;margin-top:2px}.v080pill{display:inline-flex;border-radius:999px;padding:4px 6px;font-size:7.5px;font-weight:900;font-style:normal}.v080pill.green{background:#e9f3ee;color:#1f5a45}.v080pill.gold{background:#fff5d9;color:#79570f}.v080pill.red{background:#fff0ee;color:#8b3a32}.v080quarter{display:flex;gap:8px;align-items:end;flex-wrap:wrap;margin-bottom:10px}.v080quarter label{font-size:9px;font-weight:900;color:#53625a}.v080quarter input,.v080quarter select,.v080form input,.v080form select,.v080repRates input{display:block;margin-top:4px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff}.v080settings{border:1px solid #dfe7e3;border-radius:9px;padding:9px;margin-bottom:10px}.v080settings summary{cursor:pointer;font-size:10px;font-weight:900;color:#315d49}.v080settings h4{margin:10px 0 6px}.v080form,.v080repRates{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:9px}.v080form label,.v080repRates label{font-size:8.5px;font-weight:900;color:#53625a}.v080form input,.v080form select,.v080repRates input{width:100%}.v080actions{margin-top:9px}.v080repList{margin-top:10px;border:1px solid #dfe7e3;border-radius:9px;overflow:hidden}.v080rep{display:grid;grid-template-columns:minmax(150px,1.25fr) 1fr 1fr 1fr;gap:8px;align-items:center;padding:9px;border-top:1px solid #e8edeb;font-size:9px}.v080rep:first-child{border-top:0}.v080empty{padding:12px;color:#6b7871;font-size:10px}.v080muted{color:#6b7871;font-size:9px}@media(max-width:900px){.v080summary{grid-template-columns:repeat(3,1fr)}.v080form,.v080repRates{grid-template-columns:repeat(2,1fr)}}@media(max-width:580px){.v080head{display:block}.v080tabs{margin-top:8px}.v080summary{grid-template-columns:1fr 1fr}.v080rep{grid-template-columns:1fr 1fr}.v080form,.v080repRates{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}
function ensureRoot(){
  ensureStyle();const acc=by('accounting');if(!acc)return null;let root=by('v080management');if(root)return root;root=document.createElement('div');root.id='v080management';acc.insertBefore(root,acc.firstChild);root.addEventListener('click',ev=>{const b=ev.target.closest('[data-v080]');if(!b)return;const a=b.dataset.v080;if(a==='tab-ar'){tab='ar';render(true)}else if(a==='tab-commission'){tab='commission';render(true)}else if(a==='save-settings')saveCommissionForm();else if(a==='quarter-refresh')render(true);else if(a==='commission-csv')exportCommissionCSV()});root.addEventListener('change',ev=>{if(ev.target?.matches?.('#v080year,#v080quarter'))render(true)});return root;
}
function render(){const root=ensureRoot();if(!root)return false;root.innerHTML=`<div class="v080head"><div><h2>MANAGEMENT REVIEW</h2><p>Daily A/R first review · Quarterly configurable Commission draft · V0.3.80</p></div><div class="v080tabs"><button type="button" data-v080="tab-ar" class="${tab==='ar'?'on':''}">A/R Review</button><button type="button" data-v080="tab-commission" class="${tab==='commission'?'on':''}">Commission Report</button></div></div><div class="v080body">${tab==='ar'?arHtml():commissionHtml()}</div>`;return true}
function decorate(){try{document.title='RUNLU Deerfoot Flooring OS V0.3.80 Management Control';const p=document.querySelector('header .pill');if(p)p.textContent='V0.3.80 Management Control';const d=by('command')?.querySelector?.('.demo');if(d)d.textContent='V0.3.80 · A/R first review · configurable quarterly Commission · PO inventory holds.'}catch(_){}}
function install(){decorate();ensureRoot();render(true);let tries=0;const t=setInterval(()=>{decorate();if(!by('v080management'))render(true);if(++tries>60)clearInterval(t)},500);window.addEventListener('storage',e=>{if([JOBS,PAY,SIDE,SETTINGS].includes(e.key))render(true)});return true}
window.RUNLUManagementReviewV080={install,render,arRows:openReceivables,settings,version:'0.3.80'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
