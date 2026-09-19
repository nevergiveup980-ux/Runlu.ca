/* RUNLU Deerfoot Flooring OS · PO Safe V0.4.0 Research
   Built directly on stable V0.3.37.
   Adds structured Source Type + Source / Reference per PO item.
   PO preview/print uses the existing Deerfoot legacy invoice language.
   No MutationObserver, no polling, no global build-label writer.
*/
(function(){
  'use strict';
  if(window.__runluPOSafeV040)return;
  window.__runluPOSafeV040=true;
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const PO_SETTINGS='runlu_deerfoot_po_settings_v1';
  const META_STORE='runlu_supplier_task_meta_v1';
  const PREVIEW_KEY='runlu_flooring_po_deerfoot_invoice_v040';
  const CORRUPT_BACKUP='runlu_deerfoot_supplier_orders_corrupt_backup_v0407';
  const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
  const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
  const AUTH_STORAGE='runlu-flooring-auth-v1';
  const ENV='training';
  let records=[],settings={initialized:false,startNumber:null,nextNumber:null,initializedAt:null},editingId=null,poItemsDraft=[],poStoreCorrupt=false,poStoreAlerted=false;
  let sb=null,cloudSession=null,cloudCounter=null,cloudBusy=false,cloudError='';
  const by=id=>document.getElementById(id);
  const e=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const a=v=>e(v).replace(/"/g,'&quot;');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const money=n=>Number(n||0).toLocaleString('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:2,maximumFractionDigits:2});
  const uuid=()=>{try{return crypto.randomUUID()}catch(_){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,ch=>{const n=Math.random()*16|0,v=ch==='x'?n:(n&3|8);return v.toString(16)})}};
  function loadSupabaseLibrary(){
    return new Promise((resolve,reject)=>{
      if(window.supabase?.createClient)return resolve();
      const old=document.querySelector('script[data-runlu-po-cloud-v0408]');
      if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',()=>reject(new Error('Supabase client library failed to load')),{once:true});return}
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.runluPoCloudV0408='1';s.onload=resolve;s.onerror=()=>reject(new Error('Supabase client library failed to load'));document.head.appendChild(s)
    })
  }
  async function cloudClient(){
    if(sb)return sb;
    await loadSupabaseLibrary();
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});
    sb.auth.onAuthStateChange((_e,s)=>{cloudSession=s;setTimeout(()=>refreshCloudAuthority(false),0)});
    return sb
  }
  function cloudReady(){return !!(cloudSession&&cloudCounter?.start_number&&cloudCounter?.next_number)}
  function cloudPOArgs(r){
    return {p_environment:ENV,p_id:r.cloudId||null,p_job_id:r.jobId||'',p_job_number:r.jobNumber||'',p_customer_name:r.customerName||'',p_supplier:r.supplier||'',p_sales_rep:r.salesRep||'',p_order_date:r.orderDate||null,p_expected_date:r.expectedDate||null,p_notes:r.notes||'',p_items:r.items||[]}
  }
  function adoptCloudRow(local,row){
    if(!row)return local;
    return {...local,cloudId:row.id||local.cloudId||'',cloudEnvironment:row.environment||ENV,poNumber:row.po_number==null?(local.poNumber||''):String(row.po_number),mode:row.mode||local.mode||'digital',status:row.status||local.status||'Draft',issuedAt:row.issued_at||local.issuedAt||null,cloudUpdatedAt:row.updated_at||new Date().toISOString(),issueKey:row.issue_key||local.issueKey||null}
  }
  async function refreshCloudAuthority(manual=false){
    if(cloudBusy)return;cloudBusy=true;cloudError='';renderSetup();modeUI();
    try{
      const c=await cloudClient(),s=(await c.auth.getSession()).data?.session||null;cloudSession=s;
      if(!s){cloudCounter=null;cloudError='SIGN IN REQUIRED';return false}
      const q=await c.from('flooring_po_counters').select('*').eq('environment',ENV).maybeSingle();
      if(q.error)throw q.error;cloudCounter=q.data||null;return true
    }catch(e){cloudCounter=null;cloudError=String(e?.message||e);if(manual)alert('Cloud PO Authority refresh failed: '+cloudError);return false}
    finally{cloudBusy=false;renderSetup();modeUI()}
  }
  async function connectCloudAuthority(){
    const email=(by('poCloudEmail')?.value||'').trim(),password=by('poCloudPassword')?.value||'';
    if(!email||!password)return alert('Enter the staff email and password used for RUNLU central services.');
    cloudBusy=true;cloudError='';renderSetup();modeUI();
    try{const c=await cloudClient(),r=await c.auth.signInWithPassword({email,password});if(r.error)throw r.error;cloudSession=r.data?.session||null;await refreshCloudAuthority(true)}
    catch(e){cloudError=String(e?.message||e);alert('Cloud PO Authority connection failed: '+cloudError)}
    finally{cloudBusy=false;renderSetup();modeUI()}
  }
  function persistIssueKey(r){
    if(!r.issueKey)r.issueKey=uuid();
    const i=records.findIndex(x=>x.id===r.id);if(i>=0)records[i]={...records[i],...r};else records.unshift(r);
    editingId=r.id;
    if(!save())throw new Error('Local draft could not preserve the issue key');
    return r.issueKey
  }
  async function recoverManualCloudRow(r){
    if(!sb||!r.poNumber)return null;
    const q=await sb.from('flooring_supplier_orders').select('*').eq('environment',ENV).eq('po_number',Number(r.poNumber)).maybeSingle();
    if(q.error)throw q.error;
    const row=q.data;
    if(!row)return null;
    if(String(row.job_id||'')!==String(r.jobId||'')||String(row.supplier||'')!==String(r.supplier||''))throw new Error('That PO number already belongs to a different cloud record');
    return row
  }
  function warnCorruptPOStore(){
    if(!poStoreCorrupt||poStoreAlerted)return;poStoreAlerted=true;
    setTimeout(()=>alert('PO data could not be read safely. RUNLU preserved the original browser data and blocked PO writes instead of replacing it. Do not clear browser storage; recover / export the preserved data first.'),100)
  }
  function save(){
    if(poStoreCorrupt){warnCorruptPOStore();return false}
    try{
      const payload=JSON.stringify(records);localStorage.setItem(PO_STORE,payload);
      if(localStorage.getItem(PO_STORE)!==payload)throw new Error('PO store verification failed');
      localStorage.setItem(PO_SETTINGS,JSON.stringify(settings));return true
    }catch(e){console.error('RUNLU PO save blocked / failed',e);alert('PO save failed. Existing browser data was not intentionally cleared. Stop editing and back up before retrying.');return false}
  }
  function load(){
    const raw=localStorage.getItem(PO_STORE);
    if(raw==null)records=[];
    else try{const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error('PO store is not an array');records=parsed}
    catch(e){records=[];poStoreCorrupt=true;try{if(!localStorage.getItem(CORRUPT_BACKUP))localStorage.setItem(CORRUPT_BACKUP,raw)}catch(_){}console.error('RUNLU PO store is unreadable; original data preserved and writes blocked.',e)}
    try{const s=JSON.parse(localStorage.getItem(PO_SETTINGS)||'null');if(s&&typeof s==='object')settings={...settings,...s}}catch(_){}
    warnCorruptPOStore()
  }
  function legacyMeta(){try{return JSON.parse(localStorage.getItem(META_STORE)||'{}')}catch(_){return {}}}
  function hasPickupMeta(r){return !!(r&&('fulfillment' in r||'requestedDate' in r||'purchaseType' in r))}
  function migrateLegacyPickupMeta(){const meta=legacyMeta(),unlinked=records.filter(r=>r.poNumber&&r.status!=='Draft'&&!r.jobId&&!hasPickupMeta(r));let changed=false;records.forEach(r=>{if(hasPickupMeta(r))return;let m=meta[r.id]||(r.jobId?meta[r.jobId]:null);if(!m&&!r.jobId&&unlinked.length===1)m=meta['no-job'];if(!m)return;r.fulfillment=m.fulfillment||'Pickup';r.requestedDate=m.requestedDate||'';r.purchaseType=m.purchaseType||'Job-specific';changed=true});if(changed)save();}
  function activeJob(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function taken(n,ignore){return records.some(x=>x.id!==ignore&&String(x.poNumber||'')===String(n))}
  function syncJob(jobId){try{if(typeof jobs==='undefined'||typeof saveStore!=='function')return;const j=jobs.find(x=>x.id===jobId);if(!j)return;const nums=records.filter(x=>x.jobId===jobId&&x.poNumber&&x.status!=='Cancelled').map(x=>x.poNumber).sort((x,y)=>String(x).localeCompare(String(y),undefined,{numeric:true}));j.supplierPO=nums.join(', ');saveStore();if(typeof renderAll==='function')renderAll()}catch(err){console.error('RUNLU PO sync failed',err)}}
  function unitOptions(selected){return ['carton','box','roll','sy','sf','ea','pail','bucket','tube','gal'].map(x=>`<option value="${x}"${String(selected||'').toLowerCase()===x?' selected':''}>${x.toUpperCase()}</option>`).join('')}
  function sourceTypeOptions(selected){return ['Supplier','Stock','Installer','Other'].map(x=>`<option value="${x}"${String(selected||'Supplier')===x?' selected':''}>${x}</option>`).join('')}
  function inject(){const s=by('purchasing');if(!s||by('poSafeLedger'))return;s.innerHTML=`<div class="card"><div class="statusLine"><div><h2>PO / Supplier Orders</h2><div class="muted">V0.3.40 research · same central PO records, richer line source/reference and Deerfoot Invoice output.</div></div><button class="action primary" id="poNewBtn">+ New PO Draft</button></div><div class="poSafeNotice"><b>Deerfoot practice:</b> the printed <b>SUPPLIER / STOCK</b> column is a flexible source/reference field. Internally we store Source Type + Source / Reference so Supplier, stock roll number, installer or other references remain searchable.</div><div class="poSafeStats"><div><b id="poJobCount">0</b><span>Active Job</span></div><div><b id="poDraftCount">0</b><span>Drafts</span></div><div><b id="poOpenCount">0</b><span>Open</span></div><div><b id="poTotalCount">0</b><span>Total</span></div></div></div><div class="grid2"><div class="card"><h3>Digital PO Setup · Cloud Authority</h3><div id="poCloudState" class="notice">Checking central PO authority…</div><div id="poCloudLogin" class="formgrid" style="margin-top:8px"><input id="poCloudEmail" type="email" autocomplete="username" placeholder="Staff email"><input id="poCloudPassword" type="password" autocomplete="current-password" placeholder="Password"></div><div class="actions"><button class="action" id="poCloudConnectBtn">Connect Cloud PO</button><button class="action" id="poCloudRefreshBtn">Refresh Authority</button></div><label>Starting Number</label><input id="poStart" inputmode="numeric" placeholder="Enter approved starting number"><div class="actions"><button class="action primary" id="poInitBtn">Initialize Central Counter</button></div><div class="notice" id="poSetupMsg"></div></div><div class="card"><h3>Active Job / Order</h3><div id="poSafeSummary" class="muted"></div><div id="poSafeItems"></div></div></div><div class="card"><div class="statusLine"><h3>Supplier Order Ledger</h3><span class="muted">Search PO, supplier, customer, sales rep or Job.</span></div><div class="formgrid"><input id="poSearchSafe" placeholder="Search"><select id="poScopeSafe"><option value="job">Active Job only</option><option value="all">All PO records</option></select></div><div id="poSafeLedger"></div></div><div class="card"><h3 id="poSafeEditorTitle">New PO Draft</h3><div class="formgrid"><div><label>Mode</label><select id="poModeSafe"><option value="digital">Digital / Automatic</option><option value="manual">Manual / Existing Paper PO</option></select></div><div><label>PO Number</label><input id="poNumberSafe" placeholder="Assigned on issue"></div><div><label>Supplier</label><input id="poSupplierSafe"></div><div><label>Sales Rep</label><input id="poSalesRepSafe"></div><div><label>Order Date</label><input id="poOrderDateSafe" type="date"></div><div><label>Expected Date</label><input id="poExpectedDateSafe" type="date"></div><div><label>Status</label><select id="poStatusSafe"><option>Draft</option><option>Issued</option><option>Sent</option><option>Confirmed</option><option>Partially Received</option><option>Received</option><option>Completed</option><option>Cancelled</option></select></div><div class="full"><label>Notes</label><textarea id="poNotesSafe"></textarea></div><div id="pickupMetaSafe" class="pickupMetaSafe full"><div><label>Fulfillment</label><select id="pickupFulfillmentSafe"><option value="Pickup">Pickup from Supplier</option><option value="Supplier Delivery">Supplier Delivery</option></select></div><div><label>Pickup / Receiving Date</label><input id="pickupRequestedDateSafe" type="date"></div><div><label>Purchase Type</label><select id="pickupPurchaseTypeSafe"><option value="Job-specific">Job-specific</option><option value="Stock">Stock Inventory</option></select></div></div><div class="full" id="poNativeItemsWrap"><div class="statusLine" style="margin-bottom:8px"><div><h3 style="margin:0">PO Item Lines</h3><div class="muted" id="poNativeItemHelp">Add the actual product ordered or service required.</div></div><button class="action" type="button" id="poAddNativeItemBtn">+ Item</button></div><div id="poNativeItems"></div><div id="poFinancialSummary" class="notice" style="margin-top:12px"></div></div></div><div class="actions"><button class="action" id="poSaveDraftBtn">Save Draft</button><button class="action blue" id="poPreviewBtn">Preview Deerfoot Invoice</button><button class="action" id="poPrintBtn">Print Deerfoot Invoice</button><button class="action" id="poManualBtn">Record Manual PO</button><button class="action primary" id="poIssueBtn">Issue Digital PO</button></div><div class="notice"><b>Output rule:</b> PO remains the internal supplier-order record. Preview / Print uses the same Deerfoot legacy Invoice form your company already uses for customer work and supplier pickup. PO costs stay internal by default.</div></div>`;}
  function numeric(v){const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0}
  function lineAmount(x){const direct=numeric(x.lineTotal);return direct||Math.round(numeric(x.qty)*numeric(x.unitCost)*100)/100}
  function subtotal(items){return Math.round((items||[]).reduce((s,x)=>s+lineAmount(x),0)*100)/100}
  function renderFinancialSummary(){const el=by('poFinancialSummary');if(!el)return;const items=gatherPOItems();el.innerHTML=`<div style="display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap"><span><b>PO Subtotal</b><br><small>Internal purchase cost. Deerfoot pickup Invoice preview hides cost by default.</small></span><b style="font-size:1.25rem">${money(subtotal(items))}</b></div>`}
  function lineId(x){return String(x?.lineId||x?.id||('po-line-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)))}
  function defaultSourceType(x){if(x?.sourceType)return x.sourceType;return (by('pickupPurchaseTypeSafe')?.value||'Job-specific')==='Stock'?'Stock':'Supplier'}
  function defaultSourceRef(x){if(x?.sourceRef!=null)return x.sourceRef;if(x?.supplierStock!=null)return x.supplierStock;if(x?.supplier)return x.supplier;return defaultSourceType(x)==='Supplier'?(by('poSupplierSafe')?.value||'').trim():''}
  function renderPOItems(){const el=by('poNativeItems');if(!el)return;const list=Array.isArray(poItemsDraft)?poItemsDraft:[];poItemsDraft=list.map(x=>({...x,lineId:lineId(x)}));el.innerHTML=poItemsDraft.length?poItemsDraft.map((x,i)=>`<div class="poSafeItem" data-po-native-row="${i}" data-po-line-id="${a(x.lineId)}" style="display:grid;grid-template-columns:minmax(170px,1.4fr) minmax(115px,.9fr) minmax(115px,.9fr) 78px 92px 108px 118px;gap:8px;align-items:end;margin:10px 0;padding-bottom:10px;border-bottom:1px solid #dbe4df"><div><label>Product / Style</label><input data-f="style" value="${a(x.style||x.product||'')}" placeholder="Product / style"></div><div><label>Colour</label><input data-f="colour" value="${a(x.colour||x.color||'')}" placeholder="Colour"></div><div><label>SKU / Product ID</label><input data-f="sku" value="${a(x.sku||'')}" placeholder="SKU / ID"></div><div><label>Quantity</label><input data-f="qty" inputmode="decimal" value="${a(x.qty||'')}" placeholder="Qty"></div><div><label>Unit</label><select data-f="unit">${unitOptions(x.unit||'carton')}</select></div><div><label>Unit Cost</label><input data-f="unitCost" inputmode="decimal" value="${a(x.unitCost??'')}" placeholder="0.00"></div><div><label>Line Total</label><input data-f="lineTotal" inputmode="decimal" value="${a(x.lineTotal??(x.qty&&x.unitCost?lineAmount(x).toFixed(2):''))}" placeholder="0.00"></div><div style="grid-column:1 / span 2"><label>Source Type</label><select data-f="sourceType">${sourceTypeOptions(defaultSourceType(x))}</select></div><div style="grid-column:3 / span 4"><label>Source / Reference <small style="font-weight:400">→ prints under SUPPLIER / STOCK</small></label><input data-f="sourceRef" value="${a(defaultSourceRef(x))}" placeholder="Primco / Buckwold / Roll # / Installer / other"></div><button class="action" type="button" data-po-remove="${i}" style="grid-column:7">Remove</button></div>`).join(''):'<div class="muted">No PO item lines yet. Click + Item.</div>';el.querySelectorAll('[data-po-remove]').forEach(b=>b.addEventListener('click',()=>{poItemsDraft=gatherPOItems();poItemsDraft.splice(Number(b.dataset.poRemove),1);renderPOItems();renderFinancialSummary()}));el.querySelectorAll('[data-po-native-row]').forEach(row=>{const qty=row.querySelector('[data-f="qty"]'),cost=row.querySelector('[data-f="unitCost"]'),total=row.querySelector('[data-f="lineTotal"]'),type=row.querySelector('[data-f="sourceType"]'),ref=row.querySelector('[data-f="sourceRef"]');const recalc=()=>{const q=numeric(qty?.value),c=numeric(cost?.value);if(total&&q&&c)total.value=(Math.round(q*c*100)/100).toFixed(2);renderFinancialSummary()};qty?.addEventListener('input',recalc);cost?.addEventListener('input',recalc);total?.addEventListener('input',renderFinancialSummary);type?.addEventListener('change',()=>{if(!ref?.value&&type.value==='Supplier')ref.value=(by('poSupplierSafe')?.value||'').trim()})});renderFinancialSummary();}
  function gatherPOItems(){return [...document.querySelectorAll('[data-po-native-row]')].map(row=>{const get=f=>row.querySelector(`[data-f="${f}"]`)?.value?.trim()||'';const qty=get('qty'),unitCost=get('unitCost'),enteredTotal=get('lineTotal');const calculated=enteredTotal||((numeric(qty)&&numeric(unitCost))?(Math.round(numeric(qty)*numeric(unitCost)*100)/100).toFixed(2):'');return {lineId:row.dataset.poLineId||lineId(),style:get('style'),colour:get('colour'),sku:get('sku'),qty,unit:get('unit')||'carton',unitCost,lineTotal:calculated,sourceType:get('sourceType')||'Supplier',sourceRef:get('sourceRef'),supplier:(by('poSupplierSafe')?.value||'').trim(),size:''}})}
  function updateItemHelp(){const h=by('poNativeItemHelp');if(!h)return;h.textContent=(by('pickupPurchaseTypeSafe')?.value||'Job-specific')==='Stock'?'Stock Inventory · choose Source Type = Stock and enter the carpet roll / stock reference where applicable.':'Job-specific · Source / Reference may be supplier, installer or another real Deerfoot reference.'}
  function jobRecords(){const j=activeJob();return records.filter(x=>x.jobId===j?.id)}
  function renderSetup(){
    const input=by('poStart'),btn=by('poInitBtn'),msg=by('poSetupMsg'),state=by('poCloudState'),login=by('poCloudLogin'),connect=by('poCloudConnectBtn'),refresh=by('poCloudRefreshBtn');if(!input||!btn||!msg)return;
    const signed=!!cloudSession,initialized=!!(cloudCounter?.start_number&&cloudCounter?.next_number);
    if(state){state.innerHTML=cloudBusy?'<b>Cloud PO Authority:</b> syncing…':signed?('<b>Cloud PO Authority:</b> '+(initialized?'CONNECTED · CENTRAL NUMBERING ACTIVE':'CONNECTED · COUNTER NOT INITIALIZED')):('<b>Cloud PO Authority:</b> '+(cloudError||'SIGN IN REQUIRED'))}
    if(login)login.style.display=signed?'none':'grid';if(connect)connect.style.display=signed?'none':'inline-flex';if(refresh)refresh.disabled=cloudBusy;
    if(initialized){input.value=cloudCounter.start_number;input.readOnly=true;btn.disabled=true;btn.textContent='Central Counter Initialized';msg.textContent='Next digital PO: '+cloudCounter.next_number+' · server-atomic · '+ENV}
    else{input.readOnly=false;btn.disabled=cloudBusy||!signed;btn.textContent='Initialize Central Counter';msg.textContent=signed?'Central digital numbering is not initialized. Local legacy numbering is ignored for Digital Issue.':'Connect Cloud PO Authority before initializing or issuing digital numbers.'}
  }
  function renderSummary(){const j=activeJob(),sum=by('poSafeSummary'),items=by('poSafeItems');if(sum)sum.innerHTML=j?`<b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${e(j.jobNumber||'No Job #')} · ${e(j.customerName||'Unnamed customer')}</b><br>${e(j.status||'Draft')} · Linked PO: ${e(j.supplierPO||'None')}`:'Select a Job.';if(items)items.innerHTML=(j?.items||[]).map(x=>`<div class="poSafeItem"><b>${e(x.style||'Item')}</b><span>${e(x.colour||'')}</span><small>${e(x.qty||'')} · ${e(x.supplier||'Supplier not set')}</small></div>`).join('')||'<div class="muted">No item lines on active Job.</div>'}
  function filtered(){const j=activeJob(),scope=by('poScopeSafe')?.value||'job',q=(by('poSearchSafe')?.value||'').trim().toLowerCase();return records.filter(x=>(scope==='all'||x.jobId===j?.id)&&(!q||[x.poNumber,x.supplier,x.customerName,x.salesRep,x.jobNumber,...(x.items||[]).flatMap(i=>[i.sourceRef,i.sourceType])].some(v=>String(v||'').toLowerCase().includes(q)))).sort((x,y)=>(y.createdAt||'').localeCompare(x.createdAt||''))}
  function renderLedger(){const el=by('poSafeLedger');if(!el)return;const xs=filtered();el.innerHTML=xs.length?xs.map(x=>`<div class="poSafeRow"><div><b>${x.poNumber?'#'+e(x.poNumber):'Draft'} <span class="tag">${e((x.mode||'digital').toUpperCase())}</span></b><small>${e(x.jobNumber||'No Job #')} · ${e(x.customerName||'')}</small></div><div><b>${e(x.supplier||'Supplier not set')}</b><small>${e(x.salesRep||'Sales rep not set')} · ${money(subtotal(x.items||[]))}</small></div><div><b>${e(x.status||'Draft')}</b><small>${e(x.requestedDate||x.orderDate||'')}</small></div><button class="action" data-po-open="${a(x.id)}">Open</button></div>`).join(''):'<div class="muted">No PO records in this view.</div>';}
  function renderStats(){const jr=jobRecords();if(by('poJobCount'))by('poJobCount').textContent=jr.length;if(by('poDraftCount'))by('poDraftCount').textContent=records.filter(x=>x.status==='Draft').length;if(by('poOpenCount'))by('poOpenCount').textContent=records.filter(x=>!['Completed','Cancelled'].includes(x.status)).length;if(by('poTotalCount'))by('poTotalCount').textContent=records.length;}
  function blank(){editingId=null;const j=activeJob();if(by('poSafeEditorTitle'))by('poSafeEditorTitle').textContent='New PO Draft';if(by('poModeSafe'))by('poModeSafe').value='digital';if(by('poNumberSafe'))by('poNumberSafe').value='';if(by('poSupplierSafe'))by('poSupplierSafe').value='';if(by('poSalesRepSafe'))by('poSalesRepSafe').value=j?.clerk||'';if(by('poOrderDateSafe'))by('poOrderDateSafe').value=today();if(by('poExpectedDateSafe'))by('poExpectedDateSafe').value='';if(by('poStatusSafe'))by('poStatusSafe').value='Draft';if(by('poNotesSafe'))by('poNotesSafe').value='';if(by('pickupFulfillmentSafe'))by('pickupFulfillmentSafe').value='Pickup';if(by('pickupRequestedDateSafe'))by('pickupRequestedDateSafe').value='';if(by('pickupPurchaseTypeSafe'))by('pickupPurchaseTypeSafe').value='Job-specific';poItemsDraft=[];renderPOItems();updateItemHelp();modeUI();}
  function modeUI(){const mode=by('poModeSafe')?.value||'digital',num=by('poNumberSafe'),manual=by('poManualBtn'),issue=by('poIssueBtn');if(num)num.readOnly=mode==='digital';if(manual){manual.style.display=mode==='manual'?'inline-flex':'none';manual.disabled=cloudBusy||!cloudSession}if(issue){issue.style.display=mode==='digital'?'inline-flex':'none';issue.disabled=mode==='digital'&&(cloudBusy||!cloudReady())}}
  function current(){const j=activeJob(),old=records.find(x=>x.id===editingId),items=gatherPOItems();return {...(old||{}),id:old?.id||('po-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)),jobId:old?old.jobId||'':j?.id||'',jobNumber:old?old.jobNumber||'':j?.jobNumber||'',customerName:old?old.customerName||'':j?.customerName||'',mode:by('poModeSafe')?.value||'digital',poNumber:(by('poNumberSafe')?.value||'').trim(),supplier:(by('poSupplierSafe')?.value||'').trim(),salesRep:(by('poSalesRepSafe')?.value||'').trim(),orderDate:by('poOrderDateSafe')?.value||today(),expectedDate:by('poExpectedDateSafe')?.value||'',status:by('poStatusSafe')?.value||'Draft',notes:(by('poNotesSafe')?.value||'').trim(),fulfillment:by('pickupFulfillmentSafe')?.value||'Pickup',requestedDate:by('pickupRequestedDateSafe')?.value||'',purchaseType:by('pickupPurchaseTypeSafe')?.value||'Job-specific',items:JSON.parse(JSON.stringify(items)),subtotal:subtotal(items),createdAt:old?.createdAt||new Date().toISOString(),issuedAt:old?.issuedAt||null,issueKey:old?.issueKey||null,cloudId:old?.cloudId||null,cloudEnvironment:old?.cloudEnvironment||null}}
  function notifyPickup(){try{if(typeof window.runluPickupSafeRender==='function')window.runluPickupSafeRender()}catch(_){}}
  function upsert(r){const i=records.findIndex(x=>x.id===r.id);if(i>=0)records[i]=r;else records.unshift(r);editingId=r.id;save();if(r.jobId)syncJob(r.jobId);render();fill(r);notifyPickup()}
  function fill(r){editingId=r.id;if(by('poSafeEditorTitle'))by('poSafeEditorTitle').textContent=(r.poNumber?'PO #'+r.poNumber:'Draft')+(r.status==='Cancelled'?' · Cancelled':'');by('poModeSafe').value=r.mode||'digital';by('poNumberSafe').value=r.poNumber||'';by('poSupplierSafe').value=r.supplier||'';by('poSalesRepSafe').value=r.salesRep||'';by('poOrderDateSafe').value=r.orderDate||today();by('poExpectedDateSafe').value=r.expectedDate||'';by('poStatusSafe').value=r.status||'Draft';by('poNotesSafe').value=r.notes||'';if(by('pickupFulfillmentSafe'))by('pickupFulfillmentSafe').value=r.fulfillment||'Pickup';if(by('pickupRequestedDateSafe'))by('pickupRequestedDateSafe').value=r.requestedDate||'';if(by('pickupPurchaseTypeSafe'))by('pickupPurchaseTypeSafe').value=r.purchaseType||'Job-specific';poItemsDraft=Array.isArray(r.items)?JSON.parse(JSON.stringify(r.items)):[];renderPOItems();updateItemHelp();modeUI();if(r.poNumber){by('poModeSafe').disabled=true;by('poNumberSafe').readOnly=true}else by('poModeSafe').disabled=false}
  function savePickupMeta(){const r=records.find(x=>x.id===editingId);if(!r)return;r.fulfillment=by('pickupFulfillmentSafe')?.value||'Pickup';r.requestedDate=by('pickupRequestedDateSafe')?.value||'';r.purchaseType=by('pickupPurchaseTypeSafe')?.value||'Job-specific';save();renderLedger();notifyPickup();updateItemHelp();}
  function validateItems(r){if(r.items.some(x=>!x.style)){alert('Enter Product / Style for every PO item.');return false}if(r.items.some(x=>!x.qty||Number(x.qty)<=0)){alert('Enter a Quantity greater than 0 for every PO item.');return false}return true}
  function saveDraft(){const r=current();if(r.poNumber&&taken(r.poNumber,r.id)){alert('That PO number is already in use.');return}if(!validateItems(r))return;upsert(r);alert('PO draft saved.')}
  async function recordManual(){
    const r=current();if(r.mode!=='manual'){alert('Choose Manual mode.');return}if(!r.poNumber){alert('Enter the real paper PO number.');return}if(taken(r.poNumber,r.id)){alert('That PO number is already in use on this browser.');return}if(!r.supplier){alert('Enter the supplier.');return}if(!validateItems(r))return;
    if(!cloudSession)return alert('Cloud PO Authority sign-in is required before recording an issued Manual PO. This prevents duplicate PO numbers across devices.');
    cloudBusy=true;renderSetup();modeUI();
    try{
      const c=await cloudClient(),args=cloudPOArgs(r);delete args.p_id;
      let q=await c.rpc('flooring_record_manual_po',{p_environment:ENV,p_po_number:Number(r.poNumber),p_job_id:args.p_job_id,p_job_number:args.p_job_number,p_customer_name:args.p_customer_name,p_supplier:args.p_supplier,p_sales_rep:args.p_sales_rep,p_order_date:args.p_order_date,p_expected_date:args.p_expected_date,p_notes:args.p_notes,p_items:args.p_items});
      let row=q.data;
      if(q.error){row=await recoverManualCloudRow(r);if(!row)throw q.error}
      const out=adoptCloudRow({...r,status:'Issued',issuedAt:r.issuedAt||new Date().toISOString()},row);upsert(out);alert('Manual PO recorded in central authority: #'+out.poNumber)
    }catch(e){alert('Manual PO was not recorded: '+String(e?.message||e))}
    finally{cloudBusy=false;renderSetup();modeUI()}
  }
  async function issueDigital(){
    let r=current();if(r.mode!=='digital'){alert('Choose Digital mode.');return}if(!r.supplier){alert('Enter the supplier.');return}if(!validateItems(r))return;
    if(!cloudReady())return alert('Central Digital PO Authority is not ready. Connect the cloud session and initialize the central counter first. Local numbering will not be used as a fallback.');
    cloudBusy=true;renderSetup();modeUI();
    try{
      persistIssueKey(r);
      const c=await cloudClient(),args={...cloudPOArgs(r),p_issue_key:r.issueKey},q=await c.rpc('flooring_issue_digital_po',args);if(q.error)throw q.error;
      r=adoptCloudRow(r,q.data);upsert(r);await refreshCloudAuthority(false);alert('Digital PO issued by central authority: #'+r.poNumber)
    }catch(e){alert('Digital PO was not issued. The same issue key is preserved for safe retry. '+String(e?.message||e))}
    finally{cloudBusy=false;renderSetup();modeUI()}
  }
  async function initNumber(){
    if(cloudCounter?.start_number){alert('Central Digital PO numbering is already initialized.');return}
    if(!cloudSession)return alert('Connect Cloud PO Authority first.');
    const raw=(by('poStart')?.value||'').trim();if(!/^\d+$/.test(raw)){alert('Enter a valid whole-number starting number.');return}const n=Number(raw);if(!Number.isSafeInteger(n)||n<1){alert('Enter a valid starting number.');return}
    if(!confirm('Initialize the CENTRAL digital PO counter from '+n+'? This is shared by every device and issued numbers will move forward atomically.'))return;
    cloudBusy=true;renderSetup();modeUI();
    try{const c=await cloudClient(),q=await c.rpc('flooring_initialize_po_counter',{p_environment:ENV,p_start_number:n});if(q.error)throw q.error;cloudCounter=q.data;settings={...settings,initialized:true,startNumber:Number(q.data?.start_number||n),nextNumber:Number(q.data?.next_number||n),initializedAt:q.data?.initialized_at||new Date().toISOString(),cloudAuthority:true};save();alert('Central Digital PO numbering initialized at #'+settings.startNumber)}
    catch(e){alert('Central PO counter was not initialized: '+String(e?.message||e))}
    finally{cloudBusy=false;renderSetup();modeUI()}
  }
  function previewPayload(r){const j=activeJob()||{};return {build:'V0.3.40',purpose:'PO / Supplier Pickup',poNumber:r.poNumber||'',poStatus:r.status||'Draft',invoiceNumber:j.invoiceNumber||j.jobNumber||r.jobNumber||'',invoiceDate:r.orderDate||today(),customerName:j.customerName||r.customerName||'',soldToAddress:j.soldToAddress||'',shipToName:j.shipToName||'',shipToAddress:j.shipToAddress||'',email:j.email||'',cell:j.cell||'',phoneHome:j.phoneHome||'',phoneWork:j.phoneWork||'',pickup:r.requestedDate||j.pickup||'',delivery:j.delivery||'',dateRequired:j.dateRequired||r.expectedDate||'',clerk:r.salesRep||j.clerk||'',notes:r.notes||'',items:(r.items||[]).map(x=>({qty:x.qty||'',size:x.size||'',style:x.style||'',colour:x.colour||'',sourceType:x.sourceType||'Supplier',sourceRef:x.sourceRef||x.supplierStock||x.supplier||'',supplier:x.supplier||r.supplier||'',unit:x.unit||'',unitCost:x.unitCost||'',lineTotal:x.lineTotal||''})),subtotal:r.subtotal||subtotal(r.items||[]),showCosts:false,isDemo:!!j.isDemo};}
  function previewCurrent(){const r=current();try{localStorage.setItem(PREVIEW_KEY,JSON.stringify(previewPayload(r)))}catch(err){console.error('RUNLU V0.3.40 Deerfoot Invoice preview handoff failed',err);alert('Could not prepare the Deerfoot Invoice preview.');return}const w=window.open('deerfoot-po-invoice-v040.html?t='+Date.now(),'_blank');if(!w)alert('Allow pop-ups to preview this Deerfoot Invoice.');}
  function render(){renderSetup();renderSummary();renderLedger();renderStats();renderFinancialSummary();}
  function boot(){load();migrateLegacyPickupMeta();inject();render();blank();by('poNewBtn')?.addEventListener('click',blank);by('poCloudConnectBtn')?.addEventListener('click',connectCloudAuthority);by('poCloudRefreshBtn')?.addEventListener('click',()=>refreshCloudAuthority(true));by('poInitBtn')?.addEventListener('click',initNumber);by('poSaveDraftBtn')?.addEventListener('click',saveDraft);by('poPreviewBtn')?.addEventListener('click',previewCurrent);by('poPrintBtn')?.addEventListener('click',previewCurrent);by('poManualBtn')?.addEventListener('click',recordManual);by('poIssueBtn')?.addEventListener('click',issueDigital);by('poModeSafe')?.addEventListener('change',modeUI);by('poSearchSafe')?.addEventListener('input',renderLedger);by('poScopeSafe')?.addEventListener('change',renderLedger);by('poSupplierSafe')?.addEventListener('change',()=>{poItemsDraft=gatherPOItems();poItemsDraft.forEach(x=>{if(x.sourceType==='Supplier'&&!x.sourceRef)x.sourceRef=(by('poSupplierSafe')?.value||'').trim()});renderPOItems()});by('poAddNativeItemBtn')?.addEventListener('click',()=>{poItemsDraft=gatherPOItems();const stock=(by('pickupPurchaseTypeSafe')?.value||'Job-specific')==='Stock';poItemsDraft.push({lineId:lineId(),style:'',colour:'',sku:'',qty:'',unit:'carton',unitCost:'',lineTotal:'',sourceType:stock?'Stock':'Supplier',sourceRef:stock?'':(by('poSupplierSafe')?.value||'').trim(),supplier:(by('poSupplierSafe')?.value||'').trim(),size:''});renderPOItems()});['pickupFulfillmentSafe','pickupRequestedDateSafe','pickupPurchaseTypeSafe'].forEach(id=>by(id)?.addEventListener('change',savePickupMeta));document.addEventListener('click',ev=>{const b=ev.target.closest?.('[data-po-open]');if(!b)return;const r=records.find(x=>x.id===b.dataset.poOpen);if(r)fill(r)});window.runluPORender=render;window.runluPOPreview=previewCurrent;window.runluPOPrint=previewCurrent;window.RUNLUPOCloudAuthorityV0408={ENV,cloudReady,cloudPOArgs,adoptCloudRow,refresh:refreshCloudAuthority};refreshCloudAuthority(false);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();