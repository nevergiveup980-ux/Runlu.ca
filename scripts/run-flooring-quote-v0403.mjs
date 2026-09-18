import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/quote-dual-entry-v0403.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);vm.runInContext(source,ctx.globalThis,{filename:'quote-dual-entry-v0403.js'});
const A=ctx.globalThis.RUNLUQuoteV0403;
assert(A,'Quote API not exported');

const checks=[];
function test(name,fn){const t0=performance.now();try{fn();checks.push({name,pass:true,ms:+(performance.now()-t0).toFixed(2)})}catch(e){checks.push({name,pass:false,error:e.message,ms:+(performance.now()-t0).toFixed(2)})}}

test('Normalize quote uses existing Job fields without creating second source',()=>{
  const q=A.normalizeQuote({}, {jobNumber:'190001',customerName:'Customer A',clerk:'Tony',soldToAddress:'Calgary',installer:'CHC Others'});
  assert.equal(q.quoteNumber,'190001');assert.equal(q.customerName,'Customer A');assert.equal(q.salesperson,'Tony');assert.equal(q.projectAddress,'Calgary');assert.equal(q.installer,'CHC Others')
});
test('Existing Job items can seed material quote lines',()=>{
  const q=A.quoteFromJob({jobNumber:'190002',items:[{qty:'90 SQFT',style:'LVP',colour:'Oak',supplier:'Vendor',price:4.25,total:382.5}]});
  assert.equal(q.materials.length,1);assert.equal(q.materials[0].qty,90);assert.equal(q.materials[0].unit,'SQFT');assert.equal(q.materials[0].unitPrice,4.25);assert(q.materials[0].description.includes('LVP'))
});
test('Photo-style quote totals reproduce materials labour GST and grand total',()=>{
  let q=A.normalizeQuote({gstRate:.05});
  const mats=[
    ['Venice Ultracore LVP - GIOVANNI',731.25,'sft',4.29,4.09],
    ['Reducer',1,'ea',49,42],
    ['T-Molding',4,'ea',49,42],
    ['Carpet Disposal allowance',704,'sft',.25,.25],
    ['Supplier Freight charge - absorbed',1,'-',125,0]
  ];
  const labour=[
    ['Click LVP installation',704,'sft',3,3],
    ['Undercut 14 door frames',14,'ea',10,10],
    ['Install Reducer and T-molding transitions',30,'lft',10.5,10.5],
    ['Carpet, underpad and smoothedge removal and haul away',684,'sft',1,1],
    ['Baseboards - Remove and Replace Existing',210,'lft',2,2],
    ['Door removal and replacement',8,'ea',10,10]
  ];
  mats.forEach((x,i)=>q=A.addLine(q,'materials',{id:'m'+i,description:x[0],qty:x[1],unit:x[2],listPrice:x[3],unitPrice:x[4]}));
  labour.forEach((x,i)=>q=A.addLine(q,'labour',{id:'l'+i,description:x[0],qty:x[1],unit:x[2],listPrice:x[3],unitPrice:x[4]}));
  const c=A.calcQuote(q);assert.equal(c.materials,3376.81);assert.equal(c.labour,3751);assert.equal(c.subtotal,7127.81);assert.equal(c.gst,356.39);assert.equal(c.grandTotal,7484.20)
});
test('List price is informational and quote price drives line total',()=>{
  assert.equal(A.lineTotal({qty:4,listPrice:49,unitPrice:42}),168)
});
test('Zero GST is preserved when explicitly entered',()=>{
  const q=A.normalizeQuote({gstRate:0,materials:[{id:'a',qty:10,unitPrice:5}]});const c=A.calcQuote(q);assert.equal(q.gstRate,0);assert.equal(c.gst,0);assert.equal(c.grandTotal,50)
});
test('Default GST is five percent when field is absent',()=>{
  const q=A.normalizeQuote({materials:[{id:'a',qty:10,unitPrice:5}]});assert.equal(q.gstRate,.05);assert.equal(A.calcQuote(q).gst,2.5)
});
test('Database Fields and Table Entry helpers mutate the same quote shape',()=>{
  let q=A.normalizeQuote({customerName:'A'});
  q=A.setQuoteField(q,'customerName','B');q=A.addLine(q,'materials',{id:'x',description:'LVP',qty:10,unit:'sft',unitPrice:4});
  q=A.updateLine(q,'materials','x','qty',12.5);q=A.updateLine(q,'materials','x','unitPrice',4.2);
  assert.equal(q.customerName,'B');assert.equal(q.materials[0].qty,12.5);assert.equal(A.calcQuote(q).materials,52.5)
});
test('Remove line affects only selected line group',()=>{
  let q=A.normalizeQuote({materials:[{id:'m',qty:1,unitPrice:2}],labour:[{id:'l',qty:1,unitPrice:3}]});
  q=A.removeLine(q,'materials','m');assert.equal(q.materials.length,0);assert.equal(q.labour.length,1)
});
test('Apply quote to Job preserves unrelated Job fields and stores one nested quote record',()=>{
  const job={id:'j1',jobNumber:'100',supplierPO:'PO-55',status:'Confirmed',customerName:'Old'};
  const q=A.normalizeQuote({quoteNumber:'Q-100',customerName:'New',salesperson:'Tony',projectAddress:'Site',installer:'CHC Others',fulfillment:'Delivery',materials:[{id:'m',qty:2,unitPrice:5}]});
  const out=A.applyQuoteToJob(job,q);
  assert.equal(out.supplierPO,'PO-55');assert.equal(out.status,'Confirmed');assert.equal(out.customerName,'New');assert.equal(out.clerk,'Tony');assert.equal(out.soldToAddress,'Site');assert.equal(out.installer,'CHC Others');assert.equal(out.fulfillment,'Delivery');assert(out.quote);assert.equal(out.quote.quoteNumber,'Q-100');assert.equal(out.quote.materials.length,1)
});
test('Apply quote does not create duplicate material arrays at Job top level',()=>{
  const out=A.applyQuoteToJob({id:'j1',jobNumber:'100'},A.normalizeQuote({materials:[{id:'m',qty:1,unitPrice:5}]}));
  assert.equal(Object.prototype.hasOwnProperty.call(out,'quoteMaterials'),false);assert.equal(Object.prototype.hasOwnProperty.call(out,'quoteLabour'),false)
});
test('DEMO jobs are never write targets',()=>{
  assert.equal(A.canWriteJob({id:'d',isDemo:true}),false);assert.equal(A.canWriteJob({id:'r',isDemo:false}),true);assert.equal(A.canWriteJob(null),false)
});
test('Fulfillment accepts Pickup and Delivery and rejects arbitrary value on normalize',()=>{
  assert.equal(A.normalizeQuote({fulfillment:'Pickup'}).fulfillment,'Pickup');assert.equal(A.normalizeQuote({fulfillment:'Delivery'}).fulfillment,'Delivery');assert.equal(A.normalizeQuote({fulfillment:'Courier'}).fulfillment,'')
});
test('Deposit-required defaults true but explicit false is preserved',()=>{
  assert.equal(A.normalizeQuote({}).depositRequired,true);assert.equal(A.normalizeQuote({depositRequired:false}).depositRequired,false)
});
test('Quote calculations handle 1000 lines within pressure budget',()=>{
  const materials=Array.from({length:1000},(_,i)=>({id:'m'+i,qty:(i%9)+1,unitPrice:1.25+(i%7)}));const q=A.normalizeQuote({materials});const t0=performance.now();const c=A.calcQuote(q);const ms=performance.now()-t0;assert(c.materials>0);assert(ms<250,'quote calc too slow: '+ms.toFixed(1)+'ms')
});
test('No second quote database key and no network/database connector path',()=>{
  assert.equal(/runlu_deerfoot_quotes/i.test(source),false);
  const banned=[/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/,/indexedDB\s*\./,/supabase/i];
  for(const re of banned)assert.equal(re.test(source),false,'banned network/external DB token: '+re)
});
test('Write scope is limited to existing Flooring Job and active-job browser keys',()=>{
  const setCalls=[...source.matchAll(/localStorage\.setItem\(([^,]+)/g)].map(m=>m[1].trim());
  assert(setCalls.length>=2);for(const x of setCalls)assert(['JOBS','ACTIVE'].some(k=>x===k),'unexpected localStorage write key: '+x)
});

const failed=checks.filter(x=>!x.pass);for(const c of checks)console.log((c.pass?'PASS':'FAIL')+'  '+c.name+'  '+c.ms+'ms'+(c.error?'  '+c.error:''));
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');if(failed.length)process.exit(1);
