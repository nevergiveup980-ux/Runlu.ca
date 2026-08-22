/* RUNLU Deerfoot Flooring OS · Supplier Pickup + Accounting V0.1
   Central-training bridge: issued POs create shared supplier pickup / receiving tasks.
   Warehouse executes the same task rows; Accounting reads the same receiving facts.
   Production mutations remain disabled while the Central PO backend is in training. */
(function(){
  const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const ENV='training';
  const CLOUD_ENABLED='runlu_flooring_po_cloud_enabled_v1';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const META_STORE='runlu_supplier_task_meta_v1';
  const PENDING='runlu_supplier_task_pending_issue_v1';
  let sb=null,session=null,tasks=[],notifications=[];

  function by(id){return document.getElementById(id)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function centralActive(){return !!(session&&localStorage.getItem(CLOUD_ENABLED)==='1')}
  function activeJob(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function monthKey(d){if(!d)return 'No Date';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?'No Date':x.toLocaleDateString('en-CA',{month:'long',year:'numeric'})}
  function dateLabel(d){if(!d)return 'No requested date';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?d:x.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'})}
  function taskStatusClass(s){return s==='Ready'||s==='Completed'?'done':s==='Delayed'?'cancelled':s==='In Progress'||s==='Picked Up'?'manual':''}

  function injectPage(){
    if(by('pickup'))return;
    const main=document.querySelector('main');if(!main)return;
    const section=document.createElement('section');section.id='pickup';section.className='page';
    section.innerHTML=`
      <div class="card"><div class="statusLine"><div><h2>Supplier Pickup / Receiving</h2><div class="muted">PO-driven inbound schedule shared with Warehouse. Sorted by requested date and month.</div></div><button class="action primary" onclick="refreshSupplierTasks(true)">Refresh</button></div>
        <div class="poNotice" style="margin-top:10px"><b>Shared chain:</b> PO → Pickup / Supplier Delivery → Warehouse execution → Ready / Delayed → Sales notification → Accounting receiving review. Central Training must be active for cross-device sharing.</div>
        <div class="poStats"><div><b id="pickupScheduled">0</b><span>Scheduled</span></div><div><b id="pickupProgress">0</b><span>In Progress</span></div><div><b id="pickupReady">0</b><span>Ready</span></div><div><b id="pickupDelayed">0</b><span>Delayed</span></div></div>
      </div>
      <div class="card"><div class="statusLine"><h3>Sales Updates</h3><span id="pickupUnread" class="muted">0 unread</span></div><div id="pickupNotifications"></div></div>
      <div class="card"><div class="statusLine"><h3>Pickup / Inbound Schedule</h3><select id="pickupFilter" onchange="renderSupplierTasks()"><option value="">All statuses</option><option>Scheduled</option><option>In Progress</option><option>Picked Up</option><option>Ready</option><option>Delayed</option><option>Completed</option><option>Cancelled</option></select></div><div id="pickupSchedule"></div></div>`;
    const warehouse=by('warehouse');main.insertBefore(section,warehouse||null);
  }

  function installNav(){
    try{
      if(!Array.isArray(NAV)||NAV.some(x=>x[0]==='pickup'))return;
      const i=NAV.findIndex(x=>x[0]==='purchasing');NAV.splice(i>=0?i+1:NAV.length,0,['pickup','Pickup']);
      if(typeof renderNav==='function')renderNav();
    }catch(_){ }
  }

  function injectPOFields(){
    const grid=document.querySelector('#purchasing .poEditorGrid');if(!grid||by('poFulfillmentMethod'))return;
    const fulfillment=document.createElement('div');fulfillment.innerHTML='<label>Fulfillment</label><select id="poFulfillmentMethod"><option value="Pickup">Pickup from Supplier</option><option value="Supplier Delivery">Supplier Delivery</option></select>';
    const date=document.createElement('div');date.innerHTML='<label>Pickup / Receiving Date</label><input id="poSupplierRequestedDate" type="date">';
    const type=document.createElement('div');type.innerHTML='<label>Purchase Type</label><select id="poPurchaseType"><option value="Job-specific">Job-specific</option><option value="Stock">Stock Inventory</option></select>';
    grid.appendChild(fulfillment);grid.appendChild(date);grid.appendChild(type);
    ['poFulfillmentMethod','poSupplierRequestedDate','poPurchaseType'].forEach(id=>by(id)?.addEventListener('change',saveDraftMeta));
    loadDraftMeta();
  }

  function draftMetaKey(){return activeJob()?.id||'no-job'}
  function getAllMeta(){try{return JSON.parse(localStorage.getItem(META_STORE)||'{}')}catch(_){return {}}}
  function saveDraftMeta(){const all=getAllMeta();all[draftMetaKey()]={fulfillment:by('poFulfillmentMethod')?.value||'Pickup',requestedDate:by('poSupplierRequestedDate')?.value||'',purchaseType:by('poPurchaseType')?.value||'Job-specific'};localStorage.setItem(META_STORE,JSON.stringify(all))}
  function loadDraftMeta(){const m=getAllMeta()[draftMetaKey()]||{};if(by('poFulfillmentMethod'))by('poFulfillmentMethod').value=m.fulfillment||'Pickup';if(by('poSupplierRequestedDate'))by('poSupplierRequestedDate').value=m.requestedDate||'';if(by('poPurchaseType'))by('poPurchaseType').value=m.purchaseType||'Job-specific'}
  function currentMeta(){return {fulfillment:by('poFulfillmentMethod')?.value||'Pickup',requestedDate:by('poSupplierRequestedDate')?.value||'',purchaseType:by('poPurchaseType')?.value||'Job-specific'}}

  function injectAccounting(){
    const section=by('accounting');if(!section||by('supplierAccountingBridge'))return;
    const card=document.createElement('div');card.className='card';card.id='supplierAccountingBridge';card.innerHTML='<div class="statusLine"><div><h3>Supplier Receiving / Accounting Match</h3><div class="muted">PO ordered facts and Warehouse received facts share this same record.</div></div><button class="action" onclick="refreshSupplierTasks(true)">Refresh</button></div><div id="supplierAccountingQueue" style="margin-top:10px"></div>';
    section.appendChild(card);
  }

  function renderConnectionState(){
    const el=by('pickupSchedule');if(!el)return true;
    if(!session){el.innerHTML='<div class="poEmpty">Sign in under <b>Central PO Backend · Training</b> first. Local PO rehearsal remains available, but Warehouse sharing needs the central backend.</div>';return true}
    if(!centralActive()){el.innerHTML='<div class="poEmpty">You are signed in, but Central Training is OFF on this device. Enable Central Training in PO / Supplier Orders to activate the shared Pickup chain.</div>';return true}
    return false;
  }

  window.renderSupplierTasks=function(){
    if(renderConnectionState())return;
    const f=by('pickupFilter')?.value||'';const xs=tasks.filter(t=>!f||t.status===f).sort((a,b)=>String(a.requested_date||'9999').localeCompare(String(b.requested_date||'9999'))||Number(a.po_number)-Number(b.po_number));
    if(by('pickupScheduled'))by('pickupScheduled').textContent=tasks.filter(x=>x.status==='Scheduled').length;
    if(by('pickupProgress'))by('pickupProgress').textContent=tasks.filter(x=>['In Progress','Picked Up'].includes(x.status)).length;
    if(by('pickupReady'))by('pickupReady').textContent=tasks.filter(x=>x.status==='Ready').length;
    if(by('pickupDelayed'))by('pickupDelayed').textContent=tasks.filter(x=>x.status==='Delayed').length;
    const el=by('pickupSchedule');if(!xs.length){el.innerHTML='<div class="poEmpty">No shared supplier tasks yet. Issue a Central PO with a Pickup / Receiving Date to create one automatically.</div>';return}
    const months={};xs.forEach(t=>{const m=monthKey(t.requested_date);(months[m]||(months[m]=[])).push(t)});
    el.innerHTML=Object.entries(months).map(([m,rows])=>`<div style="margin:16px 0 7px;font-weight:850;color:#173d30">${esc(m)}</div>${rows.map(t=>`<div class="poRow"><div><span class="poNumber">#${esc(t.po_number)} <span class="poBadge ${taskStatusClass(t.status)}">${esc(t.status)}</span></span><small>${esc(dateLabel(t.requested_date))} · ${esc(t.fulfillment_method)} · ${esc(t.purchase_type)}</small></div><div><b>${esc(t.supplier)}</b><small>${esc(t.job_number||'Stock / no Job')} · ${esc(t.customer_name||'')}</small></div><div><b>${esc(t.sales_rep||'Sales rep —')}</b><small>${(t.items||[]).map(x=>esc((x.qty||'')+' '+(x.style||'Item'))).join(' · ')||'No item detail'}</small></div><div><small>${t.delay_reason?'Delay: '+esc(t.delay_reason):(t.warehouse_notes?esc(t.warehouse_notes):'Warehouse pending')}</small></div></div>`).join('')}`).join('');
  };

  function renderNotifications(){
    const el=by('pickupNotifications');if(!el)return;const unread=notifications.filter(n=>!n.read_at);if(by('pickupUnread'))by('pickupUnread').textContent=unread.length+' unread';
    el.innerHTML=notifications.length?notifications.slice(0,20).map(n=>`<div class="attention" style="align-items:flex-start"><div><b>${n.read_at?'':'● '}${esc(n.sales_rep||'Sales')} · PO #${esc(n.po_number||'')}</b><span>${esc(n.message)}</span><small class="muted">${new Date(n.created_at).toLocaleString()}</small></div>${n.read_at?'':'<button class="action" onclick="markSupplierNoticeRead(\''+n.id+'\')">Read</button>'}</div>`).join(''):'<div class="muted">No Warehouse updates yet.</div>';
  }

  function discrepancy(t){
    if(!['Ready','Completed'].includes(t.status))return 'Waiting for Warehouse receiving';
    const ordered=Array.isArray(t.items)?t.items:[],received=Array.isArray(t.received_items)?t.received_items:[];
    if(!ordered.length)return 'No PO item lines';if(!received.length)return 'Receiving detail missing';
    const bad=ordered.some((x,i)=>String(x.qty||'').trim().toLowerCase()!==String(received[i]?.received_qty||'').trim().toLowerCase());
    return bad?'REVIEW · Ordered / received differs':'Matched';
  }

  function renderAccountingQueue(){
    const el=by('supplierAccountingQueue');if(!el)return;
    if(!session||!centralActive()){el.innerHTML='<div class="muted">Central Training must be active to show shared supplier receiving.</div>';return}
    const xs=tasks.slice().sort((a,b)=>String(b.received_at||b.updated_at||'').localeCompare(String(a.received_at||a.updated_at||'')));
    el.innerHTML=xs.length?xs.map(t=>{const d=discrepancy(t),warn=d.startsWith('REVIEW')||d.includes('missing');return `<div class="jobRow" style="display:block;margin-bottom:10px"><div class="statusLine"><div><b>PO #${esc(t.po_number)} · ${esc(t.supplier)}</b><small>${esc(t.purchase_type)} · ${esc(t.fulfillment_method)} · Warehouse: ${esc(t.status)} · <span style="color:${warn?'#a52232':'#176b40'}">${esc(d)}</span></small></div><span class="tag">${esc(t.accounting_status||'Pending')}</span></div><div class="formgrid" style="margin-top:8px"><div><label>Supplier Invoice #</label><input id="acctInv-${t.id}" value="${esc(t.supplier_invoice_number||'')}"></div><div><label>Accounting Status</label><select id="acctStatus-${t.id}">${['Pending','Review','Ready to Pay','Paid'].map(s=>`<option ${s===t.accounting_status?'selected':''}>${s}</option>`).join('')}</select></div><div class="full"><label>Accounting Note</label><input id="acctNote-${t.id}" value="${esc(t.accounting_note||'')}"></div></div><div class="actions"><button class="action primary" onclick="saveSupplierAccounting('${t.id}')">Save Accounting Review</button></div></div>`}).join(''):'<div class="muted">No supplier receiving records yet.</div>';
  }

  async function refresh(){
    if(!sb||!session||!centralActive()){renderSupplierTasks();renderNotifications();renderAccountingQueue();return}
    const [a,b]=await Promise.all([
      sb.from('flooring_supplier_tasks').select('*').eq('environment',ENV).order('requested_date',{ascending:true}),
      sb.from('flooring_notifications').select('*').eq('environment',ENV).order('created_at',{ascending:false}).limit(40)
    ]);
    if(a.error){console.warn('Supplier task sync:',a.error.message);return}if(b.error){console.warn('Supplier notice sync:',b.error.message);return}
    tasks=a.data||[];notifications=b.data||[];renderSupplierTasks();renderNotifications();renderAccountingQueue();await reconcilePendingIssue();
  }
  window.refreshSupplierTasks=async function(show){await refresh();if(show)alert('Supplier Pickup / Receiving refreshed.')}

  window.markSupplierNoticeRead=async function(id){if(!sb)return;const {error}=await sb.from('flooring_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('environment',ENV);if(error){alert(error.message);return}await refresh()}
  window.saveSupplierAccounting=async function(id){if(!sb||!centralActive()){alert('Central Training is not active.');return}const {error}=await sb.rpc('flooring_accounting_update_supplier_task',{p_environment:ENV,p_id:id,p_supplier_invoice_number:by('acctInv-'+id)?.value||'',p_accounting_status:by('acctStatus-'+id)?.value||'Pending',p_accounting_note:by('acctNote-'+id)?.value||''});if(error){alert('Accounting save failed: '+error.message);return}await refresh();alert('Supplier receiving / Accounting review saved.')}

  async function createTaskFromPO(po,meta){
    if(!sb||!session||!centralActive()||!po?.poNumber)return;
    const {error}=await sb.rpc('flooring_create_supplier_task',{p_environment:ENV,p_po_id:/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(po.id||'')?po.id:null,p_po_number:Number(po.poNumber),p_job_id:po.jobId||'',p_job_number:po.jobNumber||'',p_customer_name:po.customerName||'',p_supplier:po.supplier||'',p_sales_rep:po.salesRep||'',p_fulfillment_method:meta.fulfillment||'Pickup',p_requested_date:meta.requestedDate||null,p_purchase_type:meta.purchaseType||'Job-specific',p_items:po.items||[]});
    if(error)throw error;
  }

  async function reconcilePendingIssue(){
    if(!centralActive())return;let p=null;try{p=JSON.parse(sessionStorage.getItem(PENDING)||'null')}catch(_){ }if(!p)return;
    let records=[];try{records=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){ }
    const before=new Set((p.before||[]).map(String));
    let candidate=null;
    if(p.manualNumber)candidate=records.find(r=>String(r.poNumber||'')===String(p.manualNumber));
    if(!candidate)candidate=records.filter(r=>r.poNumber&&!before.has(String(r.poNumber))&&r.status!=='Draft'&&(!p.jobId||r.jobId===p.jobId)&&(!p.supplier||r.supplier===p.supplier)).sort((a,b)=>String(b.issuedAt||b.createdAt||'').localeCompare(String(a.issuedAt||a.createdAt||'')))[0];
    if(!candidate)return;
    try{await createTaskFromPO(candidate,p.meta||{});sessionStorage.removeItem(PENDING);await refresh()}catch(e){console.warn('Automatic supplier task creation pending:',e.message)}
  }

  function capturePending(manual){
    if(!centralActive())return true;const meta=currentMeta();
    if(!meta.requestedDate){alert('Enter the Pickup / Receiving Date before issuing the PO.');return false}
    saveDraftMeta();let records=[];try{records=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){ }
    const j=activeJob();sessionStorage.setItem(PENDING,JSON.stringify({before:records.filter(r=>r.poNumber).map(r=>String(r.poNumber)),manualNumber:manual?(by('poNumber')?.value||'').trim():'',jobId:j?.id||'',supplier:(by('poSupplier')?.value||'').trim(),meta,at:new Date().toISOString()}));return true;
  }

  function fillMetaFromTask(){const num=(by('poNumber')?.value||'').trim();if(!num){loadDraftMeta();return}const t=tasks.find(x=>String(x.po_number)===num);if(!t)return;if(by('poFulfillmentMethod'))by('poFulfillmentMethod').value=t.fulfillment_method||'Pickup';if(by('poSupplierRequestedDate'))by('poSupplierRequestedDate').value=t.requested_date||'';if(by('poPurchaseType'))by('poPurchaseType').value=t.purchase_type||'Job-specific'}

  function wrapCurrent(name,factory){
    const current=window[name];if(typeof current!=='function'||current.__runluSupplierPickupWrapped)return;
    const next=factory(current);next.__runluSupplierPickupWrapped=true;window[name]=next;
  }
  function wrapActions(){
    if(typeof window.poCloudEnable!=='function')return;
    wrapCurrent('issueDigitalPO',old=>function(){if(!capturePending(false))return;return old.apply(this,arguments)});
    wrapCurrent('recordManualPO',old=>function(){if(!capturePending(true))return;return old.apply(this,arguments)});
    wrapCurrent('newPODraft',old=>function(){const r=old.apply(this,arguments);setTimeout(loadDraftMeta,0);return r});
    wrapCurrent('editPO',old=>function(){const r=old.apply(this,arguments);setTimeout(fillMetaFromTask,30);return r});
    wrapCurrent('go',old=>function(id){const r=old.apply(this,arguments);if(id==='pickup'||id==='accounting')setTimeout(refresh,30);if(id==='purchasing')setTimeout(()=>{injectPOFields();loadDraftMeta()},30);return r});
  }

  async function initSupabase(){
    if(!window.supabase?.createClient){setTimeout(initSupabase,150);return}
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:'runlu-flooring-auth-v1',autoRefreshToken:true,detectSessionInUrl:true}});
    session=(await sb.auth.getSession()).data?.session||null;
    sb.auth.onAuthStateChange((_e,s)=>{session=s;setTimeout(refresh,30)});
    await refresh();
  }

  function boot(){
    injectPage();installNav();injectAccounting();
    const observer=new MutationObserver(()=>{injectPOFields();wrapActions()});observer.observe(document.body,{childList:true,subtree:true});
    setInterval(()=>{injectPOFields();wrapActions()},500);
    initSupabase();
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',boot);else boot();
})();