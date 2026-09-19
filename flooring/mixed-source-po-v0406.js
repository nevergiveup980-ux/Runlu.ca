/* RUNLU Deerfoot Flooring OS · V0.4.06 Mixed-Source Execution Reconciliation Preview
   One PO can contain Inventory + Supplier + Labour + Fee lines.
   Database Fields and Table Entry are two synchronized views of one PO draft.
   Writes only to existing Flooring PO / Job browser stores; no inventory mutation.
*/
(function(root){
'use strict';

const VERSION='0.4.06';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE_JOB='runlu_deerfoot_flooring_active_job_v1';
const SOURCE_TYPES=['INVENTORY','SUPPLIER','LABOUR','FEE'];
const UNITS=['sy','sf','carton','box','roll','ea','pail','bucket','tube','gal','lft'];
const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH_STORAGE='runlu-flooring-auth-v1';
const ENV='training';
const HOLD_TABLE='flooring_inventory_holds';
const WAREHOUSE_DATASETS=['runlu_carpet_inventory_v52','runlu_inventory_records_v21','runlu_product_master_v21'];

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
  return {id:uid('po-line'),description:'',style:'',colour:'',qty:0,unit:'sy',sourceType:s,supplier:'',sku:'',rollNumber:'',warehouseLocation:'',warehouseDatasetKey:'',warehouseRecordId:'',warehouseUnit:'',warehouseAvailable:0,holdQuantity:0,fulfillment:defaultFulfillment(s),workflowStatus:defaultStatus(s),unitCost:0,lineTotal:0,note:''}
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
    warehouseDatasetKey:str(line.warehouseDatasetKey),
    warehouseRecordId:str(line.warehouseRecordId),
    warehouseUnit:str(line.warehouseUnit).toUpperCase(),
    warehouseAvailable:num(line.warehouseAvailable),
    holdQuantity:num(line.holdQuantity),
    executionEvidence:Array.isArray(line.executionEvidence)?line.executionEvidence.map(str).filter(Boolean):[],
    executionSyncedAt:str(line.executionSyncedAt),
    fulfillment:str(line.fulfillment),
    workflowStatus:str(line.workflowStatus||line.lineStatus),
    unitCost:num(line.unitCost),
    lineTotal:num(line.lineTotal),
    note:str(line.note||line.notes)
  };
  if(!out.fulfillment)out.fulfillment=defaultFulfillment(source);
  if(!out.workflowStatus)out.workflowStatus=defaultStatus(source);
  if(source!=='SUPPLIER')out.supplier='';
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
  if(['qty','unitCost','lineTotal','warehouseAvailable','holdQuantity'].includes(key))x[key]=num(value);
  else if(key==='sourceType'){
    const old=x.sourceType;x.sourceType=normalizeSource(value);
    if(old!==x.sourceType){
      x.fulfillment=defaultFulfillment(x.sourceType);
      x.workflowStatus=defaultStatus(x.sourceType);
      if(x.sourceType!=='SUPPLIER')x.supplier='';
      if(x.sourceType!=='INVENTORY'){x.warehouseDatasetKey='';x.warehouseRecordId='';x.warehouseUnit='';x.warehouseAvailable=0;x.holdQuantity=0;x.rollNumber='';x.warehouseLocation=''}
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
function inventoryHoldKey(po,line){const p=po&&po.schemaVersion===2?po:normalizePO(po),x=normalizeLine(line);return 'mixed:'+str(p.id)+'|job:'+str(p.jobId||p.jobNumber)+'|inventory:'+str(x.warehouseRecordId||'unlinked')+'|line:'+str(x.id)}
function inventoryHoldEligibility(line){
  const x=normalizeLine(line);
  if(x.sourceType!=='INVENTORY')return {ok:false,reason:'Not an INVENTORY line'};
  if(!x.warehouseDatasetKey||!x.warehouseRecordId)return {ok:false,reason:'Live Warehouse inventory record is not linked'};
  if(!(x.holdQuantity>0))return {ok:false,reason:'Warehouse Hold Qty is required'};
  if(!x.warehouseUnit)return {ok:false,reason:'Warehouse unit is missing'};
  if(x.warehouseAvailable>0&&x.holdQuantity>x.warehouseAvailable+.0001)return {ok:false,reason:'Hold Qty exceeds live Warehouse available quantity'};
  return {ok:true,reason:''}
}
function supplierPlanEligibility(po){
  const p=normalizePO(po),xs=p.items.filter(x=>x.sourceType==='SUPPLIER');
  if(!xs.length)return {ok:true,skip:true,reason:'No SUPPLIER lines',supplier:'',fulfillment:''};
  const suppliers=[...new Set(xs.map(x=>str(x.supplier)).filter(Boolean))];
  if(xs.some(x=>!str(x.supplier)))return {ok:false,skip:false,reason:'Every SUPPLIER line needs Supplier',supplier:'',fulfillment:''};
  if(suppliers.length!==1)return {ok:false,skip:false,reason:'Current Warehouse backend supports one supplier plan per PO; split different suppliers into separate POs',supplier:'',fulfillment:''};
  const fulf=[...new Set(xs.map(x=>str(x.fulfillment)).filter(Boolean))];
  if(fulf.length>1)return {ok:false,skip:false,reason:'Supplier lines on one PO need one fulfillment method',supplier:suppliers[0],fulfillment:''};
  const digits=String(p.poNumber||'').replace(/\D/g,'');
  if(!digits)return {ok:false,skip:false,reason:'PO number is required before staging Supplier work',supplier:suppliers[0],fulfillment:fulf[0]||''};
  return {ok:true,skip:false,reason:'',supplier:suppliers[0],fulfillment:fulf[0]||'Pickup from Supplier'}
}
function executionRouting(po){
  const p=normalizePO(po),plan=executionPlan(p),blockers=[],inventory=p.items.filter(x=>x.sourceType==='INVENTORY'),supplier=p.items.filter(x=>x.sourceType==='SUPPLIER');
  inventory.forEach((x,i)=>{const e=inventoryHoldEligibility(x);if(!e.ok)blockers.push({lineId:x.id,kind:'INVENTORY',label:x.description||x.style||('Inventory line '+(i+1)),reason:e.reason})});
  const se=supplierPlanEligibility(p);if(!se.ok)blockers.push({lineId:'',kind:'SUPPLIER',label:'Supplier plan',reason:se.reason});
  return {plan,inventory,supplier,labour:p.items.filter(x=>x.sourceType==='LABOUR'),fee:p.items.filter(x=>x.sourceType==='FEE'),supplierEligibility:se,blockers,ready:blockers.length===0}
}
function buildHoldPayload(po,line,userId){
  const p=normalizePO(po),x=normalizeLine(line),e=inventoryHoldEligibility(x);if(!e.ok)throw new Error(e.reason);
  const stamp=new Date().toISOString();
  return {user_id:str(userId),environment:ENV,warehouse_dataset_key:x.warehouseDatasetKey,warehouse_record_id:x.warehouseRecordId,item_kind:x.rollNumber?'Carpet Roll':'Stock Item',item_name:x.description||x.style||x.sku||'Inventory',colour:x.colour,roll_number:x.rollNumber,location:x.warehouseLocation,job_id:p.jobId,job_number:p.jobNumber,po_number:p.poNumber,hold_key:inventoryHoldKey(p,x),quantity:x.holdQuantity,unit:x.warehouseUnit,status:'Held',note:['Mixed Source PO V0.4.06',x.note].filter(Boolean).join(' · '),updated_by:str(userId),updated_at:stamp,released_at:null,consumed_at:null}
}
function buildSupplierRPC(po){
  const p=normalizePO(po),e=supplierPlanEligibility(p);if(!e.ok||e.skip)throw new Error(e.reason||'No supplier lines');
  const xs=p.items.filter(x=>x.sourceType==='SUPPLIER');
  return {p_environment:ENV,p_po_id:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.id)?p.id:null,p_po_number:Number(String(p.poNumber).replace(/\D/g,'')),p_job_id:p.jobId,p_job_number:p.jobNumber,p_customer_name:p.customerName,p_supplier:e.supplier,p_sales_rep:p.salesRep,p_fulfillment_method:/deliver/i.test(e.fulfillment)?'Supplier Delivery':'Pickup',p_requested_date:p.requestedDate||p.expectedDate||null,p_purchase_type:'Job-specific',p_items:xs.map(x=>({style:x.description||x.style,colour:x.colour,sku:x.sku,qty:x.qty,unit:String(x.unit||'').toLowerCase(),supplier:x.supplier,size:''}))}
}
function linkInventoryLine(po,lineId,item){
  const out=normalizePO(po),x=out.items.find(v=>v.id===lineId);if(!x||x.sourceType!=='INVENTORY')return out;
  x.warehouseDatasetKey=str(item&&item.datasetKey);x.warehouseRecordId=str(item&&item.recordId);x.warehouseUnit=str(item&&item.unit).toUpperCase();x.warehouseAvailable=num(item&&item.available);x.rollNumber=str(item&&item.roll);x.warehouseLocation=str(item&&item.location);if(!x.description)x.description=str(item&&item.name);if(!x.colour)x.colour=str(item&&item.colour);if(!x.sku)x.sku=str(item&&item.sku);
  x.holdQuantity=(str(x.unit).toUpperCase()===x.warehouseUnit&&x.qty>0)?x.qty:0;
  return normalizePO(out)
}
function normExec(v){return str(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function sameExec(a,b){return !!normExec(a)&&normExec(a)===normExec(b)}
function materialTaskCandidates(po,line,tasks){
  const p=po&&po.schemaVersion===2?po:normalizePO(po),x=normalizeLine(line);
  let xs=(Array.isArray(tasks)?tasks:[]).filter(t=>!p.poNumber||String(t.po_number??t.poNumber??'')===String(p.poNumber));
  if(p.jobNumber)xs=xs.filter(t=>!str(t.job_number??t.jobNumber)||String(t.job_number??t.jobNumber)===String(p.jobNumber));
  if(x.rollNumber){
    return xs.filter(t=>sameExec(t.roll_number??t.rollNumber,x.rollNumber))
  }
  const names=[x.description,x.style,x.sku].map(normExec).filter(Boolean);
  xs=xs.filter(t=>{
    const n=normExec(t.item_name??t.itemName??t.product??t.style);
    if(!n||!names.includes(n))return false;
    const loc=str(t.location);
    if(x.warehouseLocation&&loc&&!sameExec(loc,x.warehouseLocation))return false;
    const unit=str(t.unit).toUpperCase();
    if(x.warehouseUnit&&unit&&unit!==x.warehouseUnit)return false;
    return true
  });
  return xs
}
function exactMaterialTask(po,line,tasks){
  const xs=materialTaskCandidates(po,line,tasks);
  return {task:xs.length===1?xs[0]:null,count:xs.length,ambiguous:xs.length>1}
}
function supplierTaskForLine(po,line,tasks){
  const p=po&&po.schemaVersion===2?po:normalizePO(po),x=normalizeLine(line);
  const xs=(Array.isArray(tasks)?tasks:[]).filter(t=>String(t.po_number??t.poNumber??'')===String(p.poNumber||'')).filter(t=>!x.supplier||!str(t.supplier)||sameExec(t.supplier,x.supplier));
  return {task:xs.length===1?xs[0]:null,count:xs.length,ambiguous:xs.length>1}
}
function projectionForLine(po,line,evidence={}){
  const p=po&&po.schemaVersion===2?po:normalizePO(po),x=normalizeLine(line),holds=Array.isArray(evidence.holds)?evidence.holds:[],materialTasks=Array.isArray(evidence.materialTasks)?evidence.materialTasks:[],supplierTasks=Array.isArray(evidence.supplierTasks)?evidence.supplierTasks:[];
  const out={lineId:x.id,sourceType:x.sourceType,current:x.workflowStatus,proposed:'',confidence:'none',evidence:[],reason:'No authoritative execution change identified'};
  if(x.sourceType==='LABOUR'||x.sourceType==='FEE'){out.reason='Non-material line bypasses Warehouse execution';return out}
  if(x.sourceType==='INVENTORY'){
    const key=inventoryHoldKey(p,x),hold=holds.find(h=>h.hold_key===key)||null,match=exactMaterialTask(p,x,materialTasks),task=match.task;
    if(hold)out.evidence.push('Hold '+str(hold.status||'Recorded')+(hold.quantity!=null?' · '+hold.quantity+' '+str(hold.unit):''));
    if(match.ambiguous){out.evidence.push('Multiple Warehouse material tasks matched');out.reason='Ambiguous Warehouse material-task match; no status applied';return out}
    if(task){
      const type=str(task.task_type??task.taskType),status=str(task.status||'Waiting');
      out.evidence.push(type+' · '+status);
      if(normExec(status)==='completed'&&/carpet cutting/i.test(type)){out.proposed='Cut';out.confidence='high';out.reason='Warehouse Carpet Cutting task is Completed';return out}
      if(normExec(status)==='completed'&&/stock picking/i.test(type)){out.proposed='Allocated';out.confidence='high';out.reason='Warehouse Stock Picking task is Completed';return out}
    }
    if(hold&&normExec(hold.status)==='held'){out.proposed='Reserved';out.confidence='high';out.reason='Exact line-level Flooring inventory Hold is active';return out}
    if(hold&&/released/.test(normExec(hold.status))){out.reason='Exact Hold is Released; no automatic rollback is applied';return out}
    out.reason=task?'Warehouse task does not yet prove Cut / Allocated completion':'No exact active Hold or unique Warehouse material task matched';return out
  }
  if(x.sourceType==='SUPPLIER'){
    const match=supplierTaskForLine(p,x,supplierTasks),task=match.task;
    if(match.ambiguous){out.evidence.push('Multiple Supplier tasks matched');out.reason='Ambiguous Supplier task match; no status applied';return out}
    if(!task){out.reason='No unique Supplier task matched this PO line';return out}
    const status=str(task.status||'');
    out.evidence.push('Supplier task · '+(status||'Recorded'));
    if(/completed/i.test(status)){out.proposed='Received';out.confidence='high';out.reason='Supplier task is Completed';return out}
    if(/partial/i.test(status)){out.proposed='Partially Received';out.confidence='high';out.reason='Supplier task reports Partial execution';return out}
    out.reason='Supplier task exists, but current status does not prove Receiving completion';return out
  }
  out.reason='Line Source Type is unclassified';return out
}
function shouldApplyProjectedStatus(line,proposed){
  const x=normalizeLine(line),p=str(proposed);if(!p||p===x.workflowStatus)return false;
  if(x.sourceType==='INVENTORY'){
    if(x.workflowStatus==='Completed')return false;
    if(p==='Reserved')return ['Needed',''].includes(x.workflowStatus);
    if(p==='Cut')return !['Allocated','Completed'].includes(x.workflowStatus);
    if(p==='Allocated')return !['Cut','Completed'].includes(x.workflowStatus);
    return false
  }
  if(x.sourceType==='SUPPLIER'){
    if(['Completed','Received'].includes(x.workflowStatus))return false;
    if(p==='Partially Received')return ['Draft','Ordered','Confirmed',''].includes(x.workflowStatus);
    if(p==='Received')return x.workflowStatus!=='Completed';
  }
  return false
}
function reconciliationReport(po,evidence={}){
  const p=normalizePO(po),lines=p.items.map(x=>projectionForLine(p,x,evidence));
  const byId=new Map(p.items.map(x=>[x.id,x]));
  const changes=lines.filter(x=>x.proposed&&shouldApplyProjectedStatus(byId.get(x.lineId),x.proposed));
  return {poId:p.id,poNumber:p.poNumber,lines,changes,changeCount:changes.length,ambiguousCount:lines.filter(x=>/Ambiguous/i.test(x.reason)).length}
}
function applyReconciliation(po,report,stamp=new Date().toISOString()){
  const p=normalizePO(po),map=new Map((report&&report.lines||[]).map(x=>[x.lineId,x]));
  p.items=p.items.map(line=>{
    const out=normalizeLine(line,p),x=map.get(out.id);if(!x)return out;
    if(x.proposed&&shouldApplyProjectedStatus(out,x.proposed))out.workflowStatus=x.proposed;
    out.executionEvidence=Array.isArray(x.evidence)?x.evidence.slice():[];out.executionSyncedAt=stamp;return out
  });
  return normalizePO(p)
}
function canSavePO(po){const x=normalizePO(po);return !!x.jobId&&x.items.every(i=>!!normalizeSource(i.sourceType))}

const api={VERSION,PO_STORE,JOB_STORE,ACTIVE_JOB,SOURCE_TYPES,UNITS,str,num,round2,money,defaultFulfillment,defaultStatus,normalizeSource,blankLine,normalizeLine,lineAmount,sourceTypes,isMixedSource,legacyPurchaseType,legacySupplier,legacyFulfillment,normalizePO,setHeaderField,updateLine,addLine,removeLine,executionPlan,receiptEligibility,applyPO,inventoryHoldKey,inventoryHoldEligibility,supplierPlanEligibility,executionRouting,buildHoldPayload,buildSupplierRPC,linkInventoryLine,normExec,sameExec,materialTaskCandidates,exactMaterialTask,supplierTaskForLine,projectionForLine,shouldApplyProjectedStatus,reconciliationReport,applyReconciliation,canSavePO};
root.RUNLUMixedSourcePOV0406=api;
if(typeof document==='undefined')return;

let jobs=[],records=[],activeJobId='',activePOId='',draft=normalizePO(),view='fields',dirty=false;
let sb=null,cloudInventory=[],cloudHolds=[],cloudSupplierTasks=[],cloudMaterialTasks=[],cloudState='NOT CONNECTED',pickerLineId='',cloudBusy=false;
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
function warehousePayload(row){return row&&row.payload&&typeof row.payload==='object'?row.payload:{}}
function buildCloudInventory(rows){
  const masterRows=rows.filter(r=>r.dataset_key==='runlu_product_master_v21'),masters=new Map();
  masterRows.forEach(r=>{const p=warehousePayload(r);[p.id,r.record_id].filter(Boolean).forEach(id=>masters.set(str(id),p))});
  const out=[];
  rows.filter(r=>r.dataset_key==='runlu_carpet_inventory_v52').forEach(r=>{const p=warehousePayload(r),qty=num(p.length);out.push({datasetKey:r.dataset_key,recordId:str(r.record_id),kind:'Carpet Roll',name:str(p.collection||p.product||'Carpet'),colour:str(p.colour||p.color),sku:'',roll:str(p.roll),location:str(p.location),unit:'LF',available:qty,status:str(p.status||'Active'),selectable:qty>0&&!p.transferredOut&&str(p.warehouseScope).toLowerCase()!=='external'&&!/used up|transferred|at store/i.test(str(p.status))})});
  rows.filter(r=>r.dataset_key==='runlu_inventory_records_v21').forEach(r=>{const p=warehousePayload(r),m=masters.get(str(p.masterId))||{},qty=num(p.quantity);out.push({datasetKey:r.dataset_key,recordId:str(r.record_id),kind:str(m.category||p.inventoryType||'Stock Item'),name:[m.brand,m.series,m.name].map(str).filter(Boolean).join(' · ')||str(p.product||p.name||p.inventoryId),colour:str(m.color||m.colour||p.colour||p.color),sku:str(m.sku||p.sku||p.inventoryId),roll:'',location:str(p.location),unit:str(p.unit||m.coverageUnit||'EA').toUpperCase(),available:qty,status:str(p.lifecycleStatus||p.status||'Active'),selectable:qty>0&&!/inactive|used up|transferred|archived/i.test(str(p.lifecycleStatus||p.status))&&str(p.warehouseScope).toLowerCase()!=='external'})});
  return out.sort((a,b)=>Number(b.selectable)-Number(a.selectable)||a.name.localeCompare(b.name)||b.available-a.available)
}
async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!root.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));
  if(!root.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=root.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});
  return sb
}
async function cloudSession(){const c=await client();return (await c.auth.getSession()).data?.session||null}
async function connectCloud(){
  const email=str(by('ms405email')?.value),password=by('ms405password')?.value||'';if(!email||!password)return alert('Enter the same staff email and password used for Warehouse / Flooring cloud access.');
  cloudBusy=true;renderCloud();
  try{const c=await client(),r=await c.auth.signInWithPassword({email,password});if(r.error)throw r.error;cloudBusy=false;cloudState='CONNECTED';await refreshCloud(true)}catch(e){cloudState='ERROR · '+(e?.message||e)}finally{cloudBusy=false;renderCloud()}
}
async function refreshCloud(force=false){
  if(cloudBusy&&!force)return;cloudBusy=true;cloudState='SYNCING';renderCloud();
  try{
    const c=await client(),s=(await c.auth.getSession()).data?.session;if(!s){cloudState='SIGN IN REQUIRED';cloudInventory=[];cloudHolds=[];cloudSupplierTasks=[];cloudMaterialTasks=[];return}
    const [wr,hr,tr,mr]=await Promise.all([
      c.from('warehouse_records').select('dataset_key,record_id,payload,updated_at').in('dataset_key',WAREHOUSE_DATASETS).is('deleted_at',null).limit(1000),
      c.from(HOLD_TABLE).select('*').eq('environment',ENV).order('created_at',{ascending:false}).limit(1000),
      c.from('flooring_supplier_tasks').select('*').eq('environment',ENV).order('created_at',{ascending:false}).limit(500),
      c.from('flooring_warehouse_material_tasks').select('*').eq('environment',ENV).order('created_at',{ascending:false}).limit(1000)
    ]);
    if(wr.error)throw wr.error;if(hr.error)throw hr.error;if(tr.error)throw tr.error;if(mr.error)throw mr.error;
    cloudInventory=buildCloudInventory(wr.data||[]);cloudHolds=hr.data||[];cloudSupplierTasks=tr.data||[];cloudMaterialTasks=mr.data||[];cloudState='LIVE';
  }catch(e){cloudState='ERROR · '+(e?.message||e)}finally{cloudBusy=false;renderCloud();renderPicker()}
}
function currentCloudHold(line){
  const key=inventoryHoldKey(draft,line);return cloudHolds.find(h=>h.status==='Held'&&h.hold_key===key)||null
}
function otherHeld(line,excludeId=''){
  if(!line.warehouseDatasetKey||!line.warehouseRecordId)return 0;
  return cloudHolds.filter(h=>h.status==='Held'&&h.id!==excludeId&&h.warehouse_dataset_key===line.warehouseDatasetKey&&String(h.warehouse_record_id)===String(line.warehouseRecordId)).reduce((s,h)=>s+num(h.quantity),0)
}
function liveInventoryFor(line){return cloudInventory.find(x=>x.datasetKey===line.warehouseDatasetKey&&String(x.recordId)===String(line.warehouseRecordId))||null}
async function stageCloudPlans(){
  if(dirty||!activePOId)return alert('Save the PO first, then stage its cloud work plans.');
  const routing=executionRouting(draft);if(routing.blockers.length)return alert('Work plan is not ready:\n\n'+routing.blockers.map(x=>'• '+x.label+': '+x.reason).join('\n'));
  const c=await client(),s=(await c.auth.getSession()).data?.session;if(!s)return alert('Cloud sign-in required before staging work plans.');
  if(!confirm('Stage backend work plans now?\n\nInventory lines create/update Holds only. Supplier lines create/update the Supplier task. No inventory will be deducted or received.'))return;
  cloudBusy=true;cloudState='STAGING';renderCloud();
  try{
    cloudBusy=false;await refreshCloud(true);if(!/^LIVE/.test(cloudState))throw new Error('Cloud refresh did not reach LIVE state');cloudBusy=true;cloudState='STAGING';renderCloud();
    for(const line of routing.inventory){
      const live=liveInventoryFor(line);if(!live)throw new Error('Linked Warehouse inventory is not visible for '+(line.description||line.id));
      const existing=currentCloudHold(line),max=Math.max(0,num(live.available)-otherHeld(line,existing?.id||''));
      if(line.holdQuantity>max+.0001)throw new Error((line.description||'Inventory line')+' Hold Qty exceeds current available quantity. Maximum '+max+' '+line.warehouseUnit+'.');
      const payload=buildHoldPayload(draft,{...line,warehouseAvailable:max},s.user.id);
      const res=existing?await c.from(HOLD_TABLE).update(payload).eq('id',existing.id).select().single():await c.from(HOLD_TABLE).insert([{...payload,created_by:s.user.id,created_at:new Date().toISOString()}]).select().single();
      if(res.error)throw res.error
    }
    if(routing.supplier.length){
      const args=buildSupplierRPC(draft),res=await c.rpc('flooring_create_supplier_task',args);if(res.error)throw res.error
    }
    cloudState='STAGED';cloudBusy=false;await refreshCloud(true);alert('Cloud work plans staged. Warehouse remains the execution authority.')
  }catch(e){cloudState='ERROR · '+(e?.message||e);alert('Cloud staging stopped: '+(e?.message||e))}finally{cloudBusy=false;renderCloud()}
}
function openPicker(lineId){pickerLineId=lineId;renderPicker();const m=by('ms405picker');if(m)m.hidden=false;if(!cloudInventory.length)refreshCloud()}
function closePicker(){pickerLineId='';const m=by('ms405picker');if(m)m.hidden=true}
function useInventory(recordId){
  const item=cloudInventory.find(x=>String(x.recordId)===String(recordId));if(!item||!item.selectable)return;
  draft=linkInventoryLine(draft,pickerLineId,item);setDirty();closePicker();renderEditor();renderDerived();renderCloud()
}
function renderPicker(){
  const m=by('ms405picker');if(!m||m.hidden)return;
  const q=str(by('ms405pickerSearch')?.value).toLowerCase(),xs=cloudInventory.filter(x=>x.selectable&&(!q||[x.name,x.colour,x.sku,x.roll,x.location].some(v=>str(v).toLowerCase().includes(q)))).slice(0,100);
  const list=by('ms405pickerList');if(list)list.innerHTML=xs.length?xs.map(x=>`<button type="button" class="ms405pickrow" data-ms405-use="${attr(x.recordId)}"><span><b>${esc(x.name)}</b><small>${esc([x.colour,x.sku].filter(Boolean).join(' · ')||'—')}</small></span><span><b>${esc(x.roll?'Roll '+x.roll:x.kind)}</b><small>${esc(x.location?'Location '+x.location:'No location')}</small></span><span><b>${x.available} ${esc(x.unit)}</b><small>${esc(x.status)}</small></span></button>`).join(''):'<div class="empty">No live Warehouse inventory matches this search.</div>';
  list?.querySelectorAll('[data-ms405-use]').forEach(b=>b.onclick=()=>useInventory(b.dataset.ms405Use))
}
function saveReconciledPO(next){
  const i=records.findIndex(x=>x.id===activePOId);if(i<0)throw new Error('Saved PO record was not found');
  const out=applyPO(records[i],next);records[i]=out;draft=normalizePO(out,activeJob()||{});saveStores();clearDirty()
}
function reconcileFromCloud(){
  if(dirty||!activePOId)return alert('Save the PO first, then reconcile execution status.');
  const report=reconciliationReport(draft,{holds:cloudHolds,materialTasks:cloudMaterialTasks,supplierTasks:cloudSupplierTasks});
  if(!report.changeCount)return alert('No high-confidence cloud execution change is ready to apply to PO line status.');
  const lines=report.changes.map(x=>'• '+(draft.items.find(i=>i.id===x.lineId)?.description||x.lineId)+': '+x.current+' → '+x.proposed+'\n  '+x.reason).join('\n');
  if(!confirm('Apply '+report.changeCount+' cloud-confirmed status change'+(report.changeCount===1?'':'s')+' to this saved PO?\n\n'+lines+'\n\nThis changes the local PO line status only. Warehouse cloud records will not be modified.'))return;
  try{saveReconciledPO(applyReconciliation(draft,report));renderAll();alert('PO line statuses reconciled from authoritative cloud execution evidence.')}catch(e){alert('Reconciliation was not saved: '+(e?.message||e))}
}
function renderCloud(){
  const el=by('ms405cloud');if(!el)return;
  const routing=executionRouting(draft),supplierTask=cloudSupplierTasks.find(t=>String(t.po_number)===String(draft.poNumber||'')),held=routing.inventory.filter(x=>currentCloudHold(x)).length,report=reconciliationReport(draft,{holds:cloudHolds,materialTasks:cloudMaterialTasks,supplierTasks:cloudSupplierTasks});
  const stateClass=/ERROR|REQUIRED/.test(cloudState)?'warn':/LIVE|STAGED/.test(cloudState)?'ok':'';
  el.innerHTML=`<div class="ms405cloudHead"><div><h2>Backend Work Plans</h2><p>Inventory → Flooring Hold → Warehouse Fulfillment. Supplier → Supplier task. Labour / Fee bypass material inventory.</p></div><span class="ms405state ${stateClass}">${esc(cloudState)}</span></div>
  <div class="ms405cloudStats"><div><b>${routing.inventory.length}</b><span>Inventory lines</span></div><div><b>${held}</b><span>Active Holds</span></div><div><b>${routing.supplier.length}</b><span>Supplier lines</span></div><div><b>${supplierTask?esc(supplierTask.status||'Created'):'—'}</b><span>Supplier task</span></div><div><b>${routing.labour.length+routing.fee.length}</b><span>Bypass lines</span></div></div>
  ${routing.blockers.length?'<div class="ms405blockers">'+routing.blockers.map(x=>'<div><b>'+esc(x.kind)+'</b><span>'+esc(x.label)+' · '+esc(x.reason)+'</span></div>').join('')+'</div>':'<div class="ms405ready"><b>READY TO STAGE</b><span>Planning writes only; Warehouse execution is separate.</span></div>'}
  <div class="ms405inventoryLinks">${routing.inventory.map(x=>{const h=currentCloudHold(x),live=liveInventoryFor(x);return '<div><span><b>'+esc(x.description||'Inventory line')+'</b><small>'+(x.warehouseRecordId?esc([x.rollNumber&&'Roll '+x.rollNumber,x.warehouseLocation,x.warehouseAvailable&&x.warehouseAvailable+' '+x.warehouseUnit+' available'].filter(Boolean).join(' · ')):'Live Warehouse inventory not linked')+'</small></span><button type="button" data-ms405-link="'+attr(x.id)+'">'+(x.warehouseRecordId?'Relink':'Link Inventory')+'</button><em class="'+(h?'held':'')+'">'+(h?'HELD '+esc(h.quantity)+' '+esc(h.unit):'NOT HELD')+'</em></div>'}).join('')}</div>
  <div class="ms406reconcile"><div class="ms406reconcileHead"><b>Execution Reconciliation</b><span>${report.changeCount} confirmed change${report.changeCount===1?'':'s'} · ${report.ambiguousCount} ambiguous</span></div>${report.lines.map(x=>{const line=draft.items.find(i=>i.id===x.lineId)||{};return '<div class="ms406reconcileRow"><span><b>'+esc(line.description||line.style||x.lineId)+'</b><small>'+esc(x.sourceType)+' · current '+esc(x.current||'—')+'</small></span><span><b>'+(x.proposed?('→ '+esc(x.proposed)):'No status change')+'</b><small>'+esc(x.reason)+'</small></span><em class="'+(x.confidence==='high'?'high':'')+'">'+esc((x.evidence||[]).join(' · ')||'No authoritative execution evidence')+'</em></div>'}).join('')}</div>
  <div class="ms405cloudActions"><button type="button" id="ms405refresh" ${cloudBusy?'disabled':''}>Refresh Cloud</button><button type="button" id="ms406reconcile" ${cloudBusy||dirty||!activePOId||!report.changeCount?'disabled':''}>Reconcile PO Statuses</button><button type="button" id="ms405stage" class="primary" ${cloudBusy||routing.blockers.length?'disabled':''}>Stage Work Plans</button></div>
  <div id="ms405signin" class="ms405signin" ${/SIGN IN REQUIRED|NOT CONNECTED/.test(cloudState)?'':'hidden'}><input id="ms405email" type="email" autocomplete="username" placeholder="Staff email"><input id="ms405password" type="password" autocomplete="current-password" placeholder="Password"><button type="button" id="ms405connect">Connect</button></div>`;
  el.querySelectorAll('[data-ms405-link]').forEach(b=>b.onclick=()=>openPicker(b.dataset.ms405Link));
  by('ms405refresh')?.addEventListener('click',()=>refreshCloud());by('ms406reconcile')?.addEventListener('click',reconcileFromCloud);by('ms405stage')?.addEventListener('click',stageCloudPlans);by('ms405connect')?.addEventListener('click',connectCloud)
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
    <label><span>Warehouse Hold Qty</span><input type="number" step="0.001" data-ms404-line="${attr(x.id)}" data-key="holdQuantity" value="${x.holdQuantity}" ${x.sourceType==='INVENTORY'?'':'disabled'}><small>${esc(x.warehouseUnit?x.warehouseUnit+' · '+x.warehouseAvailable+' available':'Link live inventory first')}</small></label>
    <label><span>Live Inventory</span><button type="button" class="ms405inline" data-ms405-link="${attr(x.id)}" ${x.sourceType==='INVENTORY'?'':'disabled'}>${x.warehouseRecordId?'Relink':'Link Inventory'}</button><small>${esc(x.warehouseRecordId||'—')}</small></label>
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
    <td><input type="number" step="0.001" data-ms404-line="${attr(x.id)}" data-key="holdQuantity" value="${x.holdQuantity}" ${x.sourceType==='INVENTORY'?'':'disabled'}></td>
    <td><button type="button" class="ms405inline" data-ms405-link="${attr(x.id)}" ${x.sourceType==='INVENTORY'?'':'disabled'}>${x.warehouseRecordId?'Relink':'Link'}</button></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="fulfillment">${fulfillmentOptions(x)}</select></td>
    <td><select data-ms404-line="${attr(x.id)}" data-key="workflowStatus">${statusOptions(x)}</select></td>
    <td><input type="number" step="0.01" data-ms404-line="${attr(x.id)}" data-key="unitCost" value="${x.unitCost}"></td>
    <td class="money" data-ms404-total="${attr(x.id)}">${money(lineAmount(x))}</td>
    <td><input data-ms404-line="${attr(x.id)}" data-key="note" value="${attr(x.note)}"></td>
    <td><button type="button" class="danger" data-ms404-remove="${attr(x.id)}">×</button></td>
  </tr>`).join('');
  return `<div class="ms404sourceButtons"><button data-ms404-add="INVENTORY">+ Inventory</button><button data-ms404-add="SUPPLIER">+ Supplier</button><button data-ms404-add="LABOUR">+ Labour</button><button data-ms404-add="FEE">+ Fee</button></div><div class="ms404tableWrap"><table><thead><tr><th>#</th><th>Description</th><th>Colour</th><th>Qty</th><th>Unit</th><th>Source</th><th>Supplier</th><th>SKU</th><th>Roll #</th><th>Location</th><th>Hold Qty</th><th>Live Inventory</th><th>Fulfillment</th><th>Status</th><th>Unit Cost</th><th>Total</th><th>Note</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="18" class="empty">No rows yet.</td></tr>'}</tbody></table></div>`
}
function bindEditor(scope){
  scope.querySelectorAll('[data-ms404-head]').forEach(el=>el.oninput=()=>{draft=setHeaderField(draft,el.dataset.ms404Head,el.value);setDirty();renderDerived()});
  scope.querySelectorAll('[data-ms404-line]').forEach(el=>el.oninput=()=>{
    const key=el.dataset.key;draft=updateLine(draft,el.dataset.ms404Line,key,el.value);setDirty();
    if(key==='sourceType'){renderEditor();renderDerived();renderCloud();return}
    const line=draft.items.find(x=>x.id===el.dataset.ms404Line),t=scope.querySelector('[data-ms404-total="'+CSS.escape(el.dataset.ms404Line)+'"]');if(line&&t){const v=money(lineAmount(line));if(t.tagName==='INPUT')t.value=v;else t.textContent=v}
    renderDerived();renderCloud()
  });
  scope.querySelectorAll('[data-ms404-add]').forEach(b=>b.onclick=()=>{draft=addLine(draft,b.dataset.ms404Add);setDirty();renderEditor();renderDerived()});
  scope.querySelectorAll('[data-ms404-remove]').forEach(b=>b.onclick=()=>{draft=removeLine(draft,b.dataset.ms404Remove);setDirty();renderEditor();renderDerived();renderCloud()});
  scope.querySelectorAll('[data-ms405-link]').forEach(b=>b.onclick=()=>openPicker(b.dataset.ms405Link));
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
    paper.innerHTML=`<div class="paperTop"><div><b>Deerfoot Carpet & Flooring</b><small>Mixed-Source PO / Material Order · V0.4.06</small></div><div><b>${esc(draft.poNumber||'DRAFT')}</b><small>${esc(draft.orderDate)}</small></div></div><div class="paperMeta"><span>Job: <b>${esc(draft.jobNumber||'—')}</b></span><span>Customer: <b>${esc(draft.customerName||'—')}</b></span><span>Sales: <b>${esc(draft.salesRep||'—')}</b></span></div><table><thead><tr><th>QTY</th><th>UNIT</th><th>STYLE / PRODUCT</th><th>COLOUR</th><th>SUPPLIER / STOCK</th><th>LINE STATUS</th></tr></thead><tbody>${rows||'<tr><td colspan="6">No lines</td></tr>'}</tbody></table><div class="paperNote"><b>Notes:</b> ${esc(draft.notes||'—')}</div>`
  }
  const save=by('ms404save');if(save)save.disabled=!canSavePO(draft)
}
function renderAll(){renderSelectors();renderEditor();renderDerived();renderCloud();const s=by('ms404dirty');if(s)s.textContent=dirty?'Unsaved changes':(activePOId?'Saved PO loaded':'New draft')}
function bind(){
  by('ms404new').onclick=newDraft;by('ms404save').onclick=savePO;by('ms404print').onclick=()=>window.print();
  document.querySelectorAll('[data-ms404-view]').forEach(b=>b.onclick=()=>{view=b.dataset.ms404View;renderEditor()});
  by('ms405pickerClose')?.addEventListener('click',closePicker);by('ms405pickerSearch')?.addEventListener('input',renderPicker);by('ms405picker')?.addEventListener('click',e=>{if(e.target===by('ms405picker'))closePicker()})
}
function boot(){bind();load();setTimeout(()=>refreshCloud(),450)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
