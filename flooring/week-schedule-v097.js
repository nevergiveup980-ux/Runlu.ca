/* RUNLU Deerfoot Flooring OS · V0.3.97 Week Schedule + Installer Workload Preview
   Read-only weekly task board. It may READ existing browser-local Flooring / Warehouse
   order, calendar and PO datasets, but it never writes order state, inventory, PO data,
   localStorage, IndexedDB, Supabase or any network resource.
*/
(function(root){
'use strict';
if(root.__RUNLU_WEEK_SCHEDULE_V097__)return;
root.__RUNLU_WEEK_SCHEDULE_V096__=true;

const VERSION='0.3.97';
const KEYS={
  warehouseOrders:'runlu_orders_v20',
  flooringJobs:'runlu_deerfoot_flooring_jobs_v1',
  manualEvents:'runlu_calendar_manual_events_v056',
  supplierPOs:'runlu_deerfoot_supplier_orders_v1',
  people:'runlu_calendar_people_v064'
};
const DAY_MS=86400000;
const TYPE_ORDER=['Installation','Appointment','Measurement','CHC','Pickup','Delivery','Required Date','Other'];
const TYPE_CLASS={
  Installation:'install',Appointment:'appt',Measurement:'measure',CHC:'chc',Pickup:'pickup',Delivery:'delivery','Required Date':'required',Other:'other'
};
const TYPE_LABEL={
  Installation:'Installation',Appointment:'Appointment',Measurement:'Measurement',CHC:'CHC',Pickup:'Supplier Pickup',Delivery:'Supplier Delivery','Required Date':'Required Date',Other:'Other'
};

function str(v){return String(v==null?'':v).trim()}
function esc(v){return str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function attr(v){return esc(v).replace(/"/g,'&quot;')}
function iso(v){return /^\d{4}-\d{2}-\d{2}$/.test(str(v))}
function dateObj(v){if(!iso(v))return null;const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?null:d}
function dateIso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function addDays(v,n){const d=typeof v==='string'?dateObj(v):new Date(v);if(!d)return '';d.setDate(d.getDate()+n);return dateIso(d)}
function dayDiff(a,b){const da=dateObj(a),db=dateObj(b);if(!da||!db)return 0;return Math.round((db-da)/DAY_MS)}
function sundayFor(v){const d=dateObj(v)||new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-d.getDay());return dateIso(d)}
function localToday(){const d=new Date();return dateIso(d)}
function pretty(v,opt){const d=dateObj(v);return d?d.toLocaleDateString('en-CA',opt||{month:'short',day:'numeric'}):'—'}
function timeOk(v){return /^\d{1,2}:\d{2}$/.test(str(v))}
function normalizeTime(v){const s=str(v);if(!s)return '';if(/^\d{2}:\d{2}$/.test(s))return s;if(/^\d:\d{2}$/.test(s))return '0'+s;const m=s.match(/^(\d{1,2}):(\d{2})\s*([ap])\.?m\.?$/i);if(m){let h=Number(m[1])%12;if(m[3].toLowerCase()==='p')h+=12;return String(h).padStart(2,'0')+':'+m[2]}return ''}
function firstDate(){for(const v of arguments){if(iso(v))return v}return ''}
function firstText(){for(const v of arguments){if(str(v))return str(v)}return ''}
function arr(v){return Array.isArray(v)?v:[]}
function safeRead(storage,key,fallback){try{const raw=storage&&storage.getItem?storage.getItem(key):null;if(!raw)return fallback;const v=JSON.parse(raw);return v==null?fallback:v}catch(_){return fallback}}
function stableId(prefix,parts){return prefix+'-'+parts.map(str).join('|').replace(/[^a-z0-9|_-]+/gi,'-').slice(0,160)}
function typeOfEvent(x){
  const raw=(firstText(x.eventType,x.subCalendar,x.sub,x.calendarGroup,x.group,x.type)||'Other').toLowerCase();
  if(raw.includes('measure'))return 'Measurement';
  if(raw.includes('appoint'))return 'Appointment';
  if(raw.includes('chc'))return 'CHC';
  if(raw.includes('install'))return 'Installation';
  if(raw.includes('deliver'))return 'Delivery';
  if(raw.includes('pickup'))return 'Pickup';
  return 'Other';
}
function taskBase(x){return {
  id:str(x.id),source:str(x.source),sourceKey:str(x.sourceKey),sourceRecordId:str(x.sourceRecordId),
  type:str(x.type)||'Other',title:str(x.title)||'Untitled task',customer:str(x.customer),person:str(x.person)||'Unassigned',
  sales:str(x.sales),installer:str(x.installer),startDate:str(x.startDate),endDate:str(x.endDate)||str(x.startDate),
  startTime:normalizeTime(x.startTime),endTime:normalizeTime(x.endTime),status:str(x.status),address:str(x.address),
  jobNumber:str(x.jobNumber),poNumber:str(x.poNumber),notes:str(x.notes),demo:!!x.demo
}}
function validTask(t){return iso(t.startDate)&&iso(t.endDate)&&t.endDate>=t.startDate}
function addTask(out,raw){const t=taskBase(raw);if(!t.id)t.id=stableId('task',[t.source,t.type,t.jobNumber,t.poNumber,t.customer,t.person,t.startDate,t.startTime]);if(validTask(t))out.push(t)}

function extractWarehouseOrders(records){
  const out=[];
  arr(records).forEach((o,i)=>{
    if(!o||typeof o!=='object')return;
    const id=firstText(o.id,o.orderId,o.order_id,o.jobId,o.job_id,'row'+i);
    const customer=firstText(o.customerName,o.customer_name,o.customer,o.shipToName,o.ship_to_name);
    const jobNumber=firstText(o.jobNumber,o.job_number,o.orderNumber,o.order_number,o.number,o.job);
    const sales=firstText(o.sales,o.salesRep,o.sales_rep,o.clerk,o.salesperson,o.salesPerson);
    const installer=firstText(o.installer,o.installerName,o.installer_name,o.assignedInstaller,o.assigned_installer);
    const status=firstText(o.installStatus,o.install_status,o.status);
    const address=firstText(o.installAddress,o.install_address,o.shipToAddress,o.ship_to_address,o.address);
    const notes=firstText(o.installNotes,o.install_notes,o.notes,o.note);
    const start=firstDate(o.installDate,o.install_date,o.installStartDate,o.install_start_date,o.scheduleDate,o.schedule_date);
    const end=firstDate(o.installEndDate,o.install_end_date,o.endDate,o.end_date,start);
    if(start)addTask(out,{source:'Warehouse Orders',sourceKey:KEYS.warehouseOrders,sourceRecordId:id,type:'Installation',title:firstText(jobNumber?'Job '+jobNumber:'',customer,'Installation'),customer,person:installer||sales||'Unassigned',sales,installer,startDate:start,endDate:end,startTime:firstText(o.installStart,o.install_start,o.startTime,o.start_time),endTime:firstText(o.installEnd,o.install_end,o.endTime,o.end_time),status,address,jobNumber,notes});
    const pickup=firstDate(o.pickupDate,o.pickup_date,o.supplierPickupDate,o.supplier_pickup_date);
    if(pickup)addTask(out,{source:'Warehouse Orders',sourceKey:KEYS.warehouseOrders,sourceRecordId:id,type:'Pickup',title:firstText(jobNumber?'Job '+jobNumber:'',customer,'Supplier Pickup'),customer,person:sales||installer||'Unassigned',sales,installer,startDate:pickup,endDate:pickup,status,address,jobNumber,notes});
    const delivery=firstDate(o.deliveryDate,o.delivery_date,o.supplierDeliveryDate,o.supplier_delivery_date);
    if(delivery)addTask(out,{source:'Warehouse Orders',sourceKey:KEYS.warehouseOrders,sourceRecordId:id,type:'Delivery',title:firstText(jobNumber?'Job '+jobNumber:'',customer,'Supplier Delivery'),customer,person:sales||installer||'Unassigned',sales,installer,startDate:delivery,endDate:delivery,status,address,jobNumber,notes});
  });
  return out;
}
function extractFlooringJobs(records){
  const out=[];
  arr(records).forEach((j,i)=>{
    if(!j||typeof j!=='object'||j.isDemo===true)return;
    const id=firstText(j.id,'job'+i),customer=firstText(j.customerName,j.customer,j.shipToName),jobNumber=firstText(j.jobNumber,j.orderNumber),sales=firstText(j.clerk,j.salesRep,j.sales),installer=firstText(j.installer,j.installerName),status=firstText(j.installStatus,j.status),address=firstText(j.installAddress,j.shipToAddress,j.soldToAddress),notes=firstText(j.installNotes,j.notes);
    const start=firstDate(j.installDate,j.installStartDate,j.scheduleDate),end=firstDate(j.installEndDate,j.endDate,start);
    if(start)addTask(out,{source:'Flooring Orders',sourceKey:KEYS.flooringJobs,sourceRecordId:id,type:'Installation',title:firstText(jobNumber?'Job '+jobNumber:'',customer,'Installation'),customer,person:installer||sales||'Unassigned',sales,installer,startDate:start,endDate:end,startTime:j.installStart,endTime:j.installEnd,status,address,jobNumber,notes});
    const req=firstDate(j.dateRequired,j.requiredDate);
    if(req&&!start)addTask(out,{source:'Flooring Orders',sourceKey:KEYS.flooringJobs,sourceRecordId:id,type:'Required Date',title:firstText(jobNumber?'Job '+jobNumber:'',customer,'Required Date'),customer,person:sales||installer||'Unassigned',sales,installer,startDate:req,endDate:req,status:firstText(j.status),address,jobNumber,notes});
  });
  return out;
}
function extractManualEvents(records){
  const out=[];
  arr(records).forEach((m,i)=>{
    if(!m||typeof m!=='object')return;
    const start=firstDate(m.eventDate,m.date,m.startDate),end=firstDate(m.endDate,m.eventEndDate,start);if(!start)return;
    const type=typeOfEvent(m),who=firstText(m.assignedTo,m.person,m.staff,m.installer,'Unassigned'),customer=firstText(m.customerName,m.customer),title=firstText(m.title,m.eventType,m.subCalendar,m.sub,customer,type);
    addTask(out,{source:'Calendar Events',sourceKey:KEYS.manualEvents,sourceRecordId:firstText(m.id,'event'+i),type,title,customer,person:who,sales:type==='Installation'?'':who,installer:type==='Installation'?who:'',startDate:start,endDate:end,startTime:firstText(m.startTime,m.start),endTime:firstText(m.endTime,m.end),status:firstText(m.status),address:firstText(m.address,m.installAddress),jobNumber:firstText(m.jobNumber,m.job),notes:firstText(m.notes,m.note)});
  });
  return out;
}
function extractSupplierPOs(records){
  const out=[];
  arr(records).forEach((p,i)=>{
    if(!p||typeof p!=='object'||String(p.status||'')==='Cancelled')return;
    const d=firstDate(p.requestedDate,p.expectedDate,p.pickupDate,p.deliveryDate);if(!d)return;
    const type=/deliver/i.test(firstText(p.fulfillment,p.method,p.type))?'Delivery':'Pickup';
    const customer=firstText(p.customerName,p.customer),sales=firstText(p.salesRep,p.sales,p.clerk),po=firstText(p.poNumber,p.po,p.number),job=firstText(p.jobNumber,p.job),supplier=firstText(p.supplier,'Supplier');
    addTask(out,{source:'Supplier POs',sourceKey:KEYS.supplierPOs,sourceRecordId:firstText(p.id,'po'+i),type,title:`${type==='Delivery'?'Delivery':'Pickup'} · ${supplier}`,customer,person:sales||'Warehouse',sales,startDate:d,endDate:d,status:firstText(p.status),jobNumber:job,poNumber:po,notes:firstText(p.notes,p.note)});
  });
  return out;
}
function logicalScheduleKey(t){
  const ref=firstText(t.jobNumber,t.poNumber);
  if(!ref)return '';
  return ['logical',t.type,ref,t.person,t.startDate,t.endDate,t.startTime,t.endTime].join('|').toLowerCase();
}
function dedupe(tasks){
  const seen=new Set(),logical=new Set(),out=[];
  arr(tasks).forEach(t=>{
    const sourceKey=[t.sourceKey,t.sourceRecordId,t.type,t.startDate,t.endDate,t.startTime,t.person].join('|').toLowerCase();
    const logicalKey=logicalScheduleKey(t);
    if(seen.has(sourceKey)||(logicalKey&&logical.has(logicalKey)))return;
    seen.add(sourceKey);if(logicalKey)logical.add(logicalKey);out.push(t);
  });
  return out;
}
function extractAll(datasets){return dedupe([].concat(extractWarehouseOrders(datasets.warehouseOrders),extractFlooringJobs(datasets.flooringJobs),extractManualEvents(datasets.manualEvents),extractSupplierPOs(datasets.supplierPOs)))}

function demoTasks(todayValue){
  const w=sundayFor(todayValue||localToday());
  return [
    taskBase({id:'demo-install-a',source:'DEMO',type:'Installation',title:'DEMO Job 182410',customer:'Demo Customer A',person:'Bilal',installer:'Bilal',sales:'Carol',startDate:addDays(w,1),endDate:addDays(w,2),startTime:'08:00',endTime:'16:00',status:'Scheduled',address:'Demo site · Calgary',jobNumber:'182410',notes:'DEMO only · multi-day installation',demo:true}),
    taskBase({id:'demo-install-b',source:'DEMO',type:'Installation',title:'DEMO Job 182418',customer:'Demo Customer B',person:'Bilal',installer:'Bilal',sales:'Tony',startDate:addDays(w,2),endDate:addDays(w,2),startTime:'10:00',endTime:'14:00',status:'Confirmed',jobNumber:'182418',notes:'DEMO only · overlap test',demo:true}),
    taskBase({id:'demo-measure',source:'DEMO',type:'Measurement',title:'DEMO Measure',customer:'Demo Customer C',person:'Alana',sales:'Alana',startDate:addDays(w,3),endDate:addDays(w,3),startTime:'11:00',endTime:'12:00',status:'Scheduled',demo:true}),
    taskBase({id:'demo-pickup',source:'DEMO',type:'Pickup',title:'DEMO Pickup · Fuzion',customer:'Demo Customer D',person:'Tony',sales:'Tony',startDate:addDays(w,4),endDate:addDays(w,4),status:'Ready',poNumber:'DEMO-0319',demo:true}),
    taskBase({id:'demo-chc',source:'DEMO',type:'CHC',title:'DEMO CHC Visit',customer:'Demo Customer E',person:'Faith',startDate:addDays(w,5),endDate:addDays(w,6),status:'Scheduled',demo:true})
  ];
}

function clipTask(task,weekStart){
  const weekEnd=addDays(weekStart,6),s=task.startDate,e=task.endDate||s;if(!iso(s)||!iso(e)||e<weekStart||s>weekEnd)return null;
  const cs=s<weekStart?weekStart:s,ce=e>weekEnd?weekEnd:e;
  return {...task,clipStart:cs,clipEnd:ce,startIndex:dayDiff(weekStart,cs),span:dayDiff(cs,ce)+1,continuesBefore:s<weekStart,continuesAfter:e>weekEnd};
}
function compareTask(a,b){return String(a.clipStart).localeCompare(String(b.clipStart))||String(b.clipEnd).localeCompare(String(a.clipEnd))||String(a.startTime||'99:99').localeCompare(String(b.startTime||'99:99'))||String(a.title).localeCompare(String(b.title))}
function allocateLanes(tasks,weekStart){
  const clipped=arr(tasks).map(t=>clipTask(t,weekStart)).filter(Boolean).sort(compareTask),laneEnds=[];
  clipped.forEach(t=>{let lane=0;while(lane<laneEnds.length&&t.startIndex<=laneEnds[lane])lane++;t.lane=lane;laneEnds[lane]=t.startIndex+t.span-1});
  return {tasks:clipped,laneCount:laneEnds.length};
}
function filterTasks(tasks,filters){
  const types=new Set(arr(filters&&filters.types)),person=str(filters&&filters.person),q=str(filters&&filters.q).toLowerCase();
  return arr(tasks).filter(t=>(!types.size||types.has(t.type))&&(!person||person==='ALL'||t.person===person)&&(!q||[t.title,t.customer,t.person,t.sales,t.installer,t.jobNumber,t.poNumber,t.status,t.address,t.notes].join(' ').toLowerCase().includes(q)));
}
function loadDatasets(storage){return {
  warehouseOrders:safeRead(storage,KEYS.warehouseOrders,[]),flooringJobs:safeRead(storage,KEYS.flooringJobs,[]),manualEvents:safeRead(storage,KEYS.manualEvents,[]),supplierPOs:safeRead(storage,KEYS.supplierPOs,[]),people:safeRead(storage,KEYS.people,[])
}}
function weekDayCounts(tasks,weekStart){
  const counts=Array(7).fill(0);
  arr(tasks).forEach(t=>{const c=clipTask(t,weekStart);if(!c)return;for(let i=c.startIndex;i<c.startIndex+c.span&&i<7;i++)counts[i]++});
  return counts;
}
function densityProfile(laneCount,maxDaily,requested='auto'){
  const req=str(requested).toLowerCase();
  const mode=req==='comfortable'||req==='compact'||req==='dense'?req:(laneCount>18||maxDaily>18?'dense':laneCount>8||maxDaily>9?'compact':'comfortable');
  if(mode==='dense')return {mode,laneHeight:31,taskHeight:25,label:'Dense'};
  if(mode==='compact')return {mode,laneHeight:38,taskHeight:31,label:'Compact'};
  return {mode:'comfortable',laneHeight:46,taskHeight:38,label:'Comfortable'};
}
function minuteOf(v){const t=normalizeTime(v);if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+m}
function knownMinutes(t){
  if(t.startDate!==t.endDate)return 0;
  const a=minuteOf(t.startTime),b=minuteOf(t.endTime);return a==null||b==null||b<=a?0:b-a;
}
function installerIdentity(t){return str(t.installer||((t.type==='Installation')?t.person:''))}
function installerTasks(tasks){return arr(tasks).filter(t=>installerIdentity(t)&&installerIdentity(t)!=='Unassigned'&&t.type==='Installation')}
function occupies(t,date){return iso(date)&&t.startDate<=date&&t.endDate>=date}
function timedHardOverlap(a,b,date){
  if(a.startDate!==a.endDate||b.startDate!==b.endDate||a.startDate!==date||b.startDate!==date)return false;
  const as=minuteOf(a.startTime),ae=minuteOf(a.endTime),bs=minuteOf(b.startTime),be=minuteOf(b.endTime);
  if([as,ae,bs,be].some(x=>x==null)||ae<=as||be<=bs)return false;
  return as<be&&bs<ae;
}
function conflictAnalysis(tasks,weekStart){
  const end=addDays(weekStart,6),inst=installerTasks(tasks),conflicts=[],byTask={};
  const people=[...new Set(inst.map(installerIdentity))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));
  people.forEach(person=>{
    for(let d=weekStart;d<=end;d=addDays(d,1)){
      const xs=inst.filter(t=>installerIdentity(t)===person&&occupies(t,d));
      for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){
        const a=xs[i],b=xs[j];
        const hard=timedHardOverlap(a,b,d);
        const fullyComparable=!hard&&a.startDate===a.endDate&&b.startDate===b.endDate&&a.startDate===d&&b.startDate===d&&knownMinutes(a)>0&&knownMinutes(b)>0;
        if(fullyComparable)continue;
        const item={id:[person,d,a.id,b.id].join('|'),person,date:d,kind:hard?'hard':'possible',a,b};
        conflicts.push(item);
        [a.id,b.id].forEach(id=>{if(!byTask[id])byTask[id]=[];byTask[id].push(item)});
      }
    }
  });
  return {conflicts,byTask,hard:conflicts.filter(x=>x.kind==='hard').length,possible:conflicts.filter(x=>x.kind==='possible').length};
}
function workloadMatrix(tasks,weekStart){
  const end=addDays(weekStart,6),inst=installerTasks(tasks),analysis=conflictAnalysis(tasks,weekStart);
  const people=[...new Set(inst.map(installerIdentity))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));
  const rows=people.map(person=>{
    const days=[];let taskDays=0,minutes=0,hard=0,possible=0;
    for(let d=weekStart;d<=end;d=addDays(d,1)){
      const xs=inst.filter(t=>installerIdentity(t)===person&&occupies(t,d));
      const known=xs.reduce((s,t)=>s+knownMinutes(t),0);
      const cs=analysis.conflicts.filter(x=>x.person===person&&x.date===d);
      const h=cs.filter(x=>x.kind==='hard').length,p=cs.filter(x=>x.kind==='possible').length;
      taskDays+=xs.length;minutes+=known;hard+=h;possible+=p;
      days.push({date:d,count:xs.length,knownMinutes:known,hard:h,possible:p,tasks:xs});
    }
    return {person,days,taskDays,knownMinutes:minutes,hard,possible};
  });
  return {rows,analysis};
}

const api={VERSION,KEYS,TYPE_ORDER,TYPE_LABEL,TYPE_CLASS,iso,dateObj,dateIso,addDays,dayDiff,sundayFor,localToday,pretty,normalizeTime,extractWarehouseOrders,extractFlooringJobs,extractManualEvents,extractSupplierPOs,extractAll,demoTasks,clipTask,allocateLanes,filterTasks,loadDatasets,weekDayCounts,densityProfile,minuteOf,knownMinutes,installerIdentity,installerTasks,timedHardOverlap,conflictAnalysis,workloadMatrix};
root.RUNLUWeekScheduleV097=api;

if(typeof document==='undefined')return;

let weekStart=sundayFor(localToday()),allTasks=[],usingDemo=false,selectedTypes=new Set(TYPE_ORDER),selectedPerson='ALL',searchText='',openTask=null,densityMode='auto',lastConflictAnalysis={conflicts:[],byTask:{},hard:0,possible:0};
const by=id=>document.getElementById(id);
function visibleTasks(){return filterTasks(allTasks,{types:[...selectedTypes],person:selectedPerson,q:searchText})}
function typeClass(t){return TYPE_CLASS[t]||'other'}
function taskTime(t){if(t.startTime&&t.endTime)return `${t.startTime}–${t.endTime}`;return t.startTime||''}
function sourceStats(d){return [
  ['Warehouse orders',arr(d.warehouseOrders).length],['Flooring orders',arr(d.flooringJobs).filter(x=>!x?.isDemo).length],['Calendar events',arr(d.manualEvents).length],['Supplier POs',arr(d.supplierPOs).length]
]}
function load(){
  const d=loadDatasets(root.localStorage);allTasks=extractAll(d);usingDemo=!allTasks.length;if(usingDemo)allTasks=demoTasks(localToday());renderSource(sourceStats(d));renderControls();render();
}
function renderSource(stats){const el=by('ws96source');if(!el)return;const count=allTasks.length;el.innerHTML=`<span class="ws96state ${usingDemo?'demo':'live'}">${usingDemo?'DEMO FALLBACK':'REAL DATA · READ ONLY'}</span><span>${count} schedule task${count===1?'':'s'}</span>${stats.map(([n,c])=>`<span>${esc(n)}: <b>${c}</b></span>`).join('')}`}
function renderControls(){
  const types=by('ws96types');if(types){types.innerHTML=TYPE_ORDER.map(t=>`<label class="ws96check"><input type="checkbox" data-ws96-type="${attr(t)}" ${selectedTypes.has(t)?'checked':''}><span>${esc(TYPE_LABEL[t]||t)}</span></label>`).join('');types.querySelectorAll('[data-ws96-type]').forEach(x=>x.addEventListener('change',()=>{if(x.checked)selectedTypes.add(x.dataset.ws96Type);else selectedTypes=new Set([...selectedTypes].filter(t=>t!==x.dataset.ws96Type));render()}))}
  const people=[...new Set(allTasks.map(t=>t.person).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));const p=by('ws96person');if(p){p.innerHTML='<option value="ALL">All people</option>'+people.map(n=>`<option value="${attr(n)}">${esc(n)}</option>`).join('');p.value=people.includes(selectedPerson)?selectedPerson:'ALL';selectedPerson=p.value;p.onchange=()=>{selectedPerson=p.value;render()}}
  const q=by('ws96q');if(q){q.value=searchText;q.oninput=()=>{searchText=q.value;render()}}
}
function renderHeader(){by('ws96range').textContent=`${pretty(weekStart,{month:'short',day:'numeric'})} – ${pretty(addDays(weekStart,6),{month:'short',day:'numeric',year:'numeric'})}`}
function renderStats(tasks,layout,counts,profile){const el=by('ws96stats');if(!el)return;const people=new Set(tasks.map(t=>t.person)).size,multi=tasks.filter(t=>t.startDate!==t.endDate).length,busiest=Math.max(0,...counts);el.innerHTML=`<div><b>${tasks.length}</b><span>Visible tasks</span></div><div><b>${people}</b><span>People</span></div><div><b>${multi}</b><span>Multi-day</span></div><div><b>${busiest}</b><span>Busiest day · ${esc(profile.label)}</span></div>`}
function renderWorkload(matrix){
  const el=by('ws97workload');if(!el)return;
  const summary=by('ws97workloadSummary');if(summary)summary.innerHTML=`<span><b>${matrix.rows.length}</b> installers</span><span class="${matrix.analysis.hard?'bad':''}"><b>${matrix.analysis.hard}</b> timed overlaps</span><span class="${matrix.analysis.possible?'warn':''}"><b>${matrix.analysis.possible}</b> schedule checks</span><span>Known hours count only single-day tasks with both start and end times.</span>`;
  if(!matrix.rows.length){el.innerHTML='<div class="ws97empty">No installation assignments in this week.</div>';return}
  let html='<div class="ws97workGrid"><div class="ws97corner">Installer</div>';
  for(let i=0;i<7;i++){const d=addDays(weekStart,i);html+=`<div class="ws97wh">${esc(pretty(d,{weekday:'short'}))}<small>${esc(pretty(d,{month:'short',day:'numeric'}))}</small></div>`}
  html+='<div class="ws97wh total">Week</div>';
  matrix.rows.forEach(r=>{
    html+=`<div class="ws97person"><b>${esc(r.person)}</b><small>${r.taskDays} task-day${r.taskDays===1?'':'s'}${r.knownMinutes?' · '+(r.knownMinutes/60).toFixed(r.knownMinutes%60?1:0)+'h known':''}</small></div>`;
    r.days.forEach(d=>{
      const cls=d.hard?'hard':d.possible?'possible':d.count>=3?'busy':d.count?'active':'';
      const meta=[d.knownMinutes?(d.knownMinutes/60).toFixed(d.knownMinutes%60?1:0)+'h':'',d.hard?'OVERLAP':'',!d.hard&&d.possible?'CHECK':''].filter(Boolean).join(' · ');
      html+=`<div class="ws97cell ${cls}"><b>${d.count||'—'}</b><small>${esc(meta||' ')}</small></div>`;
    });
    const totalCls=r.hard?'hard':r.possible?'possible':'';
    html+=`<div class="ws97cell total ${totalCls}"><b>${r.taskDays}</b><small>${r.hard?r.hard+' overlap':r.possible?r.possible+' check':'task-days'}</small></div>`;
  });
  html+='</div>';el.innerHTML=html;
}
function renderBoard(tasks,layout,counts,profile){
  const board=by('ws96board');if(!board)return;const today=localToday(),laneH=profile.laneHeight,taskH=profile.taskHeight,headH=62,height=Math.max(240,headH+Math.max(layout.laneCount,1)*laneH+22);
  let html=`<div class="ws96grid density-${profile.mode}" style="height:${height}px"><div class="ws96days">`;
  for(let i=0;i<7;i++){const d=addDays(weekStart,i);html+=`<div class="ws96day ${d===today?'today':''}" data-ws96-day="${i}"><span>${esc(pretty(d,{weekday:'short'}))}</span><b>${esc(pretty(d,{month:'short',day:'numeric'}))}</b><em class="ws96count">${counts[i]} task${counts[i]===1?'':'s'}</em></div>`}html+='</div><div class="ws96lanes">';
  for(let i=0;i<7;i++)html+=`<div class="ws96col ${addDays(weekStart,i)===today?'today':''}" style="grid-column:${i+1}"></div>`;
  layout.tasks.forEach(t=>{const left=(t.startIndex/7)*100,width=(t.span/7)*100,top=10+t.lane*laneH,warns=lastConflictAnalysis.byTask[t.id]||[],hard=warns.some(x=>x.kind==='hard'),possible=!hard&&warns.length;html+=`<button class="ws96task ${typeClass(t.type)} ${t.demo?'demo':''} ${hard?'conflict-hard':possible?'conflict-possible':''}" style="left:calc(${left}% + 3px);width:calc(${width}% - 6px);top:${top}px;height:${taskH}px" data-ws96-task="${attr(t.id)}" title="View details"><span class="ws96edge">${t.continuesBefore?'‹':''}</span><span class="ws96taskMain"><b>${esc(t.title)}${hard?' · ⚠ OVERLAP':possible?' · △ CHECK':''}</b><small>${esc([taskTime(t),t.person,t.customer].filter(Boolean).join(' · '))}</small></span><span class="ws96edge">${t.continuesAfter?'›':''}</span></button>`});
  html+='</div></div>';board.innerHTML=html;board.querySelectorAll('[data-ws96-task]').forEach(b=>b.addEventListener('click',()=>showTask(b.dataset.ws96Task)));
  if(!layout.tasks.length)board.insertAdjacentHTML('beforeend','<div class="ws96empty">No tasks match this week and filter.</div>')
}
function scrollToDay(index,behavior='smooth'){const sc=by('ws96scroll');if(!sc)return;const board=by('ws96board'),width=board?.scrollWidth||1120;sc.scrollTo({left:Math.max(0,(width/7)*index-8),behavior})}
function focusToday(behavior='smooth'){const today=localToday();if(today<weekStart||today>addDays(weekStart,6))return;scrollToDay(dayDiff(weekStart,today),behavior)}
function render(focus=false){renderHeader();const tasks=visibleTasks(),weekTasks=tasks.filter(t=>clipTask(t,weekStart)),layout=allocateLanes(tasks,weekStart),counts=weekDayCounts(weekTasks,weekStart),profile=densityProfile(layout.laneCount,Math.max(0,...counts),densityMode);const workloadSource=selectedPerson==='ALL'?allTasks:allTasks.filter(t=>t.person===selectedPerson||t.installer===selectedPerson),matrix=workloadMatrix(workloadSource,weekStart);lastConflictAnalysis=conflictAnalysis(allTasks,weekStart);renderStats(weekTasks,layout,counts,profile);renderWorkload(matrix);renderBoard(tasks,layout,counts,profile);const note=by('ws96demoNote');if(note)note.hidden=!usingDemo;const d=by('ws96density');if(d)d.value=densityMode;if(focus)setTimeout(()=>focusToday('smooth'),0)}
function showTask(id){openTask=allTasks.find(t=>t.id===id)||null;if(!openTask)return;const t=openTask,modal=by('ws96modal'),body=by('ws96detail');if(!modal||!body)return;const warns=lastConflictAnalysis.byTask[t.id]||[],warning=warns.some(x=>x.kind==='hard')?'TIMED OVERLAP':warns.length?'SCHEDULE CHECK':'None';const rows=[['Type',TYPE_LABEL[t.type]||t.type],['Date',t.startDate===t.endDate?t.startDate:`${t.startDate} → ${t.endDate}`],['Time',taskTime(t)||'—'],['Assigned to',t.person||'—'],['Installer',t.installer||'—'],['Sales',t.sales||'—'],['Customer',t.customer||'—'],['Job #',t.jobNumber||'—'],['PO #',t.poNumber||'—'],['Status',t.status||'—'],['Schedule warning',warning],['Address',t.address||'—'],['Notes',t.notes||'—'],['Source',`${t.source}${t.sourceKey?' · '+t.sourceKey:''}`]];body.innerHTML=`<div class="ws96detailTitle">${t.demo?'<span class="ws96demoBadge">DEMO</span>':''}${esc(t.title)}</div>${rows.map(([k,v])=>`<div class="ws96detailRow"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}<div class="ws96readonly">Read only: no drag, edit, save, status change, PO change, inventory change, or local data write is available here.</div>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeTask(){const modal=by('ws96modal');if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}openTask=null}
function bind(){
  by('ws96prev').onclick=()=>{weekStart=addDays(weekStart,-7);render()};by('ws96today').onclick=()=>{weekStart=sundayFor(localToday());render(true)};by('ws96next').onclick=()=>{weekStart=addDays(weekStart,7);render()};
  by('ws96all').onclick=()=>{selectedTypes=new Set(TYPE_ORDER);renderControls();render()};by('ws96none').onclick=()=>{selectedTypes.clear();renderControls();render()};
  const density=by('ws96density');if(density)density.onchange=()=>{densityMode=density.value||'auto';render()};
  by('ws96close').onclick=closeTask;by('ws96modal').addEventListener('click',e=>{if(e.target===by('ws96modal'))closeTask()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTask()});
  root.addEventListener('storage',e=>{if(Object.values(KEYS).includes(e.key))load()});
}
function boot(){bind();load();setTimeout(()=>focusToday('auto'),80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
