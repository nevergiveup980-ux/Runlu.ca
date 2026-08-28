/* RUNLU Deerfoot Flooring OS · V0.3.56 Calendar Groups & Overlay */
(function(){
'use strict';
if(window.__runluCalendarGroups056)return;
window.__runluCalendarGroups056=true;

const JOBS='runlu_deerfoot_flooring_jobs_v1';
const POS='runlu_deerfoot_supplier_orders_v1';
const META='runlu_supplier_task_meta_v1';
const SNAP='runlu_supplier_pickup_by_po_v1';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const P54='runlu_installer_calendar_pref_v054';
const VP='runlu_installer_calendar_view_v055';
const GS='runlu_calendar_groups_v056';
const ME='runlu_calendar_manual_events_v056';

const GROUPS=[
  {id:'installers',label:'Installers',color:'#315d49',kind:'native'},
  {id:'pickup',label:'Pickup / Receiving',color:'#2b7c70',kind:'po'},
  {id:'deliveries',label:'Deliveries',color:'#9b5aa5',kind:'po'},
  {id:'appointments',label:'Appointments / Measurements',color:'#3d6fb6',kind:'manual',subs:['Appointments','Measurements']},
  {id:'chc',label:'CHC / Other',color:'#b28126',kind:'manual',subs:['CHC','Other']}
];
const GCOL=Object.fromEntries(GROUPS.map(g=>[g.id,g.color]));
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const uid=()=>`cal-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
let syncing=false,observer=null,timer=null;

function idate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function today(){return idate(new Date())}
function dob(v){return new Date((iso(v)?v:today())+'T12:00:00')}
function add(v,n){const d=dob(v);d.setDate(d.getDate()+n);return idate(d)}
function sun(v){const d=dob(v);d.setDate(d.getDate()-d.getDay());return idate(d)}
function pretty(v,o){return dob(v).toLocaleDateString('en-CA',o||{weekday:'short',month:'short',day:'numeric'})}
function week(){const p=read(P54,{});return iso(p.week)?sun(p.week):sun(today())}
function view(){return String(read(VP,'week')||'week').toLowerCase().replace(/\s+/g,'')}
function jobs(){const x=read(JOBS,[]);return Array.isArray(x)?x:[]}
function pos(){const x=read(POS,[]);return Array.isArray(x)?x:[]}
function manual(){const x=read(ME,[]);return Array.isArray(x)?x:[]}
function state(){
  const raw=read(GS,{}),groups=raw.groups||{},subs=raw.subs||{};
  GROUPS.forEach(g=>{if(!groups[g.id])groups[g.id]={visible:true,expanded:g.id==='installers'};if(typeof groups[g.id].visible!=='boolean')groups[g.id].visible=true;if(typeof groups[g.id].expanded!=='boolean')groups[g.id].expanded=g.id==='installers';if(!subs[g.id])subs[g.id]={}});
  return {groups,subs};
}
function saveState(s){write(GS,{...s,updatedAt:new Date().toISOString()})}
function group(id){return GROUPS.find(g=>g.id===id)}
function gstate(id){return state().groups[id]||{visible:true,expanded:true}}
function groupVisible(id){return gstate(id).visible!==false}
function subVisible(gid,name){const s=state();return s.subs[gid]?.[name]!==false}
function setGroup(id,patch){const s=state();s.groups[id]={...s.groups[id],...patch};saveState(s);syncSoon()}
function setSub(gid,name,visible){const s=state();s.subs[gid]=s.subs[gid]||{};s.subs[gid][name]=!!visible;saveState(s);syncSoon()}
function showOnly(id){const s=state();GROUPS.forEach(g=>{s.groups[g.id]={...s.groups[g.id],visible:g.id===id}});saveState(s);syncSoon()}
function showAll(){const s=state();GROUPS.forEach(g=>{s.groups[g.id]={...s.groups[g.id],visible:true}});saveState(s);syncSoon()}

function poRows(){
  const xs=pos(),meta=read(META,{}),snap=read(SNAP,{});
  return xs.filter(x=>x&&x.poNumber&&x.status!=='Draft'&&x.status!=='Cancelled').map(po=>{
    const num=String(po.poNumber||'').trim(),legacy=meta[po.id]||(po.jobId?meta[po.jobId]:meta['no-job'])||{},ss=snap[num]||{};
    const requestedDate=po.requestedDate||ss.requestedDate||legacy.requestedDate||'';
    const fulfillment=po.fulfillment||ss.fulfillment||legacy.fulfillment||'Pickup';
    return {...po,requestedDate,fulfillment};
  }).filter(x=>iso(x.requestedDate));
}
function qvalue(){return String($('#r54q')?.value||'').trim().toLowerCase()}
function statusValue(){return String($('#r54st')?.value||'open')}
function poOpen(po){return !['Received','Completed','Cancelled'].includes(String(po.status||''))}
function passesText(ev){const q=qvalue();return !q||[ev.title,ev.sub,ev.supplier,ev.jobNumber,ev.notes].join(' ').toLowerCase().includes(q)}
function overlayEvents(){
  const out=[],st=statusValue();
  if(groupVisible('pickup')||groupVisible('deliveries')){
    poRows().forEach(po=>{
      if(st==='open'&&!poOpen(po))return;
      if(st==='issues')return;
      const delivery=/deliver/i.test(String(po.fulfillment||'')),gid=delivery?'deliveries':'pickup';
      if(!groupVisible(gid))return;
      const supplier=String(po.supplier||'Supplier not set').trim()||'Supplier not set';
      if(!subVisible(gid,supplier))return;
      const ev={id:`po-${po.id||po.poNumber}`,source:'po',poId:po.id,jobId:po.jobId||'',jobNumber:po.jobNumber||'',group:gid,sub:supplier,date:po.requestedDate,start:'',end:'',supplier,title:`${delivery?'DELIVERY':'PICKUP'} · ${supplier} · PO #${po.poNumber}${po.jobNumber?' · Job '+po.jobNumber:''}`,notes:po.customerName||'',color:GCOL[gid]};
      if(passesText(ev))out.push(ev);
    });
  }
  manual().forEach(m=>{
    if(!m||!iso(m.date)||!groupVisible(m.group)||!subVisible(m.group,m.sub))return;
    const ev={...m,source:'manual',color:m.color||GCOL[m.group]||'#596860'};
    if(passesText(ev))out.push(ev);
  });
  return out.sort((a,b)=>a.date.localeCompare(b.date)||String(a.start||'99:99').localeCompare(String(b.start||'99:99'))||a.title.localeCompare(b.title));
}
function tmin(v){if(!/^\d{2}:\d{2}$/.test(String(v||'')))return null;const [h,m]=v.split(':').map(Number);return h*60+m}
function labelTime(ev){return ev.start?(ev.end?`${ev.start}–${ev.end}`:ev.start):'All day'}
function eventTitle(ev){return [ev.title,labelTime(ev),ev.notes].filter(Boolean).join('\n')}
function eventButton(ev,cls='r56event'){
  return `<button class="${cls} r56overlay" data-r56-event="${attr(ev.id)}" data-r56-source="${attr(ev.source)}" style="--r56c:${attr(ev.color)};background:${attr(ev.color)}" title="${attr(eventTitle(ev))}">${esc(ev.title)}</button>`;
}
function currentRange(v=view()){
  const w=week(),base=(today()>=w&&today()<=add(w,6))?today():w;
  if(v==='day')return[base,base];if(v==='3days')return[base,add(base,2)];if(v==='4weeks')return[w,add(w,27)];
  if(v==='month'){const d=dob(add(w,3));d.setDate(1);const a=idate(d),e=new Date(d);e.setMonth(e.getMonth()+1,0);return[a,idate(e)]}
  if(v==='year'){const y=dob(add(w,3)).getFullYear();return[`${y}-01-01`,`${y}-12-31`]}
  return[w,add(w,6)];
}
function inRange(evs,a,b){return evs.filter(e=>e.date>=a&&e.date<=b)}

