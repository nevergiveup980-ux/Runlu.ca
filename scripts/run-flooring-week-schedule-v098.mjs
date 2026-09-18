import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/week-schedule-v098.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);vm.runInContext(source,ctx.globalThis,{filename:'week-schedule-v098.js'});
const A=ctx.globalThis.RUNLUWeekScheduleV098;
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
test('Daily counts include multi-day tasks on every occupied day',()=>{
  const w='2026-09-13',xs=[
    {id:'a',startDate:'2026-09-13',endDate:'2026-09-15'},
    {id:'b',startDate:'2026-09-15',endDate:'2026-09-15'},
    {id:'c',startDate:'2026-09-19',endDate:'2026-09-22'}
  ];assert.equal(JSON.stringify(Array.from(A.weekDayCounts(xs,w))),JSON.stringify([1,1,2,0,0,0,1]))
});
test('Auto density scales from comfortable to compact to dense',()=>{
  assert.equal(A.densityProfile(4,4,'auto').mode,'comfortable');
  assert.equal(A.densityProfile(10,7,'auto').mode,'compact');
  assert.equal(A.densityProfile(25,25,'auto').mode,'dense');
  assert.equal(A.densityProfile(30,30,'comfortable').mode,'comfortable')
});
test('Dense single-day workload remains deterministic',()=>{
  const w='2026-09-13',xs=Array.from({length:120},(_,i)=>({id:'d'+i,title:'Dense '+i,person:'P'+(i%12),startDate:'2026-09-15',endDate:'2026-09-15'}));
  const layout=A.allocateLanes(xs,w),counts=A.weekDayCounts(xs,w),profile=A.densityProfile(layout.laneCount,Math.max(...counts),'auto');
  assert.equal(layout.tasks.length,120);assert.equal(layout.laneCount,120);assert.equal(counts[2],120);assert.equal(profile.mode,'dense')
});
test('Cross-source logical schedule duplicates collapse to one task',()=>{
  const xs=A.extractAll({
    warehouseOrders:[{id:'w1',jobNumber:'190001',customerName:'Same Customer',installer:'Bilal',installDate:'2026-09-15',installStart:'08:00',installEnd:'16:00'}],
    flooringJobs:[{id:'f1',jobNumber:'190001',customerName:'Same Customer',installer:'Bilal',installDate:'2026-09-15',installStart:'08:00',installEnd:'16:00'}],
    manualEvents:[],supplierPOs:[]
  });assert.equal(xs.filter(x=>x.type==='Installation').length,1)
});
test('Explicit timed overlap is a hard conflict',()=>{
  const w='2026-09-13',xs=[
    {id:'a',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'08:00',endTime:'12:00'},
    {id:'b',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'11:00',endTime:'14:00'}
  ];const x=A.conflictAnalysis(xs,w);assert.equal(x.hard,1);assert.equal(x.possible,0)
});
test('Back-to-back timed jobs are not a conflict',()=>{
  const w='2026-09-13',xs=[
    {id:'a',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'08:00',endTime:'12:00'},
    {id:'b',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'12:00',endTime:'16:00'}
  ];const x=A.conflictAnalysis(xs,w);assert.equal(x.hard,0);assert.equal(x.possible,0)
});
test('Multi-day assignment plus another job is a conservative schedule check',()=>{
  const w='2026-09-13',xs=[
    {id:'a',type:'Installation',installer:'Wade',person:'Wade',startDate:'2026-09-14',endDate:'2026-09-16',startTime:'08:00',endTime:'16:00'},
    {id:'b',type:'Installation',installer:'Wade',person:'Wade',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'10:00',endTime:'12:00'}
  ];const x=A.conflictAnalysis(xs,w);assert.equal(x.hard,0);assert.equal(x.possible,1)
});
test('Different installers do not conflict',()=>{
  const w='2026-09-13',xs=[
    {id:'a',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'08:00',endTime:'12:00'},
    {id:'b',type:'Installation',installer:'Wade',person:'Wade',startDate:'2026-09-15',endDate:'2026-09-15',startTime:'09:00',endTime:'11:00'}
  ];const x=A.conflictAnalysis(xs,w);assert.equal(x.conflicts.length,0)
});
test('Workload matrix counts task-days and only known explicit hours',()=>{
  const w='2026-09-13',xs=[
    {id:'a',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-14',endDate:'2026-09-14',startTime:'08:00',endTime:'16:00'},
    {id:'b',type:'Installation',installer:'Bilal',person:'Bilal',startDate:'2026-09-15',endDate:'2026-09-16',startTime:'08:00',endTime:'16:00'}
  ];const m=A.workloadMatrix(xs,w),r=m.rows.find(x=>x.person==='Bilal');assert(r);assert.equal(r.taskDays,3);assert.equal(r.knownMinutes,480);assert.equal(r.days[1].knownMinutes,480);assert.equal(r.days[2].knownMinutes,0)
});
test('Installer roster uses active Installer people plus scheduled installers',()=>{
  const roster=A.installerRoster(
    [{name:'Bilal',groups:['Installer'],active:true},{name:'Wade',groups:['Installer'],active:false},{name:'Carol',groups:['Sales'],active:true}],
    [{id:'x',type:'Installation',installer:'Ilker',person:'Ilker',startDate:'2026-09-18',endDate:'2026-09-18'}]
  );assert.equal(JSON.stringify(Array.from(roster)),JSON.stringify(['Bilal','Ilker']))
});
test('Material state stays unknown without linked PO',()=>{
  const s=A.materialStateForJob({id:'j1',jobNumber:'100'},[]);assert.equal(s.code,'unknown');assert.equal(s.label,'No linked PO')
});
test('Material state is ready only when all linked POs are received or completed',()=>{
  const job={id:'j1',jobNumber:'100'};
  assert.equal(A.materialStateForJob(job,[{jobId:'j1',status:'Received'},{jobId:'j1',status:'Completed'}]).code,'ready');
  assert.equal(A.materialStateForJob(job,[{jobId:'j1',status:'Received'},{jobId:'j1',status:'Ordered'}]).code,'partial');
  assert.equal(A.materialStateForJob(job,[{jobId:'j1',status:'Ordered'}]).code,'waiting')
});
test('Upcoming gaps flag near-term missing installer or time but ignore completed jobs',()=>{
  const xs=A.upcomingScheduleGaps([
    {id:'a',jobNumber:'1',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:''},
    {id:'b',jobNumber:'2',customerName:'B',status:'Confirmed',dateRequired:'2026-09-19',installer:''},
    {id:'c',jobNumber:'3',customerName:'C',status:'Completed',installDate:'2026-09-18',installer:''}
  ],'2026-09-18',2);
  assert.equal(xs.length,2);assert(xs.some(x=>x.jobNumber==='1'&&x.missing.includes('end time')));assert(xs.some(x=>x.jobNumber==='2'&&x.missing.includes('install date')&&x.missing.includes('installer')))
});
test('Dispatch morning separates assigned from no-install-assigned roster',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true},{name:'Wade',groups:['Installer'],active:true}],
    flooringJobs:[{id:'j1',jobNumber:'10',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],
    supplierPOs:[],warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),d=A.dispatchMorning(datasets,tasks,'2026-09-18');
  assert.equal(JSON.stringify(Array.from(d.assigned)),JSON.stringify(['Bilal']));
  assert.equal(JSON.stringify(Array.from(d.noInstallAssigned)),JSON.stringify(['Wade']));
  assert.equal(d.installs.length,1)
});
test('Dispatch morning carries same-day hard overlap and material attention',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true}],
    flooringJobs:[
      {id:'j1',jobNumber:'10',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'},
      {id:'j2',jobNumber:'11',customerName:'B',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'11:00',installEnd:'15:00'}
    ],
    supplierPOs:[{id:'p1',jobId:'j1',jobNumber:'10',status:'Received'},{id:'p2',jobId:'j2',jobNumber:'11',status:'Ordered'}],
    warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),d=A.dispatchMorning(datasets,tasks,'2026-09-18');
  assert.equal(d.hard.length,1);assert.equal(d.materialAttention.length,1);assert.equal(d.materialAttention[0].state.code,'waiting')
});
test('Dispatch no-install-assigned is schedule-only and does not infer availability fields',()=>{
  const d=A.dispatchMorning({people:[{name:'Wade',groups:['Installer'],active:true}],flooringJobs:[],supplierPOs:[],warehouseOrders:[],manualEvents:[]},[],'2026-09-18');
  assert.equal(d.noInstallAssigned[0],'Wade');assert.equal('available' in d,false);assert.equal('working' in d,false)
});
test('1000-task layout pressure',()=>{
  const w='2026-09-13',types=['Installation','Appointment','Pickup'];const xs=Array.from({length:1000},(_,i)=>({id:'t'+i,type:types[i%types.length],title:'Task '+i,person:'P'+(i%50),startDate:A.addDays(w,i%7),endDate:A.addDays(w,Math.min(6,(i%7)+(i%3)))}));const t0=performance.now();const out=A.allocateLanes(xs,w);const ms=performance.now()-t0;assert.equal(out.tasks.length,1000);assert(ms<750,`layout too slow: ${ms.toFixed(1)}ms`)
});
test('Absolute read-only static gate',()=>{
  const banned=[/localStorage\s*\.\s*setItem\s*\(/,/localStorage\s*\.\s*removeItem\s*\(/,/indexedDB\s*\.\s*open\s*\(/,/\.\s*(insert|update|upsert|delete)\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/];for(const re of banned)assert.equal(re.test(source),false,`banned write/network token: ${re}`)
});

const failed=checks.filter(x=>!x.pass);for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'}  ${c.name}  ${c.ms}ms${c.error?'  '+c.error:''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} checks passed.`);if(failed.length)process.exit(1);
