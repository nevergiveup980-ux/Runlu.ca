/* RUNLU Deerfoot Flooring OS · V0.3.67.1 Accounting Control Language
   Visual/control layer over V0.3.67 Accounting Foundation.
   RUNLU financial language:
   - Green = Clear / Matched / Reconciled
   - Gold = Human Action / Review / Due
   - Red = Blocked / Overdue / Variance
   - Blue = Financial / Tax / Bank
   - Gray = Closed / Historical / Not Connected
   Normal stays quiet. Exceptions speak.
   No G/L posting, tax filing, bank reconciliation or month close is performed by this layer.
   V0.3.63 remains the stable rollback baseline. */
(function(){
'use strict';
if(window.__runluAccountingControlLanguageV0671)return;
window.__runluAccountingControlLanguageV0671=true;

const JOBS='runlu_deerfoot_flooring_jobs_v1';
const PO='runlu_deerfoot_supplier_orders_v1';
const PAY='runlu_flooring_payment_lifecycle_v045';
const SIDE='runlu_accounting_foundation_v067';
const VEND='runlu_vendor_invoices_v067';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const by=id=>document.getElementById(id);
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const n=v=>{const x=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(x)?x:0};
const r=x=>Math.round((n(x)+Number.EPSILON)*100)/100;
const money=x=>r(x).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const today=()=>new Date().toISOString().slice(0,10);
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});

function jobs(){const x=read(JOBS,[]);return Array.isArray(x)?x:[]}
function pos(){const x=read(PO,[]);return Array.isArray(x)?x:[]}
function vendors(){const x=read(VEND,[]);return Array.isArray(x)?x:[]}
function sideDB(){const x=read(SIDE,{});return x&&typeof x==='object'?x:{}}
function payDB(){const x=read(PAY,{});return x&&typeof x==='object'?x:{}}
function active(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function k(j){return j?.id||j?.jobNumber||'blank'}
function closed(j){return ['Closed','Completed','Cancelled','Archived'].includes(String(j?.status||''))}
function linkedPO(j,all=pos()){return all.filter(p=>p&&(p.jobId===j?.id||(j?.jobNumber&&String(p.jobNumber||'')===String(j.jobNumber))))}
function linkedBills(j,all=vendors()){return all.filter(v=>v&&(v.orderId===j?.id||(!v.orderId&&String(v.orderNumber||'')===String(j?.jobNumber||''))))}
function poSubtotal(p){return r((Array.isArray(p?.items)?p.items:[]).reduce((s,i)=>s+(n(i.lineTotal)||n(i.qty)*n(i.unitCost)),0))}
function calc(j){try{return typeof window.calc==='function'?window.calc(j):{subtotal:0,gst:0,total:0}}catch(_){return{subtotal:0,gst:0,total:0}}}
function paid(j,pdb=payDB()){
  const x=pdb[k(j)]||pdb[String(j?.jobNumber||'')]||{};
  return r((Array.isArray(x.payments)?x.payments:[]).reduce((s,p)=>s+n(p.amount),0));
}
function side(j,sdb=sideDB()){
  const x=sdb[k(j)]||sdb[String(j?.jobNumber||'')]||{};
  return {invoiceDate:x.invoiceDate||j?.invoiceDate||j?.date||'',terms:x.terms==null?30:n(x.terms),dueDate:x.dueDate||'',installer:n(x.installer),freight:n(x.freight),prep:n(x.prep),overhead:n(x.overhead),commission:n(x.commission),other:n(x.other),province:x.province||'AB',t5018:x.t5018||'Review',wcb:x.wcb||'Review'};
}
function plus(d,k){if(!iso(d))return'';const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+Number(k||0));return x.toISOString().slice(0,10)}
function dueFor(j,sdb=sideDB()){const s=side(j,sdb);return s.dueDate||plus(s.invoiceDate,s.terms)}
function ar(j,pdb=payDB(),sdb=sideDB()){
  const c=calc(j),p=paid(j,pdb),bal=Math.max(0,r(n(c.total)-p)),due=dueFor(j,sdb);
  let days=0;if(bal&&iso(due)){days=Math.floor((new Date(today()+'T12:00:00')-new Date(due+'T12:00:00'))/86400000)}
  return {paid:p,balance:bal,due,days,overdue:bal>0&&days>0};
}
function orderCost(j,allPO=pos(),allBills=vendors(),sdb=sideDB()){
  const ps=linkedPO(j,allPO).filter(p=>p.status!=='Cancelled');
  const bs=linkedBills(j,allBills).filter(v=>v.status!=='Void');
  const committed=r(ps.reduce((s,p)=>s+poSubtotal(p),0));
  const actual=r(bs.reduce((s,v)=>s+n(v.subtotal!=null?v.subtotal:v.sub),0));
  const sd=side(j,sdb),extras=r(sd.installer+sd.freight+sd.prep+sd.overhead+sd.commission+sd.other);
  const material=actual||committed,total=r(material+extras),c=calc(j),revenue=r(c.taxableSubtotal!=null?c.taxableSubtotal:c.subtotal),profit=r(revenue-total);
  return {committed,actual,material,extras,total,revenue,profit,margin:revenue?profit/revenue*100:0};
}
function billTotal(v){return r(n(v.subtotal!=null?v.subtotal:v.sub)+n(v.gst))}
function isOpenBill(v){return v&& !['Void','Paid','Completed'].includes(String(v.status||''))}
function poReceived(p){return p&&['Received','Completed'].includes(String(p.status||''))}

