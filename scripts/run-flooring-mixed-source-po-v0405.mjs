import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/mixed-source-po-v0405.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);
vm.runInContext(source,ctx.globalThis,{filename:'mixed-source-po-v0405.js'});
const A=ctx.globalThis.RUNLUMixedSourcePOV0405;
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
test('Browser writes are restricted to existing PO Job and active-job keys',()=>{
  const calls=[...source.matchAll(/localStorage\.setItem\(([^,]+)/g)].map(m=>m[1].trim());
  assert(calls.length>=3);for(const x of calls)assert(['PO_STORE','JOB_STORE','ACTIVE_JOB'].includes(x),'unexpected write key: '+x)
});

const failed=checks.filter(x=>!x.pass);
for(const c of checks)console.log((c.pass?'PASS':'FAIL')+'  '+c.name+'  '+c.ms+'ms'+(c.error?'  '+c.error:''));
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
