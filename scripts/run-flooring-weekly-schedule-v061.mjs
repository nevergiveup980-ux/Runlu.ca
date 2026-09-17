import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const modulePath='flooring/weekly-schedule-v061.js';
const htmlPath='flooring/index-v061-weekly-schedule.html';
const prodPath='flooring/index.html';
const source=fs.readFileSync(modulePath,'utf8');
const html=fs.readFileSync(htmlPath,'utf8');
const prod=fs.readFileSync(prodPath,'utf8');

const sandbox={console,module:{exports:{}},exports:{},globalThis:null};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:modulePath});
const api=sandbox.module.exports;
assert.equal(api.VERSION,'0.6.1');
assert.equal(api.readOnly,true);

let passed=0;
function check(name,fn){fn();passed++;console.log(`PASS · ${name}`)}

check('Monday week start crosses year boundary correctly',()=>{
  assert.equal(api.startOfWeek('2027-01-01'),'2026-12-28');
  assert.equal(api.addDays('2026-12-28',6),'2027-01-03');
  assert.equal(api.startOfWeek('2026-09-17'),'2026-09-14');
});

check('strict date parser rejects impossible dates',()=>{
  assert.equal(api.parseDateOnly('2026-02-29'),null);
  assert.equal(api.parseDateOnly('2026-13-01'),null);
  assert.equal(api.parseDateOnly('Sep 17'),null);
  assert.equal(api.parseDateOnly('2026-02-28').iso,'2026-02-28');
});

check('verified Job installation schema maps to Installation task',()=>{
  const rows=api.jobTasks([{id:'j1',jobNumber:'181604',customerName:'Sample',installer:'Crew A',installDate:'2026-09-14',installStart:'08:00',installEnd:'16:00',installStatus:'Scheduled',installAddress:'Calgary'}]);
  assert.equal(rows.length,1);assert.equal(rows[0].type,'installation');assert.equal(rows[0].startDate,'2026-09-14');assert.equal(rows[0].assignedTo,'Crew A');
});

check('verified PO requestedDate + fulfillment maps Pickup and Delivery',()=>{
  const rows=api.poTasks([
    {id:'p1',poNumber:'PO1',requestedDate:'2026-09-15',fulfillment:'Pickup',status:'Ordered',supplier:'Supplier A'},
    {id:'p2',poNumber:'PO2',requestedDate:'2026-09-16',fulfillment:'Delivery',status:'Ordered',supplier:'Supplier B'},
    {id:'p3',poNumber:'PO3',requestedDate:'2026-09-17',fulfillment:'Pickup',status:'Cancelled',supplier:'Supplier C'}
  ]);
  assert.deepEqual(Array.from(rows,x=>x.type),['pickup','delivery']);
});

check('manual calendar events conservatively map Measure and Service only when labeled',()=>{
  const rows=api.manualTasks([
    {id:'m1',date:'2026-09-14',sub:'Measurements',title:'Measure site',start:'09:00'},
    {id:'m2',eventDate:'2026-09-15',eventType:'Service',title:'Service callback'},
    {id:'m3',date:'2026-09-16',sub:'Appointments',title:'General appointment'}
  ]);
  assert.deepEqual(Array.from(rows,x=>x.type),['measure','service']);
});

check('multi-day task clips at left and right week edges',()=>{
  const left=api.clipToWeek({id:'a',type:'installation',startDate:'2026-09-10',endDate:'2026-09-15'},'2026-09-14');
  assert.equal(left.startCol,0);assert.equal(left.endCol,1);assert.equal(left.span,2);assert.equal(left.clippedLeft,true);assert.equal(left.clippedRight,false);
  const right=api.clipToWeek({id:'b',type:'service',startDate:'2026-09-19',endDate:'2026-09-24'},'2026-09-14');
  assert.equal(right.startCol,5);assert.equal(right.endCol,6);assert.equal(right.span,2);assert.equal(right.clippedRight,true);
});

check('overlap auto-staggers while non-overlap reuses lane',()=>{
  const p=api.planWeek([
    {id:'a',type:'installation',startDate:'2026-09-14',endDate:'2026-09-16'},
    {id:'b',type:'measure',startDate:'2026-09-15',endDate:'2026-09-15'},
    {id:'c',type:'pickup',startDate:'2026-09-17',endDate:'2026-09-17'}
  ],'2026-09-14',new Set(api.TYPE_ORDER));
  const by=Object.fromEntries(p.items.map(x=>[x.id,x]));
  assert.notEqual(by.a.lane,by.b.lane);assert.equal(by.a.lane,by.c.lane);assert.equal(p.laneCount,2);
});

