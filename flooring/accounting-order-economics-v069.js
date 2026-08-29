/* RUNLU Deerfoot Flooring OS · V0.3.69 Order Economics Refinement
   Low-risk display/control layer over V0.3.67/67.1 accounting.
   - Aligns visible accounting terminology with Order (not Job).
   - Adds Committed -> Actual -> Forecast cost maturity.
   - Forecast keeps unbilled PO commitments in cost until a received PO has vendor-bill actuals.
   - Does not change business records, vendor bills, POs, payments, tax logic, or storage schema.
   - No MutationObserver; V0.3.63 remains the stable renderer rollback baseline. */
(function(){
'use strict';
if(window.__runluAccountingOrderEconomicsV069)return;
window.__runluAccountingOrderEconomicsV069=true;

const JOBS='runlu_deerfoot_flooring_jobs_v1';
const PO='runlu_deerfoot_supplier_orders_v1';
const SIDE='runlu_accounting_foundation_v067';
const VEND='runlu_vendor_invoices_v067';
const by=id=>document.getElementById(id);
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const n=v=>{const x=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(x)?x:0};
const r=x=>Math.round((n(x)+Number.EPSILON)*100)/100;
const money=x=>r(x).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function jobs(){const x=read(JOBS,[]);return Array.isArray(x)?x:[]}
function pos(){const x=read(PO,[]);return Array.isArray(x)?x:[]}
function vendors(){const x=read(VEND,[]);return Array.isArray(x)?x:[]}
function sideDB(){const x=read(SIDE,{});return x&&typeof x==='object'?x:{}}
function active(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function key(j){return j?.id||j?.jobNumber||'blank'}
function closed(j){return ['Closed','Completed','Cancelled','Archived'].includes(String(j?.status||''))}
function linkedPO(j,all=pos()){return all.filter(p=>p&&(p.jobId===j?.id||(j?.jobNumber&&String(p.jobNumber||'')===String(j.jobNumber))))}
function linkedBills(j,all=vendors()){return all.filter(v=>v&&v.status!=='Void'&&(v.orderId===j?.id||(!v.orderId&&String(v.orderNumber||'')===String(j?.jobNumber||''))))}
function poSubtotal(p){return r((Array.isArray(p?.items)?p.items:[]).reduce((s,i)=>s+(n(i.lineTotal)||n(i.qty)*n(i.unitCost)),0))}
function poReceived(p){return p&&['Received','Completed'].includes(String(p.status||''))}
function calc(j){try{return typeof window.calc==='function'?window.calc(j):{subtotal:0,gst:0,total:0}}catch(_){return{subtotal:0,gst:0,total:0}}}
function side(j,sdb=sideDB()){const x=sdb[key(j)]||sdb[String(j?.jobNumber||'')]||{};return {installer:n(x.installer),freight:n(x.freight),prep:n(x.prep),overhead:n(x.overhead),commission:n(x.commission),other:n(x.other)}}
function extras(j,sdb=sideDB()){const s=side(j,sdb);return r(s.installer+s.freight+s.prep+s.overhead+s.commission+s.other)}

function economics(j,allPO=pos(),allBills=vendors(),sdb=sideDB()){
  if(!j)return null;
  const ps=linkedPO(j,allPO).filter(p=>p.status!=='Cancelled');
  const bs=linkedBills(j,allBills);
  const extra=extras(j,sdb);
  let committed=0,billed=0,forecastMaterial=0,variance=0,variancePairs=0,billNeeded=0,receivingReview=0;
  const rows=ps.map(p=>{
    const pc=poSubtotal(p);committed+=pc;
    const pbs=bs.filter(v=>String(v.po||'')===String(p.poNumber||''));
    const pb=r(pbs.reduce((s,v)=>s+n(v.subtotal!=null?v.subtotal:v.sub),0));billed+=pb;
    const received=poReceived(p),hasBill=pbs.length>0;
    let forecast=pc,state='committed',label='COMMITTED';
    if(received&&hasBill){forecast=pb;state=Math.abs(pb-pc)>1?'variance':'actual';label=state==='variance'?'VARIANCE':'ACTUAL'}
    else if(hasBill&&!received){forecast=pc;state='review';label='RECEIVING'}
    else if(!hasBill){billNeeded++}
    if(hasBill&&!received)receivingReview++;
    if(received&&hasBill){variance+=pb-pc;variancePairs++}
    forecastMaterial+=forecast;
    return {po:p.poNumber||'—',supplier:p.supplier||'',committed:pc,billed:pb,forecast:r(forecast),state,label,received};
  });
  const orphan=bs.filter(v=>!ps.some(p=>String(p.poNumber||'')===String(v.po||'')));
  const orphanBilled=r(orphan.reduce((s,v)=>s+n(v.subtotal!=null?v.subtotal:v.sub),0));
  billed=r(billed+orphanBilled);forecastMaterial=r(forecastMaterial+orphanBilled);
  const c=calc(j),revenue=r(c.taxableSubtotal!=null?c.taxableSubtotal:c.subtotal);
  const forecastCost=r(forecastMaterial+extra),recordedCost=r(billed+extra),profit=r(revenue-forecastCost),margin=revenue?profit/revenue*100:0;
  return {ps,bs,rows,committed:r(committed),billed,extra,recordedCost,forecastMaterial,forecastCost,revenue,profit,margin,variance:r(variance),variancePairs,billNeeded,receivingReview,orphanCount:orphan.length};
}

function portfolio(){
  const js=jobs().filter(j=>j&&!closed(j)),allPO=pos(),allBills=vendors(),sdb=sideDB();
  let revenue=0,cost=0;
  js.forEach(j=>{const e=economics(j,allPO,allBills,sdb);if(e){revenue+=e.revenue;cost+=e.forecastCost}});
  const profit=r(revenue-cost),margin=revenue?profit/revenue*100:0;
  return {revenue:r(revenue),cost:r(cost),profit,margin};
}

function ensureStyle(){if(by('r69style'))return;const s=document.createElement('style');s.id='r69style';s.textContent=`
#r69economics{border:1px solid #d9e2de;border-left:5px solid #315f82;border-radius:12px;background:#fff;margin:0 0 14px;overflow:hidden}.r69head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:13px 14px;background:#f8faf9;border-bottom:1px solid #e2e9e5}.r69head h3{margin:0;color:#173d30;font-size:15px}.r69head p{margin:4px 0 0;color:#6a7771;font-size:10px;line-height:1.4}.r69tag{border-radius:999px;padding:5px 8px;background:#edf4f8;color:#315f82;font-size:9px;font-weight:900;white-space:nowrap}.r69steps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:11px 12px}.r69step{border:1px solid #dce4e0;border-radius:9px;padding:9px;background:#fff;min-height:78px}.r69step small{display:block;color:#6d7973;font-size:9px;font-weight:900;letter-spacing:.04em}.r69step b{display:block;color:#173d30;font-size:15px;margin-top:6px}.r69step span{display:block;color:#6d7973;font-size:9px;line-height:1.35;margin-top:4px}.r69step.gray{background:#f6f8f7}.r69step.green{border-left:4px solid #1f5a45}.r69step.gold{border-left:4px solid #a97816}.r69step.blue{border-left:4px solid #315f82}.r69step.red{border-left:4px solid #8b3a32}.r69summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 12px 11px}.r69metric{padding:9px;border-radius:9px;background:#f8faf9;border:1px solid #e1e8e4}.r69metric small{display:block;color:#6d7973;font-size:9px}.r69metric b{display:block;color:#173d30;margin-top:4px;font-size:13px}.r69note{margin:0 12px 12px;padding:9px 10px;border-left:4px solid #315f82;background:#edf4f8;border-radius:0 8px 8px 0;color:#496273;font-size:10px;line-height:1.45}.r69warn{border-left-color:#a97816;background:#fff7e2;color:#6a571d}.r69red{border-left-color:#8b3a32;background:#fff0ee;color:#74342e}.r69po{margin:0 12px 12px;border:1px solid #e0e7e4;border-radius:9px;overflow:hidden}.r69porow{display:grid;grid-template-columns:minmax(120px,1fr) 100px 100px 100px 82px;gap:7px;align-items:center;padding:7px 9px;border-bottom:1px solid #e9eeec;font-size:9.5px}.r69porow:last-child{border-bottom:0}.r69porow b{color:#173d30}.r69num{text-align:right}.r69badge{display:inline-flex;justify-content:center;border-radius:999px;padding:4px 6px;font-size:8px;font-weight:900}.r69badge.actual{background:#e9f3ee;color:#1f5a45}.r69badge.committed,.r69badge.review{background:#fff5d9;color:#79570f}.r69badge.variance{background:#fff0ee;color:#8b3a32}@media(max-width:820px){.r69steps,.r69summary{grid-template-columns:1fr 1fr}.r69porow{grid-template-columns:1fr 80px 80px 78px}.r69porow .forecastCol{display:none}}@media(max-width:520px){.r69steps,.r69summary{grid-template-columns:1fr}.r69porow{grid-template-columns:1fr 72px}.r69porow .hideMobile{display:none}}
`;document.head.appendChild(s)}

const replacements=[
  ['JOB PROFIT','ORDER PROFIT'],['Job Profit','Order Profit'],['job profit','order profit'],
  ['JOB COST','ORDER COST'],['Flooring Job Cost','Flooring Order Cost'],['Job Costing','Order Costing'],
  ['Save Job Costs','Save Order Costs'],['Job Cost','Order Cost'],['job cost','order cost'],
  ['recorded jobs','recorded orders'],['job-margin','order-margin'],['job margin','order margin']
];
function polishTerms(){
  const root=by('accounting');if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;if(!p||['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT','OPTION'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{let t=node.nodeValue;replacements.forEach(([a,b])=>{t=t.split(a).join(b)});if(t!==node.nodeValue)node.nodeValue=t});
}

function patchTopProfit(){
  const p=portfolio();
  document.querySelectorAll('#r671control .r671card').forEach(card=>{
    const label=card.querySelector('small');if(!label||!/ORDER PROFIT|JOB PROFIT/i.test(label.textContent||''))return;
    label.textContent='ORDER PROFIT · Forecast margin';
    const val=card.querySelector('b'),sub=card.querySelector('span');
    if(val)val.textContent=p.revenue?p.margin.toFixed(1)+'%':'—';
    if(sub)sub.textContent=`${money(p.profit)} forecast gross profit on active orders`;
    card.classList.remove('green','gold','red','gray');card.classList.add(!p.revenue?'gray':p.margin>=30?'green':p.margin>=20?'gold':'red');
  });
}

function rowsHtml(e){
  if(!e.rows.length)return '<div class="r69note r69warn">No linked PO is recorded for this Order yet. Forecast cost currently consists only of other recorded cost buckets.</div>';
  return `<div class="r69po">${e.rows.map(x=>`<div class="r69porow"><div><b>PO ${esc(x.po)}</b><br><span style="color:#6d7973">${esc(x.supplier||'Supplier')}</span></div><span class="r69num hideMobile">${money(x.committed)}</span><span class="r69num">${x.billed?money(x.billed):'—'}</span><span class="r69num forecastCol">${money(x.forecast)}</span><span class="r69badge ${x.state}">${x.label}</span></div>`).join('')}</div>`;
}

function render(){
  ensureStyle();polishTerms();patchTopProfit();
  const accounting=by('accounting');if(!accounting)return;
  let root=by('r69economics');
  if(!root){root=document.createElement('div');root.id='r69economics';const anchor=by('r671control')||by('r67');if(anchor)anchor.insertAdjacentElement('afterend',root);else accounting.insertBefore(root,accounting.firstChild)}
  const j=active();if(!j){root.innerHTML='<div class="r69head"><div><h3>ORDER ECONOMICS</h3><p>Select an Order to see committed, actual and forecast cost maturity.</p></div><span class="r69tag">V0.3.69</span></div>';return}
  const e=economics(j),marginState=!e.revenue?'gray':e.margin>=30?'green':e.margin>=20?'gold':'red';
  const varianceState=Math.abs(e.variance)>1?'red':(e.variancePairs?'green':'gray');
  const notes=[];
  if(e.billNeeded)notes.push(`${e.billNeeded} PO${e.billNeeded===1?'':'s'} still use committed cost because no vendor bill is recorded.`);
  if(e.receivingReview)notes.push(`${e.receivingReview} PO${e.receivingReview===1?'':'s'} have a vendor bill before Receiving is complete; forecast keeps the PO commitment until Receiving is complete.`);
  if(e.orphanCount)notes.push(`${e.orphanCount} vendor bill${e.orphanCount===1?'':'s'} are linked to the Order but not to a current PO; their subtotal is included in forecast and should be reviewed.`);
  root.innerHTML=`<div class="r69head"><div><h3>ORDER ECONOMICS · ${esc(j.jobNumber||'Active Order')}</h3><p>Cost maturity · commitments stay visible until real vendor cost is ready to replace them.</p></div><span class="r69tag">COMMITTED → ACTUAL → FORECAST</span></div>
  <div class="r69steps">
    <div class="r69step gray"><small>ESTIMATE · COST BASELINE</small><b>Not captured</b><span>No estimate is invented. A formal original-cost baseline can be added later through Change Control.</span></div>
    <div class="r69step gold"><small>COMMITTED · PURCHASE ORDERS</small><b>${money(e.committed)}</b><span>Supplier material currently committed through linked POs.</span></div>
    <div class="r69step blue"><small>ACTUAL TO DATE · VENDOR BILLS</small><b>${money(e.billed)}</b><span>Vendor material subtotal recorded so far. Other recorded costs: ${money(e.extra)}.</span></div>
    <div class="r69step ${marginState}"><small>FORECAST · CURRENT ORDER COST</small><b>${money(e.forecastCost)}</b><span>${e.revenue?e.margin.toFixed(1)+'% forecast gross margin':'Revenue not available'}.</span></div>
  </div>
  <div class="r69summary"><div class="r69metric"><small>Revenue before GST</small><b>${money(e.revenue)}</b></div><div class="r69metric"><small>Recorded cost to date</small><b>${money(e.recordedCost)}</b></div><div class="r69metric"><small>Forecast gross profit</small><b>${money(e.profit)}</b></div><div class="r69metric"><small>Received PO bill variance</small><b>${e.variancePairs?money(e.variance):'—'}</b></div></div>
  ${rowsHtml(e)}
  <div class="r69note ${Math.abs(e.variance)>1?'r69red':notes.length?'r69warn':''}"><b>Forecast rule:</b> an unbilled PO stays at committed cost. Once that PO is Received / Completed and has vendor-bill actuals, the bill subtotal replaces the commitment. ${notes.join(' ')||'No forecast exception is currently detected.'}</div>`;
  polishTerms();patchTopProfit();
}

let timer=0;function schedule(delay=70){clearTimeout(timer);timer=setTimeout(render,delay)}
function install(){ensureStyle();render();document.addEventListener('click',ev=>{if(ev.target?.closest?.('#accounting'))schedule(90)},false);document.addEventListener('change',ev=>{if(ev.target?.closest?.('#accounting'))schedule(90)},false);window.addEventListener('storage',e=>{if([JOBS,PO,SIDE,VEND].includes(e.key))schedule(30)});setTimeout(render,520)}
window.RUNLUAccountingOrderEconomicsV069={install,render,economics,portfolio};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();