function matchForPO(p,allBills=vendors()){
  const bs=allBills.filter(v=>v.status!=='Void'&&String(v.po||'')===String(p.poNumber||''));
  const committed=poSubtotal(p),billed=r(bs.reduce((s,v)=>s+n(v.subtotal!=null?v.subtotal:v.sub),0));
  const variance=r(billed-committed),received=poReceived(p);
  if(!bs.length)return {state:'gold',label:'BILL NEEDED',committed,billed,variance,received,bills:bs};
  if(!received)return {state:'gold',label:'RECEIVING',committed,billed,variance,received,bills:bs};
  if(Math.abs(variance)>1)return {state:'red',label:'VARIANCE',committed,billed,variance,received,bills:bs};
  return {state:'green',label:'MATCHED',committed,billed,variance,received,bills:bs};
}

function portfolio(){
  const js=jobs().filter(j=>j&&!closed(j)),allPO=pos(),allBills=vendors(),pdb=payDB(),sdb=sideDB();
  let receivable=0,payable=0,gstCollected=0,itc=0,revenue=0,cost=0;
  const issues=[];
  js.forEach(j=>{
    const aa=ar(j,pdb,sdb),cc=calc(j),oc=orderCost(j,allPO,allBills,sdb),sd=side(j,sdb);
    receivable+=aa.balance;gstCollected+=n(cc.gst);revenue+=oc.revenue;cost+=oc.total;
    if(aa.overdue)issues.push({state:'red',type:'OVERDUE',order:j.jobNumber||'—',text:`${j.customerName||'Unnamed Customer'} · ${money(aa.balance)} · ${aa.days} day${aa.days===1?'':'s'} overdue`});
    if(oc.actual&&oc.committed&&Math.abs(oc.actual-oc.committed)>1)issues.push({state:'red',type:'JOB COST',order:j.jobNumber||'—',text:`Vendor material vs PO committed · ${money(oc.actual-oc.committed)} variance`});
    if(sd.installer>0&&sd.wcb==='Expired')issues.push({state:'red',type:'WCB',order:j.jobNumber||'—',text:'WCB clearance marked Expired · review before contractor payment'});
    else if(sd.installer>0&&sd.wcb==='Review')issues.push({state:'gold',type:'WCB',order:j.jobNumber||'—',text:'Contract labour recorded · WCB clearance still needs review'});
    if(sd.installer>0&&sd.t5018==='Review')issues.push({state:'gold',type:'T5018',order:j.jobNumber||'—',text:'Contract labour recorded · T5018 applicability still needs review'});
    if(sd.province!=='AB')issues.push({state:'gold',type:'TAX',order:j.jobNumber||'—',text:'Outside Alberta · GST/HST place-of-supply review required'});
  });
  allBills.filter(v=>v&&v.status!=='Void').forEach(v=>{
    if(isOpenBill(v))payable+=billTotal(v);
    if(v.itc)itc+=n(v.gst);else if(n(v.gst)>0)issues.push({state:'gold',type:'ITC',order:v.orderNumber||'—',text:`${v.supplier||'Vendor'} · Invoice ${v.invoice||'—'} · GST document review`});
    const p=allPO.find(p=>String(p.poNumber||'')===String(v.po||''));
    if(p&&!poReceived(p))issues.push({state:'gold',type:'3-WAY',order:v.orderNumber||p.jobNumber||'—',text:`Vendor bill ${v.invoice||'—'} exists before PO ${p.poNumber||'—'} is fully received`});
  });
  const profit=r(revenue-cost),margin=revenue?profit/revenue*100:0,netGST=r(gstCollected-itc);
  issues.sort((a,b)=>(a.state==='red'?0:1)-(b.state==='red'?0:1)||collator.compare(String(a.order),String(b.order)));
  return {js,allPO,allBills,receivable:r(receivable),payable:r(payable),gstCollected:r(gstCollected),itc:r(itc),netGST,revenue:r(revenue),cost:r(cost),profit,margin,issues};
}

