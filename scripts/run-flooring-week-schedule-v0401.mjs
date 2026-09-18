import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const path=new URL('../flooring/week-schedule-v0401.js',import.meta.url);
const source=fs.readFileSync(path,'utf8');
const ctx={globalThis:{},console};ctx.globalThis.globalThis=ctx.globalThis;
vm.createContext(ctx.globalThis);vm.runInContext(source,ctx.globalThis,{filename:'week-schedule-v0401.js'});
const A=ctx.globalThis.RUNLUWeekScheduleV0401;
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
test('Action Required puts explicit timed overlap first',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true}],
    flooringJobs:[
      {id:'j1',jobNumber:'10',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'},
      {id:'j2',jobNumber:'11',customerName:'B',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'11:00',installEnd:'15:00'}
    ],
    supplierPOs:[{id:'p1',jobId:'j1',status:'Received'},{id:'p2',jobId:'j2',status:'Received'}],warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),a=A.actionRequired(datasets,tasks,'2026-09-18',5);
  assert(a.top.length);assert.equal(a.top[0].kind,'conflict');assert.equal(a.top[0].score,100);assert.equal(a.top[0].level,'critical')
});
test('Action Required merges material and schedule-gap reasons for the same job',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true}],
    flooringJobs:[{id:'j1',jobNumber:'20',customerName:'Merge Test',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:''}],
    supplierPOs:[{id:'p1',jobId:'j1',status:'Ordered'}],warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),a=A.actionRequired(datasets,tasks,'2026-09-18',5);
  const jobs=a.items.filter(x=>x.kind==='job');assert.equal(jobs.length,1);assert(jobs[0].reasons.some(x=>x.includes('Material not received')));assert(jobs[0].reasons.some(x=>x.includes('missing end time')));assert.equal(jobs[0].score,92)
});
test('Action Required ranks today gap ahead of tomorrow gap',()=>{
  const datasets={
    people:[],
    flooringJobs:[
      {id:'j1',jobNumber:'30',customerName:'Today',status:'Confirmed',dateRequired:'2026-09-18'},
      {id:'j2',jobNumber:'31',customerName:'Tomorrow',status:'Confirmed',dateRequired:'2026-09-19'}
    ],
    supplierPOs:[],warehouseOrders:[],manualEvents:[]
  };
  const a=A.actionRequired(datasets,[],'2026-09-18',5);
  const today=a.items.find(x=>x.jobNumber==='30'),tomorrow=a.items.find(x=>x.jobNumber==='31');
  assert(today&&tomorrow);assert(today.score>tomorrow.score);assert.equal(today.level,'urgent');assert.equal(tomorrow.level,'review')
});
test('Action Required limit returns top five and reports hidden count',()=>{
  const jobs=Array.from({length:8},(_,i)=>({id:'j'+i,jobNumber:String(100+i),customerName:'C'+i,status:'Confirmed',dateRequired:'2026-09-18'}));
  const datasets={people:[],flooringJobs:jobs,supplierPOs:[],warehouseOrders:[],manualEvents:[]};
  const a=A.actionRequired(datasets,[],'2026-09-18',5);assert.equal(a.total,8);assert.equal(a.top.length,5);assert.equal(a.hidden,3)
});
test('Action Required can be empty when no issue rule fires',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true}],
    flooringJobs:[{id:'j1',jobNumber:'40',customerName:'Ready',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],
    supplierPOs:[{id:'p1',jobId:'j1',status:'Received'}],warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),a=A.actionRequired(datasets,tasks,'2026-09-18',5);assert.equal(a.total,0);assert.equal(a.top.length,0)
});
test('No linked PO stays review-level rather than being promoted to confirmed material failure',()=>{
  const datasets={
    people:[{name:'Bilal',groups:['Installer'],active:true}],
    flooringJobs:[{id:'j1',jobNumber:'50',customerName:'Unknown PO',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],
    supplierPOs:[],warehouseOrders:[],manualEvents:[]
  };
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),a=A.actionRequired(datasets,tasks,'2026-09-18',5),x=a.items.find(v=>v.jobNumber==='50');
  assert(x);assert.equal(x.score,78);assert.equal(x.level,'review');assert(x.reasons.some(r=>r.includes('No linked PO')))
});
test('Conflict explanation includes WHY, evidence and next checks',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[
    {id:'j1',jobNumber:'10',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'},
    {id:'j2',jobNumber:'11',customerName:'B',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'11:00',installEnd:'15:00'}
  ],supplierPOs:[{id:'p1',jobId:'j1',status:'Received'},{id:'p2',jobId:'j2',status:'Received'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),x=A.actionRequired(datasets,tasks,'2026-09-18',5).top[0];
  assert.equal(x.kind,'conflict');assert(x.why[0].includes('overlaps'));assert(x.nextChecks.some(v=>v.includes('exact start and end times')));assert(x.evidence.includes('Explicit installer assignment'))
});
test('Waiting material explanation tells user to check linked PO receiving status',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'20',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[{id:'p1',jobId:'j1',status:'Ordered'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),x=A.actionRequired(datasets,tasks,'2026-09-18',5).items.find(v=>v.jobNumber==='20');
  assert(x);assert(x.nextChecks.some(v=>v.includes('linked PO receiving status')));assert(x.evidence.includes('Linked Flooring PO status'))
});
test('Unknown material explanation asks to verify PO linkage rather than claim failure',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'21',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),x=A.actionRequired(datasets,tasks,'2026-09-18',5).items.find(v=>v.jobNumber==='21');
  assert(x);assert.equal(x.materialState.code,'unknown');assert(x.nextChecks.some(v=>v.includes('linked to the correct supplier PO')));assert.equal(x.why.some(v=>v.includes('not received')),false)
});
test('Schedule-gap explanation maps missing fields to concrete verification checks',()=>{
  const datasets={people:[],flooringJobs:[{id:'j1',jobNumber:'30',customerName:'Gap',status:'Confirmed',dateRequired:'2026-09-18'}],supplierPOs:[],warehouseOrders:[],manualEvents:[]};
  const x=A.actionRequired(datasets,[],'2026-09-18',5).items.find(v=>v.jobNumber==='30');
  assert(x);assert(x.missingFields.includes('install date'));assert(x.missingFields.includes('installer'));assert(x.nextChecks.some(v=>v.includes('install date')));assert(x.nextChecks.some(v=>v.includes('installer assignment')));assert(x.evidence.includes('Flooring job schedule fields'))
});
test('Merged action de-duplicates repeated What-to-check-next guidance',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'40',customerName:'Merge',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'',installEnd:''}],supplierPOs:[{id:'p1',jobId:'j1',status:'Ordered'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),x=A.actionRequired(datasets,tasks,'2026-09-18',5).items.find(v=>v.jobNumber==='40');
  assert(x);assert.equal(new Set(Array.from(x.nextChecks)).size,x.nextChecks.length);assert(x.kinds.includes('material'));assert(x.kinds.includes('schedule-gap'))
});
test('Explanation helper is deterministic and does not mutate score or level',()=>{
  const item={id:'x',score:65,level:'review',kind:'schedule-check',reasons:['Same installer/day but exact overlap cannot be proven from current time data']};
  const a=A.explainAction({...item}),b=A.explainAction({...item});assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.score,65);assert.equal(a.level,'review')
});
test('Morning Brief clear state summarizes installs without inventing issues',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'60',customerName:'Clear',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[{id:'p1',jobId:'j1',status:'Received'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),b=A.morningBrief(datasets,tasks,'2026-09-18');
  assert.equal(b.severity,'clear');assert.equal(b.actions.total,0);assert.equal(b.chips.find(x=>x.key==='installs').value,1);assert(b.headline.includes('No Action Required'))
});
test('Morning Brief critical state leads with timed overlap and first focus',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[
    {id:'j1',jobNumber:'61',customerName:'A',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'},
    {id:'j2',jobNumber:'62',customerName:'B',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'11:00',installEnd:'15:00'}
  ],supplierPOs:[{id:'p1',jobId:'j1',status:'Received'},{id:'p2',jobId:'j2',status:'Received'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),b=A.morningBrief(datasets,tasks,'2026-09-18');
  assert.equal(b.severity,'critical');assert.equal(b.chips.find(x=>x.key==='overlap').value,1);assert(b.focus);assert.equal(b.focus.level,'critical');assert(b.focus.firstCheck.includes('installer assignment'))
});
test('Morning Brief waiting material is urgent and reports material breakdown',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'63',customerName:'Waiting',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[{id:'p1',jobId:'j1',status:'Ordered'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),b=A.morningBrief(datasets,tasks,'2026-09-18');
  assert.equal(b.severity,'urgent');assert.equal(b.chips.find(x=>x.key==='material').value,1);assert(b.sentences.some(s=>s.includes('1 waiting, 0 partial, 0 unknown linkage')))
});
test('Morning Brief unknown PO linkage stays review level',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'64',customerName:'Unknown',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),b=A.morningBrief(datasets,tasks,'2026-09-18');
  assert.equal(b.severity,'review');assert(b.headline.includes('No critical conflict'));assert(b.sentences.some(s=>s.includes('1 unknown linkage')))
});
test('Morning Brief no-install-assigned language does not claim availability',()=>{
  const datasets={people:[{name:'Bilal',groups:['Installer'],active:true},{name:'Wade',groups:['Installer'],active:true}],flooringJobs:[{id:'j1',jobNumber:'65',customerName:'Assigned',status:'Confirmed',installDate:'2026-09-18',installer:'Bilal',installStart:'08:00',installEnd:'12:00'}],supplierPOs:[{id:'p1',jobId:'j1',status:'Received'}],warehouseOrders:[],manualEvents:[]};
  const tasks=A.extractFlooringJobs(datasets.flooringJobs),b=A.morningBrief(datasets,tasks,'2026-09-18');
  assert(b.sentences.some(s=>s.includes('does not mean available or off work')));assert.equal(b.actions.dispatch.noInstallAssigned.includes('Wade'),true)
});
test('Morning Brief is deterministic and first focus matches top Action Required item',()=>{
  const datasets={people:[],flooringJobs:[{id:'j1',jobNumber:'66',customerName:'Gap',status:'Confirmed',dateRequired:'2026-09-18'}],supplierPOs:[],warehouseOrders:[],manualEvents:[]};
  const a=A.morningBrief(datasets,[],'2026-09-18'),b=A.morningBrief(datasets,[],'2026-09-18');
  assert.equal(JSON.stringify(a),JSON.stringify(b));assert(a.focus);assert.equal(a.focus.title,a.actions.top[0].title);assert.equal(a.focus.firstCheck,a.actions.top[0].nextChecks[0])
});
test('1000-task layout pressure',()=>{
  const w='2026-09-13',types=['Installation','Appointment','Pickup'];const xs=Array.from({length:1000},(_,i)=>({id:'t'+i,type:types[i%types.length],title:'Task '+i,person:'P'+(i%50),startDate:A.addDays(w,i%7),endDate:A.addDays(w,Math.min(6,(i%7)+(i%3)))}));const t0=performance.now();const out=A.allocateLanes(xs,w);const ms=performance.now()-t0;assert.equal(out.tasks.length,1000);assert(ms<750,`layout too slow: ${ms.toFixed(1)}ms`)
});
test('Absolute read-only static gate',()=>{
  const banned=[/localStorage\s*\.\s*setItem\s*\(/,/localStorage\s*\.\s*removeItem\s*\(/,/indexedDB\s*\.\s*open\s*\(/,/\.\s*(insert|update|upsert|delete)\s*\(/,/fetch\s*\(/,/XMLHttpRequest\b/,/WebSocket\b/];for(const re of banned)assert.equal(re.test(source),false,`banned write/network token: ${re}`)
});

const failed=checks.filter(x=>!x.pass);for(const c of checks)console.log(`${c.pass?'PASS':'FAIL'}  ${c.name}  ${c.ms}ms${c.error?'  '+c.error:''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} checks passed.`);if(failed.length)process.exit(1);
