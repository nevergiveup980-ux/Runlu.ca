import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/week-schedule-v096.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);vm.runInContext(source,ctx.globalThis,{filename:'week-schedule-v096.js'});
const A=ctx.globalThis.RUNLUWeekScheduleV096;
assert(A,'API not exported');

const checks=[];
function test(name,fn){const t0=performance.now();try{fn();checks.push({name,pass:true,ms:+(performance.now()-t0).toFixed(2)})}catch(e){checks.push({name,pass:false,error:e.message,ms:+(performance.now()-t0).toFixed(2)})}}

test('Cross-month multi-day clipping',()=>{
  const t={id:'a',startDate:'2026-09-30',endDate:'2026-10-02'};const c=A.clipTask(t,'2026-09-27');assert.equal(c.startIndex,3);assert.equal(c.span,3)
});
test('Cross-year multi-day clipping',()=>{
  const t={id:'a',startDate:'2026-12-31',endDate:'2027-01-02'};const c=A.clipTask(t,'2026-12-27');assert.equal(c.startIndex,4);assert.equal(c.span,3)
});
test('Task clipped at both week edges',()=>{
  const t={id:'a',startDate:'2026-09-01',endDate:'2026-09-30'};const c=A.clipTask(t,'2026-09-13');assert.equal(c.startIndex,0);assert.equal(c.span,7);assert.equal(c.continuesBefore,true);assert.equal(c.continuesAfter,true)
});
test('Overlap tasks auto-stack and lane can be reused',()=>{
  const tasks=[
    {id:'a',startDate:'2026-09-13',endDate:'2026-09-15',title:'A'},
    {id:'b',startDate:'2026-09-15',endDate:'2026-09-16',title:'B'},
    {id:'c',startDate:'2026-09-17',endDate:'2026-09-17',title:'C'}
  ];const x=A.allocateLanes(tasks,'2026-09-13');assert.equal(x.laneCount,2);const m=Object.fromEntries(x.tasks.map(t=>[t.id,t.lane]));assert.notEqual(m.a,m.b);assert.equal(m.c,0)
});
test('Warehouse order adapter reads real schedule aliases',()=>{
  const xs=A.extractWarehouseOrders([{id:'1',order_number:'181999',customer_name:'Real Customer',sales_rep:'Carol',installer_name:'Bilal',install_date:'2026-09-18',install_end_date:'2026-09-19',install_start:'08:30',status:'Scheduled'}]);assert.equal(xs.length,1);assert.equal(xs[0].jobNumber,'181999');assert.equal(xs[0].person,'Bilal');assert.equal(xs[0].sales,'Carol');assert.equal(xs[0].startDate,'2026-09-18');assert.equal(xs[0].endDate,'2026-09-19')
});
test('Flooring job adapter ignores built-in demo job',()=>{
  const xs=A.extractFlooringJobs([{id:'demo',isDemo:true,installDate:'2026-09-18'},{id:'real',jobNumber:'182000',customerName:'R',clerk:'Tony',installer:'Wade',installDate:'2026-09-18'}]);assert.equal(xs.length,1);assert.equal(xs[0].sourceRecordId,'real')
});
test('Manual Calendar event adapter preserves task type/person',()=>{
  const xs=A.extractManualEvents([{id:'m1',subCalendar:'Measurements',eventDate:'2026-09-18',assignedTo:'Alana',customerName:'C'}]);assert.equal(xs.length,1);assert.equal(xs[0].type,'Measurement');assert.equal(xs[0].person,'Alana')
});
test('Supplier PO adapter creates pickup/delivery only from dated PO',()=>{
  const xs=A.extractSupplierPOs([{id:'p1',poNumber:'0319',requestedDate:'2026-09-18',fulfillment:'Pickup',salesRep:'Tony',status:'Scheduled'},{id:'p2',status:'Draft'}]);assert.equal(xs.length,1);assert.equal(xs[0].type,'Pickup');assert.equal(xs[0].poNumber,'0319')
});
test('Demo data is explicit and in-memory only',()=>{
  const xs=A.demoTasks('2026-09-18');assert(xs.length>=4);assert(xs.every(x=>x.demo===true&&x.source==='DEMO'))
});
test('1000-task layout pressure',()=>{
  const w='2026-09-13',types=['Installation','Appointment','Pickup'];const xs=Array.from({length:1000},(_,i)=>({id:'t'+i,type:types[i%types.length],title:'Task '+i,person:'P'+(i%50),startDate:A.addDays(w,i%7),endDate:A.addDays(w,Math.min(6,(i%7)+(i%3)))}));const t0=performance.now();const out=A.allocateLanes(xs,w);const ms=performance.now()-t0;assert.equal(out.tasks.length,1000);assert(ms<750,`layout too slow: ${ms.toFixed(1)}ms`)
});
test('Absolute read-only static gate',()=>{
  const banned=[/localStorage\s*\.\s*setItem\s*\(/,/localStorage\s*\.\s*removeItem\s*\(/,/indexedDB\s*\.\s*open\s*\(/,/\.\s*(insert|update|upsert|delete)\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/];for(const re of banned)assert.equal(re.test(source),false,`banned write/network token: ${re}`)
});

const failed=checks.filter(x=>!x.pass);for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'}  ${c.name}  ${c.ms}ms${c.error?'  '+c.error:''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} checks passed.`);if(failed.length)process.exit(1);