function ensureStyle(){
  if(by('r671style'))return;
  const s=document.createElement('style');s.id='r671style';s.textContent=`
:root{--r671green:#1f5a45;--r671greenSoft:#e9f3ee;--r671gold:#a97816;--r671goldSoft:#fff5d9;--r671red:#8b3a32;--r671redSoft:#fff0ee;--r671blue:#315f82;--r671blueSoft:#edf4f8;--r671gray:#66716c;--r671graySoft:#eef1ef;--r671ink:#183d31}
#r671control{margin-bottom:14px;border:1px solid #d9e2de;border-radius:13px;background:#fff;overflow:hidden}.r671top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:14px 15px;background:#f8faf9;border-bottom:1px solid #e1e8e4}.r671top h2{margin:0;color:var(--r671ink);font-size:19px}.r671top p{margin:4px 0 0;color:#68756f;font-size:11px;line-height:1.45}.r671language{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}.r671dot{border-radius:999px;padding:4px 7px;font-size:9px;font-weight:900;white-space:nowrap}.r671dot.green{background:var(--r671greenSoft);color:var(--r671green)}.r671dot.gold{background:var(--r671goldSoft);color:#79570f}.r671dot.red{background:var(--r671redSoft);color:var(--r671red)}.r671dot.blue{background:var(--r671blueSoft);color:var(--r671blue)}.r671dot.gray{background:var(--r671graySoft);color:var(--r671gray)}
.r671cards{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:12px}.r671card{position:relative;min-height:98px;border:1px solid #dce4e0;border-radius:10px;padding:10px;background:#fff;overflow:hidden}.r671card:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--r671gray)}.r671card.green:before{background:var(--r671green)}.r671card.gold:before{background:var(--r671gold)}.r671card.red:before{background:var(--r671red)}.r671card.blue:before{background:var(--r671blue)}.r671card.gray:before{background:var(--r671gray)}.r671card small{display:block;color:#6f7a75;font-size:9px;font-weight:900;letter-spacing:.05em}.r671card b{display:block;margin-top:8px;color:#173d30;font-size:17px}.r671card span{display:block;margin-top:5px;color:#6a7771;font-size:9.5px;line-height:1.3}.r671card.red{background:#fffafa}.r671card.gold{background:#fffdf8}.r671card.blue{background:#fbfdff}
.r671section{padding:0 12px 12px}.r671sectionHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:2px 0 8px}.r671sectionHead h3{margin:0;color:#173d30;font-size:14px}.r671sectionHead span{font-size:10px;color:#718079}.r671attention{border:1px solid #dce4e0;border-radius:10px;overflow:hidden}.r671issue{display:grid;grid-template-columns:76px 92px 1fr;gap:8px;align-items:center;padding:9px 10px;border-bottom:1px solid #e8edeb;font-size:10.5px}.r671issue:last-child{border-bottom:0}.r671issue:before{content:'';width:7px;height:7px;border-radius:50%;background:var(--r671gold)}.r671issue.red:before{background:var(--r671red)}.r671issue.gold:before{background:var(--r671gold)}.r671issue b{color:#173d30}.r671issue span{color:#5f6e67}.r671quiet{padding:13px;background:var(--r671greenSoft);color:var(--r671green);font-size:11px;font-weight:800}.r671grid{display:grid;grid-template-columns:1.15fr .85fr;gap:10px}.r671box{border:1px solid #dce4e0;border-radius:10px;padding:10px;background:#fff}.r671box h3{margin:0 0 8px;color:#173d30;font-size:13px}.r671matches{display:grid;gap:7px}.r671match{display:grid;grid-template-columns:minmax(110px,1fr) 95px 95px 95px 88px;gap:7px;align-items:center;padding:8px;border-radius:8px;background:#f8faf9;font-size:10px}.r671match b{color:#173d30}.r671match .amt{text-align:right}.r671badge{display:inline-flex;justify-content:center;border-radius:999px;padding:4px 7px;font-size:8.5px;font-weight:900}.r671badge.green{background:var(--r671greenSoft);color:var(--r671green)}.r671badge.gold{background:var(--r671goldSoft);color:#79570f}.r671badge.red{background:var(--r671redSoft);color:var(--r671red)}.r671trail{display:flex;gap:3px;align-items:stretch;overflow:auto;padding-bottom:3px}.r671node{min-width:105px;flex:1;border:1px solid #dce4e0;border-radius:8px;padding:8px;background:#fff}.r671node b{display:block;font-size:9px;color:#173d30}.r671node span{display:block;margin-top:4px;font-size:9px;color:#69766f;line-height:1.3}.r671node.green{border-top:4px solid var(--r671green)}.r671node.gold{border-top:4px solid var(--r671gold)}.r671node.red{border-top:4px solid var(--r671red)}.r671node.blue{border-top:4px solid var(--r671blue)}.r671node.gray{border-top:4px solid var(--r671gray)}.r671arrow{align-self:center;color:#99a49f;font-size:12px}.r671review{display:grid;gap:6px}.r671reviewRow{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:7px 8px;border-radius:8px;background:#f8faf9;font-size:10px}.r671reviewRow b{color:#173d30}.r671note{margin-top:8px;padding:8px 9px;border-radius:8px;background:var(--r671blueSoft);color:#496476;font-size:10px;line-height:1.45}
#r67{border-left-color:var(--r671blue)!important}#r67 .r67tag{background:var(--r671blueSoft)!important;color:var(--r671blue)!important}#r67 .r67tabs button.on{background:var(--r671blue)!important;border-color:var(--r671blue)!important}#r67 .r67warn:not(.r67red){border-left-color:var(--r671gold)!important;background:var(--r671goldSoft)!important}#r67 .r67red{border-left-color:var(--r671red)!important;background:var(--r671redSoft)!important}
@media(max-width:1050px){.r671cards{grid-template-columns:repeat(3,1fr)}}@media(max-width:760px){.r671top{flex-direction:column}.r671language{justify-content:flex-start}.r671cards{grid-template-columns:1fr 1fr}.r671grid{grid-template-columns:1fr}.r671issue{grid-template-columns:62px 78px 1fr}.r671match{grid-template-columns:1fr 78px;}.r671match .amt{display:none}}@media(max-width:460px){.r671cards{grid-template-columns:1fr}.r671issue{grid-template-columns:1fr;gap:4px}.r671issue:before{display:none}}
`;
  document.head.appendChild(s);
}
function card(label,value,sub,state='blue'){return `<div class="r671card ${state}"><small>${esc(label)}</small><b>${esc(value)}</b><span>${esc(sub)}</span></div>`}
function badge(label,state){return `<span class="r671badge ${state}">${esc(label)}</span>`}
function node(label,value,state){return `<div class="r671node ${state}"><b>${esc(label)}</b><span>${esc(value)}</span></div>`}

