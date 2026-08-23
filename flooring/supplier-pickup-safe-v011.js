/* RUNLU Deerfoot Flooring OS · Supplier Pickup Safe V0.1.1
   Incremental restore after Safe Core + Showroom + PO.
   No NAV mutation, no go() wrapping, no MutationObserver, no polling loop.
   This stage uses the existing local PO ledger and pickup metadata.
   Central Supabase / Warehouse sharing will be re-enabled only after this isolated module is validated. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const META_STORE='runlu_supplier_task_meta_v1';
  const by=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let records=[];

  function activeJob(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function loadPOs(){try{records=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){records=[]}}
  function allMeta(){try{return JSON.parse(localStorage.getItem(META_STORE)||'{}')}catch(_){return {}}}
  function saveMeta(all){localStorage.setItem(META_STORE,JSON.stringify(all))}
  function metaKey(){return activeJob()?.id||'no-job'}
  function currentMeta(){const m=allMeta()[metaKey()]||{};return {fulfillment:m.fulfillment||'Pickup',requestedDate:m.requestedDate||'',purchaseType:m.purchaseType||'Job-specific'}}
  function saveCurrentMeta(){const all=allMeta();all[metaKey()]={fulfillment:by('pickupFulfillmentSafe')?.value||'Pickup',requestedDate:by('pickupRequestedDateSafe')?.value||'',purchaseType:by('pickupPurchaseTypeSafe')?.value||'Job-specific'};saveMeta(all);render();}

  function ensurePOFields(){
    if(by('pickupMetaSafe'))return;
    const title=by('poSafeEditorTitle');
    const card=title?.closest('.card');
    const grid=card?.querySelector('.formgrid');
    if(!grid)return;
    const box=document.createElement('div');box.id='pickupMetaSafe';box.className='pickupMetaSafe full';
    box.innerHTML=`<div><label>Fulfillment</label><select id="pickupFulfillmentSafe"><option value="Pickup">Pickup from Supplier</option><option value="Supplier Delivery">Supplier Delivery</option></select></div><div><label>Pickup / Receiving Date</label><input id="pickupRequestedDateSafe" type="date"></div><div><label>Purchase Type</label><select id="pickupPurchaseTypeSafe"><option value="Job-specific">Job-specific</option><option value="Stock">Stock Inventory</option></select></div>`;
    grid.appendChild(box);
    ['pickupFulfillmentSafe','pickupRequestedDateSafe','pickupPurchaseTypeSafe'].forEach(id=>by(id)?.addEventListener('change',saveCurrentMeta));
    loadMetaFields();
  }
  function loadMetaFields(){const m=currentMeta();if(by('pickupFulfillmentSafe'))by('pickupFulfillmentSafe').value=m.fulfillment;if(by('pickupRequestedDateSafe'))by('pickupRequestedDateSafe').value=m.requestedDate;if(by('pickupPurchaseTypeSafe'))by('pickupPurchaseTypeSafe').value=m.purchaseType;}

  function ensurePage(){
    if(by('pickup'))return;
    const main=document.querySelector('main');if(!main)return;
    const s=document.createElement('section');s.id='pickup';s.className='page';
    s.innerHTML=`<div class="card"><div class="statusLine"><div><h2>Supplier Pickup / Receiving</h2><div class="muted">Safe incremental restore · PO-driven inbound schedule.</div></div><button class="action primary" id="pickupRefreshSafe">Refresh</button></div><div class="pickupSafeNotice"><b>Recovery stage:</b> this page currently reads the existing local PO ledger and pickup metadata only. The central Supabase / Warehouse shared bridge remains intentionally off until this module proves stable.</div><div class="pickupSafeStats"><div><b id="pickupScheduledSafe">0</b><span>Scheduled</span></div><div><b id="pickupInProgressSafe">0</b><span>In Progress</span></div><div><b id="pickupReadySafe">0</b><span>Ready</span></div><div><b id="pickupTotalSafe">0</b><span>Total</span></div></div></div><div class="card"><div class="statusLine"><h3>Pickup / Inbound Schedule</h3><select id="pickupFilterSafe"><option value="">All statuses</option><option>Scheduled</option><option>In Progress</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select></div><div id="pickupScheduleSafe"></div></div>`;
    const warehouse=by('warehouse');main.insertBefore(s,warehouse||null);
    by('pickupRefreshSafe')?.addEventListener('click',render);
    by('pickupFilterSafe')?.addEventListener('change',render);
  }

  function ensureNav(){
    const nav=by('nav');if(!nav||nav.querySelector('[data-page="pickup"]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.page='pickup';b.textContent='Pickup';
    const anchor=nav.querySelector('[data-page="warehouse"]');anchor?anchor.insertAdjacentElement('beforebegin',b):nav.appendChild(b);
    b.addEventListener('click',()=>{switchToPickup();render();});
  }
  function switchToPickup(){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='pickup'));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='pickup'));window.scrollTo({top:0,behavior:'smooth'});}

  function statusForPO(po){if(po.status==='Cancelled')return 'Cancelled';if(['Received','Completed'].includes(po.status))return po.status==='Completed'?'Completed':'Ready';if(po.status==='Partially Received')return 'In Progress';return po.poNumber?'Scheduled':'Draft';}
  function scheduleRows(){
    const meta=allMeta();
    return records.filter(x=>x.poNumber&&x.status!=='Draft').map(po=>{const m=meta[po.jobId]||{};return {...po,fulfillment:m.fulfillment||'Pickup',requestedDate:m.requestedDate||po.expectedDate||'',purchaseType:m.purchaseType||'Job-specific',pickupStatus:statusForPO(po)}}).filter(x=>x.pickupStatus!=='Draft');
  }
  function dateLabel(d){if(!d)return 'Date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?d:x.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'})}
  function monthLabel(d){if(!d)return 'Date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?'Date not set':x.toLocaleDateString('en-CA',{month:'long',year:'numeric'})}
  function render(){
    loadPOs();ensurePOFields();loadMetaFields();
    const rows=scheduleRows();
    if(by('pickupScheduledSafe'))by('pickupScheduledSafe').textContent=rows.filter(x=>x.pickupStatus==='Scheduled').length;
    if(by('pickupInProgressSafe'))by('pickupInProgressSafe').textContent=rows.filter(x=>x.pickupStatus==='In Progress').length;
    if(by('pickupReadySafe'))by('pickupReadySafe').textContent=rows.filter(x=>['Ready','Completed'].includes(x.pickupStatus)).length;
    if(by('pickupTotalSafe'))by('pickupTotalSafe').textContent=rows.length;
    const filter=by('pickupFilterSafe')?.value||'';
    const xs=rows.filter(x=>!filter||x.pickupStatus===filter).sort((a,b)=>String(a.requestedDate||'9999-12-31').localeCompare(String(b.requestedDate||'9999-12-31'))||String(a.poNumber).localeCompare(String(b.poNumber),undefined,{numeric:true}));
    const el=by('pickupScheduleSafe');if(!el)return;
    if(!xs.length){el.innerHTML='<div class="muted">No issued PO records match this view. Add a Pickup / Receiving Date in PO / Supplier Orders, then issue or record the PO.</div>';return}
    const groups={};xs.forEach(x=>(groups[monthLabel(x.requestedDate)]||(groups[monthLabel(x.requestedDate)]=[])).push(x));
    el.innerHTML=Object.entries(groups).map(([month,items])=>`<div class="pickupSafeMonth">${esc(month)}</div>${items.map(x=>`<div class="pickupSafeRow"><div><b>#${esc(x.poNumber)} · ${esc(x.supplier||'Supplier not set')}</b><small>${esc(dateLabel(x.requestedDate))} · ${esc(x.fulfillment)} · ${esc(x.purchaseType)}</small></div><div><b>${esc(x.jobNumber||'No Job #')} · ${esc(x.customerName||'')}</b><small>${esc(x.salesRep||'Sales rep not set')}</small></div><div><span class="pickupSafeStatus ${x.pickupStatus==='Cancelled'?'cancelled':(['Ready','Completed'].includes(x.pickupStatus)?'ready':'')}">${esc(x.pickupStatus)}</span></div></div>`).join('')}`).join('');
  }

  function boot(){ensurePage();ensureNav();ensurePOFields();render();window.runluPickupSafeRender=render;window.addEventListener('storage',ev=>{if([PO_STORE,META_STORE].includes(ev.key))render()});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();