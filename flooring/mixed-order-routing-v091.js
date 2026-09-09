/* RUNLU Deerfoot Flooring OS · V0.3.91 Mixed Order Line Routing
   Customer Job / Deerfoot Invoice line routing:
   - CARPET STOCK -> exact Warehouse carpet roll -> inventory Hold -> Carpet Cutting task
   - PRODUCT STOCK -> Product Master / inventory -> inventory Hold -> Stock Picking task
   - SERVICE -> Installation / Accounting only; never inventory
   - NON-STOCK MATERIAL -> procurement review; never inventory
   Safety:
   - planning / Holds never decrement physical Warehouse inventory
   - existing Warehouse execution for the same Order + roll/product is detected first to avoid duplicate work
   - current frozen production files are not modified by this module
*/
(function(){
'use strict';
if(window.__RUNLU_MIXED_ORDER_ROUTING_V091__)return;
window.__RUNLU_MIXED_ORDER_ROUTING_V091__=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const ENV='training';
const INV_BRIDGE='runlu_flooring_active_invoice_v1';
let sb=null,session=null,existing=[],masters=new Map(),busy=false,observer=null;
const by=id=>document.getElementById(id);
const str=v=>String(v??'').trim();
const num=v=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>str(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const money=n=>Number(n||0).toLocaleString('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:2});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const itemsNow=()=>{try{return typeof editingItems!=='undefined'&&Array.isArray(editingItems)?editingItems:[]}catch(_){return[]}};
const savedJob=()=>{try{return typeof active==='function'?active():null}catch(_){return null}};
const inventory=()=>{try{return window.RUNLUSmartInventoryPickerV072?.inventory?.()||[]}catch(_){return[]}};
const datasetOf=item=>str(item?.id).startsWith('carpet:')?'runlu_carpet_inventory_v52':str(item?.id).startsWith('stock:')?'runlu_inventory_records_v21':'';
const recordOf=item=>str(item?.id).replace(/^(carpet|stock):/,'');

function lineType(x){
  if(x?.routeType)return x.routeType;
  const hay=norm([x?.style,x?.colour,x?.supplier].join(' '));
  if(/\b(disposal|install|installation|labour|labor|service)\b/.test(hay))return 'SERVICE';
  if(/\brc\d+\b/i.test(str(x?.supplier))||/\broll\s*rc\d+\b/i.test(hay))return 'CARPET_STOCK';
  if(/\b(spill blocker|underlay|underlayment|pad|9lb|9 lb|stock)\b/.test(hay))return 'PRODUCT_STOCK';
  return '';
}
function routeLabel(t){return ({CARPET_STOCK:'Carpet Stock',PRODUCT_STOCK:'Product Stock',SERVICE:'Service',NON_STOCK:'Non-stock Material'}[t]||'Choose route')}
function routeDest(t){return ({CARPET_STOCK:'Carpet Inventory → Cutting',PRODUCT_STOCK:'Product Inventory → Stock Picking',SERVICE:'Installation / Accounting',NON_STOCK:'Supplier PO / Procurement'}[t]||'Not routed')}
function parseQty(v){
  const s=str(v),n=num((s.match(/-?\d+(?:\.\d+)?/)||[])[0]);let unit='';
  if(/\b(sy|yds?|yards?)\b/i.test(s))unit='SY';else if(/\b(sf|sq\s*ft|sqft)\b/i.test(s))unit='SF';else if(/\b(lf|linear\s*ft|feet|foot|ft)\b/i.test(s))unit='LF';else if(/\brolls?\b/i.test(s))unit='ROLL';else if(/\bbox(es)?\b/i.test(s))unit='BOX';else if(/\bcartons?\b/i.test(s))unit='CARTON';else if(/\bea(ch)?\b/i.test(s))unit='EA';
  return {n,unit};
}
function wordScore(a,b){const aa=norm(a).split(/\s+/).filter(x=>x.length>2),bb=norm(b);return aa.reduce((s,w)=>s+(bb.includes(w)?8:0),0)}
function score(x,inv){
  let s=0;const sup=str(x?.supplier),sty=str(x?.style),col=str(x?.colour),sku=str(x?.sku||x?.productId);
  if(inv.roll&&new RegExp('\\b'+inv.roll.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(sup+' '+sty))s+=100;
  if(sku&&inv.sku&&norm(sku)===norm(inv.sku))s+=90;
  s+=wordScore(sty,inv.name);s+=wordScore(col,inv.colour);
  if(lineType(x)==='CARPET_STOCK'&&inv.kind==='Carpet Roll')s+=12;
  if(lineType(x)==='PRODUCT_STOCK'&&inv.kind!=='Carpet Roll')s+=12;
  return s;
}
function bestInventory(x){
  const xs=inventory().filter(i=>i.selectable!==false&&((lineType(x)==='CARPET_STOCK')===(i.kind==='Carpet Roll'))).map(i=>({i,s:score(x,i)})).sort((a,b)=>b.s-a.s);
  if(!xs.length||xs[0].s<20)return null;if(xs[1]&&xs[0].s-xs[1].s<5&&xs[0].s<80)return null;return xs[0].i;
}
function selectedInventory(x){return inventory().find(i=>i.id===x?.routeInventoryId)||null}
function masterFor(inv){const id=str(inv?.raw?.masterId);return id?masters.get(id)||null:null}
function suggestedWarehouseQty(x,inv){
  if(!inv)return {qty:0,unit:'',note:'Link inventory first.'};
  const q=parseQty(x?.qty),unit=str(inv.unit).toUpperCase();
  if(inv.kind==='Carpet Roll'){
    let requested=num(x?.routeRequestedLF);const width=num(inv.width||x?.size);
    if(!requested&&q.n){if(q.unit==='LF')requested=q.n;else if(q.unit==='SY'&&width>0)requested=q.n*9/width;else if(q.unit==='SF'&&width>0)requested=q.n*12/width;}
    const cuts=Math.max(0,Math.round(num(x?.routeCutCount)));const planned=requested+(cuts?cuts*.25:0);
    return {qty:planned||requested,unit:'LF',requested,planned,cuts,note:requested?`${requested.toFixed(2).replace(/\.00$/,'')} LF requested${cuts?` + ${cuts} cut(s) × 3″ = ${planned.toFixed(2).replace(/\.00$/,'')} LF planned`:''}`:'Enter requested LF or a customer quantity that can be converted.'};
  }
  if(q.n&&q.unit===unit)return {qty:q.n,unit,note:'Invoice and Warehouse units match.'};
  const m=masterFor(inv)||{},sy=num(m.syPerRoll),sfBox=num(m.sfPerBox);
  if(unit==='ROLL'&&sy>0&&q.n){const coverage=q.unit==='SY'?q.n:q.unit==='SF'?q.n/9:0;if(coverage)return {qty:Math.ceil(coverage/sy),unit,note:`${coverage.toFixed(2)} SY ÷ ${sy} SY/roll → ${Math.ceil(coverage/sy)} roll(s)`}}
  if((unit==='BOX'||unit==='CARTON')&&sfBox>0&&q.unit==='SF'&&q.n)return {qty:Math.ceil(q.n/sfBox),unit,note:`${q.n} SF ÷ ${sfBox} SF/${unit.toLowerCase()} → ${Math.ceil(q.n/sfBox)} ${unit.toLowerCase()}(s)`};
  if(num(x?.routeWarehouseQty)>0)return {qty:num(x.routeWarehouseQty),unit,note:'Using confirmed Warehouse quantity.'};
  return {qty:0,unit,note:'No explicit Product Master conversion is available. Confirm Warehouse quantity manually.'};
}
function setRouteInventory(x,inv){
  x.routeInventoryId=inv.id;x.routeDataset=datasetOf(inv);x.routeRecordId=recordOf(inv);x.routeWarehouseUnit=str(inv.unit).toUpperCase();x.routeItemKind=inv.kind;x.routeItemName=inv.name;x.routeColour=inv.colour;x.routeRoll=inv.roll||'';x.routeLocation=inv.location||'';x.routeMasterId=str(inv.raw?.masterId||'');
  if(inv.kind==='Carpet Roll')x.supplier=inv.roll||x.supplier||'STOCK';else x.supplier='STOCK';
  const s=suggestedWarehouseQty(x,inv);if(s.requested&&!num(x.routeRequestedLF))x.routeRequestedLF=Number(s.requested.toFixed(3));if(s.qty>0&&!num(x.routeWarehouseQty))x.routeWarehouseQty=Number(s.qty.toFixed(3));
}
function autoLink(x){if(x.routeInventoryId)return;const inv=bestInventory(x);if(inv)setRouteInventory(x,inv)}
function sourceWords(x){return norm([x.style,x.colour,x.routeItemName].join(' ')).split(/\s+/).filter(w=>w.length>3)}
function matchExisting(x,p){
  if(!p)return false;const t=str(p.type),roll=str(p.roll),pid=str(p.productId),product=str(p.product),ref=str(x.routeRecordId),inv=selectedInventory(x);
  if(lineType(x)==='CARPET_STOCK'){
    if(x.routeRoll&&roll&&norm(x.routeRoll)===norm(roll))return true;
    if(ref&&str(p.carpetRecordId)&&String(p.carpetRecordId)===String(inv?.raw?.id||''))return true;
    return /carpet cutting/i.test(t)&&sourceWords(x).filter(w=>norm([product,p.colour,p.collection].join(' ')).includes(w)).length>=1;
  }
  if(lineType(x)==='PRODUCT_STOCK'){
    if(x.routeMasterId&&pid&&norm(x.routeMasterId)===norm(pid))return true;
    const words=sourceWords(x),hay=norm(product);return /shipping|stock picking/i.test(t)&&words.filter(w=>hay.includes(w)).length>=1;
  }
  return false;
}
function applyExisting(x,p){
  x.routeExistingExecution=true;x.routeExistingOperationId=str(p.id);x.routeStatus='EXISTING_'+String(p.status||'WORK').toUpperCase().replace(/\s+/g,'_');
  if(lineType(x)==='CARPET_STOCK'){
    if(num(p.requestedQuantity))x.routeRequestedLF=num(p.requestedQuantity);if(num(p.numberOfCuts))x.routeCutCount=num(p.numberOfCuts);if(num(p.plannedStockQuantity||p.actualStockQuantity))x.routeWarehouseQty=num(p.plannedStockQuantity||p.actualStockQuantity);
  }else if(num(p.stockQuantity||p.quantity))x.routeWarehouseQty=num(p.stockQuantity||p.quantity);
}
async function client(){
  if(sb)return sb;for(let i=0;i<40&&!window.supabase?.createClient;i++)await sleep(200);if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});return sb;
}
async function refreshCloud(){
  const c=await client(),s=await c.auth.getSession();session=s?.data?.session||null;if(!session)throw new Error('Staff sign-in required');
  const q=await c.from('warehouse_records').select('dataset_key,record_id,payload,updated_at').in('dataset_key',['runlu_product_master_v21']).is('deleted_at',null).limit(500);if(q.error)throw q.error;
  masters=new Map((q.data||[]).map(r=>[str(r.record_id||r.payload?.id),r.payload||{}]));
  try{await window.RUNLUSmartInventoryPickerV072?.refresh?.(false)}catch(_){}
}
async function existingFor(po){
  const c=await client();const q=await c.from('warehouse_records').select('dataset_key,record_id,payload,updated_at').in('dataset_key',['runlu_operations_log_v52','runlu_cutting_log_v52']).contains('payload',{po:String(po)}).is('deleted_at',null).limit(100);if(q.error)throw q.error;existing=(q.data||[]).map(r=>r.payload||{});return existing;
}
function style(){if(by('r091style'))return;const s=document.createElement('style');s.id='r091style';s.textContent=`
.r091route{grid-column:1/-1;margin-top:7px;border:1px solid #d8e4de;border-left:4px solid #315f82;border-radius:8px;background:#f7faf8;padding:9px}.r091top{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}.r091top b{color:#173d30;font-size:11px}.r091dest{font-size:8px;font-weight:900;padding:4px 7px;border-radius:999px;background:#eaf1ee;color:#476056}.r091grid{display:grid;grid-template-columns:170px minmax(160px,1fr) 125px 125px;gap:7px;margin-top:8px;align-items:end}.r091grid label{font-size:8px;font-weight:900;color:#5b6a63}.r091grid input,.r091grid select,.r091grid textarea{width:100%;margin-top:3px;padding:7px;border:1px solid #cbd7d1;border-radius:6px;background:#fff;font-size:10px}.r091grid textarea{min-height:54px;resize:vertical}.r091wide{grid-column:span 2}.r091full{grid-column:1/-1}.r091linked{padding:7px;border-radius:6px;background:#edf5f0;color:#315947;font-size:9px}.r091warn{padding:7px;border-radius:6px;background:#fff4da;color:#745510;font-size:9px}.r091ok{padding:7px;border-radius:6px;background:#eaf5ee;color:#245b42;font-size:9px}.r091actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.r091summary{margin-top:12px;border:1px solid #d9e4df;border-radius:9px;background:#fff;padding:10px}.r091stats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.r091stat{text-align:center;border:1px solid #e1e8e4;border-radius:7px;padding:8px}.r091stat b{display:block;color:#173d30;font-size:18px}.r091stat span{font-size:8px;color:#708078}.r091modal{position:fixed;inset:0;z-index:110000;background:rgba(12,28,21,.62);display:flex;align-items:center;justify-content:center;padding:7px}.r091modal[hidden]{display:none}.r091box{width:min(920px,98vw);height:min(760px,94vh);background:#fff;border-radius:12px;display:grid;grid-template-rows:auto auto 1fr;overflow:hidden}.r091head{padding:12px 14px;background:#173d30;color:#fff;display:flex;justify-content:space-between;gap:10px}.r091tools{padding:9px;display:grid;grid-template-columns:1fr 150px;gap:7px;border-bottom:1px solid #dde5e1}.r091tools input,.r091tools select{padding:9px;border:1px solid #cbd7d1;border-radius:6px}.r091results{overflow:auto;padding:8px;background:#f5f8f6}.r091inv{width:100%;text-align:left;border:1px solid #d9e3de;border-radius:8px;background:#fff;padding:10px;margin-bottom:6px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px}.r091inv b{display:block;color:#173d30}.r091inv small{display:block;color:#718078;margin-top:2px}@media(max-width:760px){.r091grid{grid-template-columns:1fr 1fr}.r091wide,.r091full{grid-column:1/-1}.r091stats{grid-template-columns:1fr 1fr}.r091inv{grid-template-columns:1fr 1fr}.r091inv span:last-child{grid-column:1/-1}}
`;document.head.appendChild(s)}
function ensurePicker(){if(by('r091picker'))return;const w=document.createElement('div');w.id='r091picker';w.className='r091modal';w.hidden=true;w.innerHTML=`<div class="r091box"><div class="r091head"><div><b>Link Warehouse Inventory</b><div style="font-size:10px;opacity:.75">Read-only selection; linking does not change inventory.</div></div><button type="button" id="r091close">Close</button></div><div class="r091tools"><input id="r091q" placeholder="Search product, colour, roll, SKU, location"><select id="r091kind"><option value="all">All inventory</option><option value="carpet">Carpet rolls</option><option value="stock">Stock products</option></select></div><div id="r091results" class="r091results"></div></div>`;document.body.appendChild(w);by('r091close').onclick=()=>w.hidden=true;by('r091q').oninput=renderPicker;by('r091kind').onchange=renderPicker;w.addEventListener('click',e=>{if(e.target===w)w.hidden=true})}
let pickerIndex=-1;
function openPicker(i){pickerIndex=i;ensurePicker();const x=itemsNow()[i]||{},w=by('r091picker');w.hidden=false;by('r091kind').value=lineType(x)==='CARPET_STOCK'?'carpet':lineType(x)==='PRODUCT_STOCK'?'stock':'all';by('r091q').value=[x.style,x.colour,x.supplier].filter(Boolean).join(' ');renderPicker()}
function renderPicker(){const q=norm(by('r091q')?.value),kind=by('r091kind')?.value||'all';const words=q.split(/\s+/).filter(Boolean);const xs=inventory().filter(i=>kind==='all'||(kind==='carpet')===(i.kind==='Carpet Roll')).filter(i=>!words.length||words.every(w=>norm([i.name,i.colour,i.sku,i.roll,i.manufacturerRoll,i.location].join(' ')).includes(w))).slice(0,120);const el=by('r091results');if(!el)return;el.innerHTML=xs.length?xs.map(i=>`<button type="button" class="r091inv" data-r091-inv="${esc(i.id)}"><span><b>${esc(i.name)}</b><small>${esc(i.colour||i.sku||'—')}</small></span><span><b>${esc(i.roll?'Roll '+i.roll:i.sku||i.kind)}</b><small>${esc(i.location?'Location '+i.location:'—')}</small></span><span><b>${esc(Number(i.available||0).toLocaleString('en-CA',{maximumFractionDigits:2})+' '+i.unit+' available')}</b><small>${esc(i.status||'')}</small></span></button>`).join(''):'<div class="muted">No live Warehouse inventory matches.</div>';el.querySelectorAll('[data-r091-inv]').forEach(b=>b.onclick=()=>{const x=itemsNow()[pickerIndex],inv=inventory().find(i=>i.id===b.dataset.r091Inv);if(!x||!inv)return;setRouteInventory(x,inv);try{if(typeof editItem==='function')editItem(pickerIndex,'supplier',x.supplier||'')}catch(_){}by('r091picker').hidden=true;decorate();renderSummary()})}
function routeControl(x,i){
  if(!x.routeType)x.routeType=lineType(x);if(['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType))autoLink(x);const inv=selectedInventory(x),sg=suggestedWarehouseQty(x,inv);if(inv&&sg.qty>0&&!num(x.routeWarehouseQty))x.routeWarehouseQty=Number(sg.qty.toFixed(3));
  const service=x.routeType==='SERVICE',material=['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType),carpet=x.routeType==='CARPET_STOCK';
  const status=x.routeExistingExecution?`<div class="r091ok r091full"><b>EXISTING WORK FOUND</b> · ${esc(String(x.routeStatus||'').replace(/^EXISTING_/,'').replace(/_/g,' '))} · no duplicate Hold/task will be created.</div>`:x.routeStatus?`<div class="r091linked r091full">Route status: <b>${esc(x.routeStatus.replace(/_/g,' '))}</b></div>`:'';
  return `<div class="r091route" data-r091-route="${i}"><div class="r091top"><b>Line Routing · ${esc(routeLabel(x.routeType))}</b><span class="r091dest">${esc(routeDest(x.routeType))}</span></div><div class="r091grid"><label>Line Type<select data-r091-f="routeType"><option value="">Choose route</option><option value="CARPET_STOCK"${x.routeType==='CARPET_STOCK'?' selected':''}>Carpet Stock</option><option value="PRODUCT_STOCK"${x.routeType==='PRODUCT_STOCK'?' selected':''}>Product Stock</option><option value="SERVICE"${x.routeType==='SERVICE'?' selected':''}>Service</option><option value="NON_STOCK"${x.routeType==='NON_STOCK'?' selected':''}>Non-stock Material</option></select></label>${material?`<div class="r091wide"><label>Warehouse Link</label><div class="${inv?'r091linked':'r091warn'}">${inv?`${esc(inv.name)} · ${esc(inv.roll?'Roll '+inv.roll:inv.sku||inv.kind)} · ${esc(inv.location||'No location')}`:'No Warehouse record linked yet.'}</div><div class="r091actions"><button type="button" class="action" data-r091-link>Link Inventory</button></div></div><label>Warehouse Qty (${esc(inv?.unit||x.routeWarehouseUnit||'—')})<input data-r091-f="routeWarehouseQty" inputmode="decimal" value="${esc(x.routeWarehouseQty||'')}"></label>`:''}${carpet?`<label>Cut Count<input data-r091-f="routeCutCount" inputmode="numeric" value="${esc(x.routeCutCount||'')}"></label><label>Requested LF<input data-r091-f="routeRequestedLF" inputmode="decimal" value="${esc(x.routeRequestedLF||'')}"></label><label class="r091full">Cut Plan / Notes<textarea data-r091-f="routeCutPlan" placeholder="Example: 12×16; 12×14; 12×18 …">${esc(x.routeCutPlan||'')}</textarea></label>`:''}${material?`<div class="${sg.qty?'r091linked':'r091warn'} r091full">${esc(sg.note)}${inv?` · Warehouse available ${Number(inv.available||0).toLocaleString('en-CA',{maximumFractionDigits:2})} ${esc(inv.unit)}`:''}</div>`:''}${service?`<label>Service Type<select data-r091-f="routeServiceKind"><option value="Installation"${(x.routeServiceKind||'Installation')==='Installation'?' selected':''}>Installation</option><option value="Disposal"${x.routeServiceKind==='Disposal'?' selected':''}>Disposal</option><option value="Other"${x.routeServiceKind==='Other'?' selected':''}>Other Service</option></select></label><label>Assigned To<input data-r091-f="routeAssignee" value="${esc(x.routeAssignee||'')}"></label><div class="r091linked r091wide">Service lines stay on the Invoice and Accounting total; they never create Warehouse inventory movements.</div>`:''}${x.routeType==='NON_STOCK'?'<div class="r091warn r091full">Non-stock material routes to Supplier PO / Procurement. No Warehouse Hold or inventory deduction is created.</div>':''}${status}</div></div>`
}
function bindRoute(box,i){const x=itemsNow()[i];if(!x)return;box.querySelectorAll('[data-r091-f]').forEach(el=>{const k=el.dataset.r091F;el.addEventListener('change',()=>{x[k]=el.value;if(k==='routeType'){x.routeExistingExecution=false;x.routeStatus='';x.routeInventoryId='';x.routeRecordId='';x.routeDataset='';if(['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType))autoLink(x)}decorate();renderSummary()});el.addEventListener('input',()=>{x[k]=el.value;if(['routeCutCount','routeRequestedLF'].includes(k)){const inv=selectedInventory(x),sg=suggestedWarehouseQty(x,inv);if(sg.qty)x.routeWarehouseQty=Number(sg.qty.toFixed(3))}renderSummary()})});box.querySelector('[data-r091-link]')?.addEventListener('click',()=>openPicker(i))}
function decorate(){style();const rows=[...document.querySelectorAll('#itemsEditor .itemRow')],xs=itemsNow();rows.forEach((row,i)=>{row.querySelector('.r091route')?.remove();if(!xs[i])return;const wrap=document.createElement('div');wrap.innerHTML=routeControl(xs[i],i);const box=wrap.firstElementChild;row.appendChild(box);bindRoute(box,i)});ensureSummary();renderSummary()}
function ensureSummary(){const editor=by('itemsEditor');if(!editor)return;let s=by('r091summary');if(!s){s=document.createElement('div');s.id='r091summary';s.className='r091summary';s.innerHTML='<div class="statusLine"><div><h3 style="margin:0">Mixed Order Routing</h3><div class="muted">One customer order → Warehouse / Installation / Accounting. Physical inventory changes only when Warehouse executes.</div></div><button type="button" class="action primary" id="r091routeBtn">Route Saved Order</button></div><div id="r091stats" class="r091stats"></div><div id="r091msg" class="notice" style="margin-top:8px">Save the Job first, then route it.</div>';editor.parentNode.insertBefore(s,editor.nextSibling);by('r091routeBtn').addEventListener('click',routeSavedOrder)}}
function counts(xs){return {warehouse:xs.filter(x=>['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType||lineType(x))).length,install:xs.filter(x=>(x.routeType||lineType(x))==='SERVICE'&&(x.routeServiceKind||(/disposal/i.test(x.style||'')?'Disposal':'Installation'))==='Installation').length,service:xs.filter(x=>(x.routeType||lineType(x))==='SERVICE').length,procure:xs.filter(x=>(x.routeType||lineType(x))==='NON_STOCK').length}}
function renderSummary(){const s=by('r091stats');if(!s)return;const c=counts(itemsNow());s.innerHTML=`<div class="r091stat"><b>${c.warehouse}</b><span>Warehouse</span></div><div class="r091stat"><b>${c.install}</b><span>Installation</span></div><div class="r091stat"><b>${c.service}</b><span>Service / Accounting</span></div><div class="r091stat"><b>${c.procure}</b><span>Procurement</span></div>`}
async function detectExisting(j,xs){await existingFor(j.jobNumber);xs.forEach(x=>{if(!['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType||lineType(x)))return;const p=existing.find(p=>matchExisting(x,p));if(p)applyExisting(x,p)})}
async function placeHold(j,x,i){
  const inv=selectedInventory(x);if(!inv)throw new Error(`Line ${i+1}: link a Warehouse inventory record.`);const sg=suggestedWarehouseQty(x,inv),qty=num(x.routeWarehouseQty)||sg.qty;if(!(qty>0))throw new Error(`Line ${i+1}: confirm Warehouse quantity in ${inv.unit}.`);if(qty>num(inv.available)+.0001)throw new Error(`Line ${i+1}: requested ${qty} ${inv.unit} exceeds current available ${inv.available} ${inv.unit}.`);
  const c=await client(),holdKey=`job:${str(j.id||j.jobNumber)}|order:${str(j.jobNumber)}|line:${i}|r091`;const note=[`Customer order ${j.jobNumber} line ${i+1}`,`Invoice qty ${str(x.qty)}`,x.routeCutCount?`${x.routeCutCount} cut(s) × 3in allowance`:null,x.routeRequestedLF?`${x.routeRequestedLF} LF requested`:null,x.routeCutPlan?`Cuts: ${x.routeCutPlan}`:null].filter(Boolean).join(' · ');
  const r=await c.rpc('flooring_place_inventory_hold',{p_environment:ENV,p_dataset_key:datasetOf(inv),p_record_id:recordOf(inv),p_item_kind:str(inv.kind),p_item_name:str(inv.name),p_colour:str(inv.colour),p_roll_number:str(inv.roll||inv.manufacturerRoll),p_location:str(inv.location),p_job_id:str(j.id),p_job_number:str(j.jobNumber),p_po_number:str(j.jobNumber),p_hold_key:holdKey,p_quantity:qty,p_unit:str(inv.unit),p_note:note});if(r.error)throw r.error;x.routeHoldId=r.data?.id||'';x.routeStatus='WORK_PLAN_CREATED';x.routeWarehouseQty=qty;
}
function routeService(j,x,i){const kind=x.routeServiceKind||(/disposal/i.test(x.style||'')?'Disposal':'Installation');x.routeServiceKind=kind;if(kind==='Installation'){
    const who=str(x.routeAssignee||x.supplier);if(who){if(!j.installer||norm(j.installer)===norm(who))j.installer=who;else{x.routeStatus='REVIEW_INSTALLER_CONFLICT';return}}
    const memo=`Order ${j.jobNumber} · ${x.style||'Installation'}${x.qty?' · '+x.qty:''}`;j.installNotes=[str(j.installNotes),memo].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' | ');x.routeStatus='ROUTED_TO_INSTALLATION';
  }else{x.routeStatus='ROUTED_TO_ACCOUNTING'}
}
async function routeSavedOrder(){
  if(busy)return;const j=savedJob();if(!j||!str(j.jobNumber))return alert('Save a Job / Order number before routing.');if(!Array.isArray(j.items)||!j.items.length)return alert('This saved Order has no item lines.');busy=true;const btn=by('r091routeBtn'),msg=by('r091msg');if(btn){btn.disabled=true;btn.textContent='Routing…'}if(msg)msg.textContent='Checking existing Warehouse execution first…';
  try{
    await refreshCloud();j.items.forEach(x=>{if(!x.routeType)x.routeType=lineType(x);if(['CARPET_STOCK','PRODUCT_STOCK'].includes(x.routeType))autoLink(x)});await detectExisting(j,j.items);
    let created=0,existingCount=0,services=0,review=0;
    for(let i=0;i<j.items.length;i++){
      const x=j.items[i],t=x.routeType||lineType(x);x.routeType=t;if(['CARPET_STOCK','PRODUCT_STOCK'].includes(t)){
        if(x.routeExistingExecution){existingCount++;continue}await placeHold(j,x,i);created++;
      }else if(t==='SERVICE'){routeService(j,x,i);services++;if(/REVIEW/.test(x.routeStatus||''))review++}
      else if(t==='NON_STOCK'){x.routeStatus='SUPPLIER_PO_REQUIRED';review++}else{x.routeStatus='ROUTE_REQUIRED';review++}
    }
    try{if(typeof saveStore==='function')saveStore()}catch(_){}try{if(typeof loadEditor==='function')loadEditor()}catch(_){}decorate();
    if(msg)msg.innerHTML=`<b>Route complete.</b> ${created} new Warehouse work plan(s) · ${existingCount} existing Warehouse work item(s) reused · ${services} service line(s) · ${review} review item(s). No physical inventory was deducted by Routing.`;
  }catch(e){console.error('[Mixed Order Routing V091]',e);if(msg)msg.textContent='Routing stopped safely: '+(e?.message||e);alert('Routing stopped safely. No physical inventory was deducted. '+(e?.message||e))}
  finally{busy=false;if(btn){btn.disabled=false;btn.textContent='Route Saved Order'}}
}
function invoiceNotes(data){const xs=Array.isArray(data?.items)?data.items:[],notes=[];xs.forEach((x,i)=>{if((x.routeType||lineType(x))==='CARPET_STOCK'&&(x.routeCutPlan||x.routeCutCount||x.routeRequestedLF)){notes.push(`CUTS L${i+1}: ${x.routeCutPlan||[x.routeCutCount&&x.routeCutCount+' cuts',x.routeRequestedLF&&x.routeRequestedLF+' LF requested'].filter(Boolean).join(' · ')}`)}});return notes.join(' | ')}
function wrapInvoice(){try{if(window.__r091InvoiceWrapped||typeof window.prepareInvoice!=='function')return;const old=window.prepareInvoice;window.prepareInvoice=function(){const r=old.apply(this,arguments);try{const d=JSON.parse(localStorage.getItem(INV_BRIDGE)||'null');if(d){const n=invoiceNotes(d);if(n){d.notes=[str(d.notes),n].filter(Boolean).join(' | ');localStorage.setItem(INV_BRIDGE,JSON.stringify(d))}}}catch(_){}return r};window.__r091InvoiceWrapped=true}catch(_){} }
function install(){style();ensurePicker();ensureSummary();wrapInvoice();decorate();const target=by('itemsEditor')||document.body;observer=new MutationObserver(()=>setTimeout(decorate,0));observer.observe(target,{childList:true,subtree:true});document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;if(b.dataset?.page==='jobs'||b.textContent?.trim()==='Jobs'||b.textContent?.includes('Save Job')||b.textContent?.trim()==='+ Item')setTimeout(()=>{wrapInvoice();decorate()},80)},true);window.addEventListener('pageshow',()=>setTimeout(()=>{wrapInvoice();decorate()},80));refreshCloud().then(()=>{decorate()}).catch(()=>{});window.RUNLUMixedOrderRoutingV091={routeSavedOrder,detectExisting,version:'0.3.91'} }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
