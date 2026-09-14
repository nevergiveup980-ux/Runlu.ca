/* RUNLU Flooring OS · People TO Call Sales Review Routing V0.3.95
   Company-simulation workflow:
   PO remains Received. Sales reviews the Job/Order in People TO Call and routes the Job only:
   - Order Complete -> Active
   - Pickup Needed -> Pick Up / Back Order work path
   - Keep in People TO Call -> no route change
   Adds an audit trail and a Pickup review card without changing PO status. */
(function(){
'use strict';
if(window.__runluPeopleToCallReviewV095)return;
window.__runluPeopleToCallReviewV095=true;

const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const CALL_STORE='runlu_people_to_call_v066';
const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){console.error('[People Call V095]',e);return false}};
const now=()=>new Date().toISOString();
const jobs=()=>{const v=read(JOB_STORE,[]);return Array.isArray(v)?v:[]};
const pos=()=>{const v=read(PO_STORE,[]);return Array.isArray(v)?v:[]};
const queue=()=>{const v=read(CALL_STORE,[]);return Array.isArray(v)?v:[]};
const norm=v=>String(v||'').trim().replace(/\s+/g,' ');
const closed=j=>['Closed','Completed','Cancelled'].includes(String(j?.status||''));
function linkedPOs(j,all=pos()){return all.filter(p=>(p&&p.jobId===j.id)||(p&&j.jobNumber&&String(p.jobNumber||'')===String(j.jobNumber||'')))}
function activeQueueFor(j,qs=queue()){return qs.find(q=>q&&q.status!=='Done'&&(q.orderId===j.id||(!q.orderId&&q.orderNumber&&String(q.orderNumber)===String(j.jobNumber||''))))||null}
function jobName(j){return norm(j?.customerName||j?.shipToName||'Unnamed Customer')}
function capHistory(xs,item){const a=Array.isArray(xs)?xs.slice():[];a.push(item);return a.slice(-100)}

function ensureStyle(){
  if(by('r95style'))return;
  const s=document.createElement('style');s.id='r95style';s.textContent=`
.r95reviewBox{grid-column:1/-1;margin-top:3px;padding:10px;border:1px solid #dce5e0;border-left:4px solid #6652a3;border-radius:9px;background:#fbfafc}.r95reviewHead{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.r95reviewHead b{color:#3f3567}.r95reviewHead small{color:#6f6a78}.r95reviewControls{display:grid;grid-template-columns:minmax(180px,1fr) auto auto auto;gap:7px;align-items:center;margin-top:8px}.r95reviewControls input{min-width:0;width:100%;padding:8px 9px;border:1px solid #ccd8d2;border-radius:8px;background:#fff}.r95reviewControls button{white-space:nowrap}.r95activeBtn{background:#245841!important;color:#fff!important;border-color:#245841!important}.r95pickupBtn{background:#7a5b13!important;color:#fff!important;border-color:#7a5b13!important}.r95keepBtn{background:#fff!important;color:#5d526a!important;border-color:#cfc6d8!important}.r95msg{margin-top:7px;font-size:10px;font-weight:800;color:#315f82}.r95pickupCard{border-left:5px solid #b68120}.r95pickupRows{display:grid;gap:8px;margin-top:10px}.r95pickupRow{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(160px,1fr) minmax(170px,1fr) auto;gap:10px;align-items:center;padding:10px;border:1px solid #e0e6e2;border-radius:9px;background:#fff}.r95pickupRow b{color:#173d30}.r95pickupRow small{display:block;margin-top:3px;color:#68756f}.r95pickupNote{font-weight:800;color:#7a5b13}.r95badge{display:inline-flex;padding:4px 7px;border-radius:999px;background:#fff1d8;color:#7a5600;font-size:9px;font-weight:900}@media(max-width:820px){.r95reviewControls{grid-template-columns:1fr 1fr}.r95reviewControls input{grid-column:1/-1}.r95pickupRow{grid-template-columns:1fr}.r95reviewBox{grid-column:1}}
`;
  document.head.appendChild(s);
}