check('task-type filters remove hidden categories',()=>{
  const p=api.planWeek([
    {id:'a',type:'installation',startDate:'2026-09-14',endDate:'2026-09-14'},
    {id:'b',type:'measure',startDate:'2026-09-15',endDate:'2026-09-15'}
  ],'2026-09-14',new Set(['measure']));
  assert.equal(p.items.length,1);assert.equal(p.items[0].id,'b');
});

check('empty real data yields explicitly marked demo fixtures only',()=>{
  const empty={getItem(){return null},setItem(){throw new Error('WRITE FORBIDDEN')},removeItem(){throw new Error('WRITE FORBIDDEN')},clear(){throw new Error('WRITE FORBIDDEN')}};
  const real=api.readScheduleData(empty);assert.equal(real.tasks.length,0);
  const demo=api.demoTasks('2026-09-14');assert.ok(demo.length>=5);assert.ok(demo.every(x=>x.demo===true&&x.source==='DEMO'));assert.ok(demo.some(x=>x.startDate!==x.endDate));
});

check('read adapter performs getItem only and never mutates browser storage',()=>{
  const calls=[];
  const payload={
    [api.STORES.jobs]:JSON.stringify([{id:'j1',installDate:'2026-09-14',installStatus:'Scheduled'}]),
    [api.STORES.pos]:JSON.stringify([{id:'p1',poNumber:'1',requestedDate:'2026-09-15',fulfillment:'Pickup',status:'Ordered'}]),
    [api.STORES.manual]:JSON.stringify([{id:'m1',date:'2026-09-16',sub:'Measurements',title:'Measure'}])
  };
  const storage={getItem(k){calls.push(['get',k]);return payload[k]??null},setItem(){throw new Error('WRITE FORBIDDEN')},removeItem(){throw new Error('WRITE FORBIDDEN')},clear(){throw new Error('WRITE FORBIDDEN')}};
  const r=api.readScheduleData(storage);assert.equal(r.tasks.length,3);assert.equal(calls.length,3);assert.ok(calls.every(x=>x[0]==='get'));
});

check('source contains no storage mutation or network transport calls',()=>{
  assert.doesNotMatch(source,/\.setItem\s*\(/);
  assert.doesNotMatch(source,/\.removeItem\s*\(/);
  assert.doesNotMatch(source,/\.clear\s*\(/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/XMLHttpRequest|WebSocket|supabase/i);
});

check('preview is isolated from mutating Calendar modules and production entry',()=>{
  assert.match(html,/weekly-schedule-v061\.js/);
  assert.doesNotMatch(html,/calendar-chc-people-v060|calendar-schema-v058|calendar-groups-v056/);
  assert.match(html,/READ ONLY/i);
  assert.doesNotMatch(prod,/v061-weekly-schedule|weekly-schedule-v061/);
  assert.match(prod,/index-v090r1-stable-frozen\.html/);
});

check('1,000-task week plan is deterministic and preserves every visible task',()=>{
  const tasks=Array.from({length:1000},(_,i)=>{
    const start=i%7,end=Math.min(6,start+(i%3));
    return {id:`stress-${String(i).padStart(4,'0')}`,type:api.TYPE_ORDER[i%api.TYPE_ORDER.length],startDate:api.addDays('2026-09-14',start),endDate:api.addDays('2026-09-14',end)};
  });
  const a=api.planWeek(tasks,'2026-09-14',new Set(api.TYPE_ORDER));
  const b=api.planWeek(tasks,'2026-09-14',new Set(api.TYPE_ORDER));
  assert.equal(a.items.length,1000);assert.equal(b.items.length,1000);assert.ok(a.laneCount>0);
  assert.deepEqual(Array.from(a.items,x=>[x.id,x.lane,x.startCol,x.endCol]),Array.from(b.items,x=>[x.id,x.lane,x.startCol,x.endCol]));
});

console.log(`WEEKLY SCHEDULING GATE · PASS · ${passed}/${passed}`);
console.log('READ-ONLY GATE · PASS · zero localStorage mutations / zero network transport');
