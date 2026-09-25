/* RUNLU Deerfoot Flooring OS · V0.6.1 Weekly Scheduling Board · READ ONLY */
(function(root){
'use strict';

const VERSION='0.6.1';
const STORES={
  jobs:'runlu_deerfoot_flooring_jobs_v1',
  pos:'runlu_deerfoot_supplier_orders_v1',
  manual:'runlu_calendar_manual_events_v056'
};
const TYPES={
  installation:{label:'Installation',className:'installation'},
  measure:{label:'Measure',className:'measure'},
  pickup:{label:'Pickup',className:'pickup'},
  delivery:{label:'Delivery',className:'delivery'},
  service:{label:'Service',className:'service'}
};
const TYPE_ORDER=Object.keys(TYPES);

function pad(n){return String(n).padStart(2,'0')}
function civil(y,m,d){
  y=Number(y);m=Number(m);d=Number(d);
  if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)||m<1||m>12||d<1||d>31)return null;
  const ms=Date.UTC(y,m-1,d),x=new Date(ms);
  if(x.getUTCFullYear()!==y||x.getUTCMonth()!==m-1||x.getUTCDate()!==d)return null;
  return {y,m,d,ordinal:Math.floor(ms/86400000),iso:`${y}-${pad(m)}-${pad(d)}`};
}
function parseDateOnly(v){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v||'').trim());
  return m?civil(+m[1],+m[2],+m[3]):null;
}
function isoFromOrdinal(n){const d=new Date(Number(n)*86400000);return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`}
function addDays(v,n){const d=parseDateOnly(v);return d?isoFromOrdinal(d.ordinal+Number(n||0)):''}
function dayOfWeek(v){const d=parseDateOnly(v);return d?new Date(d.ordinal*86400000).getUTCDay():null}
function startOfWeek(v){
  const d=parseDateOnly(v);if(!d)return '';
  const dow=dayOfWeek(d.iso),delta=(dow+6)%7;
  return isoFromOrdinal(d.ordinal-delta);
}
function localToday(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function prettyDate(v,opts){
  const d=parseDateOnly(v);if(!d)return '—';
  const x=new Date(Date.UTC(d.y,d.m-1,d.d,12));
  return x.toLocaleDateString('en-CA',opts||{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'});
}
function safeArray(v){return Array.isArray(v)?v:[]}
function readJson(storage,key,fallback){
  try{const raw=storage&&typeof storage.getItem==='function'?storage.getItem(key):null;if(!raw)return fallback;const v=JSON.parse(raw);return v==null?fallback:v}catch(_){return fallback}
}
function text(v){return String(v??'').trim()}
function normalizedTime(v){return /^\d{2}:\d{2}$/.test(text(v))?text(v):''}
function activeStatus(v){return !['cancelled','draft'].includes(text(v).toLowerCase())}
function taskId(prefix,v,i){return `${prefix}-${text(v)||i}`}

function task(base){
  const s=parseDateOnly(base.startDate),e=parseDateOnly(base.endDate||base.startDate);
  if(!s||!e)return null;
  const end=e.ordinal<s.ordinal?s:e;
  return {
    id:text(base.id)||`task-${s.iso}-${Math.random().toString(36).slice(2,8)}`,
    type:TYPES[base.type]?base.type:'service',
    title:text(base.title)||TYPES[base.type]?.label||'Schedule Item',
    startDate:s.iso,endDate:end.iso,
    startTime:normalizedTime(base.startTime),endTime:normalizedTime(base.endTime),
    jobNumber:text(base.jobNumber),customer:text(base.customer),assignedTo:text(base.assignedTo),
    address:text(base.address),status:text(base.status),notes:text(base.notes),source:text(base.source),
    demo:!!base.demo
  };
}

function jobTasks(rows){
  const out=[];
  safeArray(rows).forEach((j,i)=>{
    if(!j||!parseDateOnly(j.installDate)||text(j.installStatus).toLowerCase()==='cancelled')return;
    const t=task({
      id:taskId('install',j.id||j.jobNumber,i),type:'installation',title:`Install${j.jobNumber?' · Job '+j.jobNumber:''}`,
      startDate:j.installDate,endDate:j.installDate,startTime:j.installStart,endTime:j.installEnd,
      jobNumber:j.jobNumber,customer:j.customerName,assignedTo:j.installer,
      address:j.installAddress||j.shipToAddress||j.soldToAddress,status:j.installStatus||j.status,
      notes:j.installNotes,source:'Job / Order'
    });if(t)out.push(t);
  });return out;
}
function poTasks(rows){
  const out=[];
  safeArray(rows).forEach((p,i)=>{
    if(!p||!activeStatus(p.status)||!parseDateOnly(p.requestedDate))return;
    const isDelivery=/deliver/i.test(text(p.fulfillment)),type=isDelivery?'delivery':'pickup';
    const t=task({
      id:taskId(type,p.id||p.poNumber,i),type,title:`${isDelivery?'Delivery':'Pickup'}${p.supplier?' · '+p.supplier:''}${p.poNumber?' · PO #'+p.poNumber:''}`,
      startDate:p.requestedDate,endDate:p.requestedDate,jobNumber:p.jobNumber,customer:p.customerName,
      assignedTo:p.salesRep,address:p.address,status:p.status,notes:p.notes,source:'Supplier PO'
    });if(t)out.push(t);
  });return out;
}
function manualType(m){
  const hay=[m?.eventType,m?.subCalendar,m?.sub,m?.title].map(text).join(' ').toLowerCase();
  if(/measure/.test(hay))return 'measure';
  if(/service|callback/.test(hay))return 'service';
  if(/deliver/.test(hay))return 'delivery';
  if(/pickup|receiv/.test(hay))return 'pickup';
  if(/install/.test(hay))return 'installation';
  return '';
}
function manualTasks(rows){
  const out=[];
  safeArray(rows).forEach((m,i)=>{
    if(!m)return;const type=manualType(m);if(!type)return;
    const d=m.eventDate||m.date;if(!parseDateOnly(d))return;
    const t=task({
      id:taskId('event',m.id,i),type,title:m.title||TYPES[type].label,startDate:d,endDate:d,
      startTime:m.startTime||m.start,endTime:m.endTime||m.end,jobNumber:m.jobNumber,
      customer:m.customerName,assignedTo:m.assignedTo,address:m.address,status:m.status,
      notes:m.notes,source:'Calendar Event'
    });if(t)out.push(t);
  });return out;
}
function normalizeStores(data){
  return [...jobTasks(data?.jobs),...poTasks(data?.pos),...manualTasks(data?.manual)]
    .sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.endDate.localeCompare(b.endDate)||a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
}
function readScheduleData(storage){
  const s=storage||root.localStorage;
  const data={jobs:readJson(s,STORES.jobs,[]),pos:readJson(s,STORES.pos,[]),manual:readJson(s,STORES.manual,[])};
  return {tasks:normalizeStores(data),counts:{jobs:safeArray(data.jobs).length,pos:safeArray(data.pos).length,manual:safeArray(data.manual).length},stores:{...STORES}};
}

function demoTasks(weekStart){
  const w=startOfWeek(weekStart)||startOfWeek(localToday());
  return [
    task({id:'demo-install-a',type:'installation',title:'Install · Demo Job 181604',startDate:addDays(w,0),endDate:addDays(w,2),startTime:'08:00',endTime:'16:00',assignedTo:'Demo Crew A',status:'Scheduled',source:'DEMO',demo:true}),
    task({id:'demo-measure-a',type:'measure',title:'Measure · Demo Site',startDate:addDays(w,0),startTime:'10:00',endTime:'11:00',assignedTo:'Demo Sales',status:'Scheduled',source:'DEMO',demo:true}),
    task({id:'demo-pickup-a',type:'pickup',title:'Pickup · Demo Supplier',startDate:addDays(w,1),status:'Open',source:'DEMO',demo:true}),
    task({id:'demo-delivery-a',type:'delivery',title:'Delivery · Demo Job',startDate:addDays(w,3),status:'Scheduled',source:'DEMO',demo:true}),
    task({id:'demo-service-a',type:'service',title:'Service · Demo Callback',startDate:addDays(w,3),endDate:addDays(w,4),startTime:'13:00',assignedTo:'Demo Tech',status:'Scheduled',source:'DEMO',demo:true})
  ].filter(Boolean);
}

function clipToWeek(t,w){
  const ws=parseDateOnly(startOfWeek(w)),s=parseDateOnly(t?.startDate),e=parseDateOnly(t?.endDate||t?.startDate);if(!ws||!s||!e)return null;
  const we=ws.ordinal+6;if(e.ordinal<ws.ordinal||s.ordinal>we)return null;
  const a=Math.max(s.ordinal,ws.ordinal),b=Math.min(e.ordinal,we);
  return {...t,clipStart:isoFromOrdinal(a),clipEnd:isoFromOrdinal(b),startCol:a-ws.ordinal,endCol:b-ws.ordinal,span:b-a+1,clippedLeft:s.ordinal<a,clippedRight:e.ordinal>b};
}
function assignLanes(items){
  const sorted=safeArray(items).slice().sort((a,b)=>a.startCol-b.startCol||a.endCol-b.endCol||a.id.localeCompare(b.id));
  const ends=[];
  sorted.forEach(x=>{let lane=0;while(lane<ends.length&&ends[lane]>=x.startCol)lane++;if(lane===ends.length)ends.push(x.endCol);else ends[lane]=x.endCol;x.lane=lane});
  return {items:sorted,laneCount:ends.length};
}
function planWeek(tasks,w,enabledTypes){
  const ws=startOfWeek(w);if(!ws)return {weekStart:'',weekEnd:'',items:[],laneCount:0};
  const allow=enabledTypes instanceof Set?enabledTypes:new Set(Array.isArray(enabledTypes)?enabledTypes:TYPE_ORDER);
  const clipped=safeArray(tasks).filter(t=>allow.has(t.type)).map(t=>clipToWeek(t,ws)).filter(Boolean);
  const lanes=assignLanes(clipped);
  return {weekStart:ws,weekEnd:addDays(ws,6),items:lanes.items,laneCount:lanes.laneCount};
}

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function attr(v){return esc(v).replace(/"/g,'&quot;')}
function timeLabel(t){return t.startTime?(t.endTime?`${t.startTime}–${t.endTime}`:t.startTime):'All day'}
function make(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}

function boot(options){
  if(typeof document==='undefined')return null;
  const host=document.getElementById(options?.hostId||'runluWeeklyScheduleV061');if(!host)return null;
  const loaded=readScheduleData(options?.storage||root.localStorage);
  let week=startOfWeek(options?.weekStart||localToday()),filters=new Set(TYPE_ORDER),selected=null;
  const hasReal=loaded.tasks.length>0;const all=hasReal?loaded.tasks:demoTasks(week);
  host.dataset.mode=hasReal?'live':'demo';
  host.innerHTML=`<div class="r61shell"><div class="r61top"><div><div class="r61eyebrow">RUNLU FLOORING OS · V${VERSION} · READ ONLY</div><h1>Weekly Scheduling Board</h1><div class="r61sub">Monday–Sunday · Installation · Measure · Pickup · Delivery · Service</div></div><div class="r61nav"><button data-act="prev">← Week</button><button data-act="today">Today</button><button data-act="next">Week →</button></div></div><div class="r61status"><span id="r61range"></span><span id="r61mode" class="${hasReal?'live':'demo'}">${hasReal?'LIVE LOCAL DATA':'DEMO DATA · no parseable scheduled records found'}</span></div><div class="r61filters">${TYPE_ORDER.map(k=>`<label><input type="checkbox" data-type="${k}" checked><span class="dot ${k}"></span>${TYPES[k].label}</label>`).join('')}</div><div class="r61scroll"><div class="r61board"><div id="r61days" class="r61days"></div><div id="r61body" class="r61body"></div></div></div><div class="r61foot">Read-only preview. This board never changes Jobs, POs, inventory, calendar records, or browser storage.</div></div><div id="r61modal" class="r61modal" aria-hidden="true"><div class="r61dialog" role="dialog" aria-modal="true" aria-labelledby="r61detailTitle"><div class="r61dialogTop"><b id="r61detailTitle">Schedule Detail</b><button data-act="close" aria-label="Close">×</button></div><div id="r61detail" class="r61detail"></div></div></div>`;
  const range=host.querySelector('#r61range'),days=host.querySelector('#r61days'),body=host.querySelector('#r61body'),modal=host.querySelector('#r61modal'),detail=host.querySelector('#r61detail');
  function render(){
    const p=planWeek(all,week,filters);range.textContent=`${prettyDate(p.weekStart,{month:'short',day:'numeric',timeZone:'UTC'})} – ${prettyDate(p.weekEnd,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'})}`;
    days.innerHTML=Array.from({length:7},(_,i)=>{const d=addDays(p.weekStart,i),isToday=d===localToday();return `<div class="${isToday?'today':''}"><span>${prettyDate(d,{weekday:'short',timeZone:'UTC'})}</span><b>${prettyDate(d,{month:'short',day:'numeric',timeZone:'UTC'})}</b></div>`}).join('');
    const laneCount=Math.max(1,p.laneCount);body.style.height=`${Math.max(170,laneCount*48+28)}px`;
    body.innerHTML=`<div class="r61gridlines">${Array.from({length:7},()=>'<i></i>').join('')}</div>`+p.items.map(x=>{const left=(x.startCol/7)*100,width=(x.span/7)*100;const arrows=`${x.clippedLeft?'‹ ':''}${x.clippedRight?' ›':''}`;return `<button class="r61task ${x.type}${x.demo?' demo':''}" data-id="${attr(x.id)}" style="left:calc(${left}% + 4px);width:calc(${width}% - 8px);top:${x.lane*48+10}px" title="${attr(x.title+' · '+timeLabel(x))}"><span>${arrows}${esc(x.title)}</span><small>${esc(timeLabel(x))}${x.assignedTo?' · '+esc(x.assignedTo):''}</small></button>`}).join('')+(p.items.length?'':'<div class="r61empty">No matching schedule items this week.</div>');
  }
  function openDetail(id){selected=all.find(x=>x.id===id)||null;if(!selected)return;const rows=[['Type',TYPES[selected.type]?.label],['Date',selected.startDate===selected.endDate?selected.startDate:`${selected.startDate} → ${selected.endDate}`],['Time',timeLabel(selected)],['Job #',selected.jobNumber],['Customer',selected.customer],['Assigned',selected.assignedTo],['Address',selected.address],['Status',selected.status],['Source',selected.source],['Notes',selected.notes]].filter(x=>x[1]);detail.innerHTML=`<h2>${esc(selected.title)}</h2>${selected.demo?'<div class="r61demowarn">DEMO DATA</div>':''}<dl>${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p>Read only — edit the source Job / PO / Calendar record in Flooring OS.</p>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
  function close(){selected=null;modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  host.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){const a=b.dataset.act;if(a==='prev'){week=addDays(week,-7);render()}else if(a==='next'){week=addDays(week,7);render()}else if(a==='today'){week=startOfWeek(localToday());render()}else if(a==='close')close();return}const t=e.target.closest('.r61task');if(t)openDetail(t.dataset.id)});
  host.addEventListener('change',e=>{const cb=e.target.closest('input[data-type]');if(!cb)return;cb.checked?filters.add(cb.dataset.type):filters.delete(cb.dataset.type);render()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  render();
  return {version:VERSION,mode:hasReal?'live':'demo',taskCount:all.length,readOnly:true,render,getWeek:()=>week};
}

const API={VERSION,STORES,TYPES,TYPE_ORDER,parseDateOnly,addDays,startOfWeek,readScheduleData,normalizeStores,jobTasks,poTasks,manualTasks,manualType,demoTasks,clipToWeek,assignLanes,planWeek,boot,readOnly:true};
root.RUNLUWeeklyScheduleV061=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
