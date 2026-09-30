import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const basePath='flooring/weekly-schedule-v062.js';
const sidePath='flooring/weekly-schedule-v062-sidebar-r1.js';
const pagePath='flooring/index-v062r1-weekly-schedule.html';
const prodPath='flooring/index.html';
const base=fs.readFileSync(basePath,'utf8');
const source=fs.readFileSync(sidePath,'utf8');
const page=fs.readFileSync(pagePath,'utf8');
const prod=fs.readFileSync(prodPath,'utf8');

function load(path,src){
  const box={console,module:{exports:{}},exports:{},globalThis:null,Date,Map,Set,String,Array,Object,Number,Math,RegExp,Error};
  box.globalThis=box;vm.createContext(box);vm.runInContext(src,box,{filename:path});return box.module.exports;
}
const baseApi=load(basePath,base),api=load(sidePath,source);
assert.equal(baseApi.VERSION,'0.6.2');
assert.equal(api.VERSION,'0.6.2r1');
assert.equal(api.readOnly,true);

let passed=0;
function check(name,fn){fn();passed++;console.log(`PASS · ${name}`)}

const tasks=[
  {id:'i1',type:'installation',title:'Install Job 1',assignedTo:'Bilal',subCalendar:'Bilal',customer:'Alice',color:'#315d49'},
  {id:'i2',type:'installation',title:'Install Job 2',assignedTo:'Bilal',subCalendar:'Bilal',customer:'Bob',color:'#315d49'},
  {id:'i3',type:'installation',title:'Install Job 3',assignedTo:'Wade',subCalendar:'Wade',customer:'Carol',color:'#6a4f9a'},
  {id:'m1',type:'measure',title:'Measure Site',assignedTo:'Alana',subCalendar:'Measurements',customer:'Delta',color:'#445566'},
  {id:'p1',type:'pickup',title:'Pickup PO1',subCalendar:'Twelve Oaks',customer:'Echo',color:'#774411'},
  {id:'d1',type:'delivery',title:'Delivery PO2',subCalendar:'Twelve Oaks',customer:'Foxtrot',color:'#774411'}
];

check('facets group installations by installer',()=>{
  const facets=api.buildFacets(tasks),bilal=facets.find(x=>x.key==='installer:Bilal'),wade=facets.find(x=>x.key==='installer:Wade');
  assert.equal(bilal.kind,'Installers');assert.equal(bilal.count,2);assert.equal(wade.count,1);
});

check('manual measurement becomes Calendar facet',()=>{
  const f=api.facetForTask(tasks[3]);assert.equal(f.key,'calendar:Measurements');assert.equal(f.kind,'Calendars');assert.equal(f.color,'#445566');
});

check('pickup and delivery share supplier facet',()=>{
  const facets=api.buildFacets(tasks),s=facets.find(x=>x.key==='supplier:Twelve Oaks');
  assert.equal(s.kind,'Suppliers');assert.equal(s.count,2);
});

check('facet filtering hides unselected calendars',()=>{
  const selected=new Set(['installer:Bilal','calendar:Measurements','supplier:Twelve Oaks']);
  assert.equal(api.visibleByFacet(tasks[0],selected,''),true);
  assert.equal(api.visibleByFacet(tasks[2],selected,''),false);
});

check('search matches customer, title and assigned person case-insensitively',()=>{
  const all=new Set(api.buildFacets(tasks).map(x=>x.key));
  assert.equal(api.visibleByFacet(tasks[0],all,'alice'),true);
  assert.equal(api.visibleByFacet(tasks[0],all,'INSTALL JOB'),true);
  assert.equal(api.visibleByFacet(tasks[0],all,'bilal'),true);
  assert.equal(api.visibleByFacet(tasks[0],all,'not-here'),false);
});

check('missing assignment gets explicit unassigned facet',()=>{
  const f=api.facetForTask({id:'x',type:'installation'});assert.equal(f.key,'installer:Unassigned installer');
});

check('current-time marker calculates Sunday-based day column',()=>{
  const d=new Date(2026,8,16,13,30,0); // local Wednesday Sep 16 2026
  const g=api.nowGeometry('2026-09-13',d);
  assert.equal(g.dayCol,3);assert.equal(g.minute,810);assert.ok(g.topPct>0&&g.topPct<100);assert.ok(Math.abs(g.widthPct-(100/7))<1e-9);
});

check('current-time marker is absent outside week or visible hours',()=>{
  assert.equal(api.nowGeometry('2026-09-13',new Date(2026,8,20,12,0,0)),null);
  assert.equal(api.nowGeometry('2026-09-13',new Date(2026,8,16,6,30,0)),null);
  assert.equal(api.nowGeometry('2026-09-13',new Date(2026,8,16,20,0,0)),null);
});

check('enhancement source has no browser-storage mutation or network transport',()=>{
  assert.doesNotMatch(source,/\.setItem\s*\(/);
  assert.doesNotMatch(source,/\.removeItem\s*\(/);
  assert.doesNotMatch(source,/\.clear\s*\(/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/XMLHttpRequest|WebSocket|supabase/i);
});

check('enhanced page composes isolated V0.6.2 preview and sidebar only',()=>{
  assert.match(page,/index-v062-weekly-schedule\.html/);
  assert.match(page,/weekly-schedule-v062-sidebar-r1\.js/);
  assert.doesNotMatch(page,/calendar-chc-people-v060|calendar-schema-v058|calendar-groups-v056|installer-calendar-v053/);
  assert.doesNotMatch(prod,/v062r1-weekly-schedule|weekly-schedule-v062-sidebar-r1/);
});

check('facet generation is deterministic for 1,000 tasks',()=>{
  const big=Array.from({length:1000},(_,i)=>({
    id:'t'+i,type:i%3===0?'installation':i%3===1?'measure':'pickup',
    assignedTo:'Crew '+(i%17),subCalendar:i%3===2?'Supplier '+(i%11):i%3===1?'Calendar '+(i%7):'Crew '+(i%17),
    color:'#315d49'
  }));
  const a=api.buildFacets(big),b=api.buildFacets(big);
  assert.deepEqual(Array.from(a,x=>[x.key,x.kind,x.count]),Array.from(b,x=>[x.key,x.kind,x.count]));
  assert.equal(a.reduce((n,x)=>n+x.count,0),1000);
});

console.log(`WEEKLY SCHEDULING V0.6.2r1 SIDEBAR GATE · PASS · ${passed}/${passed}`);
console.log('READ-ONLY ENHANCEMENT GATE · PASS · in-memory filters only');
