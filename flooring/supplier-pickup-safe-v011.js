/* RUNLU Deerfoot Flooring OS · Supplier Pickup Safe V0.1.5
   Incremental restore after Safe Core + Showroom + PO.
   Dedicated Supplier Pickup page id prevents collision with the Job editor pickup input.
   Supplier pickup / receiving metadata is read from each PO record only; Expected Date is not treated as Pickup Date.
   The Job editor's Pickup field is promoted to an explicit Customer Pickup Date for the Deerfoot invoice.
   V0.1.5 flushes the visible PO editor's pickup metadata into the PO record before the Pickup schedule renders.
   No go() wrapping, no MutationObserver, no polling loop.
   Central Supabase / Warehouse sharing will be re-enabled only after this isolated module is validated. */
(function(){
  'use strict';
  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const META_STORE='runlu_supplier_task_meta_v1';
  const INVOICE_STORE='runlu_flooring_active_invoice_v1';
  const PAGE_ID='supplierPickupPage';
  const by=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let records=[];

  function loadPOs(){try{records=JSON.parse(localStorage.getItem(PO_STORE)||'[]')}catch(_){records=[]}}
  function savePOs(){localStorage.setItem(PO_STORE,JSON.stringify(records))}
  function allMeta(){try{return JSON.parse(localStorage.getItem(META_STORE)||'{}')}catch(_){return {}}}

  function isoDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))}
  function prettyDate(v){if(!v)return '';if(!isoDate(v))return String(v);const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric'})}
  function ensureCustomerPickupDateField(){
    const el=by('pickup');if(!el)return;
    const label=el.closest('div')?.querySelector('label');if(label)label.textContent='Customer Pickup Date';
    if(el.dataset.runluPickupDateReady==='1')return;
    const old=el.value||'';
    el.type='date';
    el.dataset.runluPickupDateReady='1';
    if(isoDate(old))el.value=old;
  }
  function ensureSupplierPickupLabel(){const el=by('pickupRequestedDateSafe');const label=el?.closest('div')?.querySelector('label');if(label)label.textContent='Supplier Pickup / Receiving Date'}
  function renderInvoicePickupDate(){
    const frame=by('invoiceFrame');if(!frame?.contentDocument)return;
    let data=null;try{data=JSON.parse(localStorage.getItem(INVOICE_STORE)||'null')}catch(_){data=null}
    const target=frame.contentDocument.querySelector('.pickData');if(target&&data)target.textContent=prettyDate(data.pickup||'');
  }
  function ensureInvoicePickupHook(){const frame=by('invoiceFrame');if(!frame||frame.dataset.runluPickupHook==='1')return;frame.dataset.runluPickupHook='1';frame.addEventListener('load',renderInvoicePickupDate)}

  /*
    The PO editor can visibly contain a Supplier Pickup / Receiving Date even when an
    older browser-restored form value has not yet reached localStorage. Before the
    schedule renders, identify the PO currently open in the editor and persist the
    visible pickup fields directly onto that PO record. This makes the PO editor the
    source of truth and prevents a visible date from becoming “date not set”.
  */
  function flushVisiblePOPickupMeta(){
    const dateEl=by('pickupRequestedDateSafe');
    const title=(by('poSafeEditorTitle')?.textContent||'').trim();
    if(!dateEl||!title)return false;
    const match=title.match(/^PO\s*#\s*(.+?)(?:\s*·|$)/i);
    if(!match)return false;
    const poNumber=match[1].trim();
    loadPOs();
    const po=records.find(x=>String(x.poNumber||'').trim()===poNumber);
    if(!po)return false;
    const fulfillment=by('pickupFulfillmentSafe')?.value||po.fulfillment||'Pickup';
    const requestedDate=dateEl.value||'';
    const purchaseType=by('pickupPurchaseTypeSafe')?.value||po.purchaseType||'Job-specific';
    const changed=po.fulfillment!==fulfillment||po.requestedDate!==requestedDate||po.purchaseType!==purchaseType;
    if(changed){
      po.fulfillment=fulfillment;
      po.requestedDate=requestedDate;
      po.purchaseType=purchaseType;
      savePOs();
    }
    return changed;
  }

  function ensurePage(){
    if(document.querySelector('section#'+PAGE_ID+'.page'))return;
    const main=document.querySelector('main');if(!main)return;
    const s=document.createElement('section');s.id=PAGE_ID;s.className='page';
    s.innerHTML=`<div class="card"><div class="statusLine"><div><h2>Supplier Pickup / Receiving</h2><div class="muted">PO-driven inbound schedule · separate from the customer pickup date printed on the invoice.</div></div><button class="action primary" id="pickupRefreshSafe">Refresh</button></div><div class="pickupSafeNotice"><b>Date rule:</b> Supplier Pickup / Receiving Date is entered on the PO and drives this schedule. PO Order Date and Supplier Expected Date are never substituted as pickup dates.</div><div class="pickupSafeStats"><div><b id="pickupScheduledSafe">0</b><span>Scheduled</span></div><div><b id="pickupInProgressSafe">0</b><span>In Progress</span></div><div><b id="pickupReadySafe">0</b><span>Ready</span></div><div><b id="pickupTotalSafe">0</b><span>Total</span></div></div></div><div class="card"><div class="statusLine"><h3>Pickup / Inbound Schedule</h3><select id="pickupFilterSafe"><option value="">All statuses</option><option>Scheduled</option><option>In Progress</option><option>Ready</option><option>Completed</option><option>Cancelled</option></select></div><div id="pickupScheduleSafe"></div></div>`;
    const warehouse=by('warehouse');main.insertBefore(s,warehouse||null);
    by('pickupRefreshSafe')?.addEventListener('click',render);
    by('pickupFilterSafe')?.addEventListener('change',render);
  }

  function ensureNav(){
    const nav=by('nav');if(!nav||nav.querySelector('[data-page="'+PAGE_ID+'"]'))return;
    const b=document.createElement('button');b.type='button';b.dataset.page=PAGE_ID;b.textContent='Pickup';
    const anchor=nav.querySelector('[data-page="warehouse"]');anchor?anchor.insertAdjacentElement('beforebegin',b):nav.appendChild(b);
    b.addEventListener('click',()=>{flushVisiblePOPickupMeta();switchToPickup();render();});
  }
  function switchToPickup(){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE_ID));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE_ID));window.scrollTo({top:0,behavior:'smooth'});}

  function statusForPO(po){if(po.status==='Cancelled')return 'Cancelled';if(['Received','Completed'].includes(po.status))return po.status==='Completed'?'Completed':'Ready';if(po.status==='Partially Received')return 'In Progress';return po.poNumber?'Scheduled':'Draft';}
  function legacyForPO(po,meta){return meta[po.id]||(po.jobId?meta[po.jobId]:meta['no-job'])||{}}
  function scheduleRows(){
    const meta=allMeta();
    return records.filter(x=>x.poNumber&&x.status!=='Draft').map(po=>{
      const legacy=legacyForPO(po,meta);
      return {...po,
        fulfillment:po.fulfillment||legacy.fulfillment||'Pickup',
        requestedDate:po.requestedDate||legacy.requestedDate||'',
        purchaseType:po.purchaseType||legacy.purchaseType||'Job-specific',
        pickupStatus:statusForPO(po)
      };
    }).filter(x=>x.pickupStatus!=='Draft');
  }
  function dateLabel(d){if(!d)return 'Supplier pickup date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?d:x.toLocaleDateString('en-CA',{weekday:'short',month:'short',day:'numeric'})}
  function monthLabel(d){if(!d)return 'Supplier pickup date not set';const x=new Date(d+'T12:00:00');return Number.isNaN(x.getTime())?'Supplier pickup date not set':x.toLocaleDateString('en-CA',{month:'long',year:'numeric'})}
  function render(){
    flushVisiblePOPickupMeta();
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

  function openPickup(){flushVisiblePOPickupMeta();ensurePage();ensureNav();switchToPickup();render();}
  function boot(){
    ensureCustomerPickupDateField();ensureInvoicePickupHook();ensurePage();ensureNav();ensureSupplierPickupLabel();render();
    window.runluPickupSafeRender=render;window.openSupplierPickupSafe=openPickup;window.runluFlushVisiblePOPickupMeta=flushVisiblePOPickupMeta;
    ['input','change'].forEach(type=>document.addEventListener(type,ev=>{if(['pickupFulfillmentSafe','pickupRequestedDateSafe','pickupPurchaseTypeSafe'].includes(ev.target?.id)){flushVisiblePOPickupMeta();render()}}));
    window.addEventListener('storage',ev=>{if([PO_STORE,META_STORE,INVOICE_STORE].includes(ev.key)){render();renderInvoicePickupDate()}})
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();