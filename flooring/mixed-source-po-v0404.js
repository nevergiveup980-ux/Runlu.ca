/* RUNLU Deerfoot Flooring OS · V0.4.04 Mixed-Source PO Preview
   One PO can contain Inventory + Supplier + Labour + Fee lines.
   Database Fields and Table Entry are two synchronized views of one PO draft.
   Writes only to existing Flooring PO / Job browser stores; no inventory mutation.
*/
(function(root){
'use strict';

const VERSION='0.4.04';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE_JOB='runlu_deerfoot_flooring_active_job_v1';
const SOURCE_TYPES=['INVENTORY','SUPPLIER','LABOUR','FEE'];
const UNITS=['sy','sf','carton','box','roll','ea','pail','bucket','tube','gal','lft'];

const str=v=>String(v??'').trim();
const num=v=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
const round2=n=>Math.round((Number(n)||0)*100)/100;
const money=n=>'$'+round2(n).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const today=()=>new Date().toISOString().slice(0,10);
const uid=(p='line')=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);

function defaultFulfillment(source){
  if(source==='INVENTORY')return 'Reserve / Cut';
  if(source==='SUPPLIER')return 'Pickup from Supplier';
  return 'N/A';
}
function defaultStatus(source){
  if(source==='INVENTORY')return 'Needed';
  if(source==='SUPPLIER')return 'Draft';
  if(source==='LABOUR')return 'Planned';
  if(source==='FEE')return 'Planned';
  return 'Unclassified';
}
function normalizeSource(v){const x=str(v).toUpperCase();return SOURCE_TYPES.includes(x)?x:''}
function blankLine(source='SUPPLIER'){
  const s=normalizeSource(source)||'SUPPLIER';
  return {id:uid('po-line'),description:'',style:'',colour:'',qty:0,unit:'sy',sourceType:s,supplier:'',sku:'',rollNumber:'',warehouseLocation:'',fulfillment:defaultFulfillment(s),workflowStatus:defaultStatus(s),unitCost:0,lineTotal:0,note:''}
}
function normalizeLine(line={},header={}){
  const legacyPurchase=str(header.purchaseType);
  let source=normalizeSource(line.sourceType);
  if(!source&&legacyPurchase==='Stock')source='INVENTORY';
  if(!source&&legacyPurchase==='Job-specific'&&(str(line.supplier)||str(header.supplier)))source='SUPPLIER';
  const out={
    id:str(line.id)||uid('po-line'),
    description:str(line.description||line.product||line.style),
    style:str(line.style||line.product),
    colour:str(line.colour||line.color),
    qty:num(line.qty),
    unit:str(line.unit||'sy').toLowerCase(),
    sourceType:source,
    supplier:str(line.supplier||header.supplier),
    sku:str(line.sku),
    rollNumber:str(line.rollNumber||line.rollNo||line.roll),
    warehouseLocation:str(line.warehouseLocation||line.location||line.bin),
    fulfillment:str(line.fulfillment),
    workflowStatus:str(line.workflowStatus||line.lineStatus),
    unitCost:num(line.unitCost),
    lineTotal:num(line.lineTotal),
    note:str(line.note||line.notes)
  };
  if(!out.fulfillment)out.fulfillment=defaultFulfillment(source);
  if(!out.workflowStatus)out.workflowStatus=defaultStatus(source);
  if(source!=='SUPPLIER')out.supplier=source==='INVENTORY'?out.supplier:'';
  if(!UNITS.includes(out.unit))out.unit=str(line.unit||'sy').toLowerCase();
  return out
}
function lineAmount(line){const direct=num(line&&line.lineTotal);return direct||round2(num(line&&line.qty)*num(line&&line.unitCost))}
function sourceTypes(items){return [...new Set((items||[]).map(x=>normalizeSource(x.sourceType)).filter(Boolean))]}
function isMixedSource(items){return sourceTypes(items).length>1}
function legacyPurchaseType(items){
  const types=sourceTypes(items);
  if(types.length===1&&types[0]==='INVENTORY')return 'Stock';
  return 'Job-specific';
}
function legacySupplier(items,existing=''){
  const suppliers=[...new Set((items||[]).filter(x=>normalizeSource(x.sourceType)==='SUPPLIER').map(x=>str(x.supplier)).filter(Boolean))];
  if(suppliers.length===1)return suppliers[0];
  return suppliers.length>1?'':str(existing);
}
function legacyFulfillment(items,existing='Pickup'){
  const vals=[...new Set((items||[]).filter(x=>normalizeSource(x.sourceType)==='SUPPLIER').map(x=>str(x.fulfillment)).filter(Boolean))];
  return vals.length===1?vals[0]:str(existing)||'Pickup';
}
function normalizePO(po={},job={}){
  const items=Array.isArray(po.items)?po.items.map(x=>normalizeLine(x,po)):[];
  return {
    id:str(po.id)||uid('po'),
    schemaVersion:2,
    mode:str(po.mode||'manual'),
    poNumber:str(po.poNumber),
    jobId:str(po.jobId||job.id),
    jobNumber:str(po.jobNumber||job.jobNumber),
    customerName:str(po.customerName||job.customerName),
    salesRep:str(po.salesRep||job.clerk),
    orderDate:str(po.orderDate)||today(),
    expectedDate:str(po.expectedDate),
    requestedDate:str(po.requestedDate),
    status:str(po.status||'Draft'),
    notes:str(po.notes),
    items,
    sourceTypes:sourceTypes(items),
    mixedSource:isMixedSource(items),
    purchaseType:legacyPurchaseType(items),
    supplier:legacySupplier(items,po.supplier),
    fulfillment:legacyFulfillment(items,po.fulfillment),
    subtotal:round2(items.reduce((s,x)=>s+lineAmount(x),0)),
    createdAt:str(po.createdAt)||new Date().toISOString(),
    updatedAt:str(po.updatedAt)
  }
}
function setHeaderField(po,key,value){
  const out=normalizePO(po);
  if(['poNumber','jobId','jobNumber','customerName','salesRep','orderDate','expectedDate','requestedDate','status','notes','mode'].includes(key))out[key]=str(value);
  return normalizePO(out);
}
function updateLine(po,lineId,key,value){
  const out=normalizePO(po),x=out.items.find(v=>v.id===lineId);if(!x)return out;
  if(['qty','unitCost','lineTotal'].includes(key))x[key]=num(value);
  else if(key==='sourceType'){
    const old=x.sourceType;x.sourceType=normalizeSource(value);
    if(old!==x.sourceType){
      x.fulfillment=defaultFulfillment(x.sourceType);
      x.workflowStatus=defaultStatus(x.sourceType);
      if(x.sourceType!=='SUPPLIER'&&x.sourceType!=='INVENTORY')x.supplier='';
    }
  }else x[key]=str(value);
  return normalizePO(out);
}
function addLine(po,source='SUPPLIER'){const out=normalizePO(po);out.items.push(blankLine(source));return normalizePO(out)}
function removeLine(po,lineId){const out=normalizePO(po);out.items=out.items.filter(x=>x.id!==lineId);return normalizePO(out)}
function executionPlan(po){
  const x=normalizePO(po),groups={INVENTORY:[],SUPPLIER:[],LABOUR:[],FEE:[],UNCLASSIFIED:[]};
  x.items.forEach(line=>{const s=normalizeSource(line.sourceType);(groups[s]||groups.UNCLASSIFIED).push(line)});
  const suppliers={};groups.SUPPLIER.forEach(line=>{const k=str(line.supplier)||'Supplier not set';(suppliers[k]||(suppliers[k]=[])).push(line)});
  return {
    groups,suppliers,
    inventoryCount:groups.INVENTORY.length,
    supplierCount:groups.SUPPLIER.length,
    labourCount:groups.LABOUR.length,
    feeCount:groups.FEE.length,
    unclassifiedCount:groups.UNCLASSIFIED.length,
    totalLines:x.items.length,
    subtotal:x.subtotal,
    mixedSource:x.mixedSource
  }
}
function receiptEligibility(line){const s=normalizeSource(line&&line.sourceType);return {warehouseReceive:s==='SUPPLIER',inventoryAllocate:s==='INVENTORY',nonMaterial:s==='LABOUR'||s==='FEE'}}
function applyPO(existing,po){
  const base={...(existing||{})},x=normalizePO(po),stamp=new Date().toISOString();
  const items=x.items.map(v=>({...v,lineTotal:lineAmount(v)}));
  const merged={...base,...x,items,sourceTypes:sourceTypes(items),mixedSource:isMixedSource(items),purchaseType:legacyPurchaseType(items),supplier:legacySupplier(items,base.supplier),fulfillment:legacyFulfillment(items,base.fulfillment),subtotal:round2(items.reduce((s,v)=>s+lineAmount(v),0)),updatedAt:stamp};
  return merged
}
function canSavePO(po){const x=normalizePO(po);return !!x.jobId&&x.items.every(i=>!!normalizeSource(i.sourceType))}

const api={VERSION,PO_STORE,JOB_STORE,ACTIVE_JOB,SOURCE_TYPES,UNITS,str,num,round2,money,defaultFulfillment,defaultStatus,normalizeSource,blankLine,normalizeLine,lineAmount,sourceTypes,isMixedSource,legacyPurchaseType,legacySupplier,legacyFulfillment,normalizePO,setHeaderField,updateLine,addLine,removeLine,executionPlan,receiptEligibility,applyPO,canSavePO};
root.RUNLUMixedSourcePOV0404=api;
if(typeof document==='undefined')return;

let jobs=[],records=[],activeJobId='',activePOId='',draft=normalizePO(),view='fields',dirty=false;
const by=id=>document.getElementById(id);
function loadStore(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}}
function saveStores(){
  localStorage.setItem(PO_STORE,JSON.stringify(records));
  if(activeJobId)localStorage.setItem(ACTIVE_JOB,activeJobId);
}
function activeJob(){return jobs.find(j=>j.id===activeJobId)||null}
function activeRecord(){return records.find(x=>x.id===activePOId)||null}
function setDirty(){dirty=true;const x=by('ms404dirty');if(x)x.textContent='Unsaved changes'}
function clearDirty(){dirty=false;const x=by('ms404dirty');if(x)x.textContent='Saved to PO store'}
function newDraft(){
  const j=activeJob();if(!j){alert('Select a Job first.');return}
  activePOId='';draft=normalizePO({jobId:j.id,jobNumber:j.jobNumber,customerName:j.customerName,salesRep:j.clerk,status:'Draft',items:[blankLine('INVENTORY'),blankLine('SUPPLIER')]},j);dirty=true;renderAll()
}
function selectJob(id){
  if(dirty&&!confirm('Discard unsaved PO edits and switch jobs?'))return;
  activeJobId=id;localStorage.setItem(ACTIVE_JOB,id||'');
  const found=records.find(x=>x.jobId===id);activePOId=found?.id||'';draft=normalizePO(found||{},activeJob()||{});dirty=false;renderAll()
}
function selectPO(id){
  if(dirty&&!confirm('Discard unsaved PO edits and open another PO?'))return;
  activePOId=id;const r=activeRecord();activeJobId=r?.jobId||activeJobId;if(activeJobId)localStorage.setItem(ACTIVE_JOB,activeJobId);draft=normalizePO(r||{},activeJob()||{});dirty=false;renderAll()
}
function syncJobReference(po){
  const j=jobs.find(x=>x.id===po.jobId);if(!j||!po.poNumber)return;
  const nums=records.filter(x=>x.jobId===po.jobId&&x.poNumber&&x.status!=='Cancelled').map(x=>x.poNumber).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
  j.supplierPO=nums.join(', ');
  localStorage.setItem(JOB_STORE,JSON.stringify(jobs));
}
function savePO(){
  if(!canSavePO(draft)){alert('Every PO line needs a Source Type, and the PO must be linked to a Job.');return}
  const existing=activeRecord(),out=applyPO(existing,draft),i=records.findIndex(x=>x.id===out.id);
  if(i>=0)records[i]=out;else records.unshift(out);
  activePOId=out.id;saveStores();syncJobReference(out);draft=normalizePO(out,activeJob()||{});clearDirty();renderAll();alert('Mixed-source PO saved. No inventory or receiving action was executed.')
}
function load(){
  jobs=loadStore(JOB_STORE);records=loadStore(PO_STORE);
  activeJobId=localStorage.getItem(ACTIVE_JOB)||jobs.find(j=>!j.isDemo)?.id||jobs[0]?.id||'';
  if(!jobs.some(j=>j.id===activeJobId))activeJobId=jobs[0]?.id||'';
  const found=records.find(x=>x.jobId===activeJobId);activePOId=found?.id||'';draft=normalizePO(found||{},activeJob()||{});renderAll()
}
function headerFields(){
  return `<div class="ms404headerGrid">
    <label><span>PO / Paper Reference</span><input data-ms404-head="poNumber" value="${attr(draft.poNumber)}"><small>poNumber</small></label>
    <label><span>Order Date</span><input type="date" data-ms404-head="orderDate" value="${attr(draft.orderDate)}"><small>orderDate</small></label>
    <label><span>Expected Date</span><input type="date" data-ms404-head="expectedDate" value="${attr(draft.expectedDate)}"><small>expectedDate</small></label>
    <label><span>Pickup / Receiving Date</span><input type="date" data-ms404-head="requestedDate" value="${attr(draft.requestedDate)}"><small>requestedDate</small></label>
    <label><span>Customer</span><input data-ms404-head="customerName" value="${attr(draft.customerName)}"><small>customerName</small></label>
    <label><span>Sales Rep</span><input data-ms404-head="salesRep" value="${attr(draft.salesRep)}"><small>salesRep</small></label>
    <label><span>Status</span><select data-ms404-head="status">${['Draft','Issued','Sent','Confirmed','Partially Received','Received','Completed','Cancelled'].map(s=>'<option'+(draft.status===s?' selected':'')+'>'+s+'</option>').join('')}</select><small>status</small></label>
    <label class="wide"><span>Notes</span><textarea data-ms404-head="notes">${esc(draft.notes)}</textarea><small>notes</small></label>
  </div>`
}
function sourceOptions(v){return '<option value="">— Source —</option>'+SOURCE_TYPES.map(s=>'<option value="'+s+'"'+(v===s?' selected':'')+'>'+s+'</option>').join('')}
function unitOptions(v){return UNITS.map(s=>'<option value="'+s+'"'+(v===s?' selected':'')+'>'+s.toUpperCase()+'</option>').join('')}
function fulfillmentOptions(x){
  const vals=x.sourceType==='INVENTORY'?['Reserve / Cut','Allocate','N/A']:x.sourceType==='SUPPLIER'?['Pickup from Supplier','Supplier Delivery','N/A']:['N/A'];
  return vals.map(s=>'<option'+(x.fulfillment===s?' selected':'')+'>'+s+'</option>').join('')
}
function statusOptions(x){
  const vals=x.sourceType==='INVENTORY'?['Needed','Reserved','Cut','Allocated','Completed']:
    x.sourceType==='SUPPLIER'?['Draft','Ordered','Confirmed','Partially Received','Received','Completed']:
    x.sourceType==='LABOUR'?['Planned','Scheduled','Completed']:
    x.sourceType==='FEE'?['Planned','Applied','Completed']:['Unclassified'];
  return vals.map(s=>'<option'+(x.workflowStatus===s?' selected':'')+'>'+s+'</option>').join('')
}
function fieldCards(){
  const rows=draft.items.map((x,i)=>`<div class="ms404lineCard ${x.sourceType.toLowerCase()||'unclassified'}">
    <div class="ms404lineNo">${i+1}</div>
    <label class="desc"><span>Description / Style</span><input data-ms404-line="${attr(x.id)}" data-key="description" value="${attr(x.description)}"></label>
    <label><span>Colour</span><input data-ms404-line="${attr(x.id)}" data-key="colour" value="${attr(x.colour)}"></label>
    <label><span>Qty</span><input type="number" step="0.01" data-ms404-line="${attr(x.id)}" data-key="qty" value="${x.qty}"></label>
    <label><span>Unit</span><select data-ms404-line="${attr(x.id)}" data-key="unit">${unitOptions(x.unit)}</select></label>
    <label><span>Source Type</span><select data-ms404-line="${attr(x.id)}" data-key="sourceType">${sourceOptions(x.sourceType)}</select></label>
    <label><span>Supplier</span><input data-ms404-line="${attr(x.id)}" data-key="supplier" value="${attr(x.supplier)}" placeholder="${x.sourceType==='SUPPLIER'?'Required for supplier line':'Optional'}"></label>
    <label><span>SKU / Product ID</span><input data-ms404-line="${attr(x.id)}" data-key="sku" value="${attr(x.sku)}"></label>
    <label><span>Roll #</span><input data-ms404-line="${attr(x.id)}" data-key="rollNumber" value="${attr(x.rollNumber)}"></label>
    <label><span>Warehouse Location</span><input data-ms404-line="${attr(x.id)}" data-key="warehouseLocation" value="${attr(x.warehouseLocation)}"></label>
    <label><span>Fulfillment</span><select data-ms404-line="${attr(x.id)}" data-key="fulfillment">${fulfillmentOptions(x)}</select></label>
    <label><span>Line Status</span><select data-ms404-line="${attr(x.id)}" data-key="workflowStatus">${statusOptions(x)}</select></label>
    <label><span>Unit Cost</span><input type="number" step="0.01" data-ms404-line="${attr(x.id)}" data-key="unitCost" value="${x.unitCost}"></label>
    <label><span>Line Total</span><input disabled data-ms404-total="${attr(x.id)}" value="${money(lineAmount(x))}"></label>
    <label class="note"><span>Line Note</span><input data-ms404-line="${attr(x.id)}" data-key="note" value="${attr(x.note)}"></label>
    <button type="button" class="danger" data-ms404-remove="${attr(x.id)}">×</button>
  </div>`).join('');
  return `<div class="ms404sourceButtons"><button data-ms404-add="INVENTORY">+ Inventory Line</button><button data-ms404-add="SUPPLIER">+ Supplier Line</button><button data-ms404-add="LABOUR">+ Labour Line</button><button data-ms404-add="FEE">+ Fee Line</button></div><div class="ms404cards">${rows||'<div class="empty">No lines yet.</div>'}</div>`
}
function tableEntry(){
  const rows=draft.items.map((x,i)=>`<tr class="${x.sourceType.toLowerCase()||'unclassified'}">
    <td>${i+1}</td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="description" value="${attr(x.description)}"></td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="colour" value="${attr(x.colour)}"></td>
    <td><input type="number" step="0.01" data-ms404-line="${attr(x.id)}" data-key="qty" value="${x.qty}"></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="unit">${unitOptions(x.unit)}</select></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="sourceType">${sourceOptions(x.sourceType)}</select></td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="supplier" value="${attr(x.supplier)}"></td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="sku" value="${attr(x.sku)}"></td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="rollNumber" value="${attr(x.rollNumber)}"></td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="warehouseLocation" value="${attr(x.warehouseLocation)}"></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="fulfillment">${fulfillmentOptions(x)}</select></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="workflowStatus">${statusOptions(x)}</select></td>
    <td><input type="number" step="0.01" data-ms404-line="${attr(x.id)}" data-key="unitCost" value="${x.unitCost}"></td>
    <td class="money" data-ms404-total="${attr(x.id)}">${money(lineAmount(x))}</td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="note" value="${attr(x.note)}"></td>
    <td><button type="button" class="danger" data-ms404-remove="${attr(x.id)}">×</button></td>
  </tr>`).join('');
  return `<div class="ms404sourceButtons"><button data-ms404-add="INVENTORY">+ Inventory</button><button data-ms404-add="SUPPLIER">+ Supplier</button><button data-ms404-add="LABOUR">+ Labour</button><button data-ms404-add="FEE">+ Fee</button></div><div class="ms404tableWrap"><table><thead><tr><th>#</th><th>Description</th><th>Colour</th><th>Qty</th><th>Unit</th><th>Source</th><th>Supplier</th><th>SKU</th><th>Roll #</th><th>Location</th><th>Fulfillment</th><th>Status</th><th>Unit Cost</th><th>Total</th><th>Note</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="16" class="empty">No rows yet.</td></tr>'}</tbody></table></div>`
}
function bindEditor(scope){
  scope.querySelectorAll('[data-ms404-head]').forEach(el=>el.oninput=()=>{draft=setHeaderField(draft,el.dataset.ms404Head,el.value);setDirty();renderDerived()});
  scope.querySelectorAll('[data-ms404-line]').forEach(el=>el.oninput=()=>{
    const key=el.dataset.key;draft=updateLine(draft,el.dataset.ms404Line,key,el.value);setDirty();
    if(key==='sourceType'){renderEditor();renderDerived();return}
    const line=draft.items.find(x=>x.id===el.dataset.ms404Line),t=scope.querySelector('[data-ms404-total="'+CSS.escape(el.dataset.ms404Line)+'"]');if(line&&t){const v=money(lineAmount(line));if(t.tagName==='INPUT')t.value=v;else t.textContent=v}
    renderDerived()
  });
  scope.querySelectorAll('[data-ms404-add]').forEach(b=>b.onclick=()=>{draft=addLine(draft,b.dataset.ms404Add);setDirty();renderEditor();renderDerived()});
  scope.querySelectorAll('[data-ms404-remove]').forEach(b=>b.onclick=()=>{draft=removeLine(draft,b.dataset.ms404Remove);setDirty();renderEditor();renderDerived()});
}
function renderEditor(){
  const el=by('ms404editor');if(!el)return;
  el.innerHTML=headerFields()+'<div class="ms404divider"></div>'+(view==='fields'?fieldCards():tableEntry());bindEditor(el);
  document.querySelectorAll('[data-ms404-view]').forEach(b=>b.classList.toggle('active',b.dataset.ms404View===view))
}
function renderSelectors(){
  const js=by('ms404job');if(js){
    js.innerHTML='<option value="">— Select Job —</option>'+jobs.map(j=>'<option value="'+attr(j.id)+'">'+(j.isDemo?'DEMO · ':'')+esc(j.jobNumber||'No #')+' · '+esc(j.customerName||'Unnamed customer')+'</option>').join('');
    js.value=activeJobId;js.onchange=()=>selectJob(js.value)
  }
  const ps=by('ms404po');if(ps){
    const xs=records.filter(x=>!activeJobId||x.jobId===activeJobId);
    ps.innerHTML='<option value="">— New / Unsaved —</option>'+xs.map(x=>'<option value="'+attr(x.id)+'">'+esc(x.poNumber||'Draft')+' · '+esc(x.customerName||'')+(x.mixedSource?' · MIXED':'')+'</option>').join('');
    ps.value=activePOId;ps.onchange=()=>selectPO(ps.value)
  }
}
function sourceBadge(line){
  const s=normalizeSource(line.sourceType)||'UNCLASSIFIED';
  if(s==='INVENTORY')return 'STOCK'+(line.rollNumber?' · Roll '+esc(line.rollNumber):'')+(line.warehouseLocation?' · '+esc(line.warehouseLocation):'');
  if(s==='SUPPLIER')return esc(line.supplier||'Supplier not set')+(line.sku?' · '+esc(line.sku):'');
  return s
}
function renderDerived(){
  const p=executionPlan(draft),sum=by('ms404summary');
  if(sum)sum.innerHTML=`<div><small>Total Lines</small><b>${p.totalLines}</b></div><div><small>Inventory</small><b>${p.inventoryCount}</b></div><div><small>Supplier</small><b>${p.supplierCount}</b></div><div><small>Labour / Fee</small><b>${p.labourCount+p.feeCount}</b></div><div class="${p.mixedSource?'mixed':''}"><small>Source Model</small><b>${p.mixedSource?'MIXED':'SINGLE'}</b></div><div><small>PO Subtotal</small><b>${money(p.subtotal)}</b></div>`;
  const plan=by('ms404plan');if(plan){
    const supplierGroups=Object.entries(p.suppliers).map(([name,xs])=>'<div class="planRow supplier"><b>'+esc(name)+'</b><span>'+xs.length+' supplier line'+(xs.length===1?'':'s')+' · receive when actually received</span></div>').join('');
    plan.innerHTML=`<div class="planRow inventory"><b>Inventory / Stock</b><span>${p.inventoryCount} line${p.inventoryCount===1?'':'s'} · Reserve / Cut / Allocate · no Supplier Receiving</span></div>${supplierGroups||'<div class="planRow supplier"><b>Supplier</b><span>0 lines</span></div>'}<div class="planRow neutral"><b>Labour / Fee</b><span>${p.labourCount+p.feeCount} line${p.labourCount+p.feeCount===1?'':'s'} · never touches material inventory</span></div>${p.unclassifiedCount?'<div class="planRow warn"><b>Unclassified</b><span>'+p.unclassifiedCount+' line(s) need a Source Type before save</span></div>':''}`
  }
  const paper=by('ms404paper');if(paper){
    const rows=draft.items.map(x=>`<tr><td>${x.qty||''}</td><td>${esc(x.unit.toUpperCase())}</td><td>${esc(x.description||'—')}</td><td>${esc(x.colour)}</td><td>${sourceBadge(x)}</td><td>${esc(x.workflowStatus)}</td></tr>`).join('');
    paper.innerHTML=`<div class="paperTop"><div><b>Deerfoot Carpet & Flooring</b><small>Mixed-Source PO / Material Order · V0.4.04</small></div><div><b>${esc(draft.poNumber||'DRAFT')}</b><small>${esc(draft.orderDate)}</small></div></div><div class="paperMeta"><span>Job: <b>${esc(draft.jobNumber||'—')}</b></span><span>Customer: <b>${esc(draft.customerName||'—')}</b></span><span>Sales: <b>${esc(draft.salesRep||'—')}</b></span></div><table><thead><tr><th>QTY</th><th>UNIT</th><th>STYLE / PRODUCT</th><th>COLOUR</th><th>SUPPLIER / STOCK</th><th>LINE STATUS</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No lines</td></tr>'}</tbody></table><div class="paperNote"><b>Notes:</b> ${esc(draft.notes||'—')}</div>`
  }
  const save=by('ms404save');if(save)save.disabled=!canSavePO(draft)
}
function renderAll(){renderSelectors();renderEditor();renderDerived();const s=by('ms404dirty');if(s)s.textContent=dirty?'Unsaved changes':(activePOId?'Saved PO loaded':'New draft')}
function bind(){
  by('ms404new').onclick=newDraft;by('ms404save').onclick=savePO;by('ms404print').onclick=()=>window.print();
  document.querySelectorAll('[data-ms404-view]').forEach(b=>b.onclick=()=>{view=b.dataset.ms404View;renderEditor()})
}
function boot(){bind();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
