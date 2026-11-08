import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/mixed-source-po-v0406.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);
vm.runInContext(source,ctx.globalThis,{filename:'mixed-source-po-v0406.js'});
const A=ctx.globalThis.RUNLUMixedSourcePOV0406;
assert(A,'Mixed-source PO API not exported');

const checks=[];
function test(name,fn){const t0=performance.now();try{fn();checks.push({name,pass:true,ms:+(performance.now()-t0).toFixed(2)})}catch(e){checks.push({name,pass:false,error:e.message,ms:+(performance.now()-t0).toFixed(2)})}}

test('Legacy Stock header migrates line source to INVENTORY',()=>{
  const p=A.normalizePO({purchaseType:'Stock',items:[{id:'a',style:'Stock carpet',qty:10,unit:'sy'}]});
  assert.equal(p.items[0].sourceType,'INVENTORY');assert.equal(p.items[0].fulfillment,'Reserve / Cut')
});
test('Legacy Job-specific supplier line migrates to SUPPLIER',()=>{
  const p=A.normalizePO({purchaseType:'Job-specific',supplier:'Vendor A',items:[{id:'a',style:'LVP',qty:10,unit:'sf'}]});
  assert.equal(p.items[0].sourceType,'SUPPLIER');assert.equal(p.items[0].supplier,'Vendor A');assert.equal(p.items[0].fulfillment,'Pickup from Supplier')
});
test('One PO can hold inventory and supplier lines together',()=>{
  const p=A.normalizePO({items:[
    {id:'i',description:'Stock carpet',qty:136,unit:'sy',sourceType:'INVENTORY',rollNumber:'2244',warehouseLocation:'2A'},
    {id:'s',description:'Supplier carpet',qty:112.67,unit:'sy',sourceType:'SUPPLIER',supplier:'Vendor B',sku:'PEA818'}
  ]});
  assert.equal(p.mixedSource,true);assert.deepEqual(Array.from(p.sourceTypes),['INVENTORY','SUPPLIER'])
});
test('Mixed PO keeps legacy purchaseType Job-specific for old-core compatibility',()=>{
  const p=A.normalizePO({items:[{id:'i',sourceType:'INVENTORY'},{id:'s',sourceType:'SUPPLIER',supplier:'Vendor'}]});
  assert.equal(p.purchaseType,'Job-specific')
});
test('All-inventory PO maps legacy purchaseType to Stock',()=>{
  const p=A.normalizePO({items:[{id:'i1',sourceType:'INVENTORY'},{id:'i2',sourceType:'INVENTORY'}]});
  assert.equal(p.purchaseType,'Stock')
});
test('Unique supplier is preserved at header for legacy UI',()=>{
  const p=A.normalizePO({items:[{id:'s1',sourceType:'SUPPLIER',supplier:'Vendor A'},{id:'s2',sourceType:'SUPPLIER',supplier:'Vendor A'}]});
  assert.equal(p.supplier,'Vendor A')
});
test('Multiple suppliers do not invent a single supplier header',()=>{
  const p=A.normalizePO({supplier:'Old Header',items:[{id:'s1',sourceType:'SUPPLIER',supplier:'Vendor A'},{id:'s2',sourceType:'SUPPLIER',supplier:'Vendor B'}]});
  assert.equal(p.supplier,'')
});
test('Source change resets fulfillment and workflow status safely',()=>{
  let p=A.normalizePO({items:[{id:'x',sourceType:'SUPPLIER',supplier:'Vendor',fulfillment:'Supplier Delivery',workflowStatus:'Confirmed'}]});
  p=A.updateLine(p,'x','sourceType','INVENTORY');
  assert.equal(p.items[0].sourceType,'INVENTORY');assert.equal(p.items[0].fulfillment,'Reserve / Cut');assert.equal(p.items[0].workflowStatus,'Needed')
});
test('Execution plan separates inventory supplier labour fee',()=>{
  const p=A.normalizePO({items:[
    {id:'i',sourceType:'INVENTORY'},{id:'s',sourceType:'SUPPLIER',supplier:'Vendor'},
    {id:'l',sourceType:'LABOUR'},{id:'f',sourceType:'FEE'}
  ]});
  const x=A.executionPlan(p);assert.equal(x.inventoryCount,1);assert.equal(x.supplierCount,1);assert.equal(x.labourCount,1);assert.equal(x.feeCount,1);assert.equal(x.mixedSource,true)
});
test('Receiving eligibility follows line source only',()=>{
  assert.equal(JSON.stringify(A.receiptEligibility({sourceType:'SUPPLIER'})),JSON.stringify({warehouseReceive:true,inventoryAllocate:false,nonMaterial:false}));
  assert.equal(JSON.stringify(A.receiptEligibility({sourceType:'INVENTORY'})),JSON.stringify({warehouseReceive:false,inventoryAllocate:true,nonMaterial:false}));
  assert.equal(JSON.stringify(A.receiptEligibility({sourceType:'LABOUR'})),JSON.stringify({warehouseReceive:false,inventoryAllocate:false,nonMaterial:true}))
});
test('Stock line can carry roll number and warehouse location',()=>{
  const x=A.normalizeLine({id:'i',sourceType:'INVENTORY',rollNumber:'2244',warehouseLocation:'2A',description:'Carpet'});
  assert.equal(x.rollNumber,'2244');assert.equal(x.warehouseLocation,'2A')
});
test('Supplier line can carry supplier and SKU',()=>{
  const x=A.normalizeLine({id:'s',sourceType:'SUPPLIER',supplier:'Vendor A',sku:'PEA818',description:'Product'});
  assert.equal(x.supplier,'Vendor A');assert.equal(x.sku,'PEA818')
});
test('Line total uses direct total when entered otherwise qty times unit cost',()=>{
  assert.equal(A.lineAmount({qty:10,unitCost:4.5,lineTotal:0}),45);assert.equal(A.lineAmount({qty:10,unitCost:4.5,lineTotal:40}),40)
});
test('Apply PO preserves unrelated record fields',()=>{
  const old={id:'p1',poNumber:'123',externalNote:'KEEP',status:'Sent',createdAt:'2026-09-01T00:00:00Z'};
  const draft=A.normalizePO({...old,items:[{id:'i',sourceType:'INVENTORY',qty:10,unitCost:2}]});
  const out=A.applyPO(old,draft);assert.equal(out.externalNote,'KEEP');assert.equal(out.id,'p1');assert.equal(out.subtotal,20);assert.equal(out.items[0].lineTotal,20)
});
test('Save eligibility requires Job link and explicit source on every line',()=>{
  assert.equal(A.canSavePO(A.normalizePO({jobId:'j1',items:[{id:'x',sourceType:''}]})),false);
  assert.equal(A.canSavePO(A.normalizePO({jobId:'j1',items:[{id:'x',sourceType:'INVENTORY'}]})),true);
  assert.equal(A.canSavePO(A.normalizePO({items:[{id:'x',sourceType:'INVENTORY'}]})),false)
});
test('Mixed-source photo-style example remains one PO record',()=>{
  const p=A.normalizePO({id:'paper-181468',jobId:'j1',poNumber:'181468',items:[
    {id:'a',description:'Stock carpet',qty:136,unit:'sy',sourceType:'INVENTORY',rollNumber:'R-100',warehouseLocation:'2A',unitCost:3.25},
    {id:'b',description:'Uplifting 50',qty:112.67,unit:'sy',sourceType:'SUPPLIER',supplier:'Vendor X',sku:'PEA818',unitCost:4.1},
    {id:'c',description:'Underlay',qty:235,unit:'sy',sourceType:'SUPPLIER',supplier:'Vendor X',unitCost:1.2}
  ]});
  const x=A.executionPlan(p);assert.equal(p.id,'paper-181468');assert.equal(x.inventoryCount,1);assert.equal(x.supplierCount,2);assert.equal(Object.keys(x.suppliers).length,1)
});
test('1000 mixed lines derive plan within pressure budget',()=>{
  const items=Array.from({length:1000},(_,i)=>({id:'x'+i,sourceType:i%2?'SUPPLIER':'INVENTORY',supplier:i%2?'Vendor':'',qty:(i%9)+1,unitCost:1.25}));
  const p=A.normalizePO({jobId:'j1',items});const t0=performance.now();const x=A.executionPlan(p);const ms=performance.now()-t0;
  assert.equal(x.totalLines,1000);assert.equal(x.inventoryCount,500);assert.equal(x.supplierCount,500);assert(ms<300,'execution plan too slow: '+ms.toFixed(1)+'ms')
});
test('No second PO database and no direct Warehouse inventory mutation path',()=>{
  assert.equal(/runlu_.*mixed.*po.*store/i.test(source),false);
  const banned=[/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/,/indexedDB\s*\./,/runlu_orders_v20/];
  for(const re of banned)assert.equal(re.test(source),false,'banned token: '+re);
  assert.equal(/from\(['"]warehouse_records['"]\)\s*\.update/.test(source),false);
  assert.equal(/from\(['"]warehouse_records['"]\)\s*\.insert/.test(source),false);
  assert.equal(/from\(['"]warehouse_records['"]\)\s*\.delete/.test(source),false);
  assert.equal(/rpc\(['"](?!flooring_create_supplier_task)[^'"]+['"]/.test(source),false,'unexpected RPC write path')
});
test('Inventory line must link live Warehouse record before staging',()=>{
  const x=A.inventoryHoldEligibility({sourceType:'INVENTORY',holdQuantity:10,warehouseUnit:'LF'});
  assert.equal(x.ok,false);assert(x.reason.includes('not linked'))
});
test('Inventory hold requires explicit Warehouse-unit quantity',()=>{
  const x=A.inventoryHoldEligibility({sourceType:'INVENTORY',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',holdQuantity:0,warehouseAvailable:50});
  assert.equal(x.ok,false);assert(x.reason.includes('Hold Qty'))
});
test('Inventory hold blocks quantity above live availability',()=>{
  const x=A.inventoryHoldEligibility({sourceType:'INVENTORY',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',holdQuantity:51,warehouseAvailable:50});
  assert.equal(x.ok,false);assert(x.reason.includes('exceeds'))
});
test('Linking inventory auto-fills Hold Qty only when PO unit matches Warehouse unit',()=>{
  const item={datasetKey:'runlu_inventory_records_v21',recordId:'r1',unit:'SF',available:500,name:'LVP',colour:'Oak',sku:'S1',location:'10A'};
  let p=A.normalizePO({jobId:'j1',items:[{id:'x',sourceType:'INVENTORY',qty:120,unit:'sf'}]});p=A.linkInventoryLine(p,'x',item);
  assert.equal(p.items[0].holdQuantity,120);assert.equal(p.items[0].warehouseUnit,'SF');assert.equal(p.items[0].warehouseRecordId,'r1');
  p=A.normalizePO({jobId:'j1',items:[{id:'y',sourceType:'INVENTORY',qty:120,unit:'sy'}]});p=A.linkInventoryLine(p,'y',item);assert.equal(p.items[0].holdQuantity,0)
});
test('Hold payload targets flooring_inventory_holds semantics without inventory decrement',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'x',sourceType:'INVENTORY',description:'Stock Carpet',colour:'Grey',rollNumber:'2244',warehouseLocation:'2A',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'rec1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:30}]});
  const x=A.buildHoldPayload(p,p.items[0],'u1');assert.equal(x.warehouse_dataset_key,'runlu_carpet_inventory_v52');assert.equal(x.warehouse_record_id,'rec1');assert.equal(x.quantity,30);assert.equal(x.unit,'LF');assert.equal(x.status,'Held');assert.equal(x.job_number,'181468');assert.equal(x.po_number,'181468');assert(x.hold_key.includes('line:x'))
});
test('Supplier backend accepts one supplier on mixed PO and sends supplier lines only',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',customerName:'C',salesRep:'Nicole',requestedDate:'2026-09-21',items:[
    {id:'i',sourceType:'INVENTORY',description:'Stock carpet',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:20},
    {id:'s1',sourceType:'SUPPLIER',description:'Uplifting 50',supplier:'Vendor X',sku:'PEA818',qty:112.67,unit:'sy',fulfillment:'Pickup from Supplier'},
    {id:'l',sourceType:'LABOUR',description:'Labour'}
  ]});
  const e=A.supplierPlanEligibility(p);assert.equal(e.ok,true);const x=A.buildSupplierRPC(p);assert.equal(x.p_supplier,'Vendor X');assert.equal(x.p_po_number,181468);assert.equal(x.p_items.length,1);assert.equal(x.p_items[0].sku,'PEA818');assert.equal(x.p_purchase_type,'Job-specific')
});
test('Multiple suppliers on same PO are blocked from cloud staging rather than merged',()=>{
  const p=A.normalizePO({jobId:'j1',poNumber:'181468',items:[{id:'a',sourceType:'SUPPLIER',supplier:'A'},{id:'b',sourceType:'SUPPLIER',supplier:'B'}]});
  const x=A.supplierPlanEligibility(p);assert.equal(x.ok,false);assert(x.reason.includes('one supplier plan per PO'))
});
test('Supplier lines with mixed fulfillment are blocked before backend write',()=>{
  const p=A.normalizePO({jobId:'j1',poNumber:'181468',items:[{id:'a',sourceType:'SUPPLIER',supplier:'A',fulfillment:'Pickup from Supplier'},{id:'b',sourceType:'SUPPLIER',supplier:'A',fulfillment:'Supplier Delivery'}]});
  const x=A.supplierPlanEligibility(p);assert.equal(x.ok,false);assert(x.reason.includes('one fulfillment method'))
});
test('Execution routing bypasses Labour and Fee and reports blockers',()=>{
  const p=A.normalizePO({jobId:'j1',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',description:'Stock'},{id:'s',sourceType:'SUPPLIER',supplier:'Vendor',fulfillment:'Pickup from Supplier'},{id:'l',sourceType:'LABOUR'},{id:'f',sourceType:'FEE'}]});
  const x=A.executionRouting(p);assert.equal(x.labour.length,1);assert.equal(x.fee.length,1);assert.equal(x.ready,false);assert(x.blockers.some(b=>b.kind==='INVENTORY'))
});
test('Execution routing becomes ready when stock is linked and supplier contract is valid',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[
    {id:'i',sourceType:'INVENTORY',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:20},
    {id:'s',sourceType:'SUPPLIER',supplier:'Vendor',fulfillment:'Pickup from Supplier',qty:10,unit:'sy'}
  ]});
  const x=A.executionRouting(p);assert.equal(x.ready,true);assert.equal(x.blockers.length,0)
});

test('Active exact line-level Hold projects INVENTORY line to Reserved',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',workflowStatus:'Needed',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:20}]});
  const h={hold_key:A.inventoryHoldKey(p,p.items[0]),status:'Held',quantity:20,unit:'LF'};
  const x=A.projectionForLine(p,p.items[0],{holds:[h]});assert.equal(x.proposed,'Reserved');assert.equal(x.confidence,'high')
});
test('Completed Carpet Cutting task projects INVENTORY line to Cut',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',description:'Stock Carpet',workflowStatus:'Reserved',rollNumber:'2244',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:20}]});
  const tasks=[{po_number:'181468',job_number:'181468',task_type:'Carpet Cutting',roll_number:'2244',status:'Completed'}];
  const x=A.projectionForLine(p,p.items[0],{materialTasks:tasks});assert.equal(x.proposed,'Cut');assert(x.reason.includes('Carpet Cutting'))
});
test('Completed Stock Picking task projects INVENTORY line to Allocated',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',description:'LVP Box',workflowStatus:'Reserved',warehouseLocation:'10A',warehouseDatasetKey:'runlu_inventory_records_v21',warehouseRecordId:'r2',warehouseUnit:'BOX',warehouseAvailable:30,holdQuantity:5}]});
  const tasks=[{po_number:'181468',job_number:'181468',task_type:'Stock Picking',item_name:'LVP Box',location:'10A',unit:'BOX',status:'Completed'}];
  const x=A.projectionForLine(p,p.items[0],{materialTasks:tasks});assert.equal(x.proposed,'Allocated')
});
test('Supplier Completed projects only supplier line to Received',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'s',sourceType:'SUPPLIER',supplier:'Vendor X',workflowStatus:'Confirmed'}]});
  const x=A.projectionForLine(p,p.items[0],{supplierTasks:[{po_number:'181468',supplier:'Vendor X',status:'Completed'}]});assert.equal(x.proposed,'Received');assert.equal(x.confidence,'high')
});
test('Supplier Partial projects to Partially Received but Ready does not claim receipt',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',poNumber:'181468',items:[{id:'s',sourceType:'SUPPLIER',supplier:'Vendor X',workflowStatus:'Confirmed'}]});
  let x=A.projectionForLine(p,p.items[0],{supplierTasks:[{po_number:'181468',supplier:'Vendor X',status:'Partial'}]});assert.equal(x.proposed,'Partially Received');
  x=A.projectionForLine(p,p.items[0],{supplierTasks:[{po_number:'181468',supplier:'Vendor X',status:'Ready'}]});assert.equal(x.proposed,'');assert(x.reason.includes('does not prove Receiving completion'))
});
test('Ambiguous material-task match is advisory only and never applied',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',description:'Stock Carpet',workflowStatus:'Reserved',rollNumber:'2244'}]});
  const tasks=[
    {po_number:'181468',task_type:'Carpet Cutting',roll_number:'2244',status:'Completed'},
    {po_number:'181468',task_type:'Carpet Cutting',roll_number:'2244',status:'Completed'}
  ];
  const x=A.projectionForLine(p,p.items[0],{materialTasks:tasks});assert.equal(x.proposed,'');assert(x.reason.includes('Ambiguous'))
});
test('Released Hold never rolls a completed local status backwards',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',workflowStatus:'Completed',warehouseRecordId:'r1'}]});
  const h={hold_key:A.inventoryHoldKey(p,p.items[0]),status:'Released',quantity:20,unit:'LF'};
  const x=A.projectionForLine(p,p.items[0],{holds:[h]});assert.equal(x.proposed,'');assert(x.reason.includes('no automatic rollback'))
});
test('Status projection never downgrades Cut to Reserved or Received to Partial',()=>{
  assert.equal(A.shouldApplyProjectedStatus({sourceType:'INVENTORY',workflowStatus:'Cut'},'Reserved'),false);
  assert.equal(A.shouldApplyProjectedStatus({sourceType:'SUPPLIER',workflowStatus:'Received'},'Partially Received'),false)
});
test('Reconciliation applies high-confidence changes and stores evidence timestamp',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',jobNumber:'181468',poNumber:'181468',items:[
    {id:'i',sourceType:'INVENTORY',workflowStatus:'Needed',warehouseDatasetKey:'runlu_carpet_inventory_v52',warehouseRecordId:'r1',warehouseUnit:'LF',warehouseAvailable:100,holdQuantity:20},
    {id:'s',sourceType:'SUPPLIER',supplier:'Vendor X',workflowStatus:'Confirmed'}
  ]});
  const h={hold_key:A.inventoryHoldKey(p,p.items[0]),status:'Held',quantity:20,unit:'LF'};
  const report=A.reconciliationReport(p,{holds:[h],supplierTasks:[{po_number:'181468',supplier:'Vendor X',status:'Completed'}]});
  assert.equal(report.changeCount,2);
  const out=A.applyReconciliation(p,report,'2026-09-18T12:00:00Z');
  assert.equal(out.items[0].workflowStatus,'Reserved');assert.equal(out.items[1].workflowStatus,'Received');
  assert.equal(out.items[0].executionSyncedAt,'2026-09-18T12:00:00Z');assert(out.items[0].executionEvidence.length>0)
});
test('Labour and Fee are explicitly bypassed by reconciliation',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',poNumber:'181468',items:[{id:'l',sourceType:'LABOUR',workflowStatus:'Planned'},{id:'f',sourceType:'FEE',workflowStatus:'Planned'}]});
  const report=A.reconciliationReport(p,{holds:[{status:'Held'}],materialTasks:[{status:'Completed'}],supplierTasks:[{status:'Completed'}]});
  assert.equal(report.changeCount,0);assert(report.lines.every(x=>x.reason.includes('bypasses Warehouse execution')))
});
test('Unique roll match wins even when product names are duplicated',()=>{
  const p=A.normalizePO({id:'p1',jobId:'j1',poNumber:'181468',items:[{id:'i',sourceType:'INVENTORY',description:'Same Carpet',rollNumber:'R-22'}]});
  const tasks=[{po_number:'181468',item_name:'Same Carpet',roll_number:'R-21',status:'Completed'},{po_number:'181468',item_name:'Same Carpet',roll_number:'R-22',status:'Completed'}];
  const x=A.exactMaterialTask(p,p.items[0],tasks);assert.equal(x.count,1);assert.equal(x.task.roll_number,'R-22')
});
test('1000-line reconciliation remains deterministic within pressure budget',()=>{
  const items=Array.from({length:1000},(_,i)=>({id:'x'+i,sourceType:'LABOUR',workflowStatus:'Planned'}));
  const p=A.normalizePO({id:'p1',jobId:'j1',poNumber:'181468',items});
  const t0=performance.now(),a=A.reconciliationReport(p,{}),b=A.reconciliationReport(p,{}),ms=performance.now()-t0;
  assert.equal(a.changeCount,0);assert.equal(JSON.stringify(a),JSON.stringify(b));assert(ms<350,'reconciliation too slow: '+ms.toFixed(1)+'ms')
});
test('V0.4.06 uses local business date instead of UTC rollover date',()=>{
  assert.equal(source.includes("new Date().toISOString().slice(0,10)"),false);
  assert(source.includes("getFullYear()"));
  assert(source.includes("getMonth()+1"));
  assert(source.includes("getDate()"))
});
test('V0.4.06 cloud readers have no 500 / 1000 global result cliff',()=>{
  assert.equal(source.includes(".limit(1000)"),false);
  assert.equal(source.includes(".limit(500)"),false);
  assert(source.includes("function pageQuery("));
  assert(source.includes(".range(from,from+pageSize-1)"))
});
test('Reconciliation task reads are scoped to the current PO',()=>{
  assert(source.includes("fetchCurrentSupplierTasks"));
  assert(source.includes("fetchCurrentMaterialTasks"));
  assert(source.includes(".eq('po_number',po)"))
});
test('Inventory reads page all live Warehouse records and active Holds',()=>{
  assert(source.includes("fetchWarehouseRecords"));
  assert(source.includes("fetchActiveHolds"));
  assert(source.includes(".eq('status','Held')"));
  assert(source.includes("pageQuery(()=>c.from('warehouse_records')"))
});
test('Corrupt PO or Job local stores are preserved and block unsafe writes',()=>{
  assert(source.includes("const storeErrors=new Set()"));
  assert(source.includes("_corrupt_backup_v0407"));
  assert(source.includes("if(storeErrors.has(PO_STORE))"));
  assert(source.includes("if(storeErrors.has(JOB_STORE))return"))
});
test('Browser writes are restricted to existing PO Job active-job and corrupt-recovery keys',()=>{
  const calls=[...source.matchAll(/localStorage\.setItem\(([^,]+)/g)].map(m=>m[1].trim());
  assert(calls.length>=3);
  for(const x of calls){
    const allowed=['PO_STORE','JOB_STORE','ACTIVE_JOB'].includes(x)||x==="key+'_corrupt_backup_v0407'";
    assert(allowed,'unexpected write key: '+x)
  }
});

const failed=checks.filter(x=>!x.pass);
for(const c of checks)console.log((c.pass?'PASS':'FAIL')+'  '+c.name+'  '+c.ms+'ms'+(c.error?'  '+c.error:''));
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
