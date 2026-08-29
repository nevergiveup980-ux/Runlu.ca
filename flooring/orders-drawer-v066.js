/* RUNLU Deerfoot Flooring OS · V0.3.66 Orders Drawer Workflow
   Mirrors Deerfoot's real high-frequency paper workflow without duplicating source-of-truth data:
   - Jobs UI becomes Orders; internal jobs route / jobId / jobNumber stay unchanged for compatibility.
   - Orders page becomes a digital drawer: Active Orders (left) / Back Orders (right).
   - Both sides sort numeric-leading customer/company names first, then natural A–Z.
   - Supplier Pickup remains a separate filing system; this layer adds Today / This Month / Recent 3 Months / All folder views.
   - Received supplier-pickup POs feed a separate People TO Call sales work queue.
   V0.3.63 remains the stable rollback baseline. */
(function(){
'use strict';
if(window.__runluOrdersDrawerV066)return;
window.__runluOrdersDrawerV066=true;

const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const CALL_STORE='runlu_people_to_call_v066';
const PREF_STORE='runlu_orders_drawer_pref_v066';
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){console.error(e);return false}};
const today=()=>new Date().toISOString().slice(0,10);
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));

let baseRenderNav=null,baseRenderJobs=null,baseNewJob=null,baseLoadEditor=null,baseSaveJob=null;

function jobs(){const v=read(JOB_STORE,[]);return Array.isArray(v)?v:[]}
function pos(){const v=read(PO_STORE,[]);return Array.isArray(v)?v:[]}
function prefs(){return {...{letter:'ALL',pickupFolder:'today'},...read(PREF_STORE,{})}}
function savePrefs(p){write(PREF_STORE,{...prefs(),...p,updatedAt:new Date().toISOString()})}
function queue(){const v=read(CALL_STORE,[]);return Array.isArray(v)?v:[]}
function saveQueue(v){write(CALL_STORE,v)}
function norm(v){return String(v||'').trim().replace(/\s+/g,' ')}
function customerName(j){return norm(j.customerName||j.shipToName||'Unnamed Customer')}
function leadingBucket(name){const s=norm(name);if(/^\d/.test(s))return '#';const m=s.match(/[A-Za-z]/);return m?m[0].toUpperCase():'#'}
function customerSort(a,b){
  const an=customerName(a),bn=customerName(b),ad=/^\d/.test(an),bd=/^\d/.test(bn);
  if(ad!==bd)return ad?-1:1;
  return collator.compare(an,bn)||collator.compare(String(a.jobNumber||''),String(b.jobNumber||''));
}
function linkedPOs(j,all=pos()){return all.filter(p=>p&&p.jobId===j.id||p&&j.jobNumber&&String(p.jobNumber||'')===String(j.jobNumber))}
function isPickupPO(p){return !/deliver/i.test(String(p?.fulfillment||'Pickup'))}
function isSupplierDelivery(p){return /deliver/i.test(String(p?.fulfillment||''))}
function poOpen(p){return p&&!['Draft','Received','Completed','Cancelled'].includes(String(p.status||''))}
function poReceived(p){return p&&['Received','Completed'].includes(String(p.status||''))}
function closed(j){return ['Closed','Completed','Cancelled'].includes(String(j.status||''))}
function qStatusOpen(q){return q&&q.status!=='Done'}
function activeQueueFor(j,qs=queue()){return qs.find(q=>qStatusOpen(q)&&(q.orderId===j.id||(!q.orderId&&q.orderNumber&&String(q.orderNumber)===String(j.jobNumber||''))))||null}