function ensureStyle(){
  if($('#r56style'))return;
  const s=document.createElement('style');s.id='r56style';s.textContent=`
  .r56group{border-top:1px solid #dce3df}.r56ghead{display:grid;grid-template-columns:16px 11px 1fr auto 22px 22px;gap:4px;align-items:center;padding:4px 5px;background:#f6f8f7;font-size:8.5px;color:#32463c}.r56ghead button{border:0;background:transparent;padding:1px;font-size:9px;cursor:pointer;color:#4d5f56}.r56ghead button:hover{background:#e7eeea;border-radius:3px}.r56sw{width:9px;height:9px;border-radius:2px}.r56gcount{font-size:7.5px;color:#7b8882}.r56subs{padding:2px 5px 5px 18px;background:#fbfcfb;max-height:140px;overflow:auto}.r56sub{display:grid;grid-template-columns:13px 9px 1fr auto;gap:4px;align-items:center;padding:2px 0;font-size:8px;color:#526159}.r56sub input{width:10px;height:10px;margin:0}.r56sub .dot{width:7px;height:7px;border-radius:50%}.r56add{display:flex;gap:4px;padding:5px;border-top:1px solid #dce3df;background:#fbfcfb}.r56add button{flex:1;border:1px solid #d5ded9;background:#fff;border-radius:4px;padding:4px;font-size:8px;cursor:pointer;color:#315d49;font-weight:800}.r56event{display:block;width:100%;border:0;border-radius:2px;margin:1px 0;padding:3px 4px;color:#fff;text-align:left;font-size:7.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.r56tevent{position:absolute;left:2px;right:2px;border:0;border-radius:3px;padding:3px;color:#fff;text-align:left;font-size:7.5px;font-weight:800;overflow:hidden;cursor:pointer;z-index:3}.r56schedrow{display:grid;grid-template-columns:120px repeat(7,minmax(125px,1fr))}.r56schedrow>div{padding:5px;border-right:1px solid #e0e6e2;border-bottom:1px solid #e7ebe9;min-height:31px;font-size:8px}.r56schedname{color:#fff;font-weight:900;display:flex;align-items:center}.r56agenda{margin:8px;border:1px solid #dce3df;border-radius:6px;overflow:hidden}.r56agenda h4{margin:0;padding:6px 8px;background:#f4f7f5;font-size:9px}.r56ar{display:grid;grid-template-columns:90px 135px 1fr 120px;gap:7px;padding:6px 8px;border-top:1px solid #edf0ee;font-size:8px}.r56ar button{border:0;background:none;color:#173d30;font-weight:900;text-align:left;cursor:pointer;padding:0}.r56tile{border:1px solid #dce3df;border-left:5px solid var(--r56c);border-radius:6px;padding:8px;cursor:pointer;background:#fff}.r56tile b{font-size:9px;color:#173d30}.r56tile small{display:block;margin-top:3px;font-size:8px;color:#69766f}.r56legend{display:flex;gap:5px;flex-wrap:wrap;padding:5px 8px;background:#f7faf8;border-bottom:1px solid #e0e6e2}.r56legend span{font-size:7.5px;padding:3px 5px;border-radius:999px;color:#fff;font-weight:800}.r56modal{position:fixed;inset:0;z-index:99998;background:rgba(25,36,31,.45);display:none;align-items:center;justify-content:center;padding:18px}.r56modal.open{display:flex}.r56box{width:min(520px,96vw);background:#fff;border-radius:12px;box-shadow:0 18px 55px rgba(0,0,0,.25);overflow:hidden}.r56boxtop{display:flex;justify-content:space-between;align-items:center;padding:11px 13px;background:#173d30;color:#fff;font-weight:900}.r56boxtop button{border:0;background:transparent;color:#fff;font-size:18px;cursor:pointer}.r56form{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:12px}.r56form label{display:flex;flex-direction:column;gap:4px;font-size:10px;font-weight:800;color:#47574f}.r56form input,.r56form select,.r56form textarea{border:1px solid #cfd9d4;border-radius:7px;padding:8px;font:inherit;color:#26342e;background:#fff}.r56form .wide{grid-column:1/-1}.r56form textarea{min-height:70px;resize:vertical}.r56actions{display:flex;justify-content:space-between;gap:8px;padding:0 12px 12px}.r56actions button{border:1px solid #cfd9d4;background:#fff;border-radius:7px;padding:8px 11px;font-weight:800;cursor:pointer}.r56actions .save{background:#315d49;color:#fff;border-color:#315d49}.r56actions .delete{color:#9a342f}.r56NoInstallers .r54event:not(.r56overlay),.r56NoInstallers .r54tevent:not(.r56overlay),.r56NoInstallers .r55ev:not(.r56overlay),.r56NoInstallers .r55te:not(.r56overlay),.r56NoInstallers .r55sr:not(.r56overlay),.r56NoInstallers .r55ar:not(.r56overlay),.r56NoInstallers .r55tile:not(.r56overlay),.r56NoInstallers .r55dot:not(.r56overlay){display:none!important}.r56NoInstallers .r55list tbody tr:not(.r56overlay){display:none!important}
  `;document.head.appendChild(s);
}
function ensureModal(){
  if($('#r56modal'))return;
  const d=document.createElement('div');d.id='r56modal';d.className='r56modal';d.innerHTML=`<div class="r56box"><div class="r56boxtop"><span id="r56mtitle">Calendar Event</span><button id="r56close">×</button></div><div class="r56form"><label class="wide">Title<input id="r56title"></label><label>Calendar<select id="r56cal"><option value="appointments|Appointments">Appointments</option><option value="appointments|Measurements">Measurements</option><option value="chc|CHC">CHC</option><option value="chc|Other">Other</option></select></label><label>Date<input id="r56date" type="date"></label><label>Start time<input id="r56start" type="time"></label><label>End time<input id="r56end" type="time"></label><label class="wide">Notes / address<textarea id="r56notes"></textarea></label></div><div class="r56actions"><button id="r56delete" class="delete">Delete</button><div><button id="r56cancel">Cancel</button> <button id="r56save" class="save">Save Event</button></div></div></div>`;document.body.appendChild(d);
  $('#r56close').onclick=closeModal;$('#r56cancel').onclick=closeModal;d.addEventListener('click',e=>{if(e.target===d)closeModal()});
  $('#r56save').onclick=saveManual;$('#r56delete').onclick=deleteManual;
}
function defaultEventDate(){const [a,b]=currentRange();return today()>=a&&today()<=b?today():a}
function openModal(id=''){
  ensureModal();const ev=manual().find(x=>x.id===id)||null;$('#r56modal').dataset.id=ev?.id||'';$('#r56mtitle').textContent=ev?'Edit Calendar Event':'New Calendar Event';$('#r56title').value=ev?.title||'';$('#r56date').value=ev?.date||defaultEventDate();$('#r56start').value=ev?.start||'';$('#r56end').value=ev?.end||'';$('#r56notes').value=ev?.notes||'';$('#r56cal').value=ev?`${ev.group}|${ev.sub}`:'appointments|Appointments';$('#r56delete').style.visibility=ev?'visible':'hidden';$('#r56modal').classList.add('open');setTimeout(()=>$('#r56title')?.focus(),40);
}
function closeModal(){$('#r56modal')?.classList.remove('open')}
function saveManual(){
  const title=String($('#r56title')?.value||'').trim(),date=$('#r56date')?.value||'',start=$('#r56start')?.value||'',end=$('#r56end')?.value||'',notes=String($('#r56notes')?.value||'').trim(),cal=String($('#r56cal')?.value||'appointments|Appointments').split('|');
  if(!title||!iso(date)){alert('Title and date are required.');return}if(start&&end&&end<=start){alert('End time must be after start time.');return}
  const list=manual(),id=$('#r56modal')?.dataset.id||uid(),i=list.findIndex(x=>x.id===id),row={id,title,date,start,end,notes,group:cal[0],sub:cal[1],updatedAt:new Date().toISOString()};if(i>=0)list[i]={...list[i],...row};else list.push(row);write(ME,list);closeModal();syncSoon();
}
function deleteManual(){const id=$('#r56modal')?.dataset.id;if(!id)return;const list=manual().filter(x=>x.id!==id);write(ME,list);closeModal();syncSoon()}

function subNames(gid){
  if(gid==='pickup'||gid==='deliveries')return [...new Set(poRows().filter(p=>(/deliver/i.test(String(p.fulfillment||''))?'deliveries':'pickup')===gid).map(p=>String(p.supplier||'Supplier not set').trim()||'Supplier not set'))].sort();
  return group(gid)?.subs||[];
}
function countGroup(gid){if(gid==='installers')return jobs().filter(j=>iso(j.installDate)).length;return overlayEvents().filter(e=>e.group===gid).length}
function groupHtml(g){
  const gs=gstate(g.id),subs=subNames(g.id),count=countGroup(g.id),subbody=g.id==='installers'?'':`<div class="r56subs" style="display:${gs.expanded?'block':'none'}">${subs.length?subs.map(n=>`<label class="r56sub"><input type="checkbox" data-r56-sub="${attr(g.id)}" data-r56-name="${attr(n)}"${subVisible(g.id,n)?' checked':''}><span class="dot" style="background:${attr(g.color)}"></span><span>${esc(n)}</span><small>${overlayEvents().filter(e=>e.group===g.id&&e.sub===n).length}</small></label>`).join(''):'<div style="font-size:8px;color:#89938e;padding:4px">No sub-calendars yet.</div>'}</div>`;
  return `<div class="r56group" data-r56-group="${attr(g.id)}"><div class="r56ghead"><button data-r56-expand="${attr(g.id)}">${gs.expanded?'▾':'▸'}</button><span class="r56sw" style="background:${attr(g.color)}"></span><b>${esc(g.label)}</b><span class="r56gcount">${count}</span><button data-r56-eye="${attr(g.id)}" title="Show / hide this group">${gs.visible?'◉':'○'}</button><button data-r56-only="${attr(g.id)}" title="Show this group only">◎</button></div>${subbody}</div>`;
}
function decorateSide(){
  const side=$('.r54side'),roster=side?.querySelector('.r54roster');if(!side||!roster)return;
  ensureStyle();ensureModal();
  let native=$('#r56native');
  if(!native){native=document.createElement('div');native.id='r56native';native.className='r56group';roster.parentNode.insertBefore(native,roster);native.appendChild(roster)}else if(roster.parentNode!==native){native.appendChild(roster)}
  const gs=gstate('installers');native.querySelector('.r56ghead')?.remove();const h=document.createElement('div');h.className='r56ghead';h.innerHTML=`<button data-r56-expand="installers">${gs.expanded?'▾':'▸'}</button><span class="r56sw" style="background:${GCOL.installers}"></span><b>Installers</b><span class="r56gcount">${jobs().filter(j=>iso(j.installDate)).length}</span><button data-r56-eye="installers" title="Show / hide this group">${gs.visible?'◉':'○'}</button><button data-r56-only="installers" title="Show this group only">◎</button>`;native.insertBefore(h,roster);roster.style.display=gs.expanded?'block':'none';
  side.querySelectorAll('.r56group:not(#r56native)').forEach(x=>x.remove());
  const about=side.querySelector('.r54about');GROUPS.filter(g=>g.id!=='installers').forEach(g=>{const t=document.createElement('div');t.innerHTML=groupHtml(g);const el=t.firstElementChild;side.insertBefore(el,about||null)});
  let addbar=$('#r56addbar');if(!addbar){addbar=document.createElement('div');addbar.id='r56addbar';addbar.className='r56add';addbar.innerHTML='<button id="r56new">＋ Event</button><button id="r56showall">Show all</button>';side.insertBefore(addbar,about||null)}
  $('#r56new').onclick=()=>openModal();$('#r56showall').onclick=showAll;
  $$('[data-r56-expand]').forEach(b=>b.onclick=()=>{const id=b.dataset.r56Expand;setGroup(id,{expanded:!gstate(id).expanded})});
  $$('[data-r56-eye]').forEach(b=>b.onclick=()=>{const id=b.dataset.r56Eye;setGroup(id,{visible:!gstate(id).visible})});
  $$('[data-r56-only]').forEach(b=>b.onclick=()=>showOnly(b.dataset.r56Only));
  $$('[data-r56-sub]').forEach(c=>c.onchange=()=>setSub(c.dataset.r56Sub,c.dataset.r56Name,c.checked));
  const root=$('#rep54');if(root)root.classList.toggle('r56NoInstallers',!groupVisible('installers'));
}

function cleanOverlays(){$$('.r56overlay,.r56overlayWrap,.r56legend').forEach(x=>x.remove())}
function bindOverlayClicks(){
  $$('[data-r56-event]').forEach(b=>{b.onclick=e=>{e.stopPropagation();const id=b.dataset.r56Event,src=b.dataset.r56Source;if(src==='manual')openModal(id);else{const ev=overlayEvents().find(x=>x.id===id);if(ev?.jobId)localStorage.setItem(ACTIVE,String(ev.jobId));try{if(ev?.jobId&&typeof window.selectJob==='function')window.selectJob(ev.jobId)}catch(_){}setTimeout(()=>{try{window.go('purchasing')}catch(_){}},30)}}});
}
function legend(evs){
  const ids=[...new Set(evs.map(e=>e.group))];if(!ids.length)return;const main=$('.r54main');if(!main)return;const d=document.createElement('div');d.className='r56legend';d.innerHTML=ids.map(id=>{const g=group(id);return `<span style="background:${g?.color||'#596860'}">${esc(g?.label||id)}</span>`}).join('');main.insertBefore(d,main.firstChild);
}
function weekOverlay(evs){
  const w=week(),days=Array.from({length:7},(_,i)=>add(w,i)),allcols=$$('.r54all .r54acol'),tcols=$$('.r54timed .r54tcol');if(!allcols.length||!tcols.length)return false;
  evs.filter(e=>days.includes(e.date)).forEach(e=>{const i=days.indexOf(e.date),m=tmin(e.start);if(m==null){allcols[i]?.insertAdjacentHTML('beforeend',eventButton(e))}else{const en=tmin(e.end),top=Math.max(0,m-420),height=Math.max(26,Math.min(180,(en||m+60)-m));tcols[i]?.insertAdjacentHTML('beforeend',`<button class="r56tevent r56overlay" data-r56-event="${attr(e.id)}" data-r56-source="${attr(e.source)}" style="top:${top}px;height:${height}px;background:${attr(e.color)}" title="${attr(eventTitle(e))}">${esc(e.title)}</button>`)}});return true;
}
function schedulerOverlay(evs){
  const el=$('.r55sched');if(!el)return false;const [a,b]=currentRange('week'),days=Array.from({length:7},(_,i)=>add(a,i)),groups=GROUPS.filter(g=>g.id!=='installers'&&groupVisible(g.id));if(!groups.length)return true;const wrap=document.createElement('div');wrap.className='r56overlayWrap';wrap.innerHTML=groups.map(g=>`<div class="r56schedrow r56overlay"><div class="r56schedname" style="background:${g.color}">${esc(g.label)}</div>${days.map(d=>`<div>${evs.filter(e=>e.group===g.id&&e.date===d).map(e=>eventButton(e)).join('')}</div>`).join('')}</div>`).join('');el.appendChild(wrap);return true;
}
function timedOverlay(evs,daysCount){
  const grid=$('.r55timegrid'),all=$('.r55all'),cols=$$('.r55timegrid .r55td');if(!grid||!all||!cols.length)return false;const [a]=currentRange(daysCount===1?'day':'3days'),days=Array.from({length:daysCount},(_,i)=>add(a,i)),list=evs.filter(e=>days.includes(e.date));
  list.filter(e=>tmin(e.start)==null).forEach(e=>all.insertAdjacentHTML('beforeend',eventButton({...e,title:`${pretty(e.date,{weekday:'short'})} · ${e.title}`})));
  list.filter(e=>tmin(e.start)!=null).forEach(e=>{const i=days.indexOf(e.date),m=tmin(e.start),en=tmin(e.end),top=Math.max(0,m-420),height=Math.max(28,Math.min(180,(en||m+60)-m));cols[i]?.insertAdjacentHTML('beforeend',`<button class="r56tevent r56overlay" data-r56-event="${attr(e.id)}" data-r56-source="${attr(e.source)}" style="top:${top}px;height:${height}px;background:${attr(e.color)}" title="${attr(eventTitle(e))}">${esc(e.title)}</button>`)});return true;
}
function calOverlay(evs,v){
  const cells=$$('.r55cal .r55md');if(!cells.length)return false;const [a,b]=currentRange(v),start=sun(a),end=add(sun(b),6),days=[];for(let d=start;d<=end;d=add(d,1))days.push(d);cells.forEach((cell,i)=>{const d=days[i];if(!d)return;evs.filter(e=>e.date===d).slice(0,5).forEach(e=>cell.insertAdjacentHTML('beforeend',eventButton(e)))});return true;
}
function yearOverlay(evs){
  const months=$$('.r55year .r55ym');if(!months.length)return false;const [a]=currentRange('year'),y=dob(a).getFullYear();months.forEach((box,m)=>{const f=`${y}-${String(m+1).padStart(2,'0')}-01`,last=new Date(dob(f));last.setMonth(last.getMonth()+1,0);const s=sun(f),e=add(sun(idate(last)),6),days=[];for(let d=s;d<=e;d=add(d,1))days.push(d);const cells=[...box.querySelectorAll('.r55yd')];cells.forEach((c,i)=>{const ds=days[i];const es=evs.filter(x=>x.date===ds);es.slice(0,4).forEach(x=>c.insertAdjacentHTML('beforeend',`<span class="r55dot r56overlay" data-r56-event="${attr(x.id)}" data-r56-source="${attr(x.source)}" style="background:${attr(x.color)}" title="${attr(eventTitle(x))}"></span>`))})});return true;
}
function agendaOverlay(evs){
  const host=$('.r55agenda');if(!host)return false;const [a,b]=currentRange('week'),list=inRange(evs,a,b);if(!list.length)return true;const wrap=document.createElement('div');wrap.className='r56agenda r56overlayWrap';wrap.innerHTML='<h4>Overlay calendars</h4>'+list.map(e=>`<div class="r56ar r56overlay"><span>${esc(pretty(e.date))}<br>${esc(labelTime(e))}</span><span style="color:${attr(e.color)};font-weight:900">${esc(group(e.group)?.label||e.group)}</span><button data-r56-event="${attr(e.id)}" data-r56-source="${attr(e.source)}">${esc(e.title)}</button><span>${esc(e.sub||'')}</span></div>`).join('');host.appendChild(wrap);return true;
}
function listOverlay(evs){
  const table=$('.r55list'),body=table?.tBodies?.[0]||table;if(!table||!body)return false;const [a,b]=currentRange('week');inRange(evs,a,b).forEach(e=>body.insertAdjacentHTML('beforeend',`<tr class="r56overlay"><td>${esc(pretty(e.date))}</td><td>${esc(labelTime(e))}</td><td><button data-r56-event="${attr(e.id)}" data-r56-source="${attr(e.source)}">${esc(e.title)}</button></td><td>${esc(e.sub||'')}</td><td>${esc(group(e.group)?.label||e.group)}</td></tr>`));return true;
}
function tilesOverlay(evs){
  const host=$('.r55tiles');if(!host)return false;const [a,b]=currentRange('week');inRange(evs,a,b).forEach(e=>host.insertAdjacentHTML('beforeend',`<div class="r56tile r56overlay" style="--r56c:${attr(e.color)}" data-r56-event="${attr(e.id)}" data-r56-source="${attr(e.source)}"><b>${esc(e.title)}</b><small>${esc(pretty(e.date))} · ${esc(labelTime(e))}</small><small>${esc(group(e.group)?.label||e.group)} · ${esc(e.sub||'')}</small></div>`));return true;
}
function syncOverlay(){
  cleanOverlays();const evs=overlayEvents();legend(evs);const v=view();let ok=false;if(v==='week')ok=weekOverlay(evs);else if(v==='scheduler')ok=schedulerOverlay(evs);else if(v==='day')ok=timedOverlay(evs,1);else if(v==='3days')ok=timedOverlay(evs,3);else if(v==='4weeks'||v==='month')ok=calOverlay(evs,v);else if(v==='year')ok=yearOverlay(evs);else if(v==='agenda')ok=agendaOverlay(evs);else if(v==='list')ok=listOverlay(evs);else if(v==='tiles')ok=tilesOverlay(evs);if(ok)bindOverlayClicks();
}
function sync(){
  if(syncing)return;syncing=true;try{if(observer)observer.disconnect();decorateSide();syncOverlay()}catch(e){console.error('Calendar Groups V056 sync failed',e)}finally{syncing=false;observe()}
}
function syncSoon(){clearTimeout(timer);timer=setTimeout(sync,70)}
function ours(n){if(!n||n.nodeType!==1)return true;return String(n.id||'').startsWith('r56')||[...n.classList||[]].some(c=>c.startsWith('r56'))}
function observe(){
  if(observer)observer.disconnect();const root=$('#installerCalendarV053')||$('#install');if(!root)return;observer=new MutationObserver(ms=>{if(syncing)return;const relevant=ms.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&!ours(n)));if(relevant)syncSoon()});observer.observe(root,{childList:true,subtree:true});
}
function hook(){document.addEventListener('click',e=>{if(e.target.closest('.r54views button,#r54prev,#r54next,#r54today,#r54refresh'))setTimeout(syncSoon,60)},true);document.addEventListener('change',e=>{if(e.target.matches('[data-person],#r54st'))setTimeout(syncSoon,30)},true);document.addEventListener('input',e=>{if(e.target.matches('#r54q'))setTimeout(syncSoon,120)},true);}
function install(){ensureStyle();ensureModal();hook();sync();setTimeout(sync,350);setTimeout(sync,1000)}

window.RUNLUCalendarGroupsV056={install,render:sync,openEvent:openModal,showOnly,showAll};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,220),{once:true});else setTimeout(install,220);
})();
