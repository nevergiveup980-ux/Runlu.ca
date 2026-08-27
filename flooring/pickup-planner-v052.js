/* RUNLU Deerfoot Flooring OS · V0.3.52 Pickup Planner
   Adds a work-planning layer to Supplier Pickup / Receiving without changing PO records.
   - By Date: daily pickup plan, grouped by supplier.
   - By Supplier: supplier-centric plan, date sorted.
   - Adjustable nearby-date window highlights possible combined supplier trips.
*/
(function(){
'use strict';
if(window.__runluPickupPlannerV052)return;
window.__runluPickupPlannerV052=true;

const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const META_STORE='runlu_supplier_task_meta_v1';
const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
const PREF_STORE='runlu_pickup_planner_pref_v052';
const PAGE_ID='supplierPickupPage';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const dayMs=86400000;

function prefs(){
  const p=read(PREF_STORE,{});return {view:p.view==='supplier'?'supplier':'date',window:[1,2,3,5,7].includes(Number(p.window))?Number(p.window):3};
}
function savePrefs(patch){write(PREF_STORE,{...prefs(),...patch,updatedAt:new Date().toISOString()})}
function statusForPO(po){
  if(po.status==='Cancelled')return 'Cancelled';
  if(['Received','Completed'].includes(po.status))return po.status==='Completed'?'Completed':'Ready';
  if(po.status==='Partially Received')return 'In Progress';
  return po.poNumber?'Scheduled':'Draft';
}
function legacyForPO(po,meta){return meta[po.id]||(po.jobId?meta[po.jobId]:meta['no-job'])||{}}
function rows(){
  const pos=read(PO_STORE,[]),meta=read(META_STORE,{}),snap=read(SNAP_STORE,{});
  if(!Array.isArray(pos))return [];
  return pos.filter(x=>x&&x.poNumber&&x.status!=='Draft').map(po=>{
    const num=String(po.poNumber||'').trim(),legacy=legacyForPO(po,meta),s=snap[num]||{};
    const requestedDate=po.requestedDate||s.requestedDate||legacy.requestedDate||'';
    return {...po,requestedDate,fulfillment:po.fulfillment||s.fulfillment||legacy.fulfillment||'Pickup',purchaseType:po.purchaseType||s.purchaseType||legacy.purchaseType||'Job-specific',pickupStatus:statusForPO(po)};
  }).filter(x=>x.pickupStatus!=='Draft');
}
function filterRows(xs){const f=by('pickupFilterSafe')?.value||'';return xs.filter(x=>!f||x.pickupStatus===f)}
function dateValue(v){if(!iso(v))return Number.POSITIVE_INFINITY;return new Date(v+'T12:00:00').getTime()}
function sortRows(xs){return [...xs].sort((a,b)=>dateValue(a.requestedDate)-dateValue(b.requestedDate)||String(a.supplier||'').localeCompare(String(b.supplier||''))||String(a.poNumber||'').localeCompare(String(b.poNumber||''),undefined,{numeric:true}))}
function supplierKey(v){return String(v||'Supplier not set').trim().replace(/\s+/g,' ').toLowerCase()||'supplier not set'}
function supplierLabel(xs){return String(xs.find(x=>String(x.supplier||'').trim())?.supplier||'Supplier not set').trim()||'Supplier not set'}
function isPickup(x){return !/deliver/i.test(String(x.fulfillment||'Pickup'))}
function prettyDate(v,long=false){
  if(!iso(v))return 'Date not set';
  const d=new Date(v+'T12:00:00');
  return d.toLocaleDateString('en-CA',long?{weekday:'long',month:'short',day:'numeric',year:'numeric'}:{weekday:'short',month:'short',day:'numeric'});
}
function relativeDate(v){
  if(!iso(v))return 'Supplier pickup date not set';
  const d=new Date(v+'T12:00:00'),t=new Date();t.setHours(12,0,0,0);const diff=Math.round((d-t)/dayMs);
  if(diff===0)return 'TODAY · '+prettyDate(v);
  if(diff===1)return 'TOMORROW · '+prettyDate(v);
  if(diff===-1)return 'YESTERDAY · '+prettyDate(v);
  if(diff<0)return 'OVERDUE · '+prettyDate(v);
  return prettyDate(v);
}
function materialSummary(x){
  const items=Array.isArray(x.items)?x.items:[];
  if(!items.length)return 'No material lines recorded';
  const parts=items.slice(0,3).map(a=>{
    const qty=[a.qty,String(a.unit||'').toUpperCase()].filter(Boolean).join(' ');
    const desc=[a.style||a.product||a.description||'',a.colour||a.color||''].filter(Boolean).join(' · ');
    const ref=a.sourceRef||a.supplierStock||'';
    return [qty,desc,ref].filter(Boolean).join(' · ');
  });
  if(items.length>3)parts.push('+'+(items.length-3)+' more line'+(items.length-3===1?'':'s'));
  return parts.join(' | ');
}
function statusClass(s){return s==='Cancelled'?'cancelled':(['Ready','Completed'].includes(s)?'ready':'')}
function taskHtml(x,combineText=''){
  const delivery=/deliver/i.test(String(x.fulfillment||''));
  return `<div class="pickupPlanTask ${delivery?'pickupPlanDelivery':''}">
    <div class="pickupPlanTaskMain"><div class="pickupPlanTitle"><b>PO #${esc(x.poNumber)}</b><span>${esc(x.jobNumber||'No Job #')} · ${esc(x.customerName||'')}</span></div><div class="pickupPlanMaterial">${esc(materialSummary(x))}</div>${combineText?`<div class="pickupPlanCombineMini">${esc(combineText)}</div>`:''}</div>
    <div class="pickupPlanMeta"><b>${esc(x.fulfillment||'Pickup')}</b><span>${esc(x.salesRep||'Sales rep not set')}</span><span>${esc(x.purchaseType||'')}</span></div>
    <div class="pickupPlanState"><span class="pickupSafeStatus ${statusClass(x.pickupStatus)}">${esc(x.pickupStatus)}</span></div>
  </div>`;
}
function clusterCandidates(xs,windowDays){
  const dated=sortRows(xs.filter(x=>isPickup(x)&&iso(x.requestedDate)&&!['Completed','Cancelled'].includes(x.pickupStatus)));
  const out=[];let i=0;
  while(i<dated.length){
    const start=dated[i],startMs=dateValue(start.requestedDate),cluster=[start];let j=i+1;
    while(j<dated.length&&dateValue(dated[j].requestedDate)-startMs<=windowDays*dayMs){cluster.push(dated[j]);j++}
    if(cluster.length>1)out.push(cluster);
    i=cluster.length>1?j:i+1;
  }
  return out;
}
function ensureStyle(){
  if(by('pickupPlannerStyleV052'))return;
  const s=document.createElement('style');s.id='pickupPlannerStyleV052';s.textContent=`
  .pickupPlannerToolbar{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin:12px 0 14px;padding:12px;border:1px solid #dce4e0;border-radius:12px;background:#f7faf8}.pickupPlannerToolbar label{display:flex;flex-direction:column;gap:5px;font-size:11px;font-weight:800;color:#4c5e55}.pickupPlannerToolbar select{min-width:150px;padding:9px 10px;border:1px solid #cfd9d4;border-radius:9px;background:#fff;color:#173d30;font-weight:700}.pickupPlannerWhy{margin-left:auto;max-width:430px;font-size:11px;line-height:1.4;color:#63716b}.pickupPlannerSummary{display:flex;gap:8px;flex-wrap:wrap;margin:-2px 0 12px}.pickupPlannerChip{padding:6px 9px;border-radius:999px;background:#edf4f0;color:#244f3f;font-size:11px;font-weight:800}.pickupPlanDay,.pickupPlanSupplier{margin:14px 0 18px}.pickupPlanDayHead,.pickupPlanSupplierHead{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 11px;border-radius:10px;background:#173d30;color:#fff}.pickupPlanDayHead b,.pickupPlanSupplierHead b{font-size:13px}.pickupPlanDayHead span,.pickupPlanSupplierHead span{font-size:11px;opacity:.82}.pickupPlanStop{margin-top:9px;border:1px solid #dce4e0;border-radius:11px;overflow:hidden;background:#fff}.pickupPlanStopHead{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;background:#eef4f1;color:#244f3f;font-size:12px}.pickupPlanStopHead b{font-size:13px}.pickupPlanTask{display:grid;grid-template-columns:minmax(0,1fr) 150px 100px;gap:12px;align-items:center;padding:10px;border-top:1px solid #e4ebe7}.pickupPlanStop .pickupPlanTask:first-of-type{border-top:0}.pickupPlanTaskMain{min-width:0}.pickupPlanTitle{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.pickupPlanTitle b{color:#173d30}.pickupPlanTitle span{font-size:11px;color:#5e6c65}.pickupPlanMaterial{margin-top:4px;font-size:11px;line-height:1.35;color:#53615a}.pickupPlanMeta{display:flex;flex-direction:column;gap:3px;font-size:10.5px;color:#63716b}.pickupPlanMeta b{color:#244f3f}.pickupPlanState{text-align:right}.pickupPlanDelivery{background:#fbfcfb}.pickupPlanCombine{margin:9px 0;padding:9px 10px;border-left:4px solid #b58a2c;border-radius:8px;background:#fff8df;color:#66521c;font-size:11px;line-height:1.45}.pickupPlanCombine b{color:#5b4510}.pickupPlanCombineMini{margin-top:5px;color:#8a6714;font-size:10.5px;font-weight:700}.pickupPlanUndated .pickupPlanDayHead{background:#6b746f}.pickupPlanSupplierRows{border:1px solid #dce4e0;border-radius:11px;overflow:hidden;margin-top:9px}.pickupPlanSupplierRows .pickupPlanTask:first-child{border-top:0}@media(max-width:760px){.pickupPlannerWhy{width:100%;max-width:none;margin-left:0}.pickupPlanTask{grid-template-columns:1fr}.pickupPlanMeta{flex-direction:row;flex-wrap:wrap}.pickupPlanState{text-align:left}.pickupPlanDayHead,.pickupPlanSupplierHead{align-items:flex-start;flex-direction:column;gap:3px}}
  `;document.head.appendChild(s);
}
function ensureControls(){
  const page=by(PAGE_ID),schedule=by('pickupScheduleSafe');if(!page||!schedule)return false;
  ensureStyle();
  if(!by('pickupPlannerToolbarV052')){
    const p=prefs(),bar=document.createElement('div');bar.id='pickupPlannerToolbarV052';bar.className='pickupPlannerToolbar';
    bar.innerHTML=`<label>Plan view<select id="pickupPlannerViewV052"><option value="date">By Date · Daily Plan</option><option value="supplier">By Supplier · Trip Plan</option></select></label><label>Nearby-date window<select id="pickupPlannerWindowV052"><option value="1">1 day</option><option value="2">2 days</option><option value="3">3 days</option><option value="5">5 days</option><option value="7">7 days</option></select></label><div class="pickupPlannerWhy"><b>Trip planning:</b> same-supplier pickup POs inside the selected window are highlighted as possible one-trip candidates. Dates and PO records are never changed automatically.</div>`;
    schedule.parentNode.insertBefore(bar,schedule);
    const summary=document.createElement('div');summary.id='pickupPlannerSummaryV052';summary.className='pickupPlannerSummary';schedule.parentNode.insertBefore(summary,schedule);
    by('pickupPlannerViewV052').value=p.view;by('pickupPlannerWindowV052').value=String(p.window);
    by('pickupPlannerViewV052').addEventListener('change',e=>{savePrefs({view:e.target.value});renderPlanner()});
    by('pickupPlannerWindowV052').addEventListener('change',e=>{savePrefs({window:Number(e.target.value)||3});renderPlanner()});
  }
  return true;
}
function renderSummary(xs,windowDays){
  const el=by('pickupPlannerSummaryV052');if(!el)return;
  const open=xs.filter(x=>!['Completed','Cancelled'].includes(x.pickupStatus));
  const pickup=open.filter(isPickup),suppliers=new Set(pickup.map(x=>supplierKey(x.supplier))).size;
  const groups={};pickup.forEach(x=>(groups[supplierKey(x.supplier)]||(groups[supplierKey(x.supplier)]=[])).push(x));
  const opportunities=Object.values(groups).reduce((n,g)=>n+clusterCandidates(g,windowDays).length,0);
  el.innerHTML=`<span class="pickupPlannerChip">${pickup.length} open pickup PO${pickup.length===1?'':'s'}</span><span class="pickupPlannerChip">${suppliers} supplier stop${suppliers===1?'':'s'}</span><span class="pickupPlannerChip">${opportunities} combine opportunit${opportunities===1?'y':'ies'}</span>`;
}
function renderByDate(xs,windowDays){
  const groups={};sortRows(xs).forEach(x=>{const k=iso(x.requestedDate)?x.requestedDate:'~undated';(groups[k]||(groups[k]=[])).push(x)});
  return Object.entries(groups).map(([date,dayRows])=>{
    const bySupplier={};dayRows.forEach(x=>(bySupplier[supplierKey(x.supplier)]||(bySupplier[supplierKey(x.supplier)]=[])).push(x));
    const stops=Object.values(bySupplier);
    const body=stops.map(sx=>{
      const label=supplierLabel(sx),pickupCount=sx.filter(isPickup).length,deliveryCount=sx.length-pickupCount;
      const stopText=[pickupCount?pickupCount+' pickup PO'+(pickupCount===1?'':'s'):'',deliveryCount?deliveryCount+' inbound delivery'+(deliveryCount===1?'':'ies'):''].filter(Boolean).join(' · ');
      return `<div class="pickupPlanStop"><div class="pickupPlanStopHead"><b>${esc(label)}</b><span>${esc(stopText)}</span></div>${sortRows(sx).map(x=>taskHtml(x)).join('')}</div>`;
    }).join('');
    return `<div class="pickupPlanDay ${date==='~undated'?'pickupPlanUndated':''}"><div class="pickupPlanDayHead"><b>${esc(date==='~undated'?'DATE NOT SET':relativeDate(date))}</b><span>${stops.length} supplier group${stops.length===1?'':'s'} · ${dayRows.length} PO${dayRows.length===1?'':'s'}</span></div>${body}</div>`;
  }).join('');
}
function renderBySupplier(xs,windowDays){
  const groups={};xs.forEach(x=>(groups[supplierKey(x.supplier)]||(groups[supplierKey(x.supplier)]=[])).push(x));
  return Object.values(groups).sort((a,b)=>supplierLabel(a).localeCompare(supplierLabel(b))).map(sx=>{
    const label=supplierLabel(sx),sorted=sortRows(sx),candidates=clusterCandidates(sx,windowDays),candidateMap={};
    const banners=candidates.map((cluster,idx)=>{
      const first=cluster[0].requestedDate,last=cluster[cluster.length-1].requestedDate,range=first===last?prettyDate(first):prettyDate(first)+' → '+prettyDate(last);const pos=cluster.map(x=>'#'+x.poNumber).join(', ');
      cluster.forEach(x=>candidateMap[String(x.poNumber)]=`Combine candidate ${idx+1} · ${range}`);
      return `<div class="pickupPlanCombine"><b>Possible one-trip pickup:</b> ${esc(range)} · ${cluster.length} POs (${esc(pos)}). If the later material will be ready, these can be considered for one supplier run.</div>`;
    }).join('');
    const dates=sorted.filter(x=>iso(x.requestedDate)).map(x=>x.requestedDate),range=dates.length?(prettyDate(dates[0])+(dates.length>1?' → '+prettyDate(dates[dates.length-1]):'')):'Dates not set';
    return `<div class="pickupPlanSupplier"><div class="pickupPlanSupplierHead"><b>${esc(label)}</b><span>${sorted.length} PO${sorted.length===1?'':'s'} · ${esc(range)}</span></div>${banners}<div class="pickupPlanSupplierRows">${sorted.map(x=>taskHtml(x,candidateMap[String(x.poNumber)]||'')).join('')}</div></div>`;
  }).join('');
}
function renderPlanner(){
  if(!ensureControls())return false;
  const p=prefs(),xs=filterRows(rows()),el=by('pickupScheduleSafe');if(!el)return false;
  renderSummary(xs,p.window);
  if(!xs.length){el.innerHTML='<div class="muted">No issued PO records match this view.</div>';return true}
  el.innerHTML=p.view==='supplier'?renderBySupplier(xs,p.window):renderByDate(xs,p.window);return true;
}
function hook(){
  if(!ensureControls())return false;
  if(typeof window.runluPickupSafeRender==='function'&&!window.runluPickupSafeRender.__v052){
    const base=window.runluPickupSafeRender;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(renderPlanner,0);return r};wrapped.__v052=true;window.runluPickupSafeRender=wrapped;
  }
  ['pickupRefreshSafe','pickupFilterSafe'].forEach(id=>{const el=by(id);if(el&&!el.dataset.pickupPlannerV052){el.dataset.pickupPlannerV052='1';el.addEventListener(id==='pickupFilterSafe'?'change':'click',()=>setTimeout(renderPlanner,0))}});
  const nav=document.querySelector('nav button[data-page="'+PAGE_ID+'"]');if(nav&&!nav.dataset.pickupPlannerV052){nav.dataset.pickupPlannerV052='1';nav.addEventListener('click',()=>{setTimeout(renderPlanner,30);setTimeout(renderPlanner,180)})}
  renderPlanner();return true;
}
function install(){let tries=0;const timer=setInterval(()=>{tries++;if(hook()||tries>40)clearInterval(timer)},100);hook();return true}
window.RUNLUPickupPlannerV052={install,render:renderPlanner};
window.addEventListener('storage',ev=>{if([PO_STORE,META_STORE,SNAP_STORE,PREF_STORE].includes(ev.key))setTimeout(renderPlanner,0)});
document.addEventListener('change',ev=>{if(['pickupRequestedDateSafe','pickupFulfillmentSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id))setTimeout(renderPlanner,80)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100),{once:true});else setTimeout(install,100);
})();
