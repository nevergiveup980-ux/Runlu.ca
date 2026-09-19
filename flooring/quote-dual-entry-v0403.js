/* RUNLU Deerfoot Flooring OS · V0.4.03 Quote Dual Entry Preview */
(function(root){
'use strict';
const VERSION='0.4.03';
const JOBS='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const GST_DEFAULT=0.05;
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const str=v=>String(v??'').trim();
const num=v=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
const round2=n=>Math.round((Number(n)||0)*100)/100;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const money=n=>'$'+round2(n).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
function id(prefix='line'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function blankLine(prefix='line'){return {id:id(prefix),description:'',qty:0,unit:'',listPrice:0,unitPrice:0,note:''}}
function lineTotal(line){return round2(num(line&&line.qty)*num(line&&line.unitPrice))}
function normalizeLine(line,prefix='line'){return {
  id:str(line&&line.id)||id(prefix),
  description:str(line&&line.description),
  qty:num(line&&line.qty),
  unit:str(line&&line.unit),
  listPrice:num(line&&line.listPrice),
  unitPrice:num(line&&line.unitPrice),
  note:str(line&&line.note)
}}
function normalizeQuote(q={},job={}){
  const raw=q||{},ful=str(raw.fulfillment||job.fulfillment);
  return {
    schemaVersion:1,
    quoteNumber:str(raw.quoteNumber||job.quoteNumber||job.jobNumber),
    quoteDate:str(raw.quoteDate||job.quoteDate)||today(),
    salesperson:str(raw.salesperson||job.quoteSalesperson||job.clerk),
    customerName:str(raw.customerName||job.customerName),
    projectAddress:str(raw.projectAddress||job.soldToAddress||job.shipToAddress),
    projectName:str(raw.projectName||job.quoteProjectName),
    installer:str(raw.installer||job.installer),
    fulfillment:ful==='Pickup'||ful==='Delivery'?ful:'',
    validDays:Math.max(0,Math.round(num(raw.validDays||30))),
    depositRequired:raw.depositRequired===false?false:true,
    gstRate:(raw.gstRate===undefined||raw.gstRate===null||raw.gstRate==='')?GST_DEFAULT:num(raw.gstRate),
    notes:str(raw.notes||job.quoteNotes||job.notes),
    materials:Array.isArray(raw.materials)?raw.materials.map(x=>normalizeLine(x,'mat')):[],
    labour:Array.isArray(raw.labour)?raw.labour.map(x=>normalizeLine(x,'lab')):[],
    updatedAt:str(raw.updatedAt)
  }
}
function quoteFromJob(job={}){
  if(job.quote&&typeof job.quote==='object')return normalizeQuote(job.quote,job);
  const q=normalizeQuote({},job);
  if(Array.isArray(job.items)&&job.items.length){
    q.materials=job.items.map((x,i)=>normalizeLine({
      id:'job-item-'+i,
      description:[x.style,x.colour].map(str).filter(Boolean).join(' · '),
      qty:num(String(x.qty||'').replace(/[^0-9.-]/g,'')),
      unit:(String(x.qty||'').match(/[A-Za-z]+/g)||[]).join(' '),
      listPrice:num(x.price),
      unitPrice:num(x.price),
      note:[x.supplier,x.size].map(str).filter(Boolean).join(' · ')
    },'mat'))
  }
  return q
}
function calcQuote(q){
  const x=normalizeQuote(q);
  const materials=round2(x.materials.reduce((s,l)=>s+lineTotal(l),0));
  const labour=round2(x.labour.reduce((s,l)=>s+lineTotal(l),0));
  const subtotal=round2(materials+labour);
  const gst=round2(subtotal*num(x.gstRate));
  return {materials,labour,subtotal,gst,grandTotal:round2(subtotal+gst)}
}
function setQuoteField(q,key,value){
  const out=normalizeQuote(q);
  if(['validDays','gstRate'].includes(key))out[key]=num(value);
  else if(key==='depositRequired')out[key]=!!value;
  else out[key]=str(value);
  return out
}
function lineGroup(q,group){return group==='labour'?q.labour:q.materials}
function updateLine(q,group,lineId,key,value){
  const out=normalizeQuote(q),xs=lineGroup(out,group),x=xs.find(v=>v.id===lineId);if(!x)return out;
  if(['qty','listPrice','unitPrice'].includes(key))x[key]=num(value);else x[key]=str(value);return out
}
function addLine(q,group,line){
  const out=normalizeQuote(q),xs=lineGroup(out,group);xs.push(normalizeLine(line||blankLine(group==='labour'?'lab':'mat'),group==='labour'?'lab':'mat'));return out
}
function removeLine(q,group,lineId){
  const out=normalizeQuote(q);if(group==='labour')out.labour=out.labour.filter(x=>x.id!==lineId);else out.materials=out.materials.filter(x=>x.id!==lineId);return out
}
function applyQuoteToJob(job,q){
  const out={...(job||{})},x=normalizeQuote(q,out),stamp=new Date().toISOString();
  x.updatedAt=stamp;out.quote=x;out.quoteNumber=x.quoteNumber;out.quoteDate=x.quoteDate;out.quoteSalesperson=x.salesperson;out.quoteProjectName=x.projectName;out.quoteNotes=x.notes;out.fulfillment=x.fulfillment;
  if(x.customerName)out.customerName=x.customerName;
  if(x.salesperson)out.clerk=x.salesperson;
  if(x.projectAddress)out.soldToAddress=x.projectAddress;
  if(x.installer)out.installer=x.installer;
  out.updatedAt=stamp;return out
}
function canWriteJob(job){return !!job&&!job.isDemo}
const api={VERSION,JOBS,ACTIVE,GST_DEFAULT,str,num,round2,money,blankLine,lineTotal,normalizeLine,normalizeQuote,quoteFromJob,calcQuote,setQuoteField,updateLine,addLine,removeLine,applyQuoteToJob,canWriteJob};
root.RUNLUQuoteV0403=api;
if(typeof document==='undefined')return;

let jobs=[],activeId='',draft=normalizeQuote(),mode='fields',dirty=false;
const by=id=>document.getElementById(id);
function readJobs(){try{const x=JSON.parse(localStorage.getItem(JOBS)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function writeJobs(){localStorage.setItem(JOBS,JSON.stringify(jobs));if(activeId)localStorage.setItem(ACTIVE,activeId)}
function activeJob(){return jobs.find(j=>j.id===activeId)||null}
function markDirty(){dirty=true;const e=by('q403dirty');if(e)e.textContent='Unsaved changes'}
function clearDirty(){dirty=false;const e=by('q403dirty');if(e)e.textContent='Saved to active Job'}
function newQuoteJob(){
  const d=today(),j={id:'quote-job-'+Date.now(),isDemo:false,jobNumber:'',date:d,customerName:'',clerk:'',soldToAddress:'',status:'Draft',notes:'',items:[],installer:'',installDate:'',installStatus:'Not Scheduled',fulfillment:'',quote:null};
  jobs.unshift(j);activeId=j.id;draft=normalizeQuote({},j);dirty=true;renderAll()
}
function selectJob(idValue){
  if(dirty&&!confirm('Discard unsaved quote edits and switch jobs?'))return;
  activeId=idValue;const j=activeJob();draft=quoteFromJob(j||{});dirty=false;localStorage.setItem(ACTIVE,activeId||'');renderAll()
}
function saveQuote(){
  const j=activeJob();if(!j){alert('Select or create a Job first.');return}
  if(!canWriteJob(j)){alert('DEMO jobs are read-only. Create a real Draft Job first.');return}
  const next=applyQuoteToJob(j,draft),idx=jobs.findIndex(x=>x.id===j.id);jobs[idx]=next;draft=quoteFromJob(next);writeJobs();clearDirty();renderAll();alert('Quote saved to the active Flooring Job record.')
}
function load(){
  jobs=readJobs();activeId=localStorage.getItem(ACTIVE)||jobs.find(j=>!j.isDemo)?.id||jobs[0]?.id||'';
  if(!jobs.some(j=>j.id===activeId))activeId=jobs[0]?.id||'';
  draft=quoteFromJob(activeJob()||{});renderAll()
}
function renderJobPicker(){
  const s=by('q403job');if(!s)return;
  s.innerHTML='<option value="">— Select Job —</option>'+jobs.map(j=>`<option value="${attr(j.id)}">${j.isDemo?'DEMO · ':''}${esc(j.jobNumber||'No #')} · ${esc(j.customerName||'Unnamed customer')}</option>`).join('');
  s.value=activeId;s.onchange=()=>selectJob(s.value);
  const status=by('q403jobStatus'),j=activeJob();if(status)status.innerHTML=j?`<b>${j.isDemo?'DEMO · ':''}${esc(j.jobNumber||'No Job #')}</b><span>${esc(j.customerName||'Unnamed customer')} · ${esc(j.status||'Draft')}</span>`:'<b>No active Job</b><span>Create or select a Job to save a quote.</span>'
}
function field(label,key,type='text',opts=''){
  const val=draft[key];if(type==='select')return `<label><span>${esc(label)}</span><select data-q403-field="${key}">${opts}</select><small>${esc(key)}</small></label>`;
  if(type==='checkbox')return `<label class="q403check"><input data-q403-field="${key}" type="checkbox" ${val?'checked':''}><span>${esc(label)}</span><small>${esc(key)}</small></label>`;
  return `<label><span>${esc(label)}</span><input data-q403-field="${key}" type="${type}" value="${attr(val)}"><small>${esc(key)}</small></label>`
}
function renderFields(){
  const el=by('q403fields');if(!el)return;
  const fulfill='<option value="">—</option><option value="Pickup">Pickup</option><option value="Delivery">Delivery</option>';
  el.innerHTML=`<div class="q403fieldgrid">
    ${field('Quote #','quoteNumber')}${field('Quote Date','quoteDate','date')}${field('Salesperson','salesperson')}${field('Customer','customerName')}
    ${field('Project Address','projectAddress')}${field('Project / Product Title','projectName')}${field('Installer','installer')}${field('Fulfillment','fulfillment','select',fulfill)}
    ${field('Valid Days','validDays','number')}${field('GST Rate (decimal)','gstRate','number')}${field('Deposit Required','depositRequired','checkbox')}
    <label class="full"><span>Notes / Terms</span><textarea data-q403-field="notes">${esc(draft.notes)}</textarea><small>notes</small></label>
  </div>
  <div class="q403fieldSections">${fieldLineCards('materials','Materials')}${fieldLineCards('labour','Installation / Labour')}</div>`;
  const f=el.querySelector('[data-q403-field="fulfillment"]');if(f)f.value=draft.fulfillment;
  bindInputs(el)
}
function fieldLineCards(group,title){
  const xs=lineGroup(draft,group);
  return `<section><div class="q403sectHead"><h3>${title}</h3><button type="button" data-q403-add="${group}">+ Line</button></div><div class="q403cards">${xs.length?xs.map((x,i)=>`<div class="q403lineCard" data-line="${attr(x.id)}"><div class="q403lineNo">${i+1}</div><label>Description<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="description" value="${attr(x.description)}"></label><label>Qty<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="qty" type="number" step="0.01" value="${x.qty}"></label><label>Unit<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="unit" value="${attr(x.unit)}"></label><label>List Price<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="listPrice" type="number" step="0.01" value="${x.listPrice}"></label><label>Quote Price<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="unitPrice" type="number" step="0.01" value="${x.unitPrice}"></label><label>Line Total<input data-q403-total="${attr(x.id)}" disabled value="${money(lineTotal(x))}"></label><label class="wide">Line Note<input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="note" value="${attr(x.note)}"></label><button type="button" class="danger" data-q403-remove="${group}" data-id="${attr(x.id)}">×</button></div>`).join(''):'<div class="q403empty">No lines yet.</div>'}</div></section>`
}
function renderTable(){
  const el=by('q403table');if(!el)return;
  el.innerHTML=tableGroup('materials','Materials')+tableGroup('labour','Installation / Labour');bindInputs(el)
}
function tableGroup(group,title){
  const xs=lineGroup(draft,group);
  return `<section class="q403tableBlock"><div class="q403sectHead"><h3>${title}</h3><button type="button" data-q403-add="${group}">+ Row</button></div><div class="q403tableWrap"><table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>List Price</th><th>Quote Price</th><th>Total</th><th>Note</th><th></th></tr></thead><tbody>${xs.length?xs.map((x,i)=>`<tr><td>${i+1}</td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="description" value="${attr(x.description)}"></td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="qty" type="number" step="0.01" value="${x.qty}"></td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="unit" value="${attr(x.unit)}"></td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="listPrice" type="number" step="0.01" value="${x.listPrice}"></td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="unitPrice" type="number" step="0.01" value="${x.unitPrice}"></td><td class="money" data-q403-total="${attr(x.id)}">${money(lineTotal(x))}</td><td><input data-q403-line="${group}" data-id="${attr(x.id)}" data-key="note" value="${attr(x.note)}"></td><td><button type="button" class="danger" data-q403-remove="${group}" data-id="${attr(x.id)}">×</button></td></tr>`).join(''):'<tr><td colspan="9" class="q403empty">No rows yet.</td></tr>'}</tbody></table></div></section>`
}
function bindInputs(scope){
  scope.querySelectorAll('[data-q403-field]').forEach(x=>x.oninput=()=>{draft=setQuoteField(draft,x.dataset.q403Field,x.type==='checkbox'?x.checked:x.value);markDirty();renderSummaryAndPreview()});
  scope.querySelectorAll('[data-q403-line]').forEach(x=>x.oninput=()=>{draft=updateLine(draft,x.dataset.q403Line,x.dataset.id,x.dataset.key,x.value);markDirty();const line=lineGroup(draft,x.dataset.q403Line).find(v=>v.id===x.dataset.id),total=scope.querySelector('[data-q403-total="'+CSS.escape(x.dataset.id)+'"]');if(total&&line){const v=money(lineTotal(line));if(total.tagName==='INPUT')total.value=v;else total.textContent=v}renderSummaryAndPreview()});
  scope.querySelectorAll('[data-q403-add]').forEach(x=>x.onclick=()=>{draft=addLine(draft,x.dataset.q403Add);markDirty();renderEditor();renderSummaryAndPreview()});
  scope.querySelectorAll('[data-q403-remove]').forEach(x=>x.onclick=()=>{draft=removeLine(draft,x.dataset.q403Remove,x.dataset.id);markDirty();renderEditor();renderSummaryAndPreview()});
}
function renderEditor(){by('q403fields').hidden=mode!=='fields';by('q403table').hidden=mode!=='table';if(mode==='fields')renderFields();else renderTable();document.querySelectorAll('[data-q403-mode]').forEach(b=>b.classList.toggle('active',b.dataset.q403Mode===mode))}
function quoteRows(xs){return xs.map(x=>`<tr><td>${esc(x.description||'—')}${x.note?'<small>'+esc(x.note)+'</small>':''}</td><td>${x.qty||''}</td><td>${esc(x.unit)}</td><td>${x.listPrice?money(x.listPrice):''}</td><td>${money(x.unitPrice)}</td><td>${money(lineTotal(x))}</td></tr>`).join('')}
function renderSummaryAndPreview(){
  const c=calcQuote(draft),sum=by('q403summary');if(sum)sum.innerHTML=`<div><small>Materials</small><b>${money(c.materials)}</b></div><div><small>Installation / Labour</small><b>${money(c.labour)}</b></div><div><small>Subtotal</small><b>${money(c.subtotal)}</b></div><div><small>GST</small><b>${money(c.gst)}</b></div><div class="grand"><small>Grand Total</small><b>${money(c.grandTotal)}</b></div>`;
  const p=by('q403preview');if(!p)return;
  p.innerHTML=`<div class="q403paperHead"><div><div class="dc">DC</div><p><b>Deerfoot Carpet & Flooring Inc.</b><br>6170 12ST SE<br>Calgary, AB T2H2X2<br>403-255-5880</p></div><div class="quoteWord">QUOTE<small>Generated ${esc(draft.quoteDate||today())}</small></div></div>
    <div class="q403sales">Salesperson: <b>${esc(draft.salesperson||'—')}</b></div>
    <div class="q403quoteMeta"><div><span>CUSTOMER</span><b>${esc(draft.customerName||'—')}</b><small>${esc(draft.projectAddress||'')}</small></div><div><span>QUOTE DETAILS</span><b>${esc(draft.projectName||draft.quoteNumber||'—')}</b><small>Date: ${esc(draft.quoteDate||'—')} · Installer: ${esc(draft.installer||'—')}</small></div></div>
    ${draft.fulfillment?`<div class="q403fulfill">${esc(draft.fulfillment.toUpperCase())}</div>`:''}
    <h4>Materials</h4><table class="q403printTable"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>List</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${quoteRows(draft.materials)||'<tr><td colspan="6">No material lines</td></tr>'}</tbody></table>
    <h4>Installation / Labour</h4><table class="q403printTable"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>List</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${quoteRows(draft.labour)||'<tr><td colspan="6">No labour lines</td></tr>'}</tbody></table>
    <div class="q403printTotals"><div>Materials <b>${money(c.materials)}</b></div><div>Installation / Labour <b>${money(c.labour)}</b></div><div>Subtotal <b>${money(c.subtotal)}</b></div><div>GST ${round2(draft.gstRate*100)}% <b>${money(c.gst)}</b></div><div class="gt">Grand Total <b>${money(c.grandTotal)}</b></div></div>
    <div class="q403notes"><b>Notes</b><p>${esc(draft.notes||'—')}</p><small>Pricing valid for ${draft.validDays} days unless otherwise noted. ${draft.depositRequired?'A deposit is required to order material and secure installation dates.':'Deposit requirement not marked.'}</small></div>`
}
function renderAll(){renderJobPicker();renderEditor();renderSummaryAndPreview();const btn=by('q403save'),j=activeJob();if(btn)btn.disabled=!canWriteJob(j);const d=by('q403dirty');if(d)d.textContent=dirty?'Unsaved changes':(j&&j.quote?'Saved quote loaded':'Draft not saved')}
function bind(){
  by('q403new').onclick=newQuoteJob;by('q403save').onclick=saveQuote;by('q403print').onclick=()=>window.print();
  document.querySelectorAll('[data-q403-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.q403Mode;renderEditor()});
}
function boot(){bind();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
