/* RUNLU Deerfoot Flooring OS · PO / Supplier Orders V0.1
   Transition-safe PO ledger: manual paper PO capture + administrator-set digital numbering.
   V0.1 stores data locally. Before multi-user production rollout, digital number assignment must move to a central transactional backend. */
(function(){
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const PO_SETTINGS='runlu_deerfoot_po_settings_v1';
  let poRecords=[];
  let poSettings={initialized:false,startNumber:null,nextNumber:null,initializedAt:null};
  let editingPOId=null;

  function by(id){return document.getElementById(id)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function attr(v){return esc(v).replace(/"/g,'&quot;')}
  function nowDate(){return new Date().toISOString().slice(0,10)}
  function loadPOData(){try{poRecords=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){poRecords=[]}try{const s=JSON.parse(localStorage.getItem(PO_SETTINGS)||'null');if(s&&typeof s==='object')poSettings={...poSettings,...s}}catch(_){}}
  function savePOData(){localStorage.setItem(PO_STORE,JSON.stringify(poRecords));localStorage.setItem(PO_SETTINGS,JSON.stringify(poSettings))}
  function pos(){return poRecords.filter(x=>x.jobId===activeId)}
  function issuedPOsForJob(jobId){return poRecords.filter(x=>x.jobId===jobId&&x.poNumber&&x.status!=='Cancelled').sort((a,b)=>String(a.poNumber).localeCompare(String(b.poNumber),undefined,{numeric:true}))}
  function syncJobPOs(jobId){const j=jobs.find(x=>x.id===jobId);if(!j)return;const nums=issuedPOsForJob(jobId).map(x=>x.poNumber);j.supplierPO=nums.join(', ');saveStore()}
  function numberTaken(n,ignoreId){return poRecords.some(x=>x.id!==ignoreId&&String(x.poNumber||'')===String(n))}
  function statusRank(s){return ['Draft','Issued','Sent','Confirmed','Partially Received','Received','Completed','Cancelled'].indexOf(s)}

  function injectPOUI(){
    const section=by('purchasing');if(!section||by('poLedger'))return;
    section.innerHTML=`
      <div class="card"><div class="statusLine"><div><h2>PO / Supplier Orders</h2><div class="muted">Each salesperson manages supplier orders for the selected Job. One Job can carry multiple POs.</div></div><button class="action primary" onclick="newPODraft()">+ New PO Draft</button></div>
        <div class="poNotice"><b>Paper → digital transition:</b> existing paper PO numbers can be recorded in Manual mode. When the company chooses its digital cutover, an authorized person enters the real starting PO number once. Digital Drafts do not consume a number; the next number is assigned only when <b>Issue Digital PO</b> is pressed.</div>
        <div class="poStats"><div><b id="poCountJob">0</b><span>POs on Active Job</span></div><div><b id="poCountDraft">0</b><span>Drafts</span></div><div><b id="poCountOpen">0</b><span>Open Supplier Orders</span></div><div><b id="poCountTotal">0</b><span>Total PO Records</span></div></div>
      </div>
      <div class="poSetupGrid">
        <div class="card"><h3>Digital PO Setup</h3><div class="poSetupCard"><div class="poSetupLine"><div><label>PO Starting Number</label><input id="poStartingNumber" inputmode="numeric" placeholder="Enter starting PO number"></div><button id="poInitializeBtn" class="action primary" onclick="initializePONumbering()">Initialize</button></div><div class="poModeHelp">No number is assumed or prefilled. Enter the real company-approved cutover number only when Digital PO is ready to begin.</div><div class="poNext"><small>Next Digital PO Number</small><b id="poNextNumber">Not initialized</b></div><div id="poSetupWarning" class="poWarning"></div></div></div>
        <div class="card"><h3>Active Job / Order</h3><div id="poSummary" class="muted">Select a Job.</div><div id="poItems" class="poItemsBox"></div></div>
      </div>
      <div class="card"><div class="statusLine"><h3>Supplier Order Ledger</h3><span class="muted">Search every PO or filter the selected Job.</span></div><div class="poToolbar"><input id="poSearch" placeholder="Search PO, supplier, customer, sales rep"><select id="poScope"><option value="job">Active Job only</option><option value="all">All PO records</option></select><select id="poStatusFilter"><option value="">All statuses</option><option>Draft</option><option>Issued</option><option>Sent</option><option>Confirmed</option><option>Partially Received</option><option>Received</option><option>Completed</option><option>Cancelled</option></select></div><div id="poLedger"></div></div>
      <div class="card"><h3 id="poEditorTitle">New PO Draft</h3><div class="poEditorGrid">
        <div><label>Mode</label><select id="poMode" onchange="updatePOModeUI()"><option value="digital">Digital / Automatic Number</option><option value="manual">Manual / Existing Paper PO</option></select><div class="poModeHelp" id="poModeHelp"></div></div>
        <div><label>PO Number</label><input id="poNumber" placeholder="Assigned on Issue"></div>
        <div><label>Supplier</label><input id="poSupplier"></div>
        <div><label>Sales Rep</label><input id="poSalesRep"></div>
        <div><label>Order Date</label><input id="poOrderDate" type="date"></div>
        <div><label>Expected Date</label><input id="poExpectedDate" type="date"></div>
        <div><label>Status</label><select id="poStatus"><option>Draft</option><option>Issued</option><option>Sent</option><option>Confirmed</option><option>Partially Received</option><option>Received</option><option>Completed</option><option>Cancelled</option></select></div>
        <div><label>Linked Job / Order</label><input id="poJobLabel" readonly></div>
        <div class="full"><label>Supplier Order Notes</label><textarea id="poNotes"></textarea></div>
      </div><div id="poEditorItems" class="poItemsBox"></div><div class="poActions"><button class="action" onclick="newPODraft()">Clear / New Draft</button><button class="action" onclick="savePODraft()">Save Draft</button><button id="poManualIssueBtn" class="action" onclick="recordManualPO()">Record Manual PO</button><button id="poDigitalIssueBtn" class="action primary" onclick="issueDigitalPO()">Issue Digital PO</button><button class="action blue" onclick="copyCurrentPO()">Copy Supplier Order</button></div><div class="poWarning">Issued PO numbers are never reused. If an issued order is cancelled, its number remains in the ledger with status Cancelled.</div></div>`;
    ['poSearch','poScope','poStatusFilter'].forEach(id=>by(id)?.addEventListener(id==='poSearch'?'input':'change',renderPOLedger));
  }

  function renderSetup(){
    const input=by('poStartingNumber'),btn=by('poInitializeBtn'),next=by('poNextNumber'),warn=by('poSetupWarning');if(!input||!btn||!next)return;
    if(poSettings.initialized){input.value=poSettings.startNumber;input.readOnly=true;input.classList.add('poLocked');btn.disabled=true;btn.textContent='Initialized';next.textContent=String(poSettings.nextNumber);warn.textContent='Digital numbering is initialized on this device. Starting numbers are not editable after initialization.'}
    else{input.readOnly=false;input.classList.remove('poLocked');btn.disabled=false;btn.textContent='Initialize';next.textContent='Not initialized';warn.textContent='Digital PO cannot be issued until an authorized starting number is entered.'}
  }
  window.initializePONumbering=function(){
    if(poSettings.initialized){alert('Digital PO numbering is already initialized.');return}
    const raw=(by('poStartingNumber')?.value||'').trim();if(!/^\d+$/.test(raw)){alert('Enter a valid whole-number PO starting number.');return}
    const n=Number(raw);if(!Number.isSafeInteger(n)||n<1){alert('Enter a valid PO starting number.');return}
    if(numberTaken(n,null)){alert('That number already exists in the PO ledger.');return}
    if(!confirm('Initialize Digital PO numbering from the number you entered? Once initialized, issued numbers will move forward and will not be reused.'))return;
    poSettings={initialized:true,startNumber:n,nextNumber:n,initializedAt:new Date().toISOString()};savePOData();renderSetup();updatePOModeUI();
  }

  function activeJobItems(){const j=active();return j?.items||[]}
  function editorItems(){const el=by('poEditorItems');if(!el)return;const xs=activeJobItems();el.innerHTML=xs.length?xs.map(x=>`<div class="poItem"><div><b>${esc(x.style||'Item')}</b><span>${esc(x.colour||'')}</span></div><div>${esc(x.qty||'')}</div><div>${esc(x.supplier||'')}</div><div>${Number(x.total||0)?money(x.total):''}</div></div>`).join(''):'<div class="poEmpty">No item lines on the selected Job yet.</div>'}
  function newDraftRecord(){const j=active();return {id:'po-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),jobId:j?.id||'',jobNumber:j?.jobNumber||'',customerName:j?.customerName||'',mode:'digital',poNumber:'',supplier:'',salesRep:j?.clerk||'',orderDate:nowDate(),expectedDate:'',status:'Draft',notes:'',items:JSON.parse(JSON.stringify(j?.items||[])),createdAt:new Date().toISOString(),issuedAt:null}}
  window.newPODraft=function(){editingPOId=null;const r=newDraftRecord();fillEditor(r);by('poSupplier')?.focus()}
  function fillEditor(r){
    if(!r)return;by('poEditorTitle').textContent=(r.poNumber?'PO #'+r.poNumber:'New PO Draft')+(r.status==='Cancelled'?' · CANCELLED':'');by('poMode').value=r.mode||'digital';by('poNumber').value=r.poNumber||'';by('poSupplier').value=r.supplier||'';by('poSalesRep').value=r.salesRep||'';by('poOrderDate').value=r.orderDate||'';by('poExpectedDate').value=r.expectedDate||'';by('poStatus').value=r.status||'Draft';by('poJobLabel').value=[r.jobNumber||'No Job #',r.customerName||''].filter(Boolean).join(' · ');by('poNotes').value=r.notes||'';editorItems();updatePOModeUI();
  }
  window.updatePOModeUI=function(){
    const mode=by('poMode')?.value||'digital',num=by('poNumber'),manual=by('poManualIssueBtn'),digital=by('poDigitalIssueBtn'),help=by('poModeHelp');const rec=poRecords.find(x=>x.id===editingPOId);const issued=!!rec?.poNumber;
    if(mode==='digital'){num.readOnly=true;num.placeholder=issued?'':'Assigned on Issue';if(help)help.textContent=poSettings.initialized?'Number is assigned only when Issue Digital PO is pressed.':'Digital numbering is not initialized yet.';if(manual)manual.style.display='none';if(digital)digital.style.display='inline-flex';if(digital)digital.disabled=!poSettings.initialized||issued}
    else{num.readOnly=issued;if(help)help.textContent='Use this during the paper-PO transition to record the real preprinted PO number.';if(manual)manual.style.display='inline-flex';if(digital)digital.style.display='none';if(manual)manual.disabled=issued}
    if(rec&&issued){by('poMode').disabled=true;by('poStatus').disabled=false}else if(by('poMode'))by('poMode').disabled=false;
  }
  function editorRecord(){const j=active();const existing=poRecords.find(x=>x.id===editingPOId);return {...(existing||newDraftRecord()),jobId:j?.id||existing?.jobId||'',jobNumber:j?.jobNumber||existing?.jobNumber||'',customerName:j?.customerName||existing?.customerName||'',mode:by('poMode')?.value||'digital',poNumber:(by('poNumber')?.value||'').trim(),supplier:(by('poSupplier')?.value||'').trim(),salesRep:(by('poSalesRep')?.value||'').trim(),orderDate:by('poOrderDate')?.value||nowDate(),expectedDate:by('poExpectedDate')?.value||'',status:by('poStatus')?.value||'Draft',notes:(by('poNotes')?.value||'').trim(),items:JSON.parse(JSON.stringify(j?.items||existing?.items||[]))}}
  function upsert(r){const i=poRecords.findIndex(x=>x.id===r.id);if(i>=0)poRecords[i]=r;else poRecords.unshift(r);editingPOId=r.id;savePOData();if(r.jobId)syncJobPOs(r.jobId);renderPO();fillEditor(r);return r}
  window.savePODraft=function(){const r=editorRecord();if(r.poNumber&&numberTaken(r.poNumber,r.id)){alert('That PO number is already in use.');return}if(r.poNumber&&r.status==='Draft')r.status='Issued';upsert(r);alert('PO draft saved.')}
  window.recordManualPO=function(){let r=editorRecord();if(r.mode!=='manual'){alert('Choose Manual / Existing Paper PO mode.');return}if(!r.poNumber){alert('Enter the real paper PO number.');return}if(numberTaken(r.poNumber,r.id)){alert('That PO number is already in use.');return}if(!r.supplier){alert('Enter the supplier.');return}r.status=r.status==='Draft'?'Issued':r.status;r.issuedAt=r.issuedAt||new Date().toISOString();r=upsert(r);alert('Manual PO recorded.')}
  window.issueDigitalPO=function(){
    let r=editorRecord();if(r.mode!=='digital'){alert('Choose Digital / Automatic Number mode.');return}if(r.poNumber){alert('This PO already has a number.');return}if(!poSettings.initialized){alert('Digital PO numbering has not been initialized.');return}if(!r.supplier){alert('Enter the supplier before issuing the PO.');return}
    let n=Number(poSettings.nextNumber);while(numberTaken(n,r.id))n++;r.poNumber=String(n);r.status='Issued';r.issuedAt=new Date().toISOString();poSettings.nextNumber=n+1;upsert(r);savePOData();renderSetup();alert('Digital PO issued: #'+r.poNumber)
  }

  function filteredPOs(){const q=(by('poSearch')?.value||'').trim().toLowerCase(),scope=by('poScope')?.value||'job',st=by('poStatusFilter')?.value||'';return poRecords.filter(x=>(scope==='all'||x.jobId===activeId)&&(!st||x.status===st)&&(!q||[x.poNumber,x.supplier,x.customerName,x.salesRep,x.jobNumber].some(v=>String(v||'').toLowerCase().includes(q)))).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))}
  function renderPOLedger(){const el=by('poLedger');if(!el)return;const xs=filteredPOs();el.innerHTML=xs.length?xs.map(x=>`<div class="poRow"><div><span class="poNumber">${x.poNumber?'#'+esc(x.poNumber):'Draft'} <span class="poBadge ${x.mode==='manual'?'manual':''} ${x.status==='Cancelled'?'cancelled':''}">${x.mode==='manual'?'MANUAL':'DIGITAL'}</span></span><small>${esc(x.jobNumber||'No Job #')} · ${esc(x.customerName||'')}</small></div><div><b>${esc(x.supplier||'Supplier not set')}</b><small>${esc(x.salesRep||'Sales rep not set')}</small></div><div><b>${esc(x.status)}</b><small>${esc(x.orderDate||'')}</small></div><div><small>${x.expectedDate?'Expected '+esc(x.expectedDate):'No expected date'}</small></div><div class="actions"><button class="action" onclick="editPO('${attr(x.id)}')">Open</button><button class="action" onclick="setPOStatus('${attr(x.id)}','${x.status==='Cancelled'?'Issued':'Cancelled'}')">${x.status==='Cancelled'?'Reopen':'Cancel'}</button></div></div>`).join(''):'<div class="poEmpty">No PO records here yet.</div>'}
  window.editPO=function(id){const r=poRecords.find(x=>x.id===id);if(!r)return;editingPOId=id;const j=jobs.find(x=>x.id===r.jobId);if(j&&j.id!==activeId){activeId=j.id;saveStore();renderAll()}fillEditor(r);by('poEditorTitle')?.scrollIntoView({behavior:'smooth',block:'center'})}
  window.setPOStatus=function(id,status){const r=poRecords.find(x=>x.id===id);if(!r)return;if(status==='Cancelled'&&!confirm('Cancel this PO? Its number will remain permanently in the ledger and will not be reused.'))return;r.status=status;savePOData();syncJobPOs(r.jobId);renderPO();if(editingPOId===id)fillEditor(r)}

  function renderActiveJob(){const j=active();if(by('poSummary'))by('poSummary').innerHTML=j?`<b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${esc(j.jobNumber||'No #')} · ${esc(j.customerName||'Unnamed customer')}</b><br>Sales Rep: ${esc(j.clerk||'—')} · Linked POs: ${issuedPOsForJob(j.id).map(x=>'#'+esc(x.poNumber)).join(', ')||'None yet'}`:'Select a Job.';if(by('poItems'))by('poItems').innerHTML=j?.items?.length?j.items.map(x=>`<div class="poItem"><div><b>${esc(x.style||'Item')}</b><span>${esc(x.colour||'')}</span></div><div>${esc(x.qty||'')}</div><div>${esc(x.supplier||'')}</div><div>${Number(x.total||0)?money(x.total):''}</div></div>`).join(''):'<div class="poEmpty">No Job items yet.</div>'}
  function renderStats(){const job=pos(),open=poRecords.filter(x=>!['Draft','Completed','Cancelled'].includes(x.status)).length;if(by('poCountJob'))by('poCountJob').textContent=job.length;if(by('poCountDraft'))by('poCountDraft').textContent=poRecords.filter(x=>x.status==='Draft').length;if(by('poCountOpen'))by('poCountOpen').textContent=open;if(by('poCountTotal'))by('poCountTotal').textContent=poRecords.length}
  function renderPO(){injectPOUI();renderSetup();renderStats();renderActiveJob();renderPOLedger();if(!editingPOId)newPODraft()}
  window.renderPO=renderPO;

  window.copyCurrentPO=async function(){const r=poRecords.find(x=>x.id===editingPOId)||editorRecord();const lines=['DEERFOOT CARPET & FLOORING · SUPPLIER ORDER',r.poNumber?'PO #'+r.poNumber:'PO Draft','Job / Order: '+(r.jobNumber||''),'Customer: '+(r.customerName||''),'Sales Rep: '+(r.salesRep||''),'Supplier: '+(r.supplier||''),'Order Date: '+(r.orderDate||''),'Expected: '+(r.expectedDate||''),'Items:',...(r.items||[]).map((x,i)=>`${i+1}. ${x.qty||''} | ${x.style||''} | ${x.colour||''} | ${x.supplier||''}`),'Notes: '+(r.notes||'')];try{await navigator.clipboard.writeText(lines.join('\n'));alert('Supplier order copied.')}catch(_){alert('Copy is unavailable in this browser.')}}

  // Rename the existing navigation item without changing the underlying page id used by app.js.
  try{const n=NAV.find(x=>x[0]==='purchasing');if(n)n[1]='PO / Supplier Orders'}catch(_){ }

  // Upgrade warehouse handoff to include every issued PO linked to the Job.
  try{
    handoffText=function(j){if(!j)return 'No active Job.';const ps=issuedPOsForJob(j.id);return ['RUNLU DEERFOOT FLOORING → WAREHOUSE HANDOFF','Job / Order: '+(j.jobNumber||''),'Customer: '+(j.customerName||''),'PO(s): '+(ps.length?ps.map(x=>'#'+x.poNumber+' · '+(x.supplier||'Supplier')).join(' | '):'None issued'),'Required: '+(j.dateRequired||''),'Pickup: '+(j.pickup||''),'Delivery: '+(j.delivery||''),'Items:',...(j.items||[]).map((x,i)=>`${i+1}. ${x.qty||''} | ${x.style||''} | ${x.colour||''} | ${x.supplier||''}`),'Notes: '+(j.notes||'')].join('\n')}
  }catch(_){ }

  const priorGo=go;go=function(id){priorGo(id);if(id==='purchasing')renderPO()};
  const priorRenderNav=renderNav;renderNav=function(){priorRenderNav();const btn=document.querySelector('nav button[data-page="purchasing"]');if(btn)btn.textContent='PO / Supplier Orders'};

  window.addEventListener('load',()=>{loadPOData();injectPOUI();renderPO();renderNav();const module=Array.from(document.querySelectorAll('.module')).find(x=>x.getAttribute('onclick')?.includes("go('purchasing')"));if(module){const strong=module.querySelector('strong'),small=module.querySelector('small');if(strong)strong.textContent='PO / Supplier Orders';if(small)small.textContent='Sales-managed supplier orders, multi-PO Job linking and digital numbering.'}const hero=document.querySelector('#command .hero p');if(hero)hero.textContent='Showroom → Estimate / Assessment → Job / Order → PO / Supplier Orders → Warehouse → Installation → Deerfoot Invoice → Payment.';const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.1 PO / Supplier Orders';const linked=by('supplierPO');if(linked){linked.readOnly=true;linked.placeholder='Managed in PO / Supplier Orders';const label=linked.closest('div')?.querySelector('label');if(label)label.textContent='Linked PO #s (managed in PO module)'}});
})();