function syncPeopleToCall(){
  const allJobs=jobs(),allPO=pos(),qs=queue();
  const map=new Map(qs.map(q=>[q.id,q]));
  const groups=new Map();
  allPO.filter(p=>p&&isPickupPO(p)&&poReceived(p)&&p.status!=='Cancelled'&&(p.jobId||p.jobNumber)).forEach(p=>{
    const key=p.jobId||('num:'+String(p.jobNumber||''));
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(p);
  });
  let changed=false;
  groups.forEach((ps,key)=>{
    const j=allJobs.find(x=>x.id===ps[0].jobId)||allJobs.find(x=>String(x.jobNumber||'')===String(ps[0].jobNumber||''));
    if(!j||closed(j))return;
    const receivedPOs=ps.map(x=>String(x.poNumber||'')).filter(Boolean).sort(collator.compare);
    const identity='ptc-'+(j.id||String(j.jobNumber||''));
    let q=map.get(identity);
    const latestDate=ps.map(p=>p.requestedDate||p.updatedAt?.slice?.(0,10)||'').filter(Boolean).sort().at(-1)||today();
    if(!q){
      q={id:identity,orderId:j.id||'',orderNumber:j.jobNumber||'',status:'Not Called',sourcePOs:receivedPOs,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),receivedDate:latestDate};
      qs.push(q);map.set(identity,q);changed=true;
    }else{
      const old=(q.sourcePOs||[]).slice().sort(collator.compare).join('|'),next=receivedPOs.join('|');
      if(old!==next){q.sourcePOs=receivedPOs;q.receivedDate=latestDate;if(q.status==='Done')q.status='Not Called';q.updatedAt=new Date().toISOString();changed=true}
      if(!q.orderId&&j.id){q.orderId=j.id;changed=true}
      if(!q.orderNumber&&j.jobNumber){q.orderNumber=j.jobNumber;changed=true}
    }
  });
  if(changed)saveQueue(qs);
  return qs;
}

function materialPath(j,allPO=pos()){
  const ps=linkedPOs(j,allPO),open=ps.filter(poOpen);
  const pickup=open.filter(isPickupPO),delivery=open.filter(isSupplierDelivery);
  const parts=[];
  if(pickup.length){
    const next=[...pickup].sort((a,b)=>String(a.requestedDate||'9999-12-31').localeCompare(String(b.requestedDate||'9999-12-31')))[0];
    parts.push(`Supplier Pickup · ${norm(next.supplier||'Supplier')} · ${next.requestedDate||'date not set'}`);
  }
  if(delivery.length){
    const next=[...delivery].sort((a,b)=>String(a.requestedDate||a.expectedDate||'9999-12-31').localeCompare(String(b.requestedDate||b.expectedDate||'9999-12-31')))[0];
    parts.push(`Waiting Supplier Delivery / Freight · ${norm(next.supplier||'Supplier')} · ${next.requestedDate||next.expectedDate||'date not set'}`);
  }
  if(!parts.length&&ps.some(p=>p.status==='Partially Received'))parts.push('Partially Received · material still pending');
  if(!parts.length&&!ps.length)parts.push('Material / PO pending');
  return parts;
}
function nextAction(j){
  if(j.pickup)return 'Customer Pickup · '+j.pickup;
  if(j.installDate)return 'Installation · '+j.installDate+(j.installer?' · '+j.installer:'');
  if(String(j.delivery||'').trim())return 'Delivery · '+String(j.delivery).trim();
  return 'Ready · next action';
}
function classify(j,allPO=pos(),qs=queue()){
  if(closed(j))return 'closed';
  if(activeQueueFor(j,qs))return 'people';
  if(j.orderDrawerOverride==='active')return 'active';
  if(j.orderDrawerOverride==='back')return 'back';
  const ps=linkedPOs(j,allPO),real=ps.filter(p=>p.status!=='Cancelled'&&p.status!=='Draft');
  if(real.some(poOpen))return 'back';
  if(real.length&&real.every(poReceived))return 'active';
  if(['Ready','In Progress'].includes(String(j.status||'')))return 'active';
  if(j.pickup||j.installDate||String(j.delivery||'').trim())return 'active';
  return 'back';
}
function searchText(j,allPO=pos()){
  const ps=linkedPOs(j,allPO);
  return [j.customerName,j.shipToName,j.cell,j.phoneHome,j.phoneWork,j.email,j.jobNumber,j.invoiceNumber,j.customerPO,j.supplierPO,...ps.flatMap(p=>[p.poNumber,p.supplier,p.salesRep])].join(' ').toLowerCase();
}
function matchesFilter(j,q,letter,allPO){
  if(q&&!searchText(j,allPO).includes(q.toLowerCase()))return false;
  if(letter&&letter!=='ALL'&&leadingBucket(customerName(j))!==letter)return false;
  return true;
}

