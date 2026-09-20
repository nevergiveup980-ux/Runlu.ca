/* RUNLU Deerfoot Flooring OS · V0.4.03i Direct Quote Form Entry */
(function(root){
'use strict';
const VERSION='0.4.03';
const JOBS='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const GST_DEFAULT=0.05;
const today=()=>new Date().toISOString().slice(0,10);
const str=v=>String(v??'').trim();
const num=v=>{const n=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(n)?n:0};
const round2=n=>Math.round((Number(n)||0)*100)/100;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const money=n=>'$'+round2(n).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
function id(prefix='line'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function blankLine(prefix='line'){return {id:id(prefix),description:'',qty:0,unit:'',listPrice:0,unitPrice:0,note:''}}
function uiBlankLine(prefix='ui'){return {id:'ui-'+prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),description:'',qty:0,unit:'',listPrice:0,unitPrice:0,note:''}}
function meaningfulLine(line){return !!(str(line?.description)||num(line?.qty)||str(line?.unit)||num(line?.listPrice)||num(line?.unitPrice)||str(line?.note))}
function stripBlankUILines(q){
  const out=normalizeQuote(q);
  out.materials=out.materials.filter(x=>!String(x.id||'').startsWith('ui-')||meaningfulLine(x));
  out.labour=out.labour.filter(x=>!String(x.id||'').startsWith('ui-')||meaningfulLine(x));
  return out
}
function ensureTableRows(q,minMaterials=6,minLabour=3){
  const out=normalizeQuote(q);
  while(out.materials.length<minMaterials)out.materials.push(normalizeLine(uiBlankLine('mat'),'mat'));
  while(out.labour.length<minLabour)out.labour.push(normalizeLine(uiBlankLine('lab'),'lab'));
  return out
}
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
const api={VERSION,JOBS,ACTIVE,GST_DEFAULT,str,num,round2,money,blankLine,uiBlankLine,meaningfulLine,stripBlankUILines,ensureTableRows,lineTotal,normalizeLine,normalizeQuote,quoteFromJob,calcQuote,setQuoteField,updateLine,addLine,removeLine,applyQuoteToJob,canWriteJob};
root.RUNLUQuoteV0403=api;
if(typeof document==='undefined')return;

let jobs=[],activeId='',draft=normalizeQuote(),mode='fields',dirty=false;
const by=id=>document.getElementById(id);
const touchIOS=(()=>{const ua=navigator.userAgent||'';return /iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)})();
if(touchIOS)mode='table';
function editValue(el){return el?.isContentEditable?(el.textContent||'').replace(/\u00a0/g,' ').trim():el?.value}
function selectCellText(el){
  try{
    if(el?.isContentEditable){const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r)}
    else el?.select?.()
  }catch(_){}
}
function sheetEditCell(group,x,key,value,kind='text',placeholder=''){
  const numeric=kind==='number',uiBlank=String(x?.id||'').startsWith('ui-')&&!meaningfulLine(x),v=(numeric&&uiBlank&&num(value)===0)?'':(value==null?'':String(value));
  if(touchIOS){
    return `<td class="q403editCell ${numeric?'q403numCell':''}" contenteditable="true" role="textbox" inputmode="${numeric?'decimal':'text'}" enterkeyhint="next" spellcheck="${numeric?'false':'true'}" data-q403-line="${group}" data-id="${attr(x.id)}" data-key="${key}" data-placeholder="${attr(placeholder)}" aria-label="${attr(key)}">${esc(v)}</td>`
  }
  return `<td><input class="q403cell ${numeric?'q403num':''}" data-q403-line="${group}" data-id="${attr(x.id)}" data-key="${key}" ${numeric?'type="number" inputmode="decimal" step="0.01"':''} value="${attr(v)}" placeholder="${attr(placeholder)}"></td>`
}

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
  const clean=stripBlankUILines(draft),next=applyQuoteToJob(j,clean),idx=jobs.findIndex(x=>x.id===j.id);jobs[idx]=next;draft=quoteFromJob(next);writeJobs();clearDirty();renderAll();alert('Quote saved to the active Flooring Job record.')
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
function iosGridCell(group,x,key,value,kind='text',placeholder=''){
  const numeric=kind==='number',uiBlank=String(x?.id||'').startsWith('ui-')&&!meaningfulLine(x),v=(numeric&&uiBlank&&num(value)===0)?'':(value==null?'':String(value));
  return `<input class="q403iosInput ${numeric?'q403iosNum':''}" data-q403-line="${group}" data-id="${attr(x.id)}" data-key="${key}" type="text" ${numeric?'inputmode="decimal"':''} enterkeyhint="next" autocomplete="off" autocapitalize="${numeric?'off':'sentences'}" spellcheck="${numeric?'false':'true'}" value="${attr(v)}" placeholder="${attr(placeholder)}" aria-label="${attr(key)}">`
}
function iosGridGroup(group,title){
  const xs=lineGroup(draft,group);
  return `<section class="q403tableBlock q403iosBlock" data-q403-group="${group}">
    <div class="q403sectHead"><h3>${title}</h3><button type="button" data-q403-add="${group}">+ Row</button></div>
    <div class="q403iosWrap">
      <div class="q403iosGrid q403iosHeader"><div>#</div><div>Description</div><div>Qty</div><div>Unit</div><div>List Price</div><div>Quote Price</div><div>Total</div><div>Note</div><div></div></div>
      ${xs.map((x,i)=>`<div class="q403iosGrid q403iosRow" data-q403-row="${attr(x.id)}">
        <div class="q403iosNo">${i+1}</div>
        ${iosGridCell(group,x,'description',x.description,'text','Product / service')}
        ${iosGridCell(group,x,'qty',x.qty,'number','0')}
        ${iosGridCell(group,x,'unit',x.unit,'text','sf / sy / ea')}
        ${iosGridCell(group,x,'listPrice',x.listPrice,'number','0')}
        ${iosGridCell(group,x,'unitPrice',x.unitPrice,'number','0')}
        <div class="q403iosTotal" data-q403-total="${attr(x.id)}">${money(lineTotal(x))}</div>
        ${iosGridCell(group,x,'note',x.note,'text','Optional note')}
        <button type="button" class="danger q403iosRemove" data-q403-remove="${group}" data-id="${attr(x.id)}" aria-label="Remove row">×</button>
      </div>`).join('')}
    </div>
  </section>`
}
function iosStackCell(group,x,key,label,value,kind='text',placeholder=''){
  const numeric=kind==='number',uiBlank=String(x?.id||'').startsWith('ui-')&&!meaningfulLine(x),v=(numeric&&uiBlank&&num(value)===0)?'':(value==null?'':String(value));
  return `<label class="q403mobileField ${key==='description'||key==='note'?'wide':''}"><span>${esc(label)}</span><input class="q403mobileInput ${numeric?'q403iosNum':''}" data-q403-line="${group}" data-id="${attr(x.id)}" data-key="${key}" type="text" ${numeric?'inputmode="decimal"':''} enterkeyhint="next" autocomplete="off" autocapitalize="${numeric?'off':'sentences'}" spellcheck="${numeric?'false':'true'}" value="${attr(v)}" placeholder="${attr(placeholder)}"></label>`
}
function iosStackGroup(group,title){
  const xs=lineGroup(draft,group);
  return `<section class="q403tableBlock q403stackBlock" data-q403-group="${group}">
    <div class="q403sectHead"><h3>${title}</h3><button type="button" data-q403-add="${group}">+ Row</button></div>
    <div class="q403stackRows">
      ${xs.map((x,i)=>`<article class="q403stackRow" data-q403-row="${attr(x.id)}">
        <div class="q403stackRowHead"><b>Row ${i+1}</b><span data-q403-total="${attr(x.id)}">${money(lineTotal(x))}</span><button type="button" class="danger" data-q403-remove="${group}" data-id="${attr(x.id)}" aria-label="Remove row">×</button></div>
        <div class="q403stackFields">
          ${iosStackCell(group,x,'description','Description',x.description,'text','Product / service')}
          ${iosStackCell(group,x,'qty','Qty',x.qty,'number','0')}
          ${iosStackCell(group,x,'unit','Unit',x.unit,'text','sf / sy / ea')}
          ${iosStackCell(group,x,'listPrice','List Price',x.listPrice,'number','0.00')}
          ${iosStackCell(group,x,'unitPrice','Quote Price',x.unitPrice,'number','0.00')}
          ${iosStackCell(group,x,'note','Note',x.note,'text','Optional note')}
        </div>
      </article>`).join('')}
    </div>
  </section>`
}
function renderTable(){
  const el=by('q403table');if(!el)return;
  try{
    draft=ensureTableRows(draft);
    if(touchIOS){
      el.innerHTML='<div class="q403tableHint q403stackHint"><b>iPhone Stacked Entry active · V0.4.03h.</b> Each quote row is now a plain native form with no table, no CSS grid, no horizontal scroller and no iframe dependency. Tap any field directly.</div>'+iosStackGroup('materials','Materials')+iosStackGroup('labour','Installation / Labour');
      bindInputs(el);
      return
    }
    el.innerHTML='<div class="q403tableHint"><b>Table Entry is editable.</b> The blank rows below are live cells. Click any cell and type; use + Row only when you need more rows.</div>'+tableGroup('materials','Materials')+tableGroup('labour','Installation / Labour');
    bindInputs(el);
    el.querySelectorAll('.q403tableWrap').forEach(w=>{w.scrollLeft=0})
  }catch(e){
    console.error('[RUNLU Quote Table Entry]',e);
    el.innerHTML='<div class="q403tableError"><b>Table Entry render error.</b><span>'+esc(e?.message||String(e))+'</span><small>Database Fields remains available; send this visible error text for repair.</small></div>'
  }
}
function tableGroup(group,title){
  const xs=lineGroup(draft,group),descHead=touchIOS?'':'sticky-desc';
  return `<section class="q403tableBlock" data-q403-group="${group}"><div class="q403sectHead"><h3>${title}</h3><button type="button" data-q403-add="${group}">+ Row</button></div><div class="q403tableWrap"><table class="q403sheet ${touchIOS?'q403nativeSheet':''}"><colgroup><col class="c-num"><col class="c-desc"><col class="c-qty"><col class="c-unit"><col class="c-price"><col class="c-price"><col class="c-total"><col class="c-note"><col class="c-remove"></colgroup><thead><tr><th class="sticky-num">#</th><th class="${descHead}">Description</th><th>Qty</th><th>Unit</th><th>List Price</th><th>Quote Price</th><th>Total</th><th>Note</th><th></th></tr></thead><tbody>${xs.length?xs.map((x,i)=>`<tr data-q403-row="${attr(x.id)}"><td class="sticky-num rowno">${i+1}</td>${sheetEditCell(group,x,'description',x.description,'text','Product / service')}${sheetEditCell(group,x,'qty',x.qty,'number','0')}${sheetEditCell(group,x,'unit',x.unit,'text','sf / sy / ea')}${sheetEditCell(group,x,'listPrice',x.listPrice,'number','0')}${sheetEditCell(group,x,'unitPrice',x.unitPrice,'number','0')}<td class="money q403calc" data-q403-total="${attr(x.id)}">${money(lineTotal(x))}</td>${sheetEditCell(group,x,'note',x.note,'text','Optional note')}<td><button type="button" class="danger" data-q403-remove="${group}" data-id="${attr(x.id)}" aria-label="Remove row">×</button></td></tr>`).join(''):'<tr><td colspan="9" class="q403empty">No rows yet. Tap + Row to start entering directly in the table.</td></tr>'}</tbody></table></div></section>`
}
function focusNextCell(input){
  const root=by('q403table')||input.closest('section')||document;
  const cells=[...root.querySelectorAll('[data-q403-line]')],i=cells.indexOf(input);if(i<0)return;
  const next=cells[i+1];if(next){next.focus();selectCellText(next);next.scrollIntoView({block:'center',inline:'nearest'})}
}
function bindInputs(scope){
  scope.querySelectorAll('[data-q403-field]').forEach(x=>x.oninput=()=>{draft=setQuoteField(draft,x.dataset.q403Field,x.type==='checkbox'?x.checked:x.value);markDirty();renderSummaryAndPreview()});
  scope.querySelectorAll('[data-q403-line]').forEach(x=>{
    const update=()=>{draft=updateLine(draft,x.dataset.q403Line,x.dataset.id,x.dataset.key,editValue(x));markDirty();const line=lineGroup(draft,x.dataset.q403Line).find(v=>v.id===x.dataset.id),total=scope.querySelector('[data-q403-total="'+CSS.escape(x.dataset.id)+'"]');if(total&&line){const v=money(lineTotal(line));if(total.tagName==='INPUT')total.value=v;else total.textContent=v}renderSummaryAndPreview()};
    x.oninput=update;
    x.onfocus=()=>{x.closest('td')?.classList.add('editing');x.closest('.q403mobileField')?.classList.add('editing');const v=editValue(x);if((x.classList.contains('q403num')||x.classList.contains('q403numCell')||x.classList.contains('q403iosNum'))&&(v==='0'||v==='0.00'))setTimeout(()=>selectCellText(x),0)};
    x.onblur=()=>{x.closest('td')?.classList.remove('editing');x.closest('.q403mobileField')?.classList.remove('editing');if(x.isContentEditable&&x.dataset.placeholder&&!editValue(x))x.innerHTML='';update()};
    x.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();focusNextCell(x)}};
    // Native iPhone grid inputs intentionally use Safari's default tap-to-focus behavior.
    // No touchend preventDefault is installed here because it can suppress the software keyboard.
  });
  scope.querySelectorAll('[data-q403-add]').forEach(x=>x.onclick=()=>{
    const group=x.dataset.q403Add;draft=stripBlankUILines(draft);draft=addLine(draft,group);const added=lineGroup(draft,group).at(-1);markDirty();renderEditor();renderSummaryAndPreview();
    if(mode==='table'&&added){const target=by('q403table')?.querySelector('[data-q403-line="'+group+'"][data-id="'+CSS.escape(added.id)+'"][data-key="description"]');target?.focus();target?.scrollIntoView({block:'nearest',inline:'center'})}
  });
  scope.querySelectorAll('[data-q403-remove]').forEach(x=>x.onclick=()=>{draft=removeLine(draft,x.dataset.q403Remove,x.dataset.id);markDirty();renderEditor();renderSummaryAndPreview()});
}
function renderEditor(){
  const fields=by('q403fields'),table=by('q403table');
  if(fields)fields.hidden=mode!=='fields';
  if(table)table.hidden=mode!=='table';
  if(mode==='fields')renderFields();
  else if(table)table.innerHTML='<div class="q403tableHint q403formHint"><b>Quote Form Entry active · V0.4.03i.</b> Enter directly in the large Deerfoot Quote form below. Database Fields and Quote Form Entry are the same draft; there are no separate card-entry records.</div>';
  document.querySelectorAll('[data-q403-mode]').forEach(b=>b.classList.toggle('active',b.dataset.q403Mode===mode))
}
function quoteRows(xs){return (Array.isArray(xs)?xs:[]).filter(meaningfulLine).map(x=>`<tr><td>${esc(x.description||'—')}${x.note?'<small>'+esc(x.note)+'</small>':''}</td><td>${x.qty||''}</td><td>${esc(x.unit)}</td><td>${x.listPrice?money(x.listPrice):''}</td><td>${money(x.unitPrice)}</td><td>${money(lineTotal(x))}</td></tr>`).join('')}
function renderSummary(){
  const c=calcQuote(draft),sum=by('q403summary');if(sum)sum.innerHTML=`<div><small>Materials</small><b>${money(c.materials)}</b></div><div><small>Installation / Labour</small><b>${money(c.labour)}</b></div><div><small>Subtotal</small><b>${money(c.subtotal)}</b></div><div><small>GST</small><b>${money(c.gst)}</b></div><div class="grand"><small>Grand Total</small><b>${money(c.grandTotal)}</b></div>`
}
function paperValue(v){return attr(v==null?'':v)}
function paperField(label,key,value,kind='text',placeholder=''){
  const numeric=kind==='number';
  return `<label class="q403paperField"><span>${esc(label)}</span><input data-q403-paper-field="${key}" type="${kind==='date'?'date':'text'}" ${numeric?'inputmode="decimal"':''} value="${paperValue(value)}" placeholder="${attr(placeholder)}"></label>`
}
function paperLineField(group,x,key,label,value,kind='text',placeholder=''){
  const numeric=kind==='number',uiBlank=String(x?.id||'').startsWith('ui-')&&!meaningfulLine(x),v=(numeric&&uiBlank&&num(value)===0)?'':(value==null?'':value);
  return `<label class="q403paperLineField ${key==='description'||key==='note'?'wide':''}"><span>${esc(label)}</span><input data-q403-paper-line="${group}" data-id="${attr(x.id)}" data-key="${key}" type="text" ${numeric?'inputmode="decimal"':''} enterkeyhint="next" value="${paperValue(v)}" placeholder="${attr(placeholder)}"></label>`
}
function paperLineRows(group,title){
  const xs=lineGroup(draft,group);
  return `<section class="q403paperEditSection" data-paper-group="${group}"><div class="q403paperEditHead"><h4>${title}</h4><button type="button" data-q403-paper-add="${group}">+ Row</button></div><div class="q403paperRows">${xs.map((x,i)=>`<article class="q403paperRow" data-paper-row="${attr(x.id)}"><div class="q403paperRowTop"><b>${i+1}</b><span data-q403-paper-total="${attr(x.id)}">${money(lineTotal(x))}</span><button type="button" data-q403-paper-remove="${group}" data-id="${attr(x.id)}" aria-label="Remove row">×</button></div><div class="q403paperRowFields">${paperLineField(group,x,'description','Description',x.description,'text','Product / service')}${paperLineField(group,x,'qty','Qty',x.qty,'number','0')}${paperLineField(group,x,'unit','Unit',x.unit,'text','sf / sy / ea')}${paperLineField(group,x,'listPrice','List Price',x.listPrice,'number','0.00')}${paperLineField(group,x,'unitPrice','Quote Price',x.unitPrice,'number','0.00')}${paperLineField(group,x,'note','Note',x.note,'text','Optional note')}</div></article>`).join('')}</div></section>`
}
function refreshPaperTotals(){
  const p=by('q403preview'),c=calcQuote(draft);renderSummary();if(!p)return;
  for(const group of ['materials','labour'])lineGroup(draft,group).forEach(x=>{const el=p.querySelector('[data-q403-paper-total="'+CSS.escape(x.id)+'"]');if(el)el.textContent=money(lineTotal(x))});
  const vals={materials:c.materials,labour:c.labour,subtotal:c.subtotal,gst:c.gst,grandTotal:c.grandTotal};
  Object.entries(vals).forEach(([k,v])=>{const el=p.querySelector('[data-paper-sum="'+k+'"]');if(el)el.textContent=money(v)});
  const gstLabel=p.querySelector('[data-paper-gst-label]');if(gstLabel)gstLabel.textContent='GST '+round2(draft.gstRate*100)+'%'
}
function bindPaperForm(p){
  p.querySelectorAll('[data-q403-paper-field]').forEach(x=>{
    x.oninput=()=>{draft=setQuoteField(draft,x.dataset.q403PaperField,x.type==='checkbox'?x.checked:x.value);markDirty();refreshPaperTotals()};
    x.onfocus=()=>x.closest('.q403paperField')?.classList.add('editing');
    x.onblur=()=>x.closest('.q403paperField')?.classList.remove('editing')
  });
  p.querySelectorAll('[data-q403-paper-line]').forEach(x=>{
    const update=()=>{draft=updateLine(draft,x.dataset.q403PaperLine,x.dataset.id,x.dataset.key,x.value);markDirty();refreshPaperTotals()};
    x.oninput=update;
    x.onfocus=()=>{x.closest('.q403paperLineField')?.classList.add('editing');if(x.inputMode==='decimal'&&(x.value==='0'||x.value==='0.00'))setTimeout(()=>selectCellText(x),0)};
    x.onblur=()=>{x.closest('.q403paperLineField')?.classList.remove('editing');update()};
    x.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const cells=[...p.querySelectorAll('[data-q403-paper-line]')],i=cells.indexOf(x),n=cells[i+1];n?.focus();n?.scrollIntoView({block:'center',inline:'nearest'})}}
  });
  p.querySelectorAll('[data-q403-paper-add]').forEach(btn=>btn.onclick=()=>{const group=btn.dataset.q403PaperAdd;draft=stripBlankUILines(draft);draft=addLine(draft,group);draft=ensureTableRows(draft);markDirty();renderSummaryAndPreview();const xs=lineGroup(draft,group),added=xs.at(-1),target=by('q403preview')?.querySelector('[data-q403-paper-line="'+group+'"][data-id="'+CSS.escape(added.id)+'"][data-key="description"]');target?.focus();target?.scrollIntoView({block:'center'})});
  p.querySelectorAll('[data-q403-paper-remove]').forEach(btn=>btn.onclick=()=>{draft=removeLine(draft,btn.dataset.q403PaperRemove,btn.dataset.id);draft=ensureTableRows(draft);markDirty();renderSummaryAndPreview()});
  const dep=p.querySelector('[data-q403-paper-check="depositRequired"]');if(dep){dep.checked=!!draft.depositRequired;dep.onchange=()=>{draft=setQuoteField(draft,'depositRequired',dep.checked);markDirty()}}
  const ful=p.querySelector('[data-q403-paper-select="fulfillment"]');if(ful){ful.value=draft.fulfillment;ful.onchange=()=>{draft=setQuoteField(draft,'fulfillment',ful.value);markDirty()}}
  const notes=p.querySelector('[data-q403-paper-notes]');if(notes){notes.oninput=()=>{draft=setQuoteField(draft,'notes',notes.value);markDirty()}}
}
function renderPaperForm(){
  const p=by('q403preview');if(!p)return;draft=ensureTableRows(draft);const c=calcQuote(draft);
  p.classList.add('q403paperEditing');
  p.innerHTML=`<div class="q403paperEditFlag">EDITING THE ACTUAL QUOTE · V0.4.03i</div>
    <div class="q403paperHead"><div><div class="dc">DC</div><p><b>Deerfoot Carpet & Flooring Inc.</b><br>6170 12ST SE<br>Calgary, AB T2H2X2<br>403-255-5880</p></div><div class="quoteWord">QUOTE<small>Direct Form Entry</small></div></div>
    <div class="q403paperHeaderFields">${paperField('Salesperson','salesperson',draft.salesperson)}${paperField('Quote #','quoteNumber',draft.quoteNumber)}${paperField('Quote Date','quoteDate',draft.quoteDate,'date')}</div>
    <div class="q403quoteMeta q403paperMetaEdit"><div><span>CUSTOMER</span>${paperField('Customer','customerName',draft.customerName)}${paperField('Address','projectAddress',draft.projectAddress)}</div><div><span>QUOTE DETAILS</span>${paperField('Project / Product','projectName',draft.projectName)}${paperField('Installer','installer',draft.installer)}<label class="q403paperField"><span>Fulfillment</span><select data-q403-paper-select="fulfillment"><option value="">—</option><option value="Pickup">Pickup</option><option value="Delivery">Delivery</option></select></label></div></div>
    ${paperLineRows('materials','Materials')}${paperLineRows('labour','Installation / Labour')}
    <div class="q403printTotals q403paperLiveTotals"><div>Materials <b data-paper-sum="materials">${money(c.materials)}</b></div><div>Installation / Labour <b data-paper-sum="labour">${money(c.labour)}</b></div><div>Subtotal <b data-paper-sum="subtotal">${money(c.subtotal)}</b></div><div><span data-paper-gst-label>GST ${round2(draft.gstRate*100)}%</span><b data-paper-sum="gst">${money(c.gst)}</b></div><div class="gt">Grand Total <b data-paper-sum="grandTotal">${money(c.grandTotal)}</b></div></div>
    <div class="q403notes q403paperNotesEdit"><b>Notes / Terms</b><textarea data-q403-paper-notes placeholder="Quote notes / terms">${esc(draft.notes||'')}</textarea><div class="q403paperTerms">${paperField('Valid Days','validDays',draft.validDays,'number')}${paperField('GST Rate','gstRate',draft.gstRate,'number')}<label class="q403paperCheck"><input type="checkbox" data-q403-paper-check="depositRequired"><span>Deposit Required</span></label></div></div>`;
  bindPaperForm(p)
}
function renderReadOnlyPreview(){
  const p=by('q403preview');if(!p)return;const c=calcQuote(draft);p.classList.remove('q403paperEditing');
  p.innerHTML=`<div class="q403paperHead"><div><div class="dc">DC</div><p><b>Deerfoot Carpet & Flooring Inc.</b><br>6170 12ST SE<br>Calgary, AB T2H2X2<br>403-255-5880</p></div><div class="quoteWord">QUOTE<small>Generated ${esc(draft.quoteDate||today())}</small></div></div>
    <div class="q403sales">Salesperson: <b>${esc(draft.salesperson||'—')}</b></div>
    <div class="q403quoteMeta"><div><span>CUSTOMER</span><b>${esc(draft.customerName||'—')}</b><small>${esc(draft.projectAddress||'')}</small></div><div><span>QUOTE DETAILS</span><b>${esc(draft.projectName||draft.quoteNumber||'—')}</b><small>Date: ${esc(draft.quoteDate||'—')} · Installer: ${esc(draft.installer||'—')}</small></div></div>
    ${draft.fulfillment?`<div class="q403fulfill">${esc(draft.fulfillment.toUpperCase())}</div>`:''}
    <h4>Materials</h4><table class="q403printTable"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>List</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${quoteRows(draft.materials)||'<tr><td colspan="6">No material lines</td></tr>'}</tbody></table>
    <h4>Installation / Labour</h4><table class="q403printTable"><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>List</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${quoteRows(draft.labour)||'<tr><td colspan="6">No labour lines</td></tr>'}</tbody></table>
    <div class="q403printTotals"><div>Materials <b>${money(c.materials)}</b></div><div>Installation / Labour <b>${money(c.labour)}</b></div><div>Subtotal <b>${money(c.subtotal)}</b></div><div>GST ${round2(draft.gstRate*100)}% <b>${money(c.gst)}</b></div><div class="gt">Grand Total <b>${money(c.grandTotal)}</b></div></div>
    <div class="q403notes"><b>Notes</b><p>${esc(draft.notes||'—')}</p><small>Pricing valid for ${draft.validDays} days unless otherwise noted. ${draft.depositRequired?'A deposit is required to order material and secure installation dates.':'Deposit requirement not marked.'}</small></div>`
}
function renderSummaryAndPreview(){renderSummary();if(mode==='table')renderPaperForm();else renderReadOnlyPreview()}
let restorePaperAfterPrint=false;
function printQuote(){
  restorePaperAfterPrint=mode==='table';
  if(restorePaperAfterPrint)renderReadOnlyPreview();
  window.print()
}
window.addEventListener('afterprint',()=>{if(restorePaperAfterPrint){restorePaperAfterPrint=false;renderPaperForm()}});

function renderAll(){renderJobPicker();renderEditor();renderSummaryAndPreview();const btn=by('q403save'),j=activeJob();if(btn)btn.disabled=!canWriteJob(j);const d=by('q403dirty');if(d)d.textContent=dirty?'Unsaved changes':(j&&j.quote?'Saved quote loaded':'Draft not saved')}
function bind(){
  by('q403new').onclick=newQuoteJob;by('q403save').onclick=saveQuote;by('q403print').onclick=printQuote;by('q403print2')&&(by('q403print2').onclick=printQuote);
  document.querySelectorAll('[data-q403-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.q403Mode;if(mode==='fields')draft=stripBlankUILines(draft);else draft=ensureTableRows(draft);renderEditor();renderSummaryAndPreview();if(mode==='table')setTimeout(()=>by('q403preview')?.scrollIntoView({block:'start'}),0)});
}
function boot(){bind();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
