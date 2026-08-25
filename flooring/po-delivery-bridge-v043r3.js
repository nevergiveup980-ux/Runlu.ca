/* RUNLU Deerfoot Flooring OS · V0.3.43R3 Delivery Bridge
   Adds an explicit PO Delivery field without changing the verified V040 PO engine.
   PO Delivery -> Deerfoot Invoice DELIVERY. Falls back to linked Job Delivery when blank.
   No polling. No MutationObserver. No inventory writes.
*/
(function(){
  'use strict';
  if(window.__runluPODelivery043R3)return;
  window.__runluPODelivery043R3=true;

  const PO_STORE='runlu_deerfoot_supplier_orders_v1';
  const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
  const JOBS='runlu_deerfoot_flooring_jobs_v1';
  const SIDE='runlu_deerfoot_po_delivery_v043r3';
  const PREVIEW='runlu_flooring_po_deerfoot_invoice_v040';
  const by=id=>document.getElementById(id);
  const val=id=>String(by(id)?.value||'').trim();

  function readJson(key,fallback){try{const x=JSON.parse(localStorage.getItem(key)||'null');return x==null?fallback:x}catch(_){return fallback}}
  function activeJob(){
    try{if(typeof active==='function'){const j=active();if(j)return j}}catch(_){}
    const list=readJson(JOBS,[]),id=localStorage.getItem(ACTIVE);
    return Array.isArray(list)?(list.find(x=>x.id===id)||list[0]||null):null;
  }
  function key(){
    const po=val('poNumberSafe');if(po)return 'po:'+po;
    const j=activeJob(),supplier=val('poSupplierSafe'),date=val('poOrderDateSafe');
    return 'draft:'+(j?.id||j?.jobNumber||'none')+':'+supplier+':'+date;
  }
  function side(){const x=readJson(SIDE,{});return x&&typeof x==='object'?x:{}}
  function recordDelivery(){
    const po=val('poNumberSafe');if(!po)return '';
    const rows=readJson(PO_STORE,[]);if(!Array.isArray(rows))return '';
    return String(rows.find(x=>String(x.poNumber||'')===po)?.delivery||'').trim();
  }
  function jobDelivery(){return String(activeJob()?.delivery||'').trim()}
  function savedDelivery(){return recordDelivery()||String(side()[key()]||'').trim()||jobDelivery()}

  function ensureField(){
    if(by('poDeliverySafe'))return by('poDeliverySafe');
    const expected=by('poExpectedDateSafe');if(!expected?.parentElement)return null;
    const wrap=document.createElement('div');wrap.id='poDeliveryWrap043R3';
    wrap.innerHTML='<label>Delivery</label><input id="poDeliverySafe" placeholder="Delivery instructions / or sooner">';
    expected.parentElement.insertAdjacentElement('afterend',wrap);
    const input=by('poDeliverySafe');if(input){input.value=savedDelivery();input.addEventListener('input',persist);input.addEventListener('change',persist);input.addEventListener('blur',persist)}
    return input;
  }
  function persist(){
    const input=ensureField();if(!input)return;
    const m=side();m[key()]=String(input.value||'').trim();
    try{localStorage.setItem(SIDE,JSON.stringify(m))}catch(_){}
  }
  function syncRecord(){
    const input=ensureField(),po=val('poNumberSafe');if(!input||!po)return;
    const rows=readJson(PO_STORE,[]);if(!Array.isArray(rows))return;
    const r=rows.find(x=>String(x.poNumber||'')===po);if(!r)return;
    r.delivery=String(input.value||'').trim();
    try{localStorage.setItem(PO_STORE,JSON.stringify(rows))}catch(_){}
  }
  function restore(){
    const input=ensureField();if(!input)return;
    const d=savedDelivery();if(d||!input.value)input.value=d;
  }
  function clearForNew(){const input=ensureField();if(input)input.value=jobDelivery()}

  function patchPreviewOpen(){
    if(window.__runluPODeliveryOpen043R3)return;
    window.__runluPODeliveryOpen043R3=true;
    const nativeOpen=window.open.bind(window);
    window.open=function(url,target,features){
      try{
        if(String(url||'').includes('deerfoot-po-invoice-v040.html')){
          persist();syncRecord();
          const data=readJson(PREVIEW,{})||{};
          const input=ensureField();
          data.delivery=String(input?.value||'').trim()||String(data.delivery||'').trim()||jobDelivery();
          localStorage.setItem(PREVIEW,JSON.stringify(data));
        }
      }catch(e){console.error('RUNLU R3 Delivery preview handoff failed',e)}
      return nativeOpen(url,target,features);
    };
  }

  function install(){ensureField();restore();patchPreviewOpen()}
  function after(fn){setTimeout(fn,0);setTimeout(fn,80)}
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('button,[data-po-open]');if(!b)return;
    if(b.id==='poNewBtn')after(clearForNew);
    if(b.matches?.('[data-po-open]'))after(restore);
    if(['poSaveDraftBtn','poManualBtn','poIssueBtn'].includes(b.id)){persist();after(()=>{persist();syncRecord();restore()})}
    if(['poPreviewBtn','poPrintBtn'].includes(b.id)){persist();syncRecord()}
  },true);
  ['change','blur'].forEach(evt=>document.addEventListener(evt,e=>{if(['poNumberSafe','poSupplierSafe','poOrderDateSafe'].includes(e.target?.id))after(restore)},true));
  window.addEventListener('pageshow',()=>after(install));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>after(install),{once:true});else after(install);
  window.RUNLUPODelivery043R3={install,restore,persist,syncRecord};
})();