function orderCard(j,type,allPO){
  const ps=linkedPOs(j,allPO),poNums=ps.filter(p=>p.poNumber&&p.status!=='Cancelled').map(p=>p.poNumber).join(', ')||'—';
  const route=type==='back'?materialPath(j,allPO).join(' · '):nextAction(j);
  const phone=j.cell||j.phoneHome||j.phoneWork||'';
  return `<div class="r66order" data-r66-order="${esc(j.id)}"><div class="r66orderHead"><div><b>${esc(customerName(j))}</b><span>Order #${esc(j.jobNumber||'—')} · PO ${esc(poNums)}</span></div><span class="r66state ${type}">${type==='active'?'ACTIVE':'BACK ORDER'}</span></div><div class="r66orderMeta"><span>${esc(phone||'No phone')}</span><span>${esc(j.clerk||'Sales / clerk —')}</span><span>${esc(route)}</span></div><div class="r66actions"><button type="button" class="action primary" data-r66-open="${esc(j.id)}">Open Order</button><button type="button" class="action" data-r66-move="${type==='active'?'back':'active'}" data-r66-id="${esc(j.id)}">Move ${type==='active'?'Back':'Active'}</button></div></div>`;
}

function ensureStyle(){
  if(by('r66style'))return;
  const s=document.createElement('style');s.id='r66style';s.textContent=`
#r66drawer{margin-bottom:16px}.r66toolbar{display:grid;grid-template-columns:minmax(240px,1fr) auto;gap:10px;align-items:center}.r66search{width:100%;padding:11px 12px;border:1px solid #cfd9d4;border-radius:10px;font-size:14px}.r66letters{display:flex;gap:4px;flex-wrap:wrap;margin:10px 0}.r66letters button{border:1px solid #d8e1dd;background:#fff;color:#345246;border-radius:7px;padding:5px 7px;font-size:10px;font-weight:800;min-width:27px}.r66letters button.on{background:#173d30;color:#fff;border-color:#173d30}.r66drawers{display:grid;grid-template-columns:1fr 1fr;gap:14px}.r66drawerCol{border:1px solid #dce4e0;border-radius:12px;background:#f8faf9;overflow:hidden}.r66drawerHead{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;background:#173d30;color:#fff}.r66drawerHead.back{background:#66551f}.r66drawerHead b{font-size:14px}.r66drawerHead span{font-size:11px;opacity:.8}.r66drawerBody{padding:8px;max-height:58vh;overflow:auto}.r66order{background:#fff;border:1px solid #dfe6e3;border-radius:10px;padding:10px;margin:7px 0;box-shadow:0 1px 2px rgba(23,61,48,.04)}.r66orderHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.r66orderHead b{display:block;color:#173d30;font-size:14px}.r66orderHead span{display:block;margin-top:3px;color:#68756f;font-size:10.5px}.r66state{white-space:nowrap;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:900;background:#e8f3ed;color:#245c45}.r66state.back{background:#fff4d9;color:#755b17}.r66orderMeta{display:grid;gap:3px;margin-top:8px;color:#586861;font-size:10.5px;line-height:1.35}.r66actions{display:flex;gap:7px;margin-top:9px;flex-wrap:wrap}.r66empty{padding:18px;text-align:center;color:#7a8781;font-size:12px}.r66people{border-left:5px solid #9b5aa5}.r66peopleGrid{display:grid;gap:8px;margin-top:10px}.r66peopleRow{display:grid;grid-template-columns:minmax(190px,1.3fr) minmax(120px,.8fr) minmax(140px,.8fr) auto;gap:9px;align-items:center;border-bottom:1px solid #e5ebe8;padding:9px 0}.r66peopleRow b{color:#173d30}.r66peopleRow small{display:block;margin-top:3px;color:#68756f}.r66peopleRow select{padding:8px;border:1px solid #cfd9d4;border-radius:8px;background:#fff}.r66folders{border-left:5px solid #2b7c70}.r66folderTabs{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.r66folderTabs button{border:1px solid #d5dfda;background:#fff;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:900;color:#315d49}.r66folderTabs button.on{background:#315d49;color:#fff}.r66folderRow{display:grid;grid-template-columns:130px 1fr 1fr 120px;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #e5ebe8;font-size:11px}.r66folderRow b{color:#173d30}.r66toCall{display:inline-flex;border-radius:999px;padding:4px 6px;background:#f1e7f3;color:#744a7b;font-size:9px;font-weight:900}.r66legend{font-size:11px;line-height:1.5;color:#65736c;background:#f7f9f8;border-radius:9px;padding:9px 10px;margin-top:10px}@media(max-width:820px){.r66drawers{grid-template-columns:1fr}.r66drawerBody{max-height:none}.r66peopleRow,.r66folderRow{grid-template-columns:1fr}.r66toolbar{grid-template-columns:1fr}.r66folderRow{gap:4px}.r66orderHead{flex-direction:column}}
`;
  document.head.appendChild(s);
}

