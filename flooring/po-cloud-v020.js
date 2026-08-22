/* RUNLU Deerfoot Flooring OS · Central PO Training V0.2
   Authenticated Supabase-backed training mode. Production PO mode remains disabled.
   When Central Training is enabled, PO numbering and the PO ledger are shared across devices.
   The database RPC allocates numbers transactionally so simultaneous Issue actions cannot receive the same number. */
(function(){
  const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const ENV='training';
  const CLOUD_ENABLED='runlu_flooring_po_cloud_enabled_v1';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const PO_SETTINGS='runlu_deerfoot_po_settings_v1';
  let sb=null;
  let session=null;
  let cloudEditingId=null;
  let originals={};
  let overridesInstalled=false;

  function by(id){return document.getElementById(id)}
  function isUUID(v){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''))}
  function cloudEnabled(){return localStorage.getItem(CLOUD_ENABLED)==='1'}
  function activeCloud(){return !!(cloudEnabled()&&session)}
  function html(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function today(){return new Date().toISOString().slice(0,10)}

  function injectCloudPanel(){
    const section=by('purchasing');
    if(!section||by('poCloudPanel'))return;
    const card=document.createElement('div');
    card.id='poCloudPanel';
    card.className='card';
    card.style.cssText='border:1px solid #bfd7cb;background:#f7fbf9';
    card.innerHTML='<div id="poCloudPanelBody"><b>Central PO Backend · Training</b><div class="muted">Loading…</div></div>';
    const anchor=section.children[1]||null;
    section.insertBefore(card,anchor);
    renderCloudPanel();
  }

  function renderCloudPanel(){
    const box=by('poCloudPanelBody');if(!box)return;
    const enabled=cloudEnabled();
    if(!sb){box.innerHTML='<h3>Central PO Backend · Training</h3><div class="poWarning">Cloud library did not load. Local rehearsal mode remains available.</div>';return}
    if(!session){
      box.innerHTML=`<div class="statusLine"><div><h3>Central PO Backend · Training</h3><div class="muted">Central multi-device numbering is ready, but staff sign-in is required.</div></div><span class="tag">LOCAL DEVICE MODE</span></div>
      <div class="poNotice" style="margin-top:10px"><b>Safety:</b> this connector is locked to the <b>training</b> environment. Production PO numbering cannot be initialized from this page.</div>
      <div class="formgrid" style="margin-top:10px"><div><label>Email</label><input id="poCloudEmail" type="email" autocomplete="username"></div><div><label>Password</label><input id="poCloudPassword" type="password" autocomplete="current-password"></div></div>
      <div class="actions"><button class="action primary" onclick="poCloudSignIn()">Sign In for Central Training</button></div>`;
      return;
    }
    box.innerHTML=`<div class="statusLine"><div><h3>Central PO Backend · Training</h3><div class="muted">${enabled?'Shared transactional numbering is active across signed-in devices.':'Signed in. Central mode is available but not active on this device yet.'}</div></div><span class="tag ${enabled?'':'demoTag'}">${enabled?'CENTRAL TRAINING ACTIVE':'SIGNED IN · LOCAL MODE'}</span></div>
      <div class="poNotice" style="margin-top:10px">${enabled?'<b>Central mode:</b> Starting Number, Next Number and Supplier Order Ledger come from Supabase. Issue Digital PO is allocated inside one database transaction.':'<b>Local mode is still active.</b> Enable Central Training when you are ready to test two-device / multi-salesperson numbering.'}</div>
      <div class="actions" style="margin-top:10px">${enabled?'<button class="action primary" onclick="poCloudSyncNow()">Sync Central PO Now</button><button class="action" onclick="poCloudDisable()">Return to Local Mode</button>':'<button class="action primary" onclick="poCloudEnable()">Enable Central Training</button>'}<button class="action" onclick="poCloudSignOut()">Sign Out</button></div>
      <div class="muted" style="margin-top:8px">Production PO mode remains disabled in this validation build.</div>`;
  }

  async function initSupabase(){
    if(!window.supabase?.createClient)return;
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:'runlu-flooring-auth-v1',autoRefreshToken:true,detectSessionInUrl:true}});
    const res=await sb.auth.getSession();session=res.data?.session||null;
    sb.auth.onAuthStateChange((_event,s)=>{session=s;setTimeout(()=>{renderCloudPanel();installOverrides()},0)});
    renderCloudPanel();installOverrides();
    if(activeCloud())await syncCloudToLocal(false);
  }

  window.poCloudSignIn=async function(){
    if(!sb)return;
    const email=(by('poCloudEmail')?.value||'').trim(),password=by('poCloudPassword')?.value||'';
    if(!email||!password){alert('Enter the staff email and password.');return}
    const {error}=await sb.auth.signInWithPassword({email,password});
    if(error){alert('Sign in failed: '+error.message);return}
    session=(await sb.auth.getSession()).data?.session||null;renderCloudPanel();alert('Signed in. Central Training is still OFF until you enable it.');
  }

  window.poCloudSignOut=async function(){if(sb)await sb.auth.signOut();session=null;localStorage.removeItem(CLOUD_ENABLED);renderCloudPanel();alert('Signed out. PO has returned to local device mode.')}

  window.poCloudEnable=async function(){
    if(!session){alert('Sign in first.');return}
    if(!confirm('Enable CENTRAL TRAINING PO on this device? The local PO rehearsal cache will be replaced by the shared training ledger from Supabase.'))return;
    localStorage.setItem(CLOUD_ENABLED,'1');
    await syncCloudToLocal(true);
  }
  window.poCloudDisable=function(){
    if(!confirm('Return this device to LOCAL PO mode? Central training records will remain in Supabase.'))return;
    localStorage.removeItem(CLOUD_ENABLED);renderCloudPanel();location.reload();
  }
  window.poCloudSyncNow=async function(){if(!activeCloud()){alert('Central Training is not active.');return}await syncCloudToLocal(true)}

  function mapCloudRecord(x){return {id:x.id,jobId:x.job_id||'',jobNumber:x.job_number||'',customerName:x.customer_name||'',mode:x.mode||'digital',poNumber:x.po_number==null?'':String(x.po_number),supplier:x.supplier||'',salesRep:x.sales_rep||'',orderDate:x.order_date||'',expectedDate:x.expected_date||'',status:x.status||'Draft',notes:x.notes||'',items:Array.isArray(x.items)?x.items:[],createdAt:x.created_at||'',issuedAt:x.issued_at||null,isCentral:true}}

  async function syncCloudToLocal(reload){
    if(!activeCloud())return false;
    const [counterRes,ordersRes]=await Promise.all([
      sb.from('flooring_po_counters').select('environment,start_number,next_number,initialized_at').eq('environment',ENV).maybeSingle(),
      sb.from('flooring_supplier_orders').select('*').eq('environment',ENV).order('created_at',{ascending:false})
    ]);
    if(counterRes.error){alert('Central PO sync failed: '+counterRes.error.message);return false}
    if(ordersRes.error){alert('Central PO ledger sync failed: '+ordersRes.error.message);return false}
    const c=counterRes.data||{};
    const settings={initialized:c.start_number!=null&&c.next_number!=null,startNumber:c.start_number??null,nextNumber:c.next_number??null,initializedAt:c.initialized_at||null,central:true,environment:ENV};
    const records=(ordersRes.data||[]).map(mapCloudRecord);
    localStorage.setItem(PO_SETTINGS,JSON.stringify(settings));
    localStorage.setItem(PO_STORE,JSON.stringify(records));
    try{
      if(Array.isArray(jobs)){
        const byJob={};
        records.filter(r=>r.poNumber&&r.status!=='Cancelled').forEach(r=>{(byJob[r.jobId]||(byJob[r.jobId]=[])).push(r.poNumber)});
        jobs.forEach(j=>{j.supplierPO=(byJob[j.id]||[]).sort((a,b)=>Number(a)-Number(b)).join(', ')});
        saveStore();
      }
    }catch(_){ }
    if(reload)location.reload();
    return true;
  }

  function editorPayload(){
    const j=typeof active==='function'?active():null;
    return {p_environment:ENV,p_id:isUUID(cloudEditingId)?cloudEditingId:null,p_job_id:j?.id||'',p_job_number:j?.jobNumber||'',p_customer_name:j?.customerName||'',p_supplier:(by('poSupplier')?.value||'').trim(),p_sales_rep:(by('poSalesRep')?.value||'').trim(),p_order_date:by('poOrderDate')?.value||today(),p_expected_date:by('poExpectedDate')?.value||null,p_notes:(by('poNotes')?.value||'').trim(),p_items:j?.items||[]};
  }

  async function rpc(name,args){const {data,error}=await sb.rpc(name,args);if(error)throw error;return data}

  function installOverrides(){
    if(overridesInstalled)return;
    const needed=['initializePONumbering','newPODraft','editPO','savePODraft','recordManualPO','issueDigitalPO','setPOStatus','resetPOTrainingData'];
    if(!needed.every(k=>typeof window[k]==='function')){setTimeout(installOverrides,100);return}
    overridesInstalled=true;
    needed.forEach(k=>originals[k]=window[k]);

    window.newPODraft=function(){cloudEditingId=null;return originals.newPODraft()};
    window.editPO=function(id){cloudEditingId=id;return originals.editPO(id)};

    window.initializePONumbering=async function(){
      if(!activeCloud())return originals.initializePONumbering();
      const raw=(by('poStartingNumber')?.value||'').trim();if(!/^\d+$/.test(raw)){alert('Enter a valid whole-number PO starting number.');return}
      if(!confirm('Initialize CENTRAL TRAINING PO numbering from the number you entered?'))return;
      try{await rpc('flooring_initialize_po_counter',{p_environment:ENV,p_start_number:Number(raw)});await syncCloudToLocal(true)}catch(e){alert('Central initialization failed: '+e.message)}
    };

    window.savePODraft=async function(){
      if(!activeCloud())return originals.savePODraft();
      try{const p=editorPayload();const row=await rpc('flooring_save_po_draft',p);cloudEditingId=row?.id||cloudEditingId;await syncCloudToLocal(true)}catch(e){alert('Central draft save failed: '+e.message)}
    };

    window.issueDigitalPO=async function(){
      if(!activeCloud())return originals.issueDigitalPO();
      const p=editorPayload();if(!p.p_supplier){alert('Enter the supplier before issuing the PO.');return}
      try{const row=await rpc('flooring_issue_digital_po',p);alert('Central Digital PO issued: #'+row.po_number);await syncCloudToLocal(true)}catch(e){alert('Central PO issue failed: '+e.message)}
    };

    window.recordManualPO=async function(){
      if(!activeCloud())return originals.recordManualPO();
      const p=editorPayload(),raw=(by('poNumber')?.value||'').trim();if(!/^\d+$/.test(raw)){alert('Enter the real paper PO number.');return}if(!p.p_supplier){alert('Enter the supplier.');return}
      delete p.p_id;p.p_po_number=Number(raw);
      try{const row=await rpc('flooring_record_manual_po',p);alert('Central manual PO recorded: #'+row.po_number);await syncCloudToLocal(true)}catch(e){alert('Central manual PO failed: '+e.message)}
    };

    window.setPOStatus=async function(id,status){
      if(!activeCloud())return originals.setPOStatus(id,status);
      if(!isUUID(id)){alert('This record is not a central PO record. Sync Central PO first.');return}
      try{await rpc('flooring_update_po_status',{p_environment:ENV,p_id:id,p_status:status});await syncCloudToLocal(true)}catch(e){alert('Central status update failed: '+e.message)}
    };

    window.resetPOTrainingData=async function(){
      if(!activeCloud())return originals.resetPOTrainingData();
      if(!confirm('Reset ALL CENTRAL TRAINING PO records and return the shared training number sequence to Not initialized?'))return;
      if(!confirm('Final confirmation: erase the CENTRAL TRAINING PO ledger. Production data is not touched.'))return;
      try{await rpc('flooring_reset_training_po',{});localStorage.removeItem(PO_STORE);localStorage.removeItem(PO_SETTINGS);try{if(Array.isArray(jobs)){jobs.forEach(j=>j.supplierPO='');saveStore()}}catch(_){ }alert('Central PO training data reset complete.');await syncCloudToLocal(true)}catch(e){alert('Central training reset failed: '+e.message)}
    };
  }

  const observer=new MutationObserver(()=>{injectCloudPanel();installOverrides()});
  window.addEventListener('load',async()=>{injectCloudPanel();observer.observe(document.body,{childList:true,subtree:true});await initSupabase()});
})();
