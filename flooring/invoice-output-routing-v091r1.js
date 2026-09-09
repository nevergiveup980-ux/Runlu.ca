/* RUNLU Deerfoot Flooring OS · V0.3.91r1 Invoice Output Routing
   Projects the same saved mixed-order data into three Deerfoot paper views:
   - Customer copy: clean commercial document + human-readable cuts
   - Warehouse copy: exact roll / pick / cut execution details
   - Accounting copy: service classification + assignee while retaining prices/totals
   This is display/print projection only. It never mutates Warehouse physical inventory.
*/
(function(){
'use strict';
if(window.__RUNLU_INVOICE_OUTPUT_ROUTING_V091R1__)return;
window.__RUNLU_INVOICE_OUTPUT_ROUTING_V091R1__=true;

const BRIDGE='runlu_flooring_active_invoice_v1';
const str=v=>String(v??'').trim();
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('en-CA',{maximumFractionDigits:2});
const routeType=x=>str(x?.routeType)||(/\b(disposal|install|installation|labour|labor|service)\b/i.test([x?.style,x?.supplier].join(' '))?'SERVICE':/\brc\d+\b/i.test([x?.supplier,x?.style].join(' '))?'CARPET_STOCK':/\b(spill blocker|underlay|underlayment|pad|9lb|9 lb)\b/i.test([x?.style,x?.supplier].join(' '))?'PRODUCT_STOCK':'');
const activeJob=()=>{try{return typeof active==='function'?active():null}catch(_){return null}};

function baseNotes(data,j){
  const direct=str(j?.notes||data?.routingOutput?.baseNotes);
  if(direct)return direct;
  return str(data?.notes).replace(/\s*\|\s*CUTS L\d+:[^|]*/g,'').trim();
}
function parseCuts(v){
  const s=str(v);if(!s)return[];
  return s.split(/[;|,\n]+/).map(x=>x.trim()).filter(Boolean).slice(0,16);
}
function lineMeta(x,i){
  const type=routeType(x),warehouseQty=num(x?.routeWarehouseQty),requested=num(x?.routeRequestedLF),cuts=Math.max(0,Math.round(num(x?.routeCutCount))),roll=str(x?.routeRoll||(/\brc\d+\b/i.exec(str(x?.supplier))||[])[0]||''),master=str(x?.routeMasterId||x?.sku||''),location=str(x?.routeLocation||''),serviceKind=str(x?.routeServiceKind||(/disposal/i.test(str(x?.style))?'Disposal':'Installation')),assignee=str(x?.routeAssignee||((type==='SERVICE'&&!/stock/i.test(str(x?.supplier)))?x?.supplier:'')),plan=parseCuts(x?.routeCutPlan);
  return {index:i,type,roll,master,location,warehouseQty,warehouseUnit:str(x?.routeWarehouseUnit||''),requestedLF:requested,cutCount:cuts,cutPlan:plan,serviceKind,assignee,status:str(x?.routeStatus||''),existing:!!x?.routeExistingExecution,itemName:str(x?.routeItemName||x?.style),colour:str(x?.routeColour||x?.colour)};
}
function buildOutput(data){
  const j=activeJob(),items=Array.isArray(j?.items)?j.items:(Array.isArray(data?.items)?data.items:[]),lines=items.map(lineMeta);
  const warehouse=lines.filter(x=>['CARPET_STOCK','PRODUCT_STOCK'].includes(x.type));
  const services=lines.filter(x=>x.type==='SERVICE');
  return {
    version:'0.3.91r1',
    baseNotes:baseNotes(data,j),
    lines,
    warehouseCount:warehouse.length,
    serviceCount:services.length,
    generatedAt:new Date().toISOString()
  };
}
function enrichBridge(){
  try{
    const data=JSON.parse(localStorage.getItem(BRIDGE)||'null');if(!data)return null;
    const j=activeJob();
    if(j&&Array.isArray(j.items))data.items=JSON.parse(JSON.stringify(j.items));
    data.routingOutput=buildOutput(data);
    localStorage.setItem(BRIDGE,JSON.stringify(data));
    return data;
  }catch(e){console.warn('[Invoice Output V091r1] bridge enrichment failed',e);return null}
}
function getBridge(){try{return JSON.parse(localStorage.getItem(BRIDGE)||'null')}catch(_){return null}}
function css(doc){
  if(doc.getElementById('r091r1InvoiceStyle'))return;
  const s=doc.createElement('style');s.id='r091r1InvoiceStyle';s.textContent=`
.r091r1-stockcell{white-space:pre-line!important;font-size:7.2pt!important;line-height:1.08!important;font-weight:700!important;color:#244c3b!important}
.r091r1-note-wrap{display:block;line-height:1.18}
.r091r1-note-label{font-weight:800;letter-spacing:.02em}
.r091r1-cutgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:5mm;row-gap:.5mm;margin-top:.8mm;font-size:7.4pt;line-height:1.05}
.r091r1-cutgrid span{white-space:nowrap}
.r091r1-warehouse-lines{display:grid;grid-template-columns:1fr;gap:.5mm;margin-top:.8mm;font-size:7.1pt;line-height:1.1}
.r091r1-accounting-lines{display:grid;grid-template-columns:1fr;gap:.5mm;margin-top:.8mm;font-size:7.1pt;line-height:1.1}
.r091r1-screen-note{margin:8px 0 0;padding:7px 10px;border-radius:7px;background:#edf5f0;color:#315947;font:700 11px/1.35 Arial,Helvetica,sans-serif}
@media print{.r091r1-screen-note{display:none!important}}
`;doc.head.appendChild(s);
}
function lineFor(data,i){return data?.routingOutput?.lines?.find?.(x=>x.index===i)||lineMeta((data?.items||[])[i]||{},i)}
function normalSupplier(item){return str(item?.supplier||item?.sourceRef||'')}
function warehouseSupplier(item,m){
  if(m.type==='CARPET_STOCK'){
    const a=[m.roll||normalSupplier(item),m.warehouseQty?`CUT ${fmt(m.warehouseQty)} ${m.warehouseUnit||'LF'}`:'',m.cutCount?`${m.cutCount} CUTS`:''].filter(Boolean);
    return a.join('\n');
  }
  if(m.type==='PRODUCT_STOCK'){
    const a=['STOCK',m.master||'',m.warehouseQty?`PICK ${fmt(m.warehouseQty)} ${m.warehouseUnit||''}`:'',m.location?`LOC ${m.location}`:''].filter(Boolean);
    return a.join('\n');
  }
  if(m.type==='SERVICE')return m.serviceKind==='Installation'?(m.assignee?`INSTALL\n${m.assignee}`:'INSTALL'):'SERVICE';
  return normalSupplier(item);
}
function accountingSupplier(item,m){
  if(m.type==='SERVICE')return [m.serviceKind.toUpperCase(),m.assignee].filter(Boolean).join('\n');
  if(m.type==='CARPET_STOCK')return m.roll||normalSupplier(item);
  if(m.type==='PRODUCT_STOCK')return m.master||'STOCK';
  return normalSupplier(item);
}
function renderRows(doc,data,copy){
  const rows=[...doc.querySelectorAll('#rows tr')],items=Array.isArray(data?.items)?data.items:[];
  rows.forEach((tr,i)=>{
    const cells=[...tr.children];if(cells.length<5)return;const item=items[i]||{},m=lineFor(data,i);
    const vals=[str(item.qty),str(item.size),str(item.style),str(item.colour),copy==='warehouse'?warehouseSupplier(item,m):copy==='accounting'?accountingSupplier(item,m):normalSupplier(item)];
    vals.forEach((v,k)=>{cells[k].textContent=v||'';cells[k].classList.toggle('r091r1-stockcell',k===4&&copy!=='customer')});
  });
}
function customerNotes(data){
  const base=esc(data?.routingOutput?.baseNotes||'');
  const carpets=(data?.routingOutput?.lines||[]).filter(x=>x.type==='CARPET_STOCK'&&(x.cutPlan?.length||x.cutCount||x.requestedLF));
  let html=base?`<span>${base}</span>`:'';
  carpets.forEach(x=>{
    const fallback=[x.cutCount?`${x.cutCount} cuts`:null,x.requestedLF?`${fmt(x.requestedLF)} LF requested`:null].filter(Boolean);
    const cuts=x.cutPlan?.length?x.cutPlan:fallback;
    if(cuts.length)html+=`${html?'<br>':''}<span class="r091r1-note-label">CUTS:</span><div class="r091r1-cutgrid">${cuts.map(c=>`<span>${esc(c)}</span>`).join('')}</div>`;
  });
  return html||'';
}
function warehouseNotes(data){
  const base=esc(data?.routingOutput?.baseNotes||''),lines=(data?.routingOutput?.lines||[]).filter(x=>['CARPET_STOCK','PRODUCT_STOCK'].includes(x.type));
  const detail=lines.map(x=>{
    if(x.type==='CARPET_STOCK')return [x.roll||x.itemName,x.requestedLF?`${fmt(x.requestedLF)} LF requested`:null,x.warehouseQty?`${fmt(x.warehouseQty)} ${x.warehouseUnit||'LF'} planned`:null,x.cutCount?`${x.cutCount} cuts`:null,x.location?`Loc ${x.location}`:null,x.existing?'Existing work found':null].filter(Boolean).join(' · ');
    return [x.itemName||'Stock item',x.master?`Product ${x.master}`:null,x.warehouseQty?`Pick ${fmt(x.warehouseQty)} ${x.warehouseUnit}`:null,x.location?`Loc ${x.location}`:null,x.existing?'Existing work found':null].filter(Boolean).join(' · ');
  });
  let html=base?`<span>${base}</span>`:'';
  if(detail.length)html+=`${html?'<br>':''}<span class="r091r1-note-label">WAREHOUSE:</span><div class="r091r1-warehouse-lines">${detail.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  return html;
}
function accountingNotes(data){
  const base=esc(data?.routingOutput?.baseNotes||''),lines=(data?.routingOutput?.lines||[]).filter(x=>x.type==='SERVICE');
  const detail=lines.map(x=>[x.serviceKind,x.assignee?`→ ${x.assignee}`:null].filter(Boolean).join(' '));
  let html=base?`<span>${base}</span>`:'';
  if(detail.length)html+=`${html?'<br>':''}<span class="r091r1-note-label">SERVICES:</span><div class="r091r1-accounting-lines">${detail.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
  return html;
}
function renderNotes(doc,data,copy){
  const n=doc.querySelector('.notesData');if(!n)return;n.classList.add('r091r1-note-wrap');
  n.innerHTML=copy==='warehouse'?warehouseNotes(data):copy==='accounting'?accountingNotes(data):customerNotes(data);
}
function screenHint(doc,copy,data){
  let h=doc.getElementById('r091r1ScreenHint');
  if(!h){h=doc.createElement('div');h.id='r091r1ScreenHint';h.className='r091r1-screen-note';const hint=doc.querySelector('.hint');hint?.insertAdjacentElement('afterend',h)}
  if(!h)return;
  const wc=data?.routingOutput?.warehouseCount||0,sc=data?.routingOutput?.serviceCount||0;
  h.textContent=copy==='warehouse'?`Warehouse projection · ${wc} material line(s) · roll / pick / cut details are printed from saved routing data.`:copy==='accounting'?`Accounting projection · ${sc} service line(s) classified · prices and totals remain unchanged.`:'Customer projection · clean commercial invoice; internal route codes are not printed.';
}
function decorateFrame(){
  const frame=document.getElementById('invoiceFrame');if(!frame)return;
  try{
    const doc=frame.contentDocument;if(!doc||!doc.body)return;css(doc);
    const data=getBridge();if(!data)return;
    const copy=doc.getElementById('copy')?.value||'customer';
    renderRows(doc,data,copy);renderNotes(doc,data,copy);screenHint(doc,copy,data);
    const sel=doc.getElementById('copy');
    if(sel&&!sel.dataset.r091r1){sel.dataset.r091r1='1';sel.addEventListener('change',()=>setTimeout(decorateFrame,0));sel.addEventListener('input',()=>setTimeout(decorateFrame,0));}
    const tag=doc.querySelector('.copyTag');if(tag&&!data.isDemo){const name=copy==='warehouse'?'WAREHOUSE':copy==='accounting'?'ACCOUNTING':'CUSTOMER';tag.textContent=name+' COPY · ROUTED OUTPUT';}
  }catch(e){console.warn('[Invoice Output V091r1] frame decoration failed',e)}
}
function hookFrame(){
  const frame=document.getElementById('invoiceFrame');if(!frame||frame.dataset.r091r1)return;frame.dataset.r091r1='1';frame.addEventListener('load',()=>setTimeout(decorateFrame,80));
}
function wrapPrepare(){
  try{
    if(window.__r091r1PrepareWrapped||typeof window.prepareInvoice!=='function')return;
    const old=window.prepareInvoice;
    window.prepareInvoice=function(){
      const r=old.apply(this,arguments);
      enrichBridge();hookFrame();setTimeout(decorateFrame,120);return r;
    };
    window.__r091r1PrepareWrapped=true;
  }catch(e){console.warn('[Invoice Output V091r1] prepare wrapper failed',e)}
}
function install(){
  wrapPrepare();hookFrame();
  document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;if(b.dataset?.page==='invoice'||b.textContent?.trim()==='Invoice')setTimeout(()=>{enrichBridge();wrapPrepare();hookFrame();decorateFrame()},120)},true);
  const mo=new MutationObserver(()=>{wrapPrepare();hookFrame()});mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>setTimeout(()=>{wrapPrepare();hookFrame()},80));
  window.RUNLUInvoiceOutputRoutingV091R1={version:'0.3.91r1',decorate:decorateFrame,enrich:enrichBridge};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