function renameLanguage(){
  const nav=document.querySelector('nav button[data-page="jobs"]');if(nav){nav.textContent='Orders';nav.title='Digital order drawer · Active Orders · Back Orders'}
  const module=[...document.querySelectorAll('#command .module')].find(b=>b.getAttribute('onclick')?.includes("go('jobs')"));if(module){const strong=module.querySelector('strong');if(strong)strong.textContent='Orders';const small=module.querySelector('small');if(small)small.textContent='Customer order, material path, Active / Back drawer status and shared record.'}
  const activeTitle=[...document.querySelectorAll('#command .card h3')].find(h=>/Active Job \/ Order/i.test(h.textContent||''));if(activeTitle)activeTitle.textContent='Active Order';
  document.querySelectorAll('#command button').forEach(b=>{if((b.textContent||'').trim()==='Open Job')b.textContent='Open Order'});
  const page=by('jobs');if(page){
    const h2=page.querySelector('.card h2');if(h2)h2.textContent='Orders';
    const nb=[...page.querySelectorAll('button')].find(b=>/\+ New Job/i.test(b.textContent||''));if(nb)nb.textContent='+ New Order';
    const lab=[...page.querySelectorAll('label')].find(l=>(l.textContent||'').trim()==='Job / Order #');if(lab)lab.textContent='Order #';
  }
  const title=by('jobEditorTitle');if(title)title.textContent=(title.textContent||'').replace(/Job \/ Order/g,'Order').replace(/^Job\s+/,'Order ');
}
function patchLanguage(){
  if(typeof window.renderNav==='function'&&!window.renderNav.__r66patched){baseRenderNav=window.renderNav;const f=function(){const r=baseRenderNav.apply(this,arguments);renameLanguage();return r};f.__r66patched=true;window.renderNav=f}
  if(typeof window.newJob==='function'&&!window.newJob.__r66patched){baseNewJob=window.newJob;const f=function(){const r=baseNewJob.apply(this,arguments);setTimeout(()=>{renameLanguage();renderDrawer()},0);return r};f.__r66patched=true;window.newJob=f}
  if(typeof window.loadEditor==='function'&&!window.loadEditor.__r66patched){baseLoadEditor=window.loadEditor;const f=function(){const r=baseLoadEditor.apply(this,arguments);renameLanguage();return r};f.__r66patched=true;window.loadEditor=f}
  if(typeof window.saveJob==='function'&&!window.saveJob.__r66patched){baseSaveJob=window.saveJob;const f=function(){const r=baseSaveJob.apply(this,arguments);setTimeout(()=>{syncPeopleToCall();renderDrawer();renderPeople()},20);return r};f.__r66patched=true;window.saveJob=f}
  if(typeof window.renderJobs==='function'&&!window.renderJobs.__r66patched){baseRenderJobs=window.renderJobs;const f=function(){const r=baseRenderJobs.apply(this,arguments);setTimeout(renderDrawer,0);return r};f.__r66patched=true;window.renderJobs=f}
}

