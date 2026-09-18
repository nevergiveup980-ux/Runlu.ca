import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const modulePath='flooring/weekly-schedule-v062.js';
const htmlPath='flooring/index-v062-weekly-schedule.html';
const prodPath='flooring/index.html';
const source=fs.readFileSync(modulePath,'utf8');
const html=fs.readFileSync(htmlPath,'utf8');
const prod=fs.readFileSync(prodPath,'utf8');

const sandbox={console,module:{exports:{}},exports:{},globalThis:null};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:modulePath});
const api=sandbox.module.exports;
assert.equal(api.VERSION,'0.6.2');
assert.equal(api.readOnly,true);

let passed=0;
function check(name,fn){fn();passed++;console.log(`PASS · ${name}`)}

check('Sunday week start matches Deerfoot reference week and crosses year safely',()=>{
  assert.equal(api.startOfWeek('2026-09-17'),'2026-09-13');
  assert.equal(api.addDays('2026-09-13',6),'2026-09-19');
  assert.equal(api.startOfWeek('2027-01-01'),'2026-12-27');
});

check('strict civil-date parser rejects impossible or loose dates',()=>{
  assert.equal(api.parseDateOnly('2026-02-29'),null);
  assert.equal(api.parseDateOnly('2026-13-01'),null);
  assert.equal(api.parseDateOnly('Sep 17'),null);
  assert.equal(api.parseDateOnly('2026-02-28').iso,'2026-02-28');
});