function saveJob(j){
  const xs=jobs(),i=xs.findIndex(x=>x&&x.id===j.id);if(i<0)return false;xs[i]=j;if(!write(JOB_STORE,xs))return false;
  try{const a=typeof window.active==='function'?window.active():null;if(a&&a.id===j.id){Object.assign(a,j);if(typeof window.saveStore==='function')window.saveStore()}}catch(e){console.warn('[People Call V095] active sync',e)}
  return true;
}
function saveQueue(xs){return write(CALL_STORE,xs)}
function noteFor(qid){return String(document.querySelector(`[data-r95-note="${CSS.escape(String(qid))}"]`)?.value||'').trim()}
function message(qid,text,err=false){const e=document.querySelector(`[data-r95-msg="${CSS.escape(String(qid))}"]`);if(e){e.textContent=text||'';e.style.color=err?'#8b3a32':'#315f82'}}

function route(qid,jid,dest){
  const qs=queue(),q=qs.find(x=>x&&x.id===qid),js=jobs(),j=js.find(x=>x&&x.id===jid);if(!q||!j){message(qid,'Order or People TO Call record not found.',true);return}
  const at=now(),note=noteFor(qid),sourcePOs=Array.isArray(q.sourcePOs)?q.sourcePOs.slice():[];
  const decision=dest==='active'?'ORDER_COMPLETE':dest==='pickup'?'PICKUP_NEEDED':'KEEP_IN_PEOPLE_TO_CALL';
  const to=dest==='active'?'Active':dest==='pickup'?'Pick Up':'People TO Call';
  const audit={at,decision,from:'People TO Call',to,note,sourcePOs};
  q.lastReviewDecision=decision;q.lastReviewedAt=at;q.reviewNote=note;q.history=capHistory(q.history,audit);q.updatedAt=at;
  j.peopleToCallHistory=capHistory(j.peopleToCallHistory,audit);j.peopleToCallLastDecision=decision;j.peopleToCallLastReviewedAt=at;
  if(dest==='active'){
    q.status='Done';j.orderDrawerOverride='active';j.orderDrawerUpdatedAt=at;j.salesMaterialRoute='active';j.pickupReviewNote='';j.peopleToCallCompletedAt=at;
  }else if(dest==='pickup'){
    q.status='Done';j.orderDrawerOverride='back';j.orderDrawerUpdatedAt=at;j.salesMaterialRoute='pickup';j.pickupReviewNote=note;j.pickupReviewAt=at;j.peopleToCallCompletedAt=at;
  }else{
    j.salesMaterialRoute='people';
  }
  if(!saveQueue(qs)||!saveJob(j)){message(qid,'Could not save the sales review decision.',true);return}
  try{localStorage.setItem(ACTIVE_STORE,j.id)}catch(_){}
  refreshAll();
}

function patchPeopleRows(){
  const list=by('r66peopleList');if(!list)return;
  list.querySelectorAll('.r66peopleRow').forEach(row=>{
    const old=row.querySelector('[data-r66-activate]');if(!old)return;
    const qid=old.dataset.r66Activate,jid=old.dataset.r66Id;if(!qid||!jid)return;
    old.hidden=true;old.setAttribute('aria-hidden','true');
    if(row.querySelector(`[data-r95-review="${CSS.escape(String(qid))}"]`))return;
    const q=queue().find(x=>x&&x.id===qid)||{};
    const box=document.createElement('div');box.className='r95reviewBox';box.dataset.r95Review=qid;
    box.innerHTML=`<div class="r95reviewHead"><div><b>Sales Review</b><small>PO stays Received · route the Job/Order only.</small></div><span class="r95badge">PEOPLE TO CALL</span></div><div class="r95reviewControls"><input data-r95-note="${esc(qid)}" value="${esc(q.reviewNote||'')}" placeholder="Remaining / pickup note (optional)"><button type="button" class="action r95activeBtn" data-r95-route="active" data-r95-qid="${esc(qid)}" data-r95-jid="${esc(jid)}">Order Complete → Active</button><button type="button" class="action r95pickupBtn" data-r95-route="pickup" data-r95-qid="${esc(qid)}" data-r95-jid="${esc(jid)}">Pickup Needed → Pick Up</button><button type="button" class="action r95keepBtn" data-r95-route="keep" data-r95-qid="${esc(qid)}" data-r95-jid="${esc(jid)}">Keep in People TO Call</button></div><div class="r95msg" data-r95-msg="${esc(qid)}"></div>`;
    row.appendChild(box);
  });
}