function attentionHtml(p){
  if(!p.issues.length)return '<div class="r671quiet">✓ No current accounting exceptions found in the records available to Flooring OS.</div>';
  return `<div class="r671attention">${p.issues.slice(0,12).map(x=>`<div class="r671issue ${x.state}"><b>${esc(x.type)}</b><span>Order #${esc(x.order)}</span><span>${esc(x.text)}</span></div>`).join('')}${p.issues.length>12?`<div class="r671issue gold"><b>MORE</b><span>${p.issues.length-12}</span><span>Additional review items are not shown in this compact view.</span></div>`:''}</div>`;
}
function matchHtml(j,p){
  if(!j)return '<div class="r671quiet">Select an Order to see PO ↔ Receiving ↔ Vendor Bill matching.</div>';
  const ps=linkedPO(j,p.allPO).filter(x=>x.poNumber&&x.status!=='Cancelled');
  if(!ps.length)return '<div class="r671quiet" style="background:var(--r671goldSoft);color:#79570f">No issued supplier PO is linked to this Order yet.</div>';
  return `<div class="r671matches">${ps.map(po=>{const q=matchForPO(po,p.allBills);return `<div class="r671match"><b>PO ${esc(po.poNumber)} · ${esc(po.supplier||'Supplier')}</b><span class="amt">PO ${esc(money(q.committed))}</span><span class="amt">Bill ${esc(money(q.billed))}</span><span class="amt">Δ ${esc(money(q.variance))}</span>${badge(q.label,q.state)}</div>`}).join('')}</div>`;
}
function trailHtml(j,p){
  if(!j)return '<div class="r671quiet">Select an Order to see its Financial Trail.</div>';
  const ps=linkedPO(j,p.allPO).filter(x=>x.status!=='Cancelled'),bs=linkedBills(j,p.allBills).filter(x=>x.status!=='Void'),aa=ar(j),cc=calc(j);
  const poState=ps.length?'green':'gold',recCount=ps.filter(poReceived).length,recState=ps.length&&recCount===ps.length?'green':(ps.length?'gold':'gray'),billState=bs.length?'blue':'gold',invState=n(cc.total)>0?'blue':'gold',payState=aa.balance<=0&&n(cc.total)>0?'green':(aa.paid>0?'gold':'gray');
  return `<div class="r671trail">${node('ORDER',`#${j.jobNumber||'—'} · ${j.customerName||'Unnamed Customer'}`,'blue')}<span class="r671arrow">→</span>${node('PO',ps.length?`${ps.length} linked`:'Not issued',poState)}<span class="r671arrow">→</span>${node('RECEIVING',ps.length?`${recCount}/${ps.length} received`:'No PO',recState)}<span class="r671arrow">→</span>${node('VENDOR BILL / A/P',bs.length?`${bs.length} bill${bs.length===1?'':'s'} · ${money(bs.reduce((s,v)=>s+billTotal(v),0))}`:'Bill needed',billState)}<span class="r671arrow">→</span>${node('INVOICE / A/R',n(cc.total)>0?`${money(cc.total)} · balance ${money(aa.balance)}`:'Invoice not ready',invState)}<span class="r671arrow">→</span>${node('PAYMENT',aa.paid?money(aa.paid):'No payment',payState)}<span class="r671arrow">→</span>${node('BANK','Not connected','gray')}</div>`;
}
function reviewBoard(p){
  const overdue=p.issues.filter(x=>x.type==='OVERDUE').length,match=p.issues.filter(x=>x.type==='JOB COST'||x.type==='3-WAY').length,docs=p.issues.filter(x=>x.type==='ITC'||x.type==='TAX').length,worker=p.issues.filter(x=>x.type==='WCB'||x.type==='T5018').length;
  const row=(a,b,state)=>`<div class="r671reviewRow"><b>${esc(a)}</b>${badge(b,state)}</div>`;
  return `<div class="r671review">${row('A/R exceptions',overdue?`${overdue} REVIEW`:'CLEAR',overdue?'red':'green')}${row('PO / Receiving / Bill match',match?`${match} REVIEW`:'CLEAR',match?'red':'green')}${row('GST / ITC documentation',docs?`${docs} REVIEW`:'CLEAR',docs?'gold':'green')}${row('Installer compliance',worker?`${worker} REVIEW`:'CLEAR',worker?'gold':'green')}${row('Bank reconciliation','NOT CONNECTED','gray')}${row('General Ledger','NOT CONNECTED','gray')}</div><div class="r671note"><b>Month Close:</b> not enabled yet. RUNLU will not show a false “Closed” state until Bank + G/L reconciliation are connected. This board is an operational review layer only.</div>`;
}
function render(){
  ensureStyle();const page=by('accounting');if(!page)return;let root=by('r671control');if(!root){root=document.createElement('div');root.id='r671control';const r67=by('r67');r67?r67.insertAdjacentElement('beforebegin',root):page.prepend(root)}
  const p=portfolio(),j=active(),red=p.issues.filter(x=>x.state==='red').length,gold=p.issues.filter(x=>x.state==='gold').length;
  const arState=p.issues.some(x=>x.type==='OVERDUE')?'red':(p.receivable?'gold':'green');
  const apState=p.issues.some(x=>x.type==='JOB COST'||x.type==='3-WAY')?'red':(p.payable?'gold':'green');
  const taxState=p.issues.some(x=>x.type==='ITC'||x.type==='TAX')?'gold':'blue';
  const marginState=p.margin>=30?'green':(p.margin>=20?'gold':(p.revenue?'red':'gray'));
  root.innerHTML=`<div class="r671top"><div><h2>ACCOUNTING CONTROL</h2><p>RFMS-informed flooring controls · RUNLU visual language · Normal stays quiet. Exceptions speak.</p></div><div class="r671language"><span class="r671dot green">GREEN · CLEAR</span><span class="r671dot gold">GOLD · ACTION</span><span class="r671dot red">RED · EXCEPTION</span><span class="r671dot blue">BLUE · FINANCIAL</span><span class="r671dot gray">GRAY · CLOSED / OFFLINE</span></div></div><div class="r671cards">${card('RECEIVABLE · Customers owe us',money(p.receivable),p.issues.filter(x=>x.type==='OVERDUE').length+' overdue exception(s)',arState)}${card('PAYABLE · We owe suppliers',money(p.payable),'Open vendor bills currently recorded',apState)}${card('GST · Estimate',money(p.netGST),`Collected ${money(p.gstCollected)} · ITC ${money(p.itc)}`,taxState)}${card('JOB PROFIT · Gross margin',p.revenue?p.margin.toFixed(1)+'%':'—',`${money(p.profit)} gross profit on recorded jobs`,marginState)}${card('ATTENTION · Human review',String(p.issues.length),`${red} blocked / exception · ${gold} action`,red?'red':(gold?'gold':'green'))}${card('BANK · Reconciliation','Not connected','No cash balance is invented by RUNLU','gray')}</div><div class="r671section"><div class="r671sectionHead"><h3>ATTENTION</h3><span>Only exceptions and human-review items surface here.</span></div>${attentionHtml(p)}</div><div class="r671section r671grid"><div class="r671box"><h3>MATCH · PO ↔ Receiving ↔ Vendor Bill</h3>${matchHtml(j,p)}</div><div class="r671box"><h3>MONTH REVIEW BOARD</h3>${reviewBoard(p)}</div></div><div class="r671section"><div class="r671box"><h3>FINANCIAL TRAIL · Active Order</h3>${trailHtml(j,p)}</div></div>`;
}

let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(render,80)}
function install(){ensureStyle();render();
  document.addEventListener('click',ev=>{if(ev.target?.closest?.('#accounting button,#accounting .action'))schedule()},true);
  document.addEventListener('change',ev=>{if(ev.target?.closest?.('#accounting'))schedule()},true);
  window.addEventListener('storage',ev=>{if([JOBS,PO,PAY,SIDE,VEND,ACTIVE].includes(ev.key))schedule()});
  setTimeout(render,600);
}
window.RUNLUAccountingControlLanguageV0671={install,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();