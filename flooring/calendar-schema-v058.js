/* RUNLU Deerfoot Flooring OS · V0.3.58 Calendar Schema Alignment */
(function(){
'use strict';
if(window.__runluCalendarSchema058)return;
window.__runluCalendarSchema058=true;

const JOBS='runlu_deerfoot_flooring_jobs_v1';
const POS='runlu_deerfoot_supplier_orders_v1';
const MAN='runlu_calendar_manual_events_v056';
const CONTACTS='runlu_installer_contacts_v054';
const META='runlu_calendar_schema_meta_v058';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const now=()=>new Date().toISOString();

const JOB_FIELDS=[
 ['jobNumber','Job #','stored'],['customerName','Customer','stored'],['installer','Installer','stored'],['installDate','Install Date','stored'],['installStart','Start Time','stored'],['installEnd','End Time','stored'],['installStatus','Install Status','stored'],['installAddress','Site Address','stored'],['installNotes','Install Notes','stored'],['clerk','Sales Rep / Clerk','stored'],['materialReadiness','Material Readiness','calculated'],['installConflict','Installer Conflict','calculated']
];
const PO_FIELDS=[
 ['poNumber','PO #','stored'],['jobId','Linked Job ID','stored'],['jobNumber','Job #','stored'],['supplier','Supplier','stored'],['requestedDate','Pickup / Receiving Date','stored'],['fulfillment','Pickup / Delivery','stored'],['status','PO Status','stored'],['customerName','Customer','stored'],['salesRep','Sales Rep','stored'],['notes','PO Notes','stored']
];
const EVENT_FIELDS=[
 ['id','Event ID','stored'],['eventType','Event Type','stored'],['calendarGroup','Calendar Group','stored'],['subCalendar','Sub-calendar','stored'],['title','Title','stored'],['eventDate','Date','stored'],['startTime','Start Time','stored'],['endTime','End Time','stored'],['assignedTo','Assigned To','stored'],['customerName','Customer','stored'],['jobId','Linked Job ID','stored'],['address','Address','stored'],['phone','Phone','stored'],['status','Status','stored'],['notes','Notes','stored']
];

function jobDefaults(j){
  return {
    ...j,
    jobNumber:String(j.jobNumber||''), customerName:String(j.customerName||''),
    installer:String(j.installer||''), installDate:String(j.installDate||''),
    installStart:String(j.installStart||''), installEnd:String(j.installEnd||''),
    installStatus:String(j.installStatus||'Not Scheduled'),
    installAddress:String(j.installAddress||j.shipToAddress||j.soldToAddress||''),
    installNotes:String(j.installNotes||''), clerk:String(j.clerk||j.salesRep||'')
  };
}
function poDefaults(p){
  return {
    ...p,
    jobId:String(p.jobId||''), jobNumber:String(p.jobNumber||''),
    supplier:String(p.supplier||''), requestedDate:String(p.requestedDate||''),
    fulfillment:String(p.fulfillment||'Pickup'), status:String(p.status||'Draft'),
    customerName:String(p.customerName||''), salesRep:String(p.salesRep||''), notes:String(p.notes||'')
  };
}
function eventDefaults(m){
  const g=String(m.calendarGroup||m.group||'appointments');
  const sub=String(m.subCalendar||m.sub||(g==='chc'?'CHC':'Appointments'));
  const d=String(m.eventDate||m.date||'');
  const st=String(m.startTime||m.start||'');
  const en=String(m.endTime||m.end||'');
  return {
    ...m,
    id:String(m.id||('cal-'+Date.now()+'-'+Math.random().toString(36).slice(2,7))),
    eventType:String(m.eventType||sub||'Calendar Event'),
    calendarGroup:g, subCalendar:sub, title:String(m.title||'Calendar Event'),
    eventDate:d, startTime:st, endTime:en,
    assignedTo:String(m.assignedTo||''), customerName:String(m.customerName||''),
    jobId:String(m.jobId||''), address:String(m.address||''), phone:String(m.phone||''),
    status:String(m.status||'Scheduled'), notes:String(m.notes||''),
    group:g, sub:sub, date:d, start:st, end:en,
    createdAt:m.createdAt||now(), updatedAt:m.updatedAt||now()
  };
}
function same(a,b){try{return JSON.stringify(a)===JSON.stringify(b)}catch(_){return false}}
function migrate(){
  let changed={jobs:0,pos:0,events:0};
  const ja=read(JOBS,[]); if(Array.isArray(ja)){const nx=ja.map(j=>{const n=jobDefaults(j||{});if(!same(n,j))changed.jobs++;return n});if(changed.jobs)write(JOBS,nx)}
  const pa=read(POS,[]); if(Array.isArray(pa)){const nx=pa.map(p=>{const n=poDefaults(p||{});if(!same(n,p))changed.pos++;return n});if(changed.pos)write(POS,nx)}
  const ma=read(MAN,[]); if(Array.isArray(ma)){const nx=ma.map(m=>{const n=eventDefaults(m||{});if(!same(n,m))changed.events++;return n});if(changed.events)write(MAN,nx)}
  write(META,{version:'0.3.58',alignedAt:now(),changed});
  return changed;
}

function ensureInstallSourceFields(){
  const form=$('#install .formgrid'); if(!form)return;
  if(!$('#installAddress')){
    const d=document.createElement('div');d.className='full';d.innerHTML='<label>Site / Install Address</label><input id="installAddress" placeholder="Installation site address">';form.appendChild(d);
  }
  const clerk=$('#clerk');if(clerk){const lab=clerk.closest('div')?.querySelector('label');if(lab&&lab.textContent.trim()==='Clerk')lab.textContent='Clerk / Sales Rep'}
}
function activeJob(){
  const id=localStorage.getItem(ACTIVE);const a=read(JOBS,[]);return Array.isArray(a)?a.find(x=>String(x.id)===String(id)):null;
}
function fillInstallAddress(){const j=activeJob();if(j&&$('#installAddress'))$('#installAddress').value=j.installAddress||j.shipToAddress||j.soldToAddress||''}
function patchInstallIO(){
  if(window.__runluSchema058InstallPatched)return;window.__runluSchema058InstallPatched=true;
  const oldLoad=typeof window.loadInstall==='function'?window.loadInstall:null;
  const oldSave=typeof window.saveInstall==='function'?window.saveInstall:null;
  window.loadInstall=function(){const r=oldLoad?.apply(this,arguments);setTimeout(()=>{ensureInstallSourceFields();fillInstallAddress()},0);return r};
  window.saveInstall=function(){
    const a=read(JOBS,[]),id=localStorage.getItem(ACTIVE),j=Array.isArray(a)?a.find(x=>String(x.id)===String(id)):null;
    if(j&&$('#installAddress')){j.installAddress=$('#installAddress').value.trim();write(JOBS,a)}
    const r=oldSave?.apply(this,arguments);
    setTimeout(()=>{try{window.RUNLUInstallerCalendarV053?.render?.();window.RUNLUInstallerReplicaV054?.render?.();window.RUNLUCalendarViewsV055?.render?.();window.RUNLUCalendarGroupsV056?.render?.()}catch(_){}auditUI()},40);
    return r;
  };
}

function audit(){
  const j=read(JOBS,[]),p=read(POS,[]),m=read(MAN,[]),c=read(CONTACTS,{});
  const jobs=Array.isArray(j)?j:[],pos=Array.isArray(p)?p:[],events=Array.isArray(m)?m:[];
  const miss=(arr,fields)=>arr.reduce((n,r)=>n+fields.filter(([k,,kind])=>kind==='stored'&&!(k in (r||{}))).length,0);
  const invalidDates=jobs.filter(x=>x.installDate&&!iso(x.installDate)).length+pos.filter(x=>x.requestedDate&&!iso(x.requestedDate)).length+events.filter(x=>x.eventDate&&!iso(x.eventDate)).length;
  const aliasMismatch=events.filter(x=>x.calendarGroup!==x.group||x.subCalendar!==x.sub||x.eventDate!==x.date||x.startTime!==x.start||x.endTime!==x.end).length;
  return {jobs:jobs.length,pos:pos.length,events:events.length,contacts:Object.keys(c||{}).length,missing:miss(jobs,JOB_FIELDS)+miss(pos,PO_FIELDS)+miss(events,EVENT_FIELDS),invalidDates,aliasMismatch};
}
function row(label,source,type){return `<tr><td>${esc(label)}</td><td><code>${esc(source)}</code></td><td><span class="r58${type}">${type==='calculated'?'Calculated':'Stored'}</span></td></tr>`}
function schemaTable(title,fields){return `<details><summary>${esc(title)}</summary><table><thead><tr><th>Calendar field</th><th>Source field</th><th>Rule</th></tr></thead><tbody>${fields.map(([k,l,t])=>row(l,k,t)).join('')}</tbody></table></details>`}
function ensureStyle(){if($('#r58style'))return;const s=document.createElement('style');s.id='r58style';s.textContent=`
#r58schema{margin:10px 0 14px;border:1px solid #dbe4df;border-radius:10px;background:#fff;overflow:hidden}.r58head{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:9px 11px;background:#f4f8f6}.r58head b{color:#173d30;font-size:12px}.r58head small{display:block;color:#6b7972;font-size:9px;margin-top:2px}.r58head button{border:1px solid #cbd8d1;background:#fff;color:#244f3f;border-radius:7px;padding:6px 8px;font-size:9px;font-weight:800;cursor:pointer}.r58stats{display:flex;gap:6px;flex-wrap:wrap;padding:8px 10px;border-top:1px solid #e4ebe7}.r58chip{padding:5px 7px;border-radius:999px;background:#edf4f0;color:#315d49;font-size:8.5px;font-weight:800}.r58chip.bad{background:#fde8e5;color:#8a3327}.r58body{padding:0 10px 9px}.r58body details{border-top:1px solid #edf0ee;padding:7px 0}.r58body summary{cursor:pointer;font-size:9px;font-weight:900;color:#34483e}.r58body table{width:100%;border-collapse:collapse;margin-top:6px;font-size:8px}.r58body th,.r58body td{padding:5px;border-bottom:1px solid #edf0ee;text-align:left}.r58body th{color:#65736c}.r58body code{font-size:7.8px}.r58stored,.r58calculated{display:inline-block;padding:2px 5px;border-radius:999px;font-size:7.5px;font-weight:900}.r58stored{background:#e5f2ea;color:#276240}.r58calculated{background:#edf0f7;color:#4d5d82}.r58rule{padding:7px 10px;background:#fbfcfb;border-top:1px solid #edf0ee;color:#607069;font-size:8.5px;line-height:1.4}
`;document.head.appendChild(s)}
function ensurePanel(){
  const section=$('#install');if(!section)return;
  ensureStyle();ensureInstallSourceFields();
  let p=$('#r58schema');if(!p){p=document.createElement('div');p.id='r58schema';const cal=$('#installerCalendarV053');if(cal)cal.parentNode.insertBefore(p,cal);else section.appendChild(p)}
  p.innerHTML=`<div class="r58head"><div><b>Calendar ↔ Data Model</b><small>Every editable Calendar field must map to a stored source field; calculated signals are never duplicated.</small></div><button id="r58audit">Run Schema Audit</button></div><div id="r58stats" class="r58stats"></div><div class="r58body">${schemaTable('Installation / Job',JOB_FIELDS)}${schemaTable('Pickup / Delivery PO',PO_FIELDS)}${schemaTable('Appointments / Measurements / CHC Events',EVENT_FIELDS)}</div><div class="r58rule"><b>Single-source rule:</b> Material Readiness and Conflict are calculated from PO / installer date-time data. They are intentionally not stored as editable fields. Installer phone numbers remain in the Installer Contacts data store.</div>`;
  $('#r58audit').onclick=()=>{migrate();fillInstallAddress();auditUI();try{window.RUNLUCalendarGroupsV056?.render?.()}catch(_){}};
  auditUI();
}
function auditUI(){const a=audit(),el=$('#r58stats');if(!el)return;const issue=a.missing+a.invalidDates+a.aliasMismatch;el.innerHTML=`<span class="r58chip">${a.jobs} Job records</span><span class="r58chip">${a.pos} PO records</span><span class="r58chip">${a.events} Calendar events</span><span class="r58chip">${a.contacts} Installer contacts</span><span class="r58chip ${issue?'bad':''}">${issue?issue+' schema issue(s)':'Schema aligned'}</span>`}

function syncManualAliases(){
  const a=read(MAN,[]);if(!Array.isArray(a))return;let changed=false;const n=a.map(x=>{const y=eventDefaults(x||{});if(!same(y,x))changed=true;return y});if(changed)write(MAN,n)
}
function bind(){
  if(document.documentElement.dataset.r58bound)return;document.documentElement.dataset.r58bound='1';
  document.addEventListener('change',e=>{if(e.target?.id==='installAddress'){const a=read(JOBS,[]),id=localStorage.getItem(ACTIVE),j=Array.isArray(a)?a.find(x=>String(x.id)===String(id)):null;if(j){j.installAddress=e.target.value.trim();write(JOBS,a)}}},true);
  window.addEventListener('storage',e=>{if([JOBS,POS,MAN,CONTACTS].includes(e.key)){migrate();auditUI()}});
}
function install(){migrate();ensureStyle();ensureInstallSourceFields();patchInstallIO();bind();setTimeout(()=>{ensurePanel();fillInstallAddress()},280);setTimeout(()=>{syncManualAliases();auditUI()},950);let go=window.go;if(typeof go==='function'&&!window.__r58go){window.__r58go=true;window.go=function(id){const r=go.apply(this,arguments);if(id==='install')setTimeout(()=>{ensurePanel();fillInstallAddress();auditUI()},100);return r}}}
window.RUNLUCalendarSchemaV058={install,migrate,audit,render:()=>{ensurePanel();auditUI()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,320),{once:true});else setTimeout(install,320);
})();