function ensurePickupCard(){
  const page=by('supplierPickupPage');if(!page)return null;let card=by('r95pickupCard');if(card)return card;
  card=document.createElement('div');card.id='r95pickupCard';card.className='card r95pickupCard';card.innerHTML='<div class="statusLine"><div><h3 style="margin:0">Sales Review → Pick Up</h3><div class="muted">Orders Sales marked incomplete after a received PO. They remain here until another received PO sends them back to People TO Call, or Sales later completes the order.</div></div><span id="r95pickupCount" class="tag">0 waiting</span></div><div id="r95pickupRows" class="r95pickupRows"></div>';
  page.prepend(card);return card;
}
function renderPickupReview(){
  const card=ensurePickupCard();if(!card)return;
  try{window.RUNLUOrdersDrawerV066?.syncPeopleToCall?.()}catch(_){}
  const qs=queue(),allPO=pos();
  const xs=jobs().filter(j=>j&&j.salesMaterialRoute==='pickup'&&!closed(j)&&!activeQueueFor(j,qs));
  const count=by('r95pickupCount');if(count)count.textContent=xs.length+' waiting';
  const el=by('r95pickupRows');if(!el)return;
  el.innerHTML=xs.length?xs.map(j=>{
    const ps=linkedPOs(j,allPO).filter(p=>p&&p.status!=='Cancelled'),received=ps.filter(p=>['Received','Completed'].includes(String(p.status||''))).length,open=ps.filter(p=>!['Draft','Received','Completed','Cancelled'].includes(String(p.status||''))).length;
    return `<div class="r95pickupRow"><div><b>${esc(jobName(j))}</b><small>Order #${esc(j.jobNumber||'—')} · ${received} received PO${received===1?'':'s'} · ${open} open PO${open===1?'':'s'}</small></div><div><b>Pickup Needed</b><small>${esc(j.pickupReviewAt?new Date(j.pickupReviewAt).toLocaleString():'Sales reviewed')}</small></div><div><span class="r95pickupNote">${esc(j.pickupReviewNote||'Remaining material / pickup required')}</span><small>Next received PO will return this order to People TO Call for review.</small></div><button type="button" class="action" data-r95-open="${esc(j.id)}">Open Order</button></div>`;
  }).join(''):'<div class="r66empty">No Sales-reviewed orders are waiting in Pick Up.</div>';
}

function openOrder(id){try{if(typeof window.selectJob==='function')window.selectJob(id);else{localStorage.setItem(ACTIVE_STORE,id);if(typeof window.go==='function')window.go('jobs')}}catch(e){console.error(e)}}
function refreshAll(){
  try{window.RUNLUOrdersDrawerV066?.refresh?.()}catch(e){console.warn(e)}
  setTimeout(()=>{patchPeopleRows();renderPickupReview()},30);
}
function bind(){
  if(document.documentElement.dataset.r95bound)return;document.documentElement.dataset.r95bound='1';
  document.addEventListener('click',e=>{
    const r=e.target.closest?.('[data-r95-route]');if(r){e.preventDefault();e.stopPropagation();route(r.dataset.r95Qid,r.dataset.r95Jid,r.dataset.r95Route);return}
    const o=e.target.closest?.('[data-r95-open]');if(o){openOrder(o.dataset.r95Open);return}
  },true);
  window.addEventListener('storage',e=>{if([JOB_STORE,PO_STORE,CALL_STORE].includes(e.key))setTimeout(refreshAll,30)});
}
function observe(){
  if(window.__r95observer)return;let timer=0;const ob=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{patchPeopleRows();renderPickupReview()},20)});ob.observe(document.body,{childList:true,subtree:true});window.__r95observer=ob;
}
function install(){ensureStyle();bind();observe();setTimeout(refreshAll,100);setTimeout(refreshAll,700);setTimeout(refreshAll,1500)}
window.RUNLUPeopleToCallReviewV095={version:'0.3.95',install,refresh:refreshAll,route,poStatusImmutable:true,jobRoutes:['People TO Call','Pick Up','Active']};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();