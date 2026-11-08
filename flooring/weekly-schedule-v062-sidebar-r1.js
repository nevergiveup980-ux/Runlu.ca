/* RUNLU Deerfoot Flooring OS · V0.6.2r1 Calendar Facet Sidebar · READ ONLY
   In-memory view filters + current-time marker for the isolated weekly preview.
   No Job / PO / Calendar / localStorage writes and no network transport. */
(function(root){
'use strict';

const VERSION='0.6.2r1';
const DAY_START=7*60,DAY_END=19*60,DAY_SPAN=DAY_END-DAY_START;
const clean=v=>String(v??'').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const slug=v=>clean(v).toLowerCase().replace(/\s+/g,' ');

function facetForTask(t){
  if(!t)return {key:'other:Unassigned',kind:'Other',label:'Unassigned',color:'#718078'};
  if(t.type==='installation'){
    const label=clean(t.assignedTo)||'Unassigned installer';
    return {key:'installer:'+label,kind:'Installers',label,color:t.color||'#315d49'};
  }
  if(t.type==='pickup'||t.type==='delivery'){
    const label=clean(t.subCalendar)||'Supplier not set';
    return {key:'supplier:'+label,kind:'Suppliers',label,color:t.color||'#2b7c70'};
  }
  const label=clean(t.subCalendar)||clean(t.assignedTo)||clean(t.type)||'Calendar';
  return {key:'calendar:'+label,kind:'Calendars',label,color:t.color||'#5b6573'};
}
function buildFacets(tasks){
  const map=new Map();
  (Array.isArray(tasks)?tasks:[]).forEach(t=>{
    const f=facetForTask(t),x=map.get(f.key);
    if(x)x.count++;
    else map.set(f.key,{...f,count:1});
  });
  const order={Installers:0,Calendars:1,Suppliers:2,Other:3};
  return [...map.values()].sort((a,b)=>(order[a.kind]??9)-(order[b.kind]??9)||a.label.localeCompare(b.label,undefined,{numeric:true,sensitivity:'base'}));
}
function searchable(t){
  return [t?.title,t?.jobNumber,t?.customer,t?.assignedTo,t?.subCalendar,t?.address,t?.status,t?.source,t?.notes].map(clean).join(' ').toLowerCase();
}
function visibleByFacet(t,selected,query=''){
  if(!t)return true;
  const f=facetForTask(t);
  const enabled=selected instanceof Set?selected:new Set(Array.isArray(selected)?selected:[]);
  if(!enabled.has(f.key))return false;
  const q=slug(query);return !q||searchable(t).includes(q);
}
function localIso(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function ordinal(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(iso));if(!m)return null;
  const ms=Date.UTC(+m[1],+m[2]-1,+m[3]),d=new Date(ms);
  return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()+1===+m[2]&&d.getUTCDate()===+m[3]?Math.floor(ms/86400000):null;
}
function nowGeometry(weekStart,date=new Date()){
  const a=ordinal(weekStart),b=ordinal(localIso(date));if(a==null||b==null)return null;
  const dayCol=b-a;if(dayCol<0||dayCol>6)return null;
  const minute=date.getHours()*60+date.getMinutes();if(minute<DAY_START||minute>DAY_END)return null;
  return {dayCol,topPct:((minute-DAY_START)/DAY_SPAN)*100,leftPct:(dayCol/7)*100,widthPct:100/7,minute};
}
function injectStyle(){
  if(typeof document==='undefined'||document.getElementById('r62r1style'))return;
  const s=document.createElement('style');s.id='r62r1style';s.textContent=`
  .r62r1work{display:grid;grid-template-columns:190px minmax(0,1fr);min-height:0}.r62r1side{border-right:1px solid #dfe6e2;background:#f8faf9;padding:9px 8px;min-width:0}.r62r1head{display:flex;justify-content:space-between;align-items:center;gap:5px;margin-bottom:7px}.r62r1head b{font-size:10px;color:#173d30}.r62r1head small{font-size:7px;color:#77847e}.r62r1tools{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:7px}.r62r1tools button{border:1px solid #ccd9d2;background:#fff;border-radius:6px;padding:5px 4px;color:#315d49;font-size:8px;font-weight:900;cursor:pointer}.r62r1search{width:100%;border:1px solid #ced9d4;border-radius:7px;padding:7px 8px;margin:0 0 8px;background:#fff;color:#253a30;font-size:9px}.r62r1group{border-top:1px solid #e1e7e4;padding:7px 0 3px}.r62r1group h3{margin:0 0 5px;font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:#748078}.r62r1facet{display:grid;grid-template-columns:13px 8px minmax(0,1fr) auto;gap:5px;align-items:center;padding:3px 2px;font-size:8px;color:#45564d;cursor:pointer}.r62r1facet input{width:12px;height:12px;margin:0}.r62r1facet i{width:7px;height:7px;border-radius:2px}.r62r1facet span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r62r1facet em{font-style:normal;color:#87928c;font-size:7px}.r62r1visible{margin-top:8px;padding:6px;border-radius:6px;background:#edf4f0;color:#496157;font-size:7.5px;line-height:1.35}.r62r1now{position:absolute;height:2px;background:#d34b42;z-index:6;pointer-events:none}.r62r1now:before{content:'';position:absolute;left:-3px;top:-3px;width:7px;height:7px;border-radius:50%;background:#d34b42}.r62r1nowLabel{position:absolute;left:3px;top:-11px;padding:1px 3px;border-radius:3px;background:#d34b42;color:#fff;font-size:6px;font-weight:900;white-space:nowrap}.r62r1hidden{display:none!important}
  @media(max-width:860px){.r62r1work{grid-template-columns:1fr}.r62r1side{border-right:0;border-bottom:1px solid #dfe6e2}.r62r1groups{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:7px;overflow:auto}.r62r1group{border:1px solid #e1e7e4;border-radius:7px;padding:6px}.r62r1visible{display:none}}
  `;document.head.appendChild(s);
}
function install(options={}){
  if(typeof document==='undefined')return null;
  const api=root.RUNLUWeeklyScheduleV062;if(!api)return null;
  const host=document.getElementById(options.hostId||'runluWeeklyScheduleV062');if(!host||host.dataset.r62r1==='1')return null;
  const controller=options.controller||root.RUNLUWeeklyScheduleBoardV062||null;
  const loaded=api.readScheduleData(options.storage||root.localStorage);
  let tasks=loaded.tasks;
  if(!tasks.length){
    const week=controller?.getWeek?.()||api.startOfWeek(localIso());
    tasks=api.demoTasks(week);
  }
  const byId=new Map(tasks.map(t=>[t.id,t])),facets=buildFacets(tasks),selected=new Set(facets.map(f=>f.key));
  let query='';
  host.dataset.r62r1='1';injectStyle();

  const scroll=host.querySelector('.r62scroll');
  if(!scroll)return null;
  const work=document.createElement('div');work.className='r62r1work';
  const side=document.createElement('aside');side.className='r62r1side';side.setAttribute('aria-label','Calendar filters');
  side.innerHTML=`<div class="r62r1head"><b>Calendars</b><small>VIEW ONLY</small></div><div class="r62r1tools"><button type="button" data-r62r1="all">Show all</button><button type="button" data-r62r1="none">Clear</button></div><input class="r62r1search" type="search" placeholder="Search schedule…" aria-label="Search schedule"><div class="r62r1groups"></div><div class="r62r1visible"></div>`;
  scroll.parentNode.insertBefore(work,scroll);work.appendChild(side);work.appendChild(scroll);
  const groups=side.querySelector('.r62r1groups'),visible=side.querySelector('.r62r1visible'),search=side.querySelector('.r62r1search');
  const kinds=[...new Set(facets.map(f=>f.kind))];
  groups.innerHTML=kinds.map(kind=>`<section class="r62r1group"><h3>${esc(kind)}</h3>${facets.filter(f=>f.kind===kind).map(f=>`<label class="r62r1facet" title="${attr(f.label)}"><input type="checkbox" data-facet="${attr(f.key)}" checked><i style="background:${attr(f.color)}"></i><span>${esc(f.label)}</span><em>${f.count}</em></label>`).join('')}</section>`).join('');

  function addNow(){
    const time=host.querySelector('.r62time');if(!time)return;
    time.querySelectorAll('.r62r1now').forEach(x=>x.remove());
    const week=controller?.getWeek?.();if(!week)return;
    const g=nowGeometry(week,new Date());if(!g)return;
    const n=document.createElement('div');n.className='r62r1now';n.style.left=`calc(${g.leftPct}% + 1px)`;n.style.width=`calc(${g.widthPct}% - 2px)`;n.style.top=g.topPct+'%';n.innerHTML='<span class="r62r1nowLabel">NOW</span>';time.appendChild(n);
  }
  function apply(){
    let shown=0,total=0;
    host.querySelectorAll('[data-id]').forEach(el=>{
      const t=byId.get(el.dataset.id);if(!t)return;
      total++;const show=visibleByFacet(t,selected,query);el.classList.toggle('r62r1hidden',!show);if(show)shown++;
    });
    visible.textContent=`${shown} visible schedule block${shown===1?'':'s'} · ${selected.size}/${facets.length} calendars selected`;
    addNow();
  }
  side.addEventListener('change',e=>{
    const cb=e.target.closest('input[data-facet]');if(!cb)return;
    cb.checked?selected.add(cb.dataset.facet):selected.delete(cb.dataset.facet);apply();
  });
  side.addEventListener('click',e=>{
    const b=e.target.closest('button[data-r62r1]');if(!b)return;
    const on=b.dataset.r62r1==='all';selected.clear();side.querySelectorAll('input[data-facet]').forEach(cb=>{cb.checked=on;if(on)selected.add(cb.dataset.facet)});apply();
  });
  search.addEventListener('input',()=>{query=search.value||'';apply()});

  let timer=null;
  const obs=new MutationObserver(ms=>{
    if(ms.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&!n.classList?.contains('r62r1now')))){
      clearTimeout(timer);timer=setTimeout(apply,20);
    }
  });
  obs.observe(scroll,{childList:true,subtree:true});
  const clock=setInterval(addNow,60000);
  apply();
  return {version:VERSION,readOnly:true,facets,selected,apply,destroy(){obs.disconnect();clearInterval(clock);work.replaceWith(scroll);host.dataset.r62r1=''}};
}
const API={VERSION,facetForTask,buildFacets,searchable,visibleByFacet,localIso,nowGeometry,install,readOnly:true};
root.RUNLUWeeklyScheduleSidebarV062R1=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