check('Job installation maps to timed Installation without changing source data',()=>{
  const src={id:'j1',jobNumber:'181604',customerName:'Sample',installer:'Crew A',installDate:'2026-09-14',installStart:'08:00',installEnd:'16:00',installStatus:'Scheduled',installAddress:'Calgary'};
  const before=JSON.stringify(src),rows=api.jobTasks([src]);
  assert.equal(rows.length,1);assert.equal(rows[0].type,'installation');assert.equal(rows[0].startTime,'08:00');assert.equal(rows[0].assignedTo,'Crew A');assert.match(rows[0].color,/^hsl\(/);assert.equal(JSON.stringify(src),before);
});

check('PO requestedDate + fulfillment maps all-day Pickup and Delivery',()=>{
  const rows=api.poTasks([
    {id:'p1',poNumber:'PO1',requestedDate:'2026-09-15',fulfillment:'Pickup',status:'Ordered',supplier:'Supplier A'},
    {id:'p2',poNumber:'PO2',requestedDate:'2026-09-16',fulfillment:'Delivery',status:'Ordered',supplier:'Supplier B'},
    {id:'p3',poNumber:'PO3',requestedDate:'2026-09-17',fulfillment:'Pickup',status:'Cancelled',supplier:'Supplier C'}
  ]);
  assert.deepEqual(Array.from(rows,x=>x.type),['pickup','delivery']);
  assert.ok(rows.every(x=>x.startTime===''));
});

check('Manual calendar keeps stored color and timed appointment fields',()=>{
  const rows=api.manualTasks([
    {id:'m1',date:'2026-09-14',sub:'Measurements',title:'Measure site',start:'09:00',end:'10:00',color:'#445566',assignedTo:'Alana'},
    {id:'m2',eventDate:'2026-09-15',eventType:'Service',title:'Service callback'},
    {id:'m3',date:'2026-09-16',sub:'Appointments',title:'General appointment'}
  ]);
  assert.deepEqual(Array.from(rows,x=>x.type),['measure','service']);
  assert.equal(rows[0].color,'#445566');assert.equal(rows[0].startTime,'09:00');assert.equal(rows[0].assignedTo,'Alana');
});

check('multi-day all-day task clips at both week edges',()=>{
  const left=api.clipToWeek({id:'a',type:'installation',startDate:'2026-09-10',endDate:'2026-09-14'},'2026-09-13');
  assert.equal(left.startCol,0);assert.equal(left.endCol,1);assert.equal(left.span,2);assert.equal(left.clippedLeft,true);
  const right=api.clipToWeek({id:'b',type:'service',startDate:'2026-09-18',endDate:'2026-09-24'},'2026-09-13');
  assert.equal(right.startCol,5);assert.equal(right.endCol,6);assert.equal(right.span,2);assert.equal(right.clippedRight,true);
});

check('dense all-day overlap auto-staggers and reuses lanes',()=>{
  const rows=[
    {id:'a',type:'installation',startDate:'2026-09-13',endDate:'2026-09-15'},
    {id:'b',type:'pickup',startDate:'2026-09-14',endDate:'2026-09-14'},
    {id:'c',type:'delivery',startDate:'2026-09-16',endDate:'2026-09-16'}
  ];
  const clipped=rows.map(x=>api.clipToWeek(x,'2026-09-13'));
  const p=api.assignLanes(clipped),by=Object.fromEntries(p.items.map(x=>[x.id,x]));
  assert.notEqual(by.a.lane,by.b.lane);assert.equal(by.a.lane,by.c.lane);assert.equal(p.laneCount,2);
});

check('timed overlap gets deterministic side-by-side lanes inside one day',()=>{
  const rows=[
    {id:'a',type:'measure',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'09:00',endTime:'10:00'},
    {id:'b',type:'service',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'09:30',endTime:'10:30'},
    {id:'c',type:'service',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'10:30',endTime:'11:00'}
  ];
  const g=api.timedGeometry(rows,'2026-09-13'),by=Object.fromEntries(g.map(x=>[x.id,x]));
  assert.equal(by.a.dayCol,1);assert.notEqual(by.a.timedLane,by.b.timedLane);assert.equal(by.c.timedLane,0);assert.equal(by.a.timedLaneCount,2);assert.ok(by.a.heightPct>0);
});

check('events outside 7 AM–7 PM are excluded from timed canvas',()=>{
  const rows=[
    {id:'early',type:'measure',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'05:00',endTime:'06:00'},
    {id:'late',type:'measure',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'20:00',endTime:'21:00'},
    {id:'ok',type:'measure',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'18:30',endTime:'19:30'}
  ];
  const g=api.timedGeometry(rows,'2026-09-13');
  assert.deepEqual(Array.from(g,x=>x.id),['ok']);assert.equal(g[0].endMinute,api.DAY_END);
});

check('type filters apply to both all-day and timed zones',()=>{
  const p=api.planWeek([
    {id:'a',type:'installation',startDate:'2026-09-13',endDate:'2026-09-13',startTime:'08:00',endTime:'09:00'},
    {id:'b',type:'measure',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'10:00',endTime:'11:00'},
    {id:'c',type:'pickup',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'',endTime:''}
  ],'2026-09-13',['measure']);
  assert.equal(p.timed.length,1);assert.equal(p.timed[0].id,'b');assert.equal(p.allDay.length,0);
});

check('empty stores yield clearly marked video-style demo fixtures',()=>{
  const empty={getItem(){return null},setItem(){throw new Error('WRITE FORBIDDEN')},removeItem(){throw new Error('WRITE FORBIDDEN')},clear(){throw new Error('WRITE FORBIDDEN')}};
  const real=api.readScheduleData(empty);assert.equal(real.tasks.length,0);
  const demo=api.demoTasks('2026-09-13');assert.ok(demo.length>=7);assert.ok(demo.every(x=>x.demo===true&&x.source==='DEMO'));assert.ok(demo.some(x=>x.startDate!==x.endDate));assert.ok(demo.some(x=>x.startTime));
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

check('source contains zero browser-storage mutation and zero network transport',()=>{
  assert.doesNotMatch(source,/\.setItem\s*\(/);
  assert.doesNotMatch(source,/\.removeItem\s*\(/);
  assert.doesNotMatch(source,/\.clear\s*\(/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/XMLHttpRequest|WebSocket|supabase/i);
});

check('preview remains isolated from mutating calendar modules and production entry',()=>{
  assert.match(html,/weekly-schedule-v062\.js/);
  assert.doesNotMatch(html,/calendar-chc-people-v060|calendar-schema-v058|calendar-groups-v056|installer-calendar-v053/);
  assert.match(source,/READ ONLY/i);
  assert.doesNotMatch(prod,/v062-weekly-schedule|weekly-schedule-v062/);
});

check('1,000 mixed tasks produce deterministic all-day and timed layout',()=>{
  const tasks=Array.from({length:1000},(_,i)=>{
    const day=i%7,type=api.TYPE_ORDER[i%api.TYPE_ORDER.length],timed=i%2===0;
    return {id:`stress-${String(i).padStart(4,'0')}`,type,startDate:api.addDays('2026-09-13',day),endDate:api.addDays('2026-09-13',day),startTime:timed?`${String(8+(i%9)).padStart(2,'0')}:00`:'',endTime:timed?`${String(9+(i%9)).padStart(2,'0')}:00`:''};
  });
  const a=api.planWeek(tasks,'2026-09-13',new Set(api.TYPE_ORDER));
  const b=api.planWeek(tasks,'2026-09-13',new Set(api.TYPE_ORDER));
  assert.equal(a.allDay.length+a.timed.length,1000);assert.equal(b.allDay.length+b.timed.length,1000);
  assert.deepEqual(Array.from(a.allDay,x=>[x.id,x.lane,x.startCol,x.endCol]),Array.from(b.allDay,x=>[x.id,x.lane,x.startCol,x.endCol]));
  assert.deepEqual(Array.from(a.timed,x=>[x.id,x.dayCol,x.timedLane,x.topPct,x.heightPct]),Array.from(b.timed,x=>[x.id,x.dayCol,x.timedLane,x.topPct,x.heightPct]));
});

console.log(`WEEKLY SCHEDULING V0.6.2 GATE · PASS · ${passed}/${passed}`);
console.log('READ-ONLY GATE · PASS · zero localStorage mutations / zero network transport');
