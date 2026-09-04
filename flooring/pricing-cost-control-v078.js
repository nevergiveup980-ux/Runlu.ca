/* RUNLU Deerfoot Flooring OS · V0.3.78 Price History & Cost Control
   Adds a non-destructive price revision log and a unified active-order cost maturity view.
   Existing V0.3.70 pricing catalog, V0.3.71 sales pricing snapshots and V0.3.69 accounting
   remain the authorities; this layer does not rewrite Orders, POs, vendor bills or inventory.
*/
(function(){
'use strict';
if(window.__runluPricingCostControlV078)return;
window.__runluPricingCostControlV078=true;

const CAT='runlu_pricing_catalog_v070';
const HIST='runlu_pricing_history_v078';
const MAX_HISTORY=500;
const PRICE_FIELDS=['supplier','purchaseUnit','sellUnit','conversionFactor','standardCost','currentCost','retailPrice','builderPrice','promoPrice','minimumPrice','effectiveFrom','effectiveTo','branch','priceSource','active'];
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>v==null||v===''||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const clone=v=>JSON.parse(JSON.stringify(v));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const catalog=()=>{const v=read(CAT,[]);return Array.isArray(v)?v:[]};
const history=()=>{const v=read(HIST,[]);return Array.isArray(v)?v:[]};
const norm=v=>String(v??'').trim();
let pendingBefore=null,pendingAt=0,showHistory=false,lastPanelKey='';

function fieldEqual(a,b){
  if(a==null&&b==null)return true;
  if(typeof a==='number'||typeof b==='number')return Number(a)==Number(b);
  return norm(a)===norm(b);
}
function priceState(p){const out={};PRICE_FIELDS.forEach(k=>out[k]=p?.[k]??null);return out}
function recordDiff(before,after){
  const b=new Map((before||[]).map(p=>[String(p.id),p]));
  const a=new Map((after||[]).map(p=>[String(p.id),p]));
  const ids=new Set([...b.keys(),...a.keys()]);
  const added=[];
  ids.forEach(id=>{
    const old=b.get(id)||null,next=a.get(id)||null;if(!next)return;
    const changes=old?PRICE_FIELDS.filter(k=>!fieldEqual(old[k],next[k])):PRICE_FIELDS.filter(k=>next[k]!=null&&norm(next[k])!=='');
    if(!old||changes.length){
      added.push({
        id:'rev-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),at:new Date().toISOString(),type:old?'updated':'created',
        productId:next.id||id,sku:next.sku||'',style:next.style||'',colour:next.colour||'',supplier:next.supplier||'',
        changes,before:old?priceState(old):null,after:priceState(next),priceSource:next.priceSource||''
      });
    }
  });
  if(!added.length)return 0;
  const log=[...added.reverse(),...history()].slice(0,MAX_HISTORY);
  try{localStorage.setItem(HIST,JSON.stringify(log))}catch(_){return 0}
  return added.length;
}
function startSaveCapture(){pendingBefore=clone(catalog());pendingAt=Date.now()}
function finishSaveCapture(){
  if(!pendingBefore||Date.now()-pendingAt>5000){pendingBefore=null;return}
  const before=pendingBefore;pendingBefore=null;
  recordDiff(before,catalog());render(true);
}

function activeOrder(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function economics(){
  const j=activeOrder(),api=window.RUNLUAccountingOrderEconomicsV069;
  if(!j||!api||typeof api.economics!=='function')return {order:j,e:null,estimate:null};
  let e=null,estimate=null;
  try{e=api.economics(j)}catch(_){}
  try{estimate=window.RUNLUPricingV070?.estimateOrder?.(j)||null}catch(_){}
  return {order:j,e,estimate};
}
function marginClass(m,revenue){if(!revenue)return'gray';return m>=30?'green':m>=20?'gold':'red'}
function revisionLabel(r){return [r.sku,r.style,r.colour].filter(Boolean).join(' · ')||r.productId||'Pricing record'}
function changeText(r){
  const c=(r.changes||[]).map(k=>({standardCost:'Standard Cost',currentCost:'Current Cost',retailPrice:'Retail',builderPrice:'Contract',promoPrice:'Promo',minimumPrice:'Floor',purchaseUnit:'Purchase Unit',sellUnit:'Sell Unit',conversionFactor:'Conversion',effectiveFrom:'Effective From',effectiveTo:'Effective To',priceSource:'Price Source',supplier:'Supplier',branch:'Branch',active:'Active'}[k]||k));
  return c.join(', ')||'Initial pricing record';
}
function historyHtml(){
  const rows=history().slice(0,12);
  if(!rows.length)return '<div class="r78empty">Revision logging is ready. No Product & Cost pricing change has been saved since V0.3.78 was enabled.</div>';
  return `<div class="r78history">${rows.map(r=>`<div class="r78rev"><div><b>${esc(revisionLabel(r))}</b><small>${esc(new Date(r.at).toLocaleString())} · ${esc(changeText(r))}${r.priceSource?' · Source '+esc(r.priceSource):''}</small></div><span class="r78pill blue">${esc(String(r.type||'updated').toUpperCase())}</span></div>`).join('')}</div>`;
}
function metric(label,value,sub,cls=''){return `<div class="r78metric ${cls}"><small>${esc(label)}</small><b>${esc(value)}</b><span>${esc(sub||'')}</span></div>`}
function costHtml(){
  const {order,e,estimate}=economics();
  if(!order)return '<div class="r78empty">Select an Order to see Estimate → PO Committed → Vendor Bill Actual → Forecast cost maturity here.</div>';
  if(!e)return '<div class="r78empty">Order Economics is not ready yet. Existing Accounting data remains unchanged.</div>';
  const est=estimate?.complete?money(estimate.total):'Not complete';
  const m=Number(e.margin||0),mc=marginClass(m,e.revenue);
  return `<div class="r78orderHead"><div><b>${esc(order.jobNumber||order.orderNumber||'Active Order')}</b><small>Read-only summary from existing Pricing + Accounting records</small></div><span class="r78pill ${mc}">${e.revenue?m.toFixed(1)+'% FORECAST MARGIN':'MARGIN WAITING'}</span></div><div class="r78metrics">${metric('ESTIMATE · PRICE SNAPSHOT',est,estimate?.complete?`${estimate.lines} / ${estimate.lines} lines captured`:`${estimate?.covered||0} / ${estimate?.lines||0} lines captured`)}${metric('COMMITTED · PURCHASE ORDERS',money(e.committed),`${e.ps?.length||0} linked PO(s)`,'gold')}${metric('ACTUAL TO DATE · VENDOR BILLS',money(e.billed),'Recorded material subtotal','blue')}${metric('FORECAST · CURRENT ORDER COST',money(e.forecastCost),'Committed cost remains until actual cost is ready',mc)}${metric('FORECAST GROSS PROFIT',money(e.profit),e.revenue?m.toFixed(1)+'% gross margin':'Revenue not available',mc)}</div>`;
}

function ensureStyle(){
  if(by('r78style'))return;
  const s=document.createElement('style');s.id='r78style';s.textContent=`
#r78control{margin-top:12px}.r78card{border:1px solid #dce4e0;border-left:5px solid #315f82;border-radius:11px;background:#fff;padding:12px;margin-top:12px}.r78card.green{border-left-color:#1f5a45}.r78head,.r78orderHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r78head h3{margin:0;color:#173d30;font-size:15px}.r78muted,.r78orderHead small,.r78rev small{display:block;color:#697770;font-size:9.5px;line-height:1.45;margin-top:3px}.r78pills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.r78pill{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:900;white-space:nowrap}.r78pill.green{background:#e9f3ee;color:#1f5a45}.r78pill.gold{background:#fff5d9;color:#79570f}.r78pill.red{background:#fff0ee;color:#8b3a32}.r78pill.blue{background:#edf4f8;color:#315f82}.r78pill.gray{background:#eef1ef;color:#66716c}.r78metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:10px}.r78metric{border:1px solid #e0e7e3;border-radius:9px;padding:9px;background:#fafcfb}.r78metric.gold{border-left:4px solid #a97816}.r78metric.blue{border-left:4px solid #315f82}.r78metric.green{border-left:4px solid #1f5a45}.r78metric.red{border-left:4px solid #8b3a32}.r78metric small{display:block;color:#6b7871;font-size:7.5px;font-weight:900}.r78metric b{display:block;margin-top:4px;color:#173d30;font-size:12px}.r78metric span{display:block;margin-top:3px;color:#6b7871;font-size:8px;line-height:1.3}.r78actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.r78history{margin-top:10px;border:1px solid #e0e7e3;border-radius:9px;overflow:hidden}.r78rev{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 9px;border-top:1px solid #e8edeb;font-size:9.5px}.r78rev:first-child{border-top:0}.r78rev b{color:#173d30}.r78empty{margin-top:10px;padding:10px;border-left:4px solid #a97816;background:#fff7e2;color:#6a571d;font-size:9.5px;line-height:1.45}.r78note{margin-top:10px;padding:9px 10px;border-left:4px solid #315f82;background:#edf4f8;color:#496273;border-radius:0 8px 8px 0;font-size:9.5px;line-height:1.45}@media(max-width:900px){.r78metrics{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:580px){.r78head,.r78orderHead{display:block}.r78pills{justify-content:flex-start;margin-top:7px}.r78metrics{grid-template-columns:1fr 1fr}.r78rev{align-items:flex-start}.r78metric:last-child{grid-column:1/-1}}
`;
  document.head.appendChild(s);
}
function panelKey(){
  const {order,e,estimate}=economics(),h=history();
  return JSON.stringify([order?.id||order?.jobNumber||'',e?.committed,e?.billed,e?.forecastCost,e?.profit,e?.margin,estimate?.covered,estimate?.lines,h[0]?.id,h.length,showHistory]);
}
function render(force=false){
  ensureStyle();const page=by('pricing');if(!page)return false;
  let root=by('r78control');if(!root){root=document.createElement('div');root.id='r78control';page.appendChild(root)}
  const key=panelKey();if(!force&&key===lastPanelKey&&root.innerHTML)return true;lastPanelKey=key;
  const h=history();
  root.innerHTML=`<div class="r78card green"><div class="r78head"><div><h3>PRICE HISTORY &amp; COST CONTROL</h3><div class="r78muted">One Flooring OS view for product-price revisions and Order cost maturity. Existing records remain the source of truth.</div></div><div class="r78pills"><span class="r78pill green">V0.3.78</span><span class="r78pill blue">${h.length} PRICE REVISION${h.length===1?'':'S'}</span></div></div>${costHtml()}<div class="r78note"><b>Control rule:</b> Product pricing changes are versioned from this release forward. Order price snapshots stay historical; PO committed cost and Vendor Bill actual cost continue to come from Accounting. Nothing here silently rewrites an old Order.</div><div class="r78actions"><button type="button" class="action" data-r78="toggle-history">${showHistory?'Hide':'View'} Price Revision History</button><button type="button" class="action" data-r78="refresh">Refresh Cost Control</button></div>${showHistory?historyHtml():''}</div>`;
  return true;
}
function bind(){
  if(document.documentElement.dataset.r78Bound)return;
  document.documentElement.dataset.r78Bound='1';
  document.addEventListener('click',ev=>{
    const save=ev.target?.closest?.('[data-r70="save"]');if(save){startSaveCapture();setTimeout(finishSaveCapture,80);setTimeout(finishSaveCapture,260);return}
    const b=ev.target?.closest?.('[data-r78]');if(b){
      if(b.dataset.r78==='toggle-history')showHistory=!showHistory;
      render(true);return;
    }
    if(ev.target?.closest?.('[data-page="pricing"],#pricing button,#accounting button'))setTimeout(()=>render(true),120);
  },true);
  document.addEventListener('change',ev=>{if(ev.target?.closest?.('#pricing,#accounting'))setTimeout(()=>render(true),100)},true);
  window.addEventListener('storage',ev=>{if([CAT,HIST,'runlu_deerfoot_flooring_jobs_v1','runlu_deerfoot_supplier_orders_v1','runlu_vendor_invoices_v067','runlu_accounting_foundation_v067'].includes(ev.key))render(true)});
}
function decorateShell(){
  try{
    document.title='RUNLU Deerfoot Flooring OS V0.3.78 Price History & Cost Control';
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.78 Cost Control';
    const brand=document.querySelector('header .brand span');if(brand)brand.textContent='Complete workflow · Pricing history · Order cost maturity · Live inventory';
    const demo=by('command')?.querySelector?.('.demo');if(demo)demo.textContent='V0.3.78 · Product price revisions + Estimate → PO Committed → Vendor Bill Actual → Forecast margin.';
  }catch(_){}
}
function install(){
  decorateShell();bind();render(true);
  let tries=0;const timer=setInterval(()=>{decorateShell();render(false);if(++tries>=60)clearInterval(timer)},500);
  document.documentElement.setAttribute('data-runlu-v078','price-history-cost-control');
  return true;
}
window.RUNLUPricingCostControlV078={install,render,history,recordDiff,version:'0.3.78'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
