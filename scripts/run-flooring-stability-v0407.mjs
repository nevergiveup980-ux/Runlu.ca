
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const checks=[];
function test(name,fn){const t=performance.now();try{fn();checks.push({name,pass:true,ms:+(performance.now()-t).toFixed(2)})}catch(e){checks.push({name,pass:false,error:e.message,ms:+(performance.now()-t).toFixed(2)})}}

const modified=[
'flooring/app.js','flooring/po-safe-v040.js','flooring/payment-shared-v046.js','flooring/payment-cloud-v047.js',
'flooring/accounting-foundation-v067.js','flooring/accounting-control-language-v0671.js','flooring/management-review-v080.js',
'flooring/quote-dual-entry-v0403.js','flooring/deerfoot-real-workflow-v046.js','flooring/orders-drawer-v066.js',
'flooring/pricing-foundation-v070.js','flooring/po-void-v084r2.js','flooring/po-history-v085.js',
'flooring/service-claims-safe-v001.js','flooring/pickup-planner-v052.js','flooring/warehouse-work-sync-v090.js',
'flooring/smart-inventory-picker-v072.js','flooring/material-work-sync-v091.js','flooring/po-inventory-holds-v080r1.js',
'flooring/storage-resilience-v0407.js'
];

test('All touched JavaScript compiles',()=>{for(const p of modified)new Function(read(p))});

test('Quote local date survives UTC rollover',()=>{
  const source=read('flooring/quote-dual-entry-v0403.js');
  class FakeDate extends Date{
    constructor(...a){super(...(a.length?a:['2026-09-19T01:30:00.000Z']))}
    getFullYear(){return 2026}
    getMonth(){return 8}
    getDate(){return 18}
  }
  const ctx={console,Date:FakeDate};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);
  assert.equal(ctx.RUNLUQuoteV0403.normalizeQuote({},{}).quoteDate,'2026-09-18');
});

test('Raw UTC today pattern removed from business-date modules',()=>{
  const targets=['flooring/po-safe-v040.js','flooring/payment-shared-v046.js','flooring/payment-cloud-v047.js','flooring/accounting-foundation-v067.js','flooring/accounting-control-language-v0671.js','flooring/quote-dual-entry-v0403.js','flooring/deerfoot-real-workflow-v046.js','flooring/orders-drawer-v066.js','flooring/pricing-foundation-v070.js','flooring/po-void-v084r2.js','flooring/service-claims-safe-v001.js'];
  for(const p of targets)assert.equal(read(p).includes("new Date().toISOString().slice(0,10)"),false,p);
});

test('Aging and pickup windows are DST-safe calendar math',()=>{
  for(const p of ['flooring/accounting-foundation-v067.js','flooring/accounting-control-language-v0671.js','flooring/management-review-v080.js'])assert(read(p).includes('Date.UTC('),p);
  const pickup=read('flooring/pickup-planner-v052.js');
  assert(pickup.includes('dayNumber(v)-dayNumber(localToday())'));
  assert(pickup.includes('dayNumber(dated[j].requestedDate)-startDay<=windowDays'));
});

test('Corrupt Job and PO stores are preserved and write-blocked',()=>{
  const app=read('flooring/app.js'),po=read('flooring/po-safe-v040.js');
  assert(app.includes('runlu_deerfoot_flooring_jobs_corrupt_backup_v0407'));
  assert(app.includes('if(jobStoreCorrupt){warnCorruptJobStore();return false}'));
  assert(po.includes('runlu_deerfoot_supplier_orders_corrupt_backup_v0407'));
  assert(po.includes('if(poStoreCorrupt){warnCorruptPOStore();return false}'));
});

test('PO receiving and Holds use stable line IDs',()=>{
  const po=read('flooring/po-safe-v040.js'),recv=read('flooring/deerfoot-real-workflow-v046.js'),holds=read('flooring/po-inventory-holds-v080r1.js');
  assert(po.includes('data-po-line-id='));
  assert(po.includes('lineId:row.dataset.poLineId||lineId()'));
  assert(recv.includes('row?.dataset?.poLineId'));
  assert(holds.includes('row?.dataset?.poLineId'));
  assert.equal(holds.includes('legacy-index-'+String.fromCharCode(36)+'{indexOf(row)}'),false);
});

function loadWork(){
  const source=read('flooring/warehouse-work-sync-v090.js'),mem=new Map();
  const ctx={console,localStorage:{getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,String(v))},document:{readyState:'loading',addEventListener(){},getElementById(){return null}},setTimeout(){},setInterval(){},clearTimeout(){},clearInterval(){}};
  ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.RUNLUWarehouseWorkSyncV090;
}
const W=loadWork();

test('Historical terminal POs do not re-plan every refresh',()=>{
  assert.equal(W.planningPO({poNumber:'1',supplier:'A',status:'Completed'}),false);
  assert.equal(W.planningPO({poNumber:'1',supplier:'A',status:'Received'}),false);
  assert.equal(W.planningPO({poNumber:'1',supplier:'A',status:'Cancelled'}),false);
  assert.equal(W.planningPO({poNumber:'1',supplier:'A',status:'Sent'}),true);
  assert.equal(W.planningPO({poNumber:'1',supplier:'A',status:'Confirmed'}),true);
});

