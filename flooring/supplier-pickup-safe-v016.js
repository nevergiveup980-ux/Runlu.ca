/* RUNLU Deerfoot Flooring OS · Supplier Pickup Safe V0.1.6
   Robust PO-number bridge for Supplier Pickup / Receiving Date.
   Uses the visible PO Number field as the source identifier, snapshots pickup metadata
   before leaving the PO editor, and reads that snapshot first in the Pickup schedule.
   Customer Pickup Date remains separate and continues to feed the Deerfoot invoice. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const META_STORE='runlu_supplier_task_meta_v1';
  const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
  const INVOICE_STORE='runlu_flooring_active_invoice_v1';
  const PAGE_ID='supplierPickupPage';
  const by=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let records=[];

  function loadPOs(){try{records=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){records=[]}}
  function savePOs(){localStorage.setItem(PO_STORE,JSON.stringify(records))}
  function readObj(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'?v:{}}catch(_){return {}}}
  function writeObj(key,obj){localStorage.setItem(key,JSON.stringify(obj))}
  function allMeta(){return readObj(META_STORE)}
  function snapshots(){return readObj(SNAP_STORE)}

  function isoDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
  function prettyDate(v){if(!v)return '';if(!isoDate(v))return String(v);const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric'})}

  function ensureCustomerPickupDateField(){
    const el=by('pickup');if(!el)return;
    const label=el.closest('div')?.querySelector('label');if(label)label.textContent='Customer Pickup Date';
    if(el.dataset.runluPickupDateReady==='1')return;
    const old=el.value||'';el.type='date';el.dataset.runluPickupDateReady='1';if(isoDate(old))el.value=old;
  }
  function ensureSupplierPickupLabel(){const el=by('pickupRequestedDateSafe');const label=el?.closest('div')?.querySelector('label');if(label)label.textContent='Supplier Pickup / Receiving Date'}

  function renderInvoicePickupDate(){
    const frame=by('invoiceFrame');if(!frame?.contentDocument)return;
    let data=null;try{data=JSON.parse(localStorage.getItem(INVOICE_STORE)||'null')}catch(_){data=null}
    const target=frame.contentDocument.querySelector('.pickData');if(target&&data)target.textContent=prettyDate(data.pickup||'');
  }
  function ensureInvoicePickupHook(){const frame=by('invoiceFrame');if(!frame||frame.dataset.runluPickupHook==='1')return;frame.dataset.runluPickupHook='1';frame.addEventListener('load',renderInvoicePickupDate)}

  function visiblePONumber(){
    const raw=(by('poNumberSafe')?.value||'').trim();
    if(raw)return raw;
    const title=(by('poSafeEditorTitle')?.textContent||'').trim();
    const m=title.match(/^PO\s*#\s*([^\s·]+)/i);return m?m[1].trim():'';
  }

  function snapshotVisiblePO(){
    const poNumber=visiblePONumber();
    const dateEl=by('pickupRequestedDateSafe');
    if(!poNumber||!dateEl)return false;
    const fulfillment=by('pickupFulfillmentSafe')?.value||'Pickup';
    const requestedDate=dateEl.value||'';
    const purchaseType=by('pickupPurchaseTypeSafe')?.value||'Job-specific';

    const snap=snapshots();
    const prev=snap[poNumber]||{};
    const next={fulfillment,requestedDate,purchaseType,updatedAt:new Date().toISOString()};
    const snapChanged=prev.fulfillment!==next.fulfillment||prev.requestedDate!==next.requestedDate||prev.purchaseType!==next.purchaseType;
    if(snapChanged)writeObj(SNAP_STORE,{...snap,[poNumber]:next});

    loadPOs();
    const po=records.find(x=>String(x.poNumber||'').trim()===poNumber);
    let poChanged=false;
    if(po){
      poChanged=po.fulfillment!==fulfillment||po.requestedDate!==requestedDate||po.purchaseType!==purchaseType;
      if(poChanged){po.fulfillment=fulfillment;po.requestedDate=requestedDate;po.purchaseType=purchaseType;savePOs()}
    }
    return snapChanged||poChanged;
  }

  function ensurePage(){
    if(document.querySelector('section#'+PAGE_ID+'.page'))return;
    const main=document.querySelector('main');if(!main)return;
    const s=document.createElement('section');s.id=PAGE_ID;s.className='page';
    s.innerHTML=`<div class="card"><div class="statusLine"><div><h2>Supplier Pickup / Receiving</h2><div class="muted">PO-driven inbound schedule · separate from the customer pickup date printed on the invoice.</div></div><button class="action primary" id="pickupRefreshSafe">Refresh</button></div><div class="pickupSafeNotice"><b>Date rule:</b> Supplier Pickup / Receiving Date is entered on the PO and drives this schedule. PO Order Date and Supplier Expected Date are never substituted as pickup dates. <span class="muted">Bridge V0.1.6</span></div><div class="pickupSafeStats"><div><b id="pickupScheduledSafe">0</b><span>Scheduled</span></div><div><b id="pickupInProgressSafe">0</b><span>In Progress</span></div><div><b id="pickupReadySafe">0</b><span>Ready</span></div><div><b id="pickupTotalSafe">0</b><span>Total</span></div></div></div><div class="card"><div class="statusLine"><h3>Pickup / Inbound Schedule</h3><select id="pickupFilterSafe"><option value="">All statuses</option><option>Scheduled</option><option>In Progress</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select></div><div id="pickupScheduleSafe"></div></div>`;
    const warehouse=by('warehouse');main.insertBefore(s,warehouse||null);
    by('pickupRefreshSafe')?.addEventListener('click',()=>{snapshotVisiblePO();render()});
    by('pickupFilterSafe')?.addEventListener('change',render);
  }

  function ensureNav(){
    const nav=by('nav');if(!nav||nav.querySelector('[data-page="'+PAGE_ID+'"]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.page=PAGE_ID;b.textContent='Pickup';
    const anchor=nav.querySelector('[data-page="warehouse"]');anchor?anchor.insertAdjacentElement('beforebegin',b):nav.appendChild(b);
    b.addEventListener('click',()=>{snapshotVisiblePO();switchToPickup();render()});
  }
  function switchToPickup(){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE_ID));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE_ID));window.scrollTo({top:0,behavior:'smooth'})}

  function statusForPO(po){if(po.status==='Cancelled')return 'Cancelled';if(['Received','Completed'].includes(po.status))return po.status==='Completed'?'Completed':'Ready';if(po.status==='Partially Received')return 'In Progress';return po.poNumber?'Scheduled':'Draft'}
  function legacyForPO(po,meta){return meta[po.id]||(po.jobId?meta[po.jobId]:meta['no-job'])||{}}
  function scheduleRows(){
    const meta=allMeta(),snap=snapshots();
    return records.filter(x=>x.poNumber&&x.status!=='Draft').map(po=>{
      const legacy=legacyForPO(po,meta),s=snap[String(po.poNumber||'').trim()]||{};
      return {...po,
        fulfillment:s.fulfillment||po.fulfillment||legacy.fulfillment||'Pickup',
        requestedDate:s.requestedDate||po.requestedDate||legacy.requestedDate||'',
        purchaseType:s.purchaseType||po.purchaseType||legacy.purchaseType||'Job-specific',
        pickupStatus:statusForPO(po)
      };
    }).filter(x=>x.pickupStatus!=='Draft');
  }
  function dateLabel(d){if(!d)return 'Supplier pickup date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?d:x.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'})}
  function monthLabel(d){if(!d)return 'Supplier pickup date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?'Supplier pickup date not set':x.toLocaleDateString('en-CA',{month:'long',year:'numeric'})}

  function render(){
    loadPOs();ensureCustomerPickupDateField();ensureSupplierPickupLabel();ensureInvoicePickupHook();
    const rows=scheduleRows();
    if(by('pickupScheduledSafe'))by('pickupScheduledSafe').textContent=rows.filter(x=>x.pickupStatus==='Scheduled').length;
    if(by('pickupInProgressSafe'))by('pickupInProgressSafe').textContent=rows.filter(x=>x.pickupStatus==='In Progress').length;
    if(by('pickupReadySafe'))by('pickupReadySafe').textContent=rows.filter(x=>['Ready','Completed'].includes(x.pickupStatus)).length;
    if(by('pickupTotalSafe'))by('pickupTotalSafe').textContent=rows.length;
    const filter=by('pickupFilterSafe')?.value||'';
    const xs=rows.filter(x=>!filter||x.pickupStatus===filter).sort((a,b)=>String(a.requestedDate||'9999-12-31').localeCompare(String(b.requestedDate||'9999-12-31'))||String(a.poNumber).localeCompare(String(b.poNumber),undefined,{numeric:true}));
    const el=by('pickupScheduleSafe');if(!el)return;
    if(!xs.length){el.innerHTML='<div class="muted">No issued PO records match this view. Open a PO and enter its Supplier Pickup / Receiving Date.</div>';return}
    const groups={};xs.forEach(x=>(groups[monthLabel(x.requestedDate)]||(groups[monthLabel(x.requestedDate)]=[])).push(x));
    el.innerHTML=Object.entries(groups).map(([month,items])=>`<div class="pickupSafeMonth">${esc(month)}</div>${items.map(x=>`<div class="pickupSafeRow"><div><b>#${esc(x.poNumber)} · ${esc(x.supplier||'Supplier not set')}</b><small>${esc(dateLabel(x.requestedDate))} · ${esc(x.fulfillment)} · ${esc(x.purchaseType)}</small></div><div><b>${esc(x.jobNumber||'No Job #')} · ${esc(x.customerName||'')}</b><small>${esc(x.salesRep||'Sales rep not set')}</small></div><div><span class="pickupSafeStatus ${x.pickupStatus==='Cancelled'?'cancelled':(['Ready','Completed'].includes(x.pickupStatus)?'ready':'')}">${esc(x.pickupStatus)}</span></div></div>`).join('')}`).join('');
  }

  function openPickup(){snapshotVisiblePO();ensurePage();ensureNav();switchToPickup();render()}
  function boot(){
    ensureCustomerPickupDateField();ensureInvoicePickupHook();ensurePage();ensureNav();ensureSupplierPickupLabel();render();
    window.runluPickupSafeRender=render;window.openSupplierPickupSafe=openPickup;window.runluSnapshotVisiblePO=snapshotVisiblePO;
    ['input','change'].forEach(type=>document.addEventListener(type,ev=>{if(['pickupFulfillmentSafe','pickupRequestedDateSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id)){snapshotVisiblePO()}}));
    window.addEventListener('storage',ev=>{if([PO_STORE,META_STORE,SNAP_STORE,INVOICE_STORE].includes(ev.key)){render();renderInvoicePickupDate()}})
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();