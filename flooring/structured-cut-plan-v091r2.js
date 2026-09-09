/* RUNLU Deerfoot Flooring OS · V0.3.91r2 Structured Carpet Cut Plan
   Additive enhancement layered on V0.3.91 Mixed Order Routing + V0.3.91r1 Invoice Output.
   Business rules:
   - Sales total may be entered without detailed cuts.
   - Detailed carpet cuts are optional and may contain 0..N pieces.
   - If both total and detailed cuts exist, compare them but do not block saving.
   - Carpet sales units convert to LF using the linked roll width; 3 in allowance per cut is added for Warehouse planning.
   - Product stock keeps sales quantity/unit and the Warehouse-converted quantity/unit (for example SY -> Roll).
   - Structured routing data is attached to the inventory Hold and copied into the Warehouse material task.
   - This module never decrements physical Warehouse inventory.
*/
(function(){
'use strict';
if(window.__RUNLU_STRUCTURED_CUT_PLAN_V091R2__)return;
window.__RUNLU_STRUCTURED_CUT_PLAN_V091R2__=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const ENV='training';
let sb=null,obs=null,taskRows=[],taskBusy=false;
const by=id=>document.getElementById(id);
const str=v=>String(v??'').trim();
const num=v=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const round3=n=>Math.round((Number(n)||0)*1000)/1000;
const itemsNow=()=>{try{return typeof editingItems!=='undefined'&&Array.isArray(editingItems)?editingItems:[]}catch(_){return[]}};
const activeJob=()=>{try{return typeof active==='function'?active():null}catch(_){return null}};
const inventory=()=>{try{return window.RUNLUSmartInventoryPickerV072?.inventory?.()||[]}catch(_){return[]}};

function parseQty(v){
  const s=str(v),m=s.match(/-?\d+(?:\.\d+)?/),n=m?Number(m[0]):0;let unit='';
  if(/\b(sy|yds?|yards?)\b/i.test(s))unit='SY';
  else if(/\b(sf|sq\s*ft|sqft)\b/i.test(s))unit='SF';
  else if(/\b(lf|linear\s*ft|feet|foot|ft)\b/i.test(s))unit='LF';
  else if(/\brolls?\b/i.test(s))unit='ROLL';
  else if(/\bbox(es)?\b/i.test(s))unit='BOX';
  else if(/\bcartons?\b/i.test(s))unit='CARTON';
  else if(/\b(pails?|buckets?)\b/i.test(s))unit='PAIL';
  else if(/\btubes?\b/i.test(s))unit='TUBE';
  else if(/\b(ea|each|pieces?)\b/i.test(s))unit='EA';
  return {n:Number.isFinite(n)?n:0,unit};
}
function selectedInventory(x){return inventory().find(i=>i.id===x?.routeInventoryId)||null}
function widthOf(x){
  const inv=selectedInventory(x);const vals=[inv?.width,x?.routeWidthFt,x?.size];
  for(const v of vals){const m=str(v).match(/\d+(?:\.\d+)?/);if(m&&Number(m[0])>0)return Number(m[0])}
  return 0;
}
function salesLF(x,width){
  const q=parseQty(x?.qty);if(!(q.n>0)||!(width>0))return q.unit==='LF'?q.n:0;
  if(q.unit==='SY')return q.n*9/width;
  if(q.unit==='SF')return q.n*12/width;
  if(q.unit==='LF')return q.n;
  return 0;
}
function feetToText(v){
  let totalIn=Math.round((Number(v)||0)*12);const ft=Math.floor(totalIn/12),inch=totalIn-ft*12;
  return `${ft}'${inch?inch+'"':''}`;
}
function pieceLF(p){return Math.max(0,num(p?.lengthFt))+Math.max(0,num(p?.lengthIn))/12}
function canonicalPiece(p,defaultWidth){
  const w=num(p?.widthFt)||defaultWidth||0,lf=Math.max(0,Math.floor(num(p?.lengthFt))),inch=Math.max(0,num(p?.lengthIn));
  const l=`${lf}'${inch?`${inch}"`:''}`;return w?`${w}' × ${l}`:l;
}
function parseLegacyPiece(s,defaultWidth){
  s=str(s);if(!s)return null;
  let width=defaultWidth||0,len=s;
  const pair=s.split(/[x×]/i);if(pair.length>=2){const wm=pair[0].match(/\d+(?:\.\d+)?/);if(wm)width=Number(wm[0]);len=pair.slice(1).join('x')}
  const fm=len.match(/(\d+(?:\.\d+)?)\s*'/),im=len.match(/(\d+(?:\.\d+)?)\s*"/);
  if(fm)return {widthFt:width,lengthFt:Math.floor(Number(fm[1])),lengthIn:im?Number(im[1]):0};
  const dm=len.match(/\d+(?:\.\d+)?/);if(dm){const n=Number(dm[0]);return {widthFt:width,lengthFt:Math.floor(n),lengthIn:Math.round((n-Math.floor(n))*12)}}
  return null;
}
function ensurePieces(x){
  if(Array.isArray(x.routeCutPieces))return x.routeCutPieces;
  const w=widthOf(x),parts=str(x.routeCutPlan).split(/[;|,\n]+/).map(v=>v.trim()).filter(Boolean),out=[];
  parts.forEach(s=>{const p=parseLegacyPiece(s,w);if(p)out.push(p)});x.routeCutPieces=out;return out;
}
function derived(x){
  const width=widthOf(x),q=parseQty(x?.qty),pieces=ensurePieces(x),detailTotal=pieces.reduce((s,p)=>s+pieceLF(p),0),fromSales=salesLF(x,width),manual=num(x?.routeRequestedLF);
  let requested=fromSales||manual||detailTotal||0;
  if(!requested&&q.unit==='LF')requested=q.n;
  const count=pieces.length||Math.max(0,Math.round(num(x?.routeCutCount)));
  const allowance=count*3;
  const planned=requested+(count?allowance/12:0);
  if(width)x.routeWidthFt=width;
  if(requested)x.routeRequestedLF=round3(requested);
  if(pieces.length){x.routeCutCount=pieces.length;x.routeCutPlan=pieces.map(p=>canonicalPiece(p,width)).join('; ')}
  if(planned)x.routeWarehouseQty=round3(planned);
  x.routeSalesQuantity=q.n||0;x.routeSalesUnit=q.unit||'';x.routeCutDetailTotalLF=round3(detailTotal);x.routeCutDifferenceLF=round3(detailTotal&&requested?detailTotal-requested:0);x.routeAllowanceInches=allowance;x.routeStructuredVersion='0.3.91r2';
  return {width,q,pieces,detailTotal,fromSales,requested,count,allowance,planned,diff:detailTotal&&requested?detailTotal-requested:0};
}
function routingData(x){
  const d=derived(x);return {
    version:'0.3.91r2',
    routeType:str(x.routeType),
    salesQuantity:d.q.n||0,
    salesUnit:d.q.unit||'',
    carpetWidthFt:d.width||0,
    requestedLF:round3(d.requested),
    cutPieces:d.pieces.map((p,i)=>({index:i+1,widthFt:num(p.widthFt)||d.width||0,lengthFt:Math.floor(num(p.lengthFt)),lengthIn:num(p.lengthIn),lengthLF:round3(pieceLF(p)),label:canonicalPiece(p,d.width)})),
    cutDetailTotalLF:round3(d.detailTotal),
    cutCount:d.count,
    allowanceInches:d.allowance,
    plannedWarehouseQuantity:round3(d.planned||num(x.routeWarehouseQty)),
    warehouseUnit:str(x.routeWarehouseUnit||''),
    warehouseRecordId:str(x.routeRecordId||''),
    productMasterId:str(x.routeMasterId||''),
    rollNumber:str(x.routeRoll||''),
    location:str(x.routeLocation||''),
    conversionNote:conversionText(x,d),
    mismatchLF:round3(d.diff),
    savedFrom:'Flooring OS Sales / Job Routing'
  };
}
function conversionText(x,d){
  if(x.routeType==='CARPET_STOCK'){
    const a=[];if(d.q.n&&d.q.unit)a.push(`${d.q.n} ${d.q.unit}`);if(d.requested)a.push(`${feetToText(d.requested)} requested`);if(d.count)a.push(`${d.count} cut(s) × 3\"`);if(d.planned)a.push(`${feetToText(d.planned)} planned`);return a.join(' → ');
  }
  if(x.routeType==='PRODUCT_STOCK'){
    const a=[];if(d.q.n&&d.q.unit)a.push(`${d.q.n} ${d.q.unit}`);if(num(x.routeWarehouseQty))a.push(`${num(x.routeWarehouseQty)} ${str(x.routeWarehouseUnit)}`);return a.join(' → ');
  }
  return '';
}
function style(){if(by('r091r2style'))return;const s=document.createElement('style');s.id='r091r2style';s.textContent=`
.r091r2box{grid-column:1/-1;margin-top:8px;border:1px solid #cfded7;border-radius:8px;background:#fff;padding:9px}.r091r2head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap}.r091r2head b{font-size:10px;color:#173d30}.r091r2head small{display:block;color:#718078;margin-top:2px}.r091r2summary{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.r091r2sum{border:1px solid #e0e8e4;border-radius:6px;padding:7px;text-align:center;background:#f8faf9}.r091r2sum b{display:block;font-size:12px;color:#214e3c}.r091r2sum span{font-size:7px;color:#748078}.r091r2match{margin-top:7px;padding:7px;border-radius:6px;font-size:9px;background:#eaf5ee;color:#245b42}.r091r2match.warn{background:#fff1d8;color:#7a5600}.r091r2cuts{display:grid;gap:5px;margin-top:8px}.r091r2cut{display:grid;grid-template-columns:30px 90px 90px 80px 36px;gap:6px;align-items:end}.r091r2cut label{font-size:7px;font-weight:800;color:#69776f}.r091r2cut input{width:100%;padding:6px;border:1px solid #ccd8d2;border-radius:5px;background:#fff}.r091r2num{font-size:9px;font-weight:900;color:#4e6258;padding-bottom:7px}.r091r2del{padding:6px;border:1px solid #e0caca;border-radius:5px;background:#fff;color:#8a3f3f}.r091r2actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.r091r2empty{padding:8px;border:1px dashed #d5dfda;border-radius:6px;color:#718078;font-size:9px;margin-top:8px}.r091r2conv{grid-column:1/-1;margin-top:7px;padding:7px;border-radius:6px;background:#eef4f1;color:#315947;font-size:9px}.r091r2taskdetail{grid-column:1/-1;margin-top:6px;padding:6px 8px;border-radius:6px;background:#f2f7f4;color:#315947;font-size:9px;line-height:1.35}@media(max-width:720px){.r091r2summary{grid-template-columns:1fr 1fr}.r091r2cut{grid-template-columns:26px 1fr 1fr 62px 34px}.r091r2cut label:nth-of-type(1){grid-column:auto}.r091r2head small{max-width:270px}}
`;document.head.appendChild(s)}
function summaryHTML(x,d){
  const sales=d.q.n&&d.q.unit?`${d.q.n} ${d.q.unit}`:'—',requested=d.requested?feetToText(d.requested):'—',detail=d.pieces.length?feetToText(d.detailTotal):'Optional',planned=d.planned?feetToText(d.planned):'—';
  let match='Detailed cuts are optional. Total-only routing is valid.';let cls='';
  if(d.pieces.length&&d.requested){const inches=Math.round(Math.abs(d.diff)*12);if(inches<=1)match=`✓ Detailed cuts match the order total (${feetToText(d.detailTotal)}).`;else{match=`Review: detailed cuts total ${feetToText(d.detailTotal)} vs order total ${feetToText(d.requested)} · difference ${inches}\". Saving is still allowed.`;cls=' warn'}}
  else if(d.pieces.length)match=`Detailed cuts total ${feetToText(d.detailTotal)}. No separate sales total is required to save the cut plan.`;
  return `<div class="r091r2summary"><div class="r091r2sum"><b>${esc(sales)}</b><span>Sales total</span></div><div class="r091r2sum"><b>${esc(requested)}</b><span>Requested LF</span></div><div class="r091r2sum"><b>${esc(detail)}</b><span>Detailed cuts</span></div><div class="r091r2sum"><b>${esc(planned)}</b><span>Warehouse plan</span></div></div><div class="r091r2match${cls}">${esc(match)}${d.count?` · Allowance ${d.count} × 3\" = ${d.allowance}\".`:''}</div>`;
}
function cutRowsHTML(x,d){
  if(!d.pieces.length)return '<div class="r091r2empty">No detailed cuts yet. The sales total can be routed now; dimensions may be added later.</div>';
  return `<div class="r091r2cuts">${d.pieces.map((p,i)=>`<div class="r091r2cut" data-r091r2-cut="${i}"><div class="r091r2num">#${i+1}</div><label>Width ft<input data-k="widthFt" inputmode="decimal" value="${esc(num(p.widthFt)||d.width||'')}"></label><label>Length ft<input data-k="lengthFt" inputmode="numeric" value="${esc(p.lengthFt??'')}"></label><label>Inches<input data-k="lengthIn" inputmode="decimal" value="${esc(p.lengthIn??0)}"></label><button type="button" class="r091r2del" aria-label="Delete cut">×</button></div>`).join('')}</div>`;
}
function renderCarpetBox(route,x,i){
  let box=route.querySelector('.r091r2box');if(box)box.remove();const d=derived(x);box=document.createElement('div');box.className='r091r2box';box.innerHTML=`<div class="r091r2head"><div><b>Structured Cut Plan</b><small>Total may stand alone. Detailed cuts are optional and can be added or changed later.</small></div><span style="font-size:8px;font-weight:900;color:#315947">0–N CUTS</span></div>${summaryHTML(x,d)}${cutRowsHTML(x,d)}<div class="r091r2actions"><button type="button" class="action" data-r091r2-add>+ Add Cut</button>${d.pieces.length?'<button type="button" class="action" data-r091r2-clear>Clear Detailed Cuts</button>':''}</div>`;route.appendChild(box);
  box.querySelector('[data-r091r2-add]')?.addEventListener('click',()=>{const a=ensurePieces(x);a.push({widthFt:d.width||12,lengthFt:'',lengthIn:0});derived(x);decorate()});
  box.querySelector('[data-r091r2-clear]')?.addEventListener('click',()=>{if(!confirm('Clear detailed cut dimensions? The sales total and linked inventory will remain.'))return;x.routeCutPieces=[];x.routeCutPlan='';derived(x);decorate()});
  box.querySelectorAll('[data-r091r2-cut]').forEach(row=>{const idx=Number(row.dataset.r091r2Cut);row.querySelectorAll('input[data-k]').forEach(inp=>inp.addEventListener('input',()=>{const a=ensurePieces(x),p=a[idx];if(!p)return;p[inp.dataset.k]=inp.value;derived(x);paintOnly(box,x)}));row.querySelector('.r091r2del')?.addEventListener('click',()=>{ensurePieces(x).splice(idx,1);derived(x);decorate()})});
}
function paintOnly(box,x){const d=derived(x);const old=box.querySelector('.r091r2summary'),match=box.querySelector('.r091r2match'),tmp=document.createElement('div');tmp.innerHTML=summaryHTML(x,d);if(old)old.replaceWith(tmp.firstElementChild);if(match){const n=tmp.firstElementChild;match.replaceWith(n)}}
function renderProductConversion(route,x){
  route.querySelector('.r091r2conv')?.remove();const d=derived(x);const div=document.createElement('div');div.className='r091r2conv';const src=d.q.n&&d.q.unit?`${d.q.n} ${d.q.unit}`:'Sales quantity not recognized',dst=num(x.routeWarehouseQty)?`${num(x.routeWarehouseQty)} ${str(x.routeWarehouseUnit)||'Warehouse unit'}`:'Warehouse quantity pending';div.innerHTML=`<b>Unit Conversion</b> · ${esc(src)} → <b>${esc(dst)}</b>${x.routeMasterId?` · Product Master ${esc(x.routeMasterId)}`:''}`;route.appendChild(div)
}
function decorate(){
  style();const xs=itemsNow(),routes=[...document.querySelectorAll('#itemsEditor .r091route')];routes.forEach(route=>{const i=Number(route.dataset.r091Route),x=xs[i];if(!x)return;if(x.routeType==='CARPET_STOCK')renderCarpetBox(route,x,i);else{route.querySelector('.r091r2box')?.remove();if(x.routeType==='PRODUCT_STOCK')renderProductConversion(route,x)}});decorateFulfillment()
}
async function client(){if(sb)return sb;for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});return sb}
async function syncHold(x){
  if(!x?.routeHoldId)return false;const c=await client(),payload=routingData(x);const r=await c.rpc('flooring_set_hold_routing_data',{p_hold_id:x.routeHoldId,p_routing_data:payload});if(r.error)throw r.error;x.routeStructuredSyncedAt=new Date().toISOString();return true
}
async function syncRoutedItems(){
  const j=activeJob(),xs=Array.isArray(j?.items)?j.items:itemsNow();if(!xs.length)return;let synced=0;
  for(const x of xs){if(!['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType))continue;derived(x);if(x.routeExistingExecution)continue;if(x.routeHoldId){try{if(await syncHold(x))synced++}catch(e){console.warn('[Structured Cut V091r2] hold sync failed',e)}}}
  try{if(typeof saveStore==='function')saveStore()}catch(_){}if(synced)refreshTasks().catch(()=>{})
}
function schedulePostRouteSync(){let n=0;const t=setInterval(()=>{n++;syncRoutedItems().catch(()=>{});if(n>=18)clearInterval(t)},650)}
async function refreshTasks(){
  if(taskBusy)return;taskBusy=true;try{const c=await client(),s=(await c.auth.getSession()).data?.session;if(!s)return;const q=await c.from('flooring_warehouse_material_tasks').select('id,po_number,roll_number,item_name,task_type,quantity,unit,status,routing_data,created_at').eq('environment',ENV).order('created_at',{ascending:false}).limit(250);if(q.error)throw q.error;taskRows=q.data||[];decorateFulfillment()}catch(e){console.warn('[Structured Cut V091r2] task read failed',e)}finally{taskBusy=false}}
function taskForText(text){
  const po=(text.match(/PO\s+([^\s·]+)/i)||[])[1]||'',roll=(text.match(/Roll\s+(RC\d+)/i)||[])[1]||'';
  return taskRows.find(t=>(!po||str(t.po_number)===po)&&(!roll||str(t.roll_number).toLowerCase()===roll.toLowerCase())&&t.routing_data&&Object.keys(t.routing_data).length)||null
}
function decorateFulfillment(){
  const page=by('warehouseFulfillment');if(!page)return;page.querySelectorAll('.mw091row').forEach(row=>{row.querySelector('.r091r2taskdetail')?.remove();const t=taskForText(row.textContent||'');if(!t)return;const r=t.routing_data||{},cuts=Array.isArray(r.cutPieces)?r.cutPieces:[];let text='';if(t.task_type==='Carpet Cutting')text=[cuts.length?`Cuts: ${cuts.map(p=>p.label||`${p.lengthLF} LF`).join(' · ')}`:null,r.requestedLF?`${feetToText(r.requestedLF)} requested`:null,r.allowanceInches?`+ ${r.allowanceInches}\" allowance`:null,r.plannedWarehouseQuantity?`${feetToText(r.plannedWarehouseQuantity)} planned`:null].filter(Boolean).join(' | ');else text=[r.salesQuantity&&r.salesUnit?`Sales ${r.salesQuantity} ${r.salesUnit}`:null,r.plannedWarehouseQuantity?`Pick ${r.plannedWarehouseQuantity} ${r.warehouseUnit||t.unit}`:null,r.productMasterId?`Master ${r.productMasterId}`:null].filter(Boolean).join(' | ');if(text){const d=document.createElement('div');d.className='r091r2taskdetail';d.textContent=text;row.appendChild(d)}})
}
function install(){
  style();decorate();const target=by('itemsEditor')||document.body;obs=new MutationObserver(()=>setTimeout(decorate,0));obs.observe(target,{childList:true,subtree:true});document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;if(b.id==='r091routeBtn')schedulePostRouteSync();if(b.dataset?.page==='warehouseFulfillment'||b.textContent?.trim()==='Fulfillment')setTimeout(()=>refreshTasks(),250);if(b.dataset?.page==='jobs'||b.textContent?.trim()==='Jobs'||b.textContent?.includes('Save Job')||b.textContent?.trim()==='+ Item')setTimeout(decorate,100)},true);window.addEventListener('pageshow',()=>setTimeout(()=>{decorate();refreshTasks().catch(()=>{})},120));refreshTasks().catch(()=>{});window.RUNLUStructuredCutPlanV091R2={version:'0.3.91r2',routingData,syncRoutedItems,refreshTasks}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