test('Legacy Supplier task payload excludes mixed-source non-supplier lines',()=>{
  const xs=W.compactItems([
    {description:'Supplier LVP',sourceType:'SUPPLIER',qty:10,unit:'box'},
    {description:'Stock Carpet',sourceType:'INVENTORY',qty:20,unit:'sy'},
    {description:'Labour',sourceType:'LABOUR',qty:1,unit:'ea'},
    {description:'Fee',sourceType:'FEE',qty:1,unit:'ea'},
    {description:'Legacy supplier item',qty:2,unit:'box'}
  ]);
  assert.equal(xs.length,2);assert.equal(xs[0].style,'Supplier LVP');assert.equal(xs[1].style,'Legacy supplier item');
});

test('Plan fingerprint is stable and suppresses unchanged work',()=>{
  const po={id:'p1',poNumber:'181468',jobId:'j1',jobNumber:'181468',customerName:'C',supplier:'Vendor',salesRep:'N',fulfillment:'Pickup',requestedDate:'2026-09-20',purchaseType:'Job-specific',status:'Confirmed',items:[{description:'LVP',sourceType:'SUPPLIER',qty:10,unit:'box'}]};
  const a=W.planFingerprint(po,{}),b=W.planFingerprint(JSON.parse(JSON.stringify(po)),{});assert.equal(a,b);
  const x=JSON.parse(JSON.stringify(po));x.items[0].qty=11;assert.notEqual(a,W.planFingerprint(x,{}));
});

test('Two-year aging simulation keeps automatic plan load tied to open work',()=>{
  const all=Array.from({length:14600},(_,i)=>({poNumber:String(180000+i),supplier:'Vendor',status:i<14550?'Completed':'Confirmed',items:[{description:'P',sourceType:'SUPPLIER',qty:1,unit:'box'}]}));
  const t=performance.now(),active=all.filter(W.planningPO),ms=performance.now()-t;assert.equal(active.length,50);assert(ms<100);
  const fp={};let first=0,second=0;
  for(const p of active){const s=W.planFingerprint(p,{});if(fp[p.poNumber]!==s){first++;fp[p.poNumber]=s}}
  for(const p of active){const s=W.planFingerprint(p,{});if(fp[p.poNumber]!==s){second++;fp[p.poNumber]=s}}
  assert.equal(first,50);assert.equal(second,0);
});

test('Growth-sensitive cloud readers are paged or deliberately bounded',()=>{
  const work=read('flooring/warehouse-work-sync-v090.js');
  assert(work.includes('PLAN_FP_STORE'));assert(work.includes(".in('status',ACTIVE_TASK_STATUSES)"));assert(work.includes(".eq('status','Completed')"));assert(work.includes('.range(from,from+page-1)'));assert(work.includes('.limit(100)'));
  const inv=read('flooring/smart-inventory-picker-v072.js');assert(inv.includes('fetchAllWarehouseRecords'));assert(inv.includes('.range(from, from + pageSize - 1)'));assert.equal(inv.includes('.limit(1000)'),false);
  const holds=read('flooring/po-inventory-holds-v080r1.js');assert(holds.includes("eq('status','Held')"));assert(holds.includes('.range(from,from+page-1)'));
  const mat=read('flooring/material-work-sync-v091.js');assert(mat.includes("in('status',['Waiting','In Progress','Partial'])"));assert(mat.includes('.range(from,from+page-1)'));assert(mat.includes("eq('status','Completed')"));assert(mat.includes('.limit(200)'));
});

test('Storage resilience is versioned, explicit, and non-destructive',()=>{
  const s=read('flooring/storage-resilience-v0407.js'),shell=read('flooring/index-v0403-release.html');
  assert(s.includes('indexedDB.open(DB,1)'));assert(s.includes('previousRaw'));assert(s.includes('validJSON'));
  assert(s.includes("confirm('Restore the last safe browser backup"));assert(s.includes("confirm('Restore safe IndexedDB backups"));
  const boot=s.slice(s.indexOf('function boot()'),s.indexOf('root.RUNLUStorageResilienceV0407'));assert.equal(boot.includes('recoverAll('),false);
  assert(shell.indexOf('storage-resilience-v0407.js')<shell.indexOf("frame.src=views[v]"));
});

test('Stability layer never mutates Warehouse physical records',()=>{
  for(const p of ['flooring/warehouse-work-sync-v090.js','flooring/po-inventory-holds-v080r1.js','flooring/storage-resilience-v0407.js']){
    const s=read(p);
    assert.equal(s.includes("from('warehouse_records').update"),false,p);
    assert.equal(s.includes("from('warehouse_records').insert"),false,p);
    assert.equal(s.includes("from('warehouse_records').delete"),false,p);
  }
});

for(const c of checks)console.log((c.pass?'PASS':'FAIL')+'  '+c.name+'  '+c.ms+'ms'+(c.error?'  '+c.error:''));
const failed=checks.filter(x=>!x.pass);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
