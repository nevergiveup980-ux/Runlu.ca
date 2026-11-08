/* RUNLU Deerfoot Flooring OS · V0.6.2 Weekly Scheduling Board · READ ONLY
   Video-style Sunday–Saturday board with dense all-day lanes + timed appointments.
   Reads existing Flooring stores only. Never mutates Job / PO / Calendar / browser storage. */
(function(root){
'use strict';

const VERSION='0.6.2';
const STORES={
  jobs:'runlu_deerfoot_flooring_jobs_v1',
  pos:'runlu_deerfoot_supplier_orders_v1',
  manual:'runlu_calendar_manual_events_v056'
};
const TYPES={
  installation:{label:'Installation',fallback:'#315d49'},
  measure:{label:'Measure',fallback:'#3d6fb6'},
  pickup:{label:'Pickup',fallback:'#2b7c70'},
  delivery:{label:'Delivery',fallback:'#8a5f9d'},
  service:{label:'Service',fallback:'#a06f24'}
};
const TYPE_ORDER=Object.keys(TYPES);
const DAY_START=7*60;
const DAY_END=19*60;
const DAY_SPAN=DAY_END-DAY_START;

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
function startOfWeek(v){
  const d=parseDateOnly(v);if(!d)return '';
  const dow=new Date(d.ordinal*86400000).getUTCDay();
  return isoFromOrdinal(d.ordinal-dow);
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
function minute(v){const t=normalizedTime(v);if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+m}
function activeStatus(v){return !['cancelled','draft'].includes(text(v).toLowerCase())}
function hashHue(value){let h=0;for(const ch of text(value)||'RUNLU')h=(h*31+ch.charCodeAt(0))%360;return h}
function hashColor(value){return `hsl(${hashHue(value)} 62% 43%)`}
function validColor(v){const s=text(v);return /^(#[0-9a-f]{3,8}|hsl[a]?\([^)]{1,80}\)|rgb[a]?\([^)]{1,80}\))$/i.test(s)?s:''}
function taskId(prefix,v,i){return `${prefix}-${text(v)||i}`}

function task(base){
  const s=parseDateOnly(base.startDate),e=parseDateOnly(base.endDate||base.startDate);
  if(!s||!e)return null;
  const end=e.ordinal<s.ordinal?s:e;
  const type=TYPES[base.type]?base.type:'service';
  const title=text(base.title)||TYPES[type].label;
  return {
    id:text(base.id)||`task-${type}-${s.iso}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,36)}`,
    type,title,startDate:s.iso,endDate:end.iso,
    startTime:normalizedTime(base.startTime),endTime:normalizedTime(base.endTime),
    jobNumber:text(base.jobNumber),customer:text(base.customer),assignedTo:text(base.assignedTo),
    address:text(base.address),status:text(base.status),notes:text(base.notes),source:text(base.source),
    group:text(base.group),subCalendar:text(base.subCalendar),
    color:validColor(base.color)||TYPES[type].fallback,
    demo:!!base.demo
  };
}
function jobTasks(rows){
  const out=[];
  safeArray(rows).forEach((j,i)=>{
    if(!j||!parseDateOnly(j.installDate)||text(j.installStatus).toLowerCase()==='cancelled')return;
    const assigned=text(j.installer);
    const t=task({
      id:taskId('install',j.id||j.jobNumber,i),type:'installation',
      title:`Install${j.jobNumber?' · Job '+j.jobNumber:''}`,
      startDate:j.installDate,endDate:j.installDate,startTime:j.installStart,endTime:j.installEnd,
      jobNumber:j.jobNumber,customer:j.customerName,assignedTo:assigned,
      address:j.installAddress||j.shipToAddress||j.soldToAddress,status:j.installStatus||j.status,
      notes:j.installNotes,source:'Job / Order',group:'installers',subCalendar:assigned,
      color:hashColor(assigned||j.clerk||j.salesRep||'Installation')
    });if(t)out.push(t);
  });return out;
}
function poTasks(rows){
  const out=[];
  safeArray(rows).forEach((p,i)=>{
    if(!p||!activeStatus(p.status)||!parseDateOnly(p.requestedDate))return;
    const isDelivery=/deliver/i.test(text(p.fulfillment)),type=isDelivery?'delivery':'pickup';
    const supplier=text(p.supplier);
    const t=task({
      id:taskId(type,p.id||p.poNumber,i),type,
      title:`${isDelivery?'Delivery':'Pickup'}${supplier?' · '+supplier:''}${p.poNumber?' · PO #'+p.poNumber:''}`,
      startDate:p.requestedDate,endDate:p.requestedDate,jobNumber:p.jobNumber,customer:p.customerName,
      assignedTo:p.salesRep,address:p.address,status:p.status,notes:p.notes,source:'Supplier PO',
      group:type,subCalendar:supplier,color:hashColor(supplier||TYPES[type].label)
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
    const sub=text(m.subCalendar||m.sub),assigned=text(m.assignedTo||sub);
    const t=task({
      id:taskId('event',m.id,i),type,title:m.title||TYPES[type].label,startDate:d,endDate:d,
      startTime:m.startTime||m.start,endTime:m.endTime||m.end,jobNumber:m.jobNumber,
      customer:m.customerName,assignedTo:assigned,address:m.address,status:m.status,
      notes:m.notes,source:'Calendar Event',group:m.calendarGroup||m.group,subCalendar:sub,
      color:validColor(m.color)||hashColor(sub||assigned||type)
    });if(t)out.push(t);
  });return out;
}
function normalizeStores(data){
  return [...jobTasks(data?.jobs),...poTasks(data?.pos),...manualTasks(data?.manual)]
    .sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.startTime.localeCompare(b.startTime)||a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
}
function readScheduleData(storage){
  const s=storage||root.localStorage;
  const data={jobs:readJson(s,STORES.jobs,[]),pos:readJson(s,STORES.pos,[]),manual:readJson(s,STORES.manual,[])};
  return {tasks:normalizeStores(data),counts:{jobs:safeArray(data.jobs).length,pos:safeArray(data.pos).length,manual:safeArray(data.manual).length},stores:{...STORES}};
}

function demoTasks(weekStart){
  const w=startOfWeek(weekStart)||startOfWeek(localToday());
  return [
    task({id:'demo-install-a',type:'installation',title:'Demo · Multi-day installation',startDate:addDays(w,0),endDate:addDays(w,2),assignedTo:'Demo Crew A',status:'Scheduled',source:'DEMO',color:'#315d49',demo:true}),
    task({id:'demo-install-b',type:'installation',title:'Demo · Flooring job',startDate:addDays(w,1),endDate:addDays(w,4),assignedTo:'Demo Crew B',status:'Scheduled',source:'DEMO',color:'#b64f78',demo:true}),
    task({id:'demo-pickup-a',type:'pickup',title:'Demo · Supplier pickup',startDate:addDays(w,0),status:'Open',source:'DEMO',color:'#d28735',demo:true}),
    task({id:'demo-delivery-a',type:'delivery',title:'Demo · Material delivery',startDate:addDays(w,2),endDate:addDays(w,3),status:'Scheduled',source:'DEMO',color:'#7b66b2',demo:true}),
    task({id:'demo-measure-a',type:'measure',title:'Demo · Measure',startDate:addDays(w,1),startTime:'09:00',endTime:'10:00',assignedTo:'Demo Sales',status:'Scheduled',source:'DEMO',color:'#334155',demo:true}),
    task({id:'demo-measure-b',type:'measure',title:'Demo · Measure',startDate:addDays(w,2),startTime:'14:30',endTime:'15:30',assignedTo:'Demo Sales',status:'Scheduled',source:'DEMO',color:'#334155',demo:true}),
    task({id:'demo-service-a',type:'service',title:'Demo · Service callback',startDate:addDays(w,2),startTime:'14:45',endTime:'16:00',assignedTo:'Demo Tech',status:'Scheduled',source:'DEMO',color:'#5b6573',demo:true})
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
function timedGeometry(items,weekStart){
  const ws=parseDateOnly(startOfWeek(weekStart));if(!ws)return [];
  const grouped=Array.from({length:7},()=>[]);
  safeArray(items).forEach(t=>{
    if(t.startDate!==t.endDate)return;
    const d=parseDateOnly(t.startDate),s=minute(t.startTime);if(!d||s==null)return;
    const dayCol=d.ordinal-ws.ordinal;if(dayCol<0||dayCol>6)return;
    let e=minute(t.endTime);if(e==null||e<=s)e=s+60;
    if(e<=DAY_START||s>=DAY_END)return;
    grouped[dayCol].push({...t,dayCol,startMinute:Math.max(DAY_START,s),endMinute:Math.min(DAY_END,e),rawStartMinute:s,rawEndMinute:e});
  });
  const out=[];
  grouped.forEach((rows,dayCol)=>{
    rows.sort((a,b)=>a.startMinute-b.startMinute||a.endMinute-b.endMinute||a.id.localeCompare(b.id));
    const ends=[];let max=1;
    rows.forEach(x=>{let lane=0;while(lane<ends.length&&ends[lane]>x.startMinute)lane++;if(lane===ends.length)ends.push(x.endMinute);else ends[lane]=x.endMinute;x.timedLane=lane;max=Math.max(max,ends.length)});
    rows.forEach(x=>{
      x.timedLaneCount=max;
      x.topPct=((x.startMinute-DAY_START)/DAY_SPAN)*100;
      x.heightPct=Math.max(2.2,((x.endMinute-x.startMinute)/DAY_SPAN)*100);
      out.push(x);
    });
  });
  return out.sort((a,b)=>a.dayCol-b.dayCol||a.startMinute-b.startMinute||a.id.localeCompare(b.id));
}
function planWeek(tasks,w,enabledTypes){
  const ws=startOfWeek(w);if(!ws)return {weekStart:'',weekEnd:'',allDay:[],timed:[],allDayLaneCount:0};
  const allow=enabledTypes instanceof Set?enabledTypes:new Set(Array.isArray(enabledTypes)?enabledTypes:TYPE_ORDER);
  const selected=safeArray(tasks).filter(t=>allow.has(t.type));
  const all=selected.filter(t=>!normalizedTime(t.startTime)||t.startDate!==t.endDate).map(t=>clipToWeek(t,ws)).filter(Boolean);
  const lanes=assignLanes(all);
  const timed=timedGeometry(selected.filter(t=>normalizedTime(t.startTime)),ws);
  return {weekStart:ws,weekEnd:addDays(ws,6),allDay:lanes.items,timed,allDayLaneCount:lanes.laneCount};
}

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function attr(v){return esc(v).replace(/"/g,'&quot;')}
function timeLabel(t){return t.startTime?(t.endTime?`${t.startTime}–${t.endTime}`:t.startTime):'All day'}
function hourLabel(m){const h=Math.floor(m/60),ampm=h>=12?'PM':'AM',hr=((h+11)%12)+1;return `${hr}:00 ${ampm}`}
function taskMap(tasks){return new Map(safeArray(tasks).map(x=>[x.id,x]))}

function boot(options){
  if(typeof document==='undefined')return null;
  const host=document.getElementById(options?.hostId||'runluWeeklyScheduleV062');if(!host)return null;
  const loaded=readScheduleData(options?.storage||root.localStorage);
  let week=startOfWeek(options?.weekStart||localToday()),filters=new Set(TYPE_ORDER),selected=null;
  const hasReal=loaded.tasks.length>0;let all=hasReal?loaded.tasks:demoTasks(week);let byId=taskMap(all);
  host.dataset.mode=hasReal?'live':'demo';
  host.innerHTML=`<div class="r62shell"><div class="r62top"><div><div class="r62eyebrow">RUNLU FLOORING OS · V${VERSION} · READ ONLY</div><h1>Weekly Scheduling Board</h1><div class="r62sub">Sunday–Saturday · dense job lanes + timed appointments</div></div><div class="r62nav"><button data-act="prev">← Week</button><button data-act="today">Today</button><button data-act="next">Week →</button></div></div><div class="r62status"><div><b id="r62range"></b><span id="r62counts"></span></div><span id="r62mode" class="${hasReal?'live':'demo'}">${hasReal?'LIVE LOCAL DATA':'DEMO DATA · no parseable scheduled records found'}</span></div><div class="r62filters">${TYPE_ORDER.map(k=>`<label><input type="checkbox" data-type="${k}" checked><span class="dot" style="background:${TYPES[k].fallback}"></span>${TYPES[k].label}</label>`).join('')}</div><div class="r62scroll"><div class="r62week"><div id="r62days" class="r62days"></div><div class="r62allrow"><div class="r62railLabel">ALL DAY</div><div id="r62all" class="r62all"></div></div><div class="r62timerow"><div id="r62axis" class="r62axis"></div><div id="r62time" class="r62time"></div></div></div></div><div class="r62foot">Read-only preview. Source records remain authoritative; this view never edits Jobs, POs, Calendar records, inventory, or browser storage.</div></div><div id="r62modal" class="r62modal" aria-hidden="true"><div class="r62dialog" role="dialog" aria-modal="true" aria-labelledby="r62detailTitle"><div class="r62dialogTop"><b id="r62detailTitle">Schedule Detail</b><button data-act="close" aria-label="Close">×</button></div><div id="r62detail" class="r62detail"></div></div></div>`;
  const range=host.querySelector('#r62range'),counts=host.querySelector('#r62counts'),days=host.querySelector('#r62days'),allBox=host.querySelector('#r62all'),axis=host.querySelector('#r62axis'),time=host.querySelector('#r62time'),modal=host.querySelector('#r62modal'),detail=host.querySelector('#r62detail');

  function render(){
    if(!hasReal){all=demoTasks(week);byId=taskMap(all)}
    const p=planWeek(all,week,filters);
    range.textContent=`${prettyDate(p.weekStart,{month:'short',day:'numeric',timeZone:'UTC'})} – ${prettyDate(p.weekEnd,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'})}`;
    counts.textContent=` ${p.allDay.length} all-day · ${p.timed.length} timed`;
    days.innerHTML='<div class="r62railHead">TIME</div>'+Array.from({length:7},(_,i)=>{const d=addDays(p.weekStart,i),isToday=d===localToday();return `<div class="${isToday?'today':''}"><span>${prettyDate(d,{weekday:'short',timeZone:'UTC'})}</span><b>${prettyDate(d,{month:'short',day:'numeric',timeZone:'UTC'})}</b></div>`}).join('');
    const allHeight=Math.max(54,Math.max(1,p.allDayLaneCount)*24+12);allBox.style.height=allHeight+'px';
    allBox.innerHTML='<div class="r62daycols">'+Array.from({length:7},()=>'<i></i>').join('')+'</div>'+p.allDay.map(x=>{const left=(x.startCol/7)*100,width=(x.span/7)*100,arrows=`${x.clippedLeft?'‹ ':''}${x.clippedRight?' ›':''}`;return `<button class="r62allTask${x.demo?' demo':''}" data-id="${attr(x.id)}" style="left:calc(${left}% + 3px);width:calc(${width}% - 6px);top:${x.lane*24+6}px;background:${attr(x.color)}" title="${attr(x.title+' · '+timeLabel(x))}"><span>${arrows}${esc(x.title)}</span><small>${esc(x.assignedTo||x.subCalendar||x.source)}</small></button>`}).join('')+(p.allDay.length?'':'<div class="r62emptyAll">No all-day schedule items.</div>');
    const hours=[];for(let m=DAY_START;m<=DAY_END;m+=60)hours.push(`<span style="top:${((m-DAY_START)/DAY_SPAN)*100}%">${hourLabel(m)}</span>`);axis.innerHTML=hours.join('');
    const hlines=[];for(let m=DAY_START;m<=DAY_END;m+=60)hlines.push(`<i class="r62hline" style="top:${((m-DAY_START)/DAY_SPAN)*100}%"></i>`);
    const vlines=Array.from({length:8},(_,i)=>`<i class="r62vline" style="left:${(i/7)*100}%"></i>`).join('');
    const blocks=p.timed.map(x=>{const dayBase=(x.dayCol/7)*100,dayWidth=100/7,laneWidth=dayWidth/x.timedLaneCount,left=dayBase+x.timedLane*laneWidth,width=laneWidth;return `<button class="r62timedTask${x.demo?' demo':''}" data-id="${attr(x.id)}" style="left:calc(${left}% + 2px);width:calc(${width}% - 4px);top:${x.topPct}%;height:${x.heightPct}%;background:${attr(x.color)}" title="${attr(x.title+' · '+timeLabel(x))}"><b>${esc(x.title)}</b><small>${esc(timeLabel(x))}${x.assignedTo?' · '+esc(x.assignedTo):''}</small></button>`}).join('');
    time.innerHTML=hlines.join('')+vlines+blocks+(p.timed.length?'':'<div class="r62emptyTimed">No timed appointments in the visible 7 AM–7 PM window.</div>');
  }
  function openDetail(id){
    selected=byId.get(id)||null;if(!selected)return;
    const rows=[['Type',TYPES[selected.type]?.label],['Date',selected.startDate===selected.endDate?selected.startDate:`${selected.startDate} → ${selected.endDate}`],['Time',timeLabel(selected)],['Job #',selected.jobNumber],['Customer',selected.customer],['Assigned',selected.assignedTo],['Calendar',selected.subCalendar||selected.group],['Address',selected.address],['Status',selected.status],['Source',selected.source],['Notes',selected.notes]].filter(x=>x[1]);
    detail.innerHTML=`<h2>${esc(selected.title)}</h2>${selected.demo?'<div class="r62demowarn">DEMO DATA</div>':''}<dl>${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p>Read only — edit the authoritative Job / PO / Calendar record in Flooring OS.</p>`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }
  function close(){selected=null;modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  host.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b){const a=b.dataset.act;if(a==='prev'){week=addDays(week,-7);render()}else if(a==='next'){week=addDays(week,7);render()}else if(a==='today'){week=startOfWeek(localToday());render()}else if(a==='close')close();return}const t=e.target.closest('[data-id]');if(t)openDetail(t.dataset.id)});
  host.addEventListener('change',e=>{const cb=e.target.closest('input[data-type]');if(!cb)return;cb.checked?filters.add(cb.dataset.type):filters.delete(cb.dataset.type);render()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close()});
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  render();
  return {version:VERSION,mode:hasReal?'live':'demo',taskCount:all.length,readOnly:true,render,getWeek:()=>week};
}

const API={VERSION,STORES,TYPES,TYPE_ORDER,DAY_START,DAY_END,parseDateOnly,addDays,startOfWeek,readScheduleData,normalizeStores,jobTasks,poTasks,manualTasks,manualType,demoTasks,clipToWeek,assignLanes,timedGeometry,planWeek,hashColor,boot,readOnly:true};
root.RUNLUWeeklyScheduleV062=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