function ensureDrawer(){
  styleGuard();const page=by('jobs');if(!page)return null;
  const old=by('jobList');if(old)old.style.display='none';
  const first=old?.closest('.card')||page.querySelector('.card');if(!first)return null;
  let box=by('r66drawer');if(!box){box=document.createElement('div');box.id='r66drawer';box.className='card';box.innerHTML=`<div class="statusLine"><div><h2 style="margin:0">Order Drawer</h2><div class="muted">Digital version of the daily file drawer · Active left · Back Orders right.</div></div><span class="tag"># first · then A–Z</span></div><div class="r66toolbar"><input id="r66search" class="r66search" placeholder="Find Customer / Company · Phone · Order # · Invoice # · PO #"><button type="button" class="action" id="r66clear">Clear</button></div><div id="r66letters" class="r66letters"></div><div class="r66drawers"><div class="r66drawerCol"><div class="r66drawerHead"><b>ACTIVE ORDERS</b><span id="r66activeCount">0 files</span></div><div id="r66active" class="r66drawerBody"></div></div><div class="r66drawerCol"><div class="r66drawerHead back"><b>BACK ORDERS</b><span id="r66backCount">0 files</span></div><div id="r66back" class="r66drawerBody"></div></div></div><div class="r66legend"><b>Workflow rule:</b> Supplier Pickup remains a separate folder system. A received supplier-pickup PO goes to <b>People TO Call</b>; after Sales handles the customer, the Order can be moved to Active. Supplier Delivery / Freight and still-open Pickup POs remain Back Orders.</div>`;first.insertAdjacentElement('afterend',box);
    by('r66search').addEventListener('input',renderDrawer);by('r66clear').onclick=()=>{by('r66search').value='';savePrefs({letter:'ALL'});renderDrawer()};
  }
  const letters=by('r66letters');if(letters&&!letters.dataset.ready){letters.dataset.ready='1';letters.innerHTML=['ALL','#',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(x=>`<button type="button" data-r66-letter="${x}">${x}</button>`).join('');letters.addEventListener('click',e=>{const b=e.target.closest('[data-r66-letter]');if(!b)return;savePrefs({letter:b.dataset.r66Letter});renderDrawer()})}
  return box;
}
function styleGuard(){ensureStyle()}
function renderDrawer(){
  ensureDrawer();renameLanguage();syncPeopleToCall();const all=jobs(),allPO=pos(),qs=queue(),p=prefs(),q=(by('r66search')?.value||'').trim();
  const active=[],back=[];all.forEach(j=>{const c=classify(j,allPO,qs);if(c==='active'&&matchesFilter(j,q,p.letter,allPO))active.push(j);else if(c==='back'&&matchesFilter(j,q,p.letter,allPO))back.push(j)});active.sort(customerSort);back.sort(customerSort);
  if(by('r66activeCount'))by('r66activeCount').textContent=active.length+' file'+(active.length===1?'':'s');if(by('r66backCount'))by('r66backCount').textContent=back.length+' file'+(back.length===1?'':'s');
  if(by('r66active'))by('r66active').innerHTML=active.length?active.map(j=>orderCard(j,'active',allPO)).join(''):'<div class="r66empty">No Active Orders in this view.</div>';
  if(by('r66back'))by('r66back').innerHTML=back.length?back.map(j=>orderCard(j,'back',allPO)).join(''):'<div class="r66empty">No Back Orders in this view.</div>';
  document.querySelectorAll('[data-r66-letter]').forEach(b=>b.classList.toggle('on',b.dataset.r66Letter===p.letter));
}

function openOrder(id){try{if(typeof window.selectJob==='function'){window.selectJob(id);renameLanguage();return}localStorage.setItem(ACTIVE_STORE,id);if(typeof window.go==='function')window.go('jobs')}catch(e){console.error(e)}}
function moveOrder(id,dest){
  openOrder(id);setTimeout(()=>{try{const j=typeof window.active==='function'?window.active():null;if(!j||j.id!==id)return;j.orderDrawerOverride=dest;j.orderDrawerUpdatedAt=new Date().toISOString();if(typeof window.saveStore==='function')window.saveStore();renderDrawer()}catch(e){console.error(e)}},0)
}

function ensurePeople(){
  const page=by('jobs');if(!page)return null;let box=by('r66people');if(box)return box;box=document.createElement('div');box.id='r66people';box.className='card r66people';box.innerHTML='<div class="statusLine"><div><h3 style="margin:0">People TO Call</h3><div class="muted">Separate Sales work folder created after Supplier Pickup material is received / put away.</div></div><span class="tag" id="r66peopleCount">0 waiting</span></div><div id="r66peopleList" class="r66peopleGrid"></div>';const drawer=by('r66drawer');drawer?drawer.insertAdjacentElement('afterend',box):page.prepend(box);return box
}
function renderPeople(){
  ensurePeople();syncPeopleToCall();const qs=queue(),allJobs=jobs(),activeQs=qs.filter(qStatusOpen).map(q=>({q,j:allJobs.find(j=>j.id===q.orderId)||allJobs.find(j=>String(j.jobNumber||'')===String(q.orderNumber||''))})).filter(x=>x.j&&!closed(x.j)).sort((a,b)=>customerSort(a.j,b.j));
  if(by('r66peopleCount'))by('r66peopleCount').textContent=activeQs.length+' waiting';const el=by('r66peopleList');if(!el)return;el.innerHTML=activeQs.length?activeQs.map(({q,j})=>`<div class="r66peopleRow"><div><b>${esc(customerName(j))}</b><small>Order #${esc(j.jobNumber||'—')} · Pickup PO ${esc((q.sourcePOs||[]).join(', ')||'—')} · received ${esc(q.receivedDate||'—')}</small></div><div><small>Sales / Clerk</small><b>${esc(j.clerk||linkedPOs(j).find(p=>p.salesRep)?.salesRep||'—')}</b></div><select data-r66-call-status="${esc(q.id)}"><option${q.status==='Not Called'?' selected':''}>Not Called</option><option${q.status==='Called'?' selected':''}>Called</option><option${q.status==='Waiting Customer'?' selected':''}>Waiting Customer</option><option${q.status==='Done'?' selected':''}>Done</option></select><div class="r66actions"><button type="button" class="action" data-r66-open="${esc(j.id)}">Open Order</button><button type="button" class="action primary" data-r66-activate="${esc(q.id)}" data-r66-id="${esc(j.id)}">Move Active & Done</button></div></div>`).join(''):'<div class="r66empty">No Supplier Pickup orders are waiting for Sales.</div>';
}
function setCallStatus(id,status){const qs=queue(),q=qs.find(x=>x.id===id);if(!q)return;q.status=status;q.updatedAt=new Date().toISOString();saveQueue(qs);renderPeople();renderDrawer()}
function activateFromCall(qid,jid){const qs=queue(),q=qs.find(x=>x.id===qid);if(q){q.status='Done';q.updatedAt=new Date().toISOString();saveQueue(qs)}openOrder(jid);setTimeout(()=>{const j=typeof window.active==='function'?window.active():null;if(j&&j.id===jid){j.orderDrawerOverride='active';j.peopleToCallCompletedAt=new Date().toISOString();window.saveStore?.()}renderPeople();renderDrawer()},0)}

function folderRange(type,date){
  if(!iso(date))return type==='all';const d=new Date(date+'T12:00:00'),now=new Date();now.setHours(12,0,0,0);
  if(type==='today')return date===today();
  if(type==='month')return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth();
  if(type==='recent'){const start=new Date(now.getFullYear(),now.getMonth()-2,1,12);const end=new Date(now.getFullYear(),now.getMonth()+1,1,12);return d>=start&&d<end}
  return true;
}
function ensurePickupFolders(){
  const page=by('supplierPickupPage');if(!page)return null;let box=by('r66pickupFolders');if(box)return box;box=document.createElement('div');box.id='r66pickupFolders';box.className='card r66folders';box.innerHTML=`<div class="statusLine"><div><h3 style="margin:0">Supplier Pickup Folders</h3><div class="muted">Digital filing view · separate from the Orders drawer.</div></div><span class="tag">PO source records</span></div><div id="r66folderTabs" class="r66folderTabs"><button type="button" data-r66-folder="today">TODAY</button><button type="button" data-r66-folder="month">THIS MONTH</button><button type="button" data-r66-folder="recent">RECENT 3 MONTHS</button><button type="button" data-r66-folder="all">ALL</button></div><div id="r66folderList"></div>`;page.prepend(box);by('r66folderTabs').addEventListener('click',e=>{const b=e.target.closest('[data-r66-folder]');if(!b)return;savePrefs({pickupFolder:b.dataset.r66Folder});renderPickupFolders()});return box
}
function renderPickupFolders(){
  if(!by('supplierPickupPage'))return;ensurePickupFolders();const type=prefs().pickupFolder||'today',allJobs=jobs();let xs=pos().filter(p=>p&&p.poNumber&&p.status!=='Draft'&&p.status!=='Cancelled'&&isPickupPO(p)&&folderRange(type,p.requestedDate));xs.sort((a,b)=>String(a.requestedDate||'9999-12-31').localeCompare(String(b.requestedDate||'9999-12-31'))||collator.compare(String(a.supplier||''),String(b.supplier||''))||collator.compare(String(a.poNumber||''),String(b.poNumber||'')));
  document.querySelectorAll('[data-r66-folder]').forEach(b=>b.classList.toggle('on',b.dataset.r66Folder===type));const el=by('r66folderList');if(!el)return;el.innerHTML=xs.length?xs.map(p=>{const j=allJobs.find(j=>j.id===p.jobId)||allJobs.find(j=>String(j.jobNumber||'')===String(p.jobNumber||''));return `<div class="r66folderRow"><div><b>${esc(p.requestedDate||'Date not set')}</b><small>PO #${esc(p.poNumber)}</small></div><div><b>${esc(p.supplier||'Supplier not set')}</b><small>${esc(p.status||'—')}</small></div><div><b>${esc(j?customerName(j):(p.customerName||'Customer —'))}</b><small>Order #${esc(j?.jobNumber||p.jobNumber||'—')}</small></div><div>${poReceived(p)?'<span class="r66toCall">→ People TO Call</span>':'<span class="tag">Pickup</span>'}</div></div>`}).join(''):'<div class="r66empty">No Supplier Pickup PO records in this folder.</div>';
}

function bind(){
  if(document.documentElement.dataset.r66bound)return;document.documentElement.dataset.r66bound='1';
  document.addEventListener('click',e=>{const open=e.target.closest('[data-r66-open]');if(open){openOrder(open.dataset.r66Open);return}const mv=e.target.closest('[data-r66-move]');if(mv){moveOrder(mv.dataset.r66Id,mv.dataset.r66Move);return}const ac=e.target.closest('[data-r66-activate]');if(ac){activateFromCall(ac.dataset.r66Activate,ac.dataset.r66Id);return}},true);
  document.addEventListener('change',e=>{if(e.target.matches('[data-r66-call-status]'))setCallStatus(e.target.dataset.r66CallStatus,e.target.value)},true);
  window.addEventListener('storage',e=>{if([JOB_STORE,PO_STORE,CALL_STORE].includes(e.key))setTimeout(refresh,30)});
}
function refresh(){patchLanguage();renameLanguage();styleGuard();syncPeopleToCall();ensureDrawer();renderDrawer();ensurePeople();renderPeople();renderPickupFolders()}
function install(){patchLanguage();bind();styleGuard();syncPeopleToCall();setTimeout(refresh,120);setTimeout(refresh,650);setTimeout(refresh,1400)}
window.RUNLUOrdersDrawerV066={install,refresh,syncPeopleToCall,renderDrawer,renderPeople,renderPickupFolders};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();