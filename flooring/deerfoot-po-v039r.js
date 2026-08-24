/* RUNLU Deerfoot Flooring OS · Deerfoot PO Renderer V0.3.39R */
(function(){
  'use strict';
  const KEY='runlu_deerfoot_po_print_preview_v039r';
  const by=id=>document.getElementById(id);
  const money=n=>Number(n||0).toLocaleString('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:2,maximumFractionDigits:2});
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}
  function set(id,v){const el=by(id);if(el)el.textContent=v??''}
  function numeric(v){const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0}
  function lineTotal(x){const direct=numeric(x.lineTotal);return direct||numeric(x.qty)*numeric(x.unitCost)}
  function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function fitMobile(){
    const sheet=by('sheet'),holder=by('sheetHolder');if(!sheet||!holder)return;
    if(window.matchMedia('(max-width:760px)').matches){
      const natural=816,available=Math.max(300,window.innerWidth-12),scale=Math.min(1,available/natural);
      sheet.style.transform=`scale(${scale})`;sheet.style.transformOrigin='top left';
      holder.style.height=(sheet.offsetHeight*scale+18)+'px';holder.style.width='100%';
    }else{sheet.style.transform='';holder.style.height='';holder.style.width='';}
  }
  function render(){
    const d=read(),items=Array.isArray(d.items)?d.items:[],po=d.poNumber||'DRAFT';
    set('poDate',d.orderDate||'—');set('poNumber',po);set('poNumberBottom',po);
    set('supplierName',d.supplier||'—');set('jobNumber',d.jobNumber||'—');set('customerName',d.customerName||'—');
    set('status',d.status||'Draft');set('salesRep',d.salesRep||'—');set('pickup',d.requestedDate||'—');set('fulfillment',d.fulfillment||'Pickup');
    set('expected',d.expectedDate||'—');set('purchaseType',d.purchaseType||'Job-specific');
    set('shipInstruction',d.fulfillment==='Supplier Delivery'?'Supplier Delivery':'Pickup / Receiving');set('notes',d.notes||'');
    const tbody=by('itemRows');if(tbody){let html='';for(let i=0;i<14;i++){const x=items[i]||{};html+=`<tr><td>${safe(x.qty)}</td><td>${safe(String(x.unit||'').toUpperCase())}</td><td>${safe(x.style)}</td><td>${safe(x.colour)}</td><td>${safe(x.sku)}</td><td class="moneyCell">${x.unitCost!==''&&x.unitCost!=null?money(numeric(x.unitCost)):''}</td><td class="moneyCell">${lineTotal(x)?money(lineTotal(x)):''}</td></tr>`}tbody.innerHTML=html}
    const sub=items.reduce((s,x)=>s+lineTotal(x),0);set('subTotal',money(sub));set('poTotal',money(sub));
    set('copyTag',(d.status==='Draft'?'DRAFT PO PREVIEW':'PURCHASE ORDER')+' · V0.3.39R');
    fitMobile();
  }
  window.addEventListener('resize',fitMobile,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();