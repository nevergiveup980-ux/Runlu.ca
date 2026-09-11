/* RUNLU Flooring OS · Carpet Line RC Link V0.3.93
   Company-simulation phase: Finance assigns RC numbers; Job / Order carpet lines can select an RC
   and immediately see the live Carpet Inventory facts needed for cut planning.
   Boundaries:
   - Read-only against Carpet Inventory / RC Tracking. This module never changes roll quantity/location/status.
   - RC Number + Planned Cuts are stored on the Job line item only when the Job is saved.
   - Availability is an advisory planning check, not an inventory reservation/hold.
   - Existing warehouse cut rule is reflected as +3 inches per planned cut.
*/
(function(){
'use strict';
if(window.__RUNLU_CARPET_LINE_RC_V093__)return;
window.__RUNLU_CARPET_LINE_RC_V093__=true;

const JOBS_STORE='runlu_deerfoot_flooring_jobs_v1';
const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const DRAFT_PREFIX='runlu_carpet_line_rc_draft_v093:';
const CUT_ALLOWANCE_FT=0.25; // 3 inches per cut
let observer=null,lastCombinedCount=-1,lastDecoratedAt=0;

const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').trim().toUpperCase();
const obj=v=>v&&typeof v==='object'?v:{};
const num=v=>v==null||String(v).trim()===''?null:(Number.isFinite(Number(v))?Number(v):null);
function payload(r){return obj(r?.payload)}
function activeJobId(){return localStorage.getItem(ACTIVE_STORE)||''}
function readJSON(storage,key,fallback){try{const x=JSON.parse(storage.getItem(key)||'null');return x==null?fallback:x}catch(_){return fallback}}
function savedItem(i){const jobs=readJSON(localStorage,JOBS_STORE,[]);const id=activeJobId();const job=Array.isArray(jobs)?jobs.find(x=>String(x?.id||'')===String(id)):null;return obj(job?.items?.[i])}
function draftKey(){return DRAFT_PREFIX+(activeJobId()||'no-active-job')}
function readDraft(){const x=readJSON(sessionStorage,draftKey(),{});return x&&typeof x==='object'?x:{}}
function writeDraft(x){try{sessionStorage.setItem(draftKey(),JSON.stringify(x||{}))}catch(_){}}
function draftItem(i){return obj(readDraft()[String(i)])}
function setDraftField(i,k,v){const d=readDraft(),row=obj(d[String(i)]);row[k]=v;d[String(i)]=row;writeDraft(d)}
function clearDraft(){try{sessionStorage.removeItem(draftKey())}catch(_){} }
function shiftDraftAfterRemove(removeIndex){const d=readDraft(),next={};Object.entries(d).forEach(([k,v])=>{const n=Number(k);if(!Number.isInteger(n)||n===removeIndex)return;next[String(n>removeIndex?n-1:n)]=v});writeDraft(next)}
function valueFor(i,k){const d=draftItem(i);if(Object.prototype.hasOwnProperty.call(d,k))return String(d[k]??'');return String(savedItem(i)[k]??'')}

function combined(){try{const api=window.RUNLUCarpetRCTrackingV092;return api&&typeof api.combined==='function'?api.combined():[]}catch(_){return []}}
function entryFor(rc){const key=norm(rc);if(!key)return null;return combined().find(x=>norm(x?.rc)===key)||null}
function inventoryFacts(entry){const ip=payload(entry?.inventory),rp=payload(entry?.registry);return {
  rc:String(entry?.rc||rp.rcNumber||entry?.inventory?.record_id||'').trim(),
  current:num(ip.length),
  original:num(ip.originalLength??rp.originalLength),
  location:String(ip.location||'').trim(),
  colour:String(ip.colour||rp.colour||'').trim(),
  lot:String(ip.lot||rp.dyeLot||'').trim(),
  width:num(ip.width??rp.width),
  widthText:String(ip.width||rp.width||'').trim(),
  collection:String(ip.collection||rp.collection||'').trim(),
  mill:String(ip.manufacturerRoll||rp.manufacturerRoll||'').trim(),
  po:String(ip.po||rp.poNumber||'').trim(),
  inventoryStatus:String(ip.status||'').trim(),
  registryStatus:String(rp.status||'').trim(),
  hasInventory:!!entry?.inventory,
  hasRegistry:!!entry?.registry
}}

function normalizeMarks(s){return String(s||'').replace(/[′’]/g,"'").replace(/[″“”]/g,'"').replace(/×/g,'x')}
function parseMeasure(s){
  let t=normalizeMarks(s).trim().toLowerCase();if(!t)return null;
  let feet=0,inches=0,found=false;
  const fm=t.match(/(-?\d+(?:\.\d+)?)\s*(?:'|ft\b|feet\b|foot\b)/i);if(fm){feet=Number(fm[1]);found=true}
  const im=t.match(/(\d+(?:\.\d+)?)\s*(?:"|in\b|inch(?:es)?\b)/i);if(im){inches=Number(im[1]);found=true}
  if(found&&Number.isFinite(feet)&&Number.isFinite(inches))return feet+inches/12;
  const n=Number(t.replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:null;
}
function parseCuts(text){
  const raw=normalizeMarks(text).trim();if(!raw)return [];
  const parts=raw.split(/\n|,|;|\+|\/\//).map(x=>x.trim()).filter(Boolean);
  return parts.map(part=>{
    let width=null,lenText=part;
    const xi=part.toLowerCase().lastIndexOf('x');
    if(xi>0){width=parseMeasure(part.slice(0,xi));lenText=part.slice(xi+1)}
    const length=parseMeasure(lenText);return length!=null&&length>=0?{raw:part,width,length}:null;
  }).filter(Boolean)
}
function feetInches(v){
  const n=num(v);if(n==null)return '—';const neg=n<0;let totalIn=Math.round(Math.abs(n)*12);let ft=Math.floor(totalIn/12),inch=totalIn%12;return `${neg?'−':''}${ft}′${inch?` ${inch}″`:''}`
}
function planning(facts,cuts){
  if(!cuts.length)return {kind:'neutral',label:'Enter planned cuts',detail:'Availability check will include +3″ per cut.',required:null,remaining:null};
  const cutFeet=cuts.reduce((s,x)=>s+x.length,0),allowance=cuts.length*CUT_ALLOWANCE_FT,required=cutFeet+allowance;
  const widthProblem=facts.width!=null&&cuts.some(x=>x.width!=null&&x.width>facts.width+0.001);
  if(widthProblem)return {kind:'bad',label:'WIDTH CHECK',detail:`At least one planned cut is wider than this ${facts.widthText||facts.width+' ft'} roll.`,required,remaining:facts.current==null?null:facts.current-required};
  if(facts.current==null)return {kind:'warn',label:'LENGTH NOT AVAILABLE',detail:`Cuts ${feetInches(cutFeet)} + allowance ${feetInches(allowance)} = ${feetInches(required)} required.`,required,remaining:null};
  const remaining=facts.current-required;
  if(remaining>=-0.0001)return {kind:'good',label:'ENOUGH',detail:`Need ${feetInches(required)} including ${cuts.length} × 3″ allowance · projected remaining ${feetInches(Math.max(0,remaining))}.`,required,remaining};
  return {kind:'bad',label:`SHORT ${feetInches(Math.abs(remaining))}`,detail:`Need ${feetInches(required)} including ${cuts.length} × 3″ allowance · current ${feetInches(facts.current)}.`,required,remaining};
}

function ensureStyle(){
  if(by('rc093style'))return;
  const s=document.createElement('style');s.id='rc093style';s.textContent=`
.rc093strip{grid-column:1/-1;margin-top:4px;padding:9px 10px;border:1px solid #d6e2dc;border-radius:9px;background:#f8fbf9}.rc093top{display:grid;grid-template-columns:minmax(130px,.75fr) minmax(180px,1.25fr) auto;gap:8px;align-items:end}.rc093top label{font-size:8px;font-weight:900;color:#53625a}.rc093top input{display:block;width:100%;margin-top:3px;padding:7px;border:1px solid #cbd7d1;border-radius:7px;background:#fff}.rc093tag{align-self:end;display:inline-flex;align-items:center;justify-content:center;min-height:32px;padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap;background:#eef2f0;color:#56655e}.rc093tag.good{background:#e6f3eb;color:#235b3e}.rc093tag.warn{background:#fff1d8;color:#7a5600}.rc093tag.bad{background:#fff0ee;color:#8b3a32}.rc093facts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:8px}.rc093fact{padding:7px 8px;border-radius:7px;background:#fff;border:1px solid #e0e8e4;min-width:0}.rc093fact small{display:block;font-size:7.5px;font-weight:900;color:#7a857f;text-transform:uppercase}.rc093fact b{display:block;margin-top:2px;color:#264b3c;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rc093plan{margin-top:7px;font-size:9px;color:#5e6b65;line-height:1.4}.rc093plan b{color:#314d41}.rc093hint{margin-top:5px;font-size:8px;color:#7b8580}.rc093loading{opacity:.65}@media(max-width:850px){.rc093facts{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:600px){.rc093top{grid-template-columns:1fr 1fr}.rc093top .rc093tag{grid-column:1/-1;justify-self:start}.rc093facts{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)
}
function ensureDatalist(){let dl=by('rc093rolls');if(!dl){dl=document.createElement('datalist');dl.id='rc093rolls';document.body.appendChild(dl)}const xs=combined();if(xs.length===lastCombinedCount&&dl.options.length)return;lastCombinedCount=xs.length;dl.innerHTML=xs.slice().sort((a,b)=>String(a.rc||'').localeCompare(String(b.rc||''),undefined,{numeric:true,sensitivity:'base'})).map(x=>{const f=inventoryFacts(x),label=[f.collection,f.colour,f.location&&('Loc '+f.location),f.current!=null&&feetInches(f.current)].filter(Boolean).join(' · ');return `<option value="${esc(f.rc)}" label="${esc(label)}"></option>`}).join('')}
function setLineItemField(i,k,v){setDraftField(i,k,v);try{if(typeof window.editItem==='function')window.editItem(i,k,v)}catch(e){console.warn('[RC093] editItem mirror failed',e)}}
function renderStrip(strip,index){
  const rc=String(strip.querySelector('[data-rc093="rc"]')?.value||'').trim(),cutsText=String(strip.querySelector('[data-rc093="cuts"]')?.value||'').trim(),tag=strip.querySelector('.rc093tag'),factsBox=strip.querySelector('.rc093facts'),planBox=strip.querySelector('.rc093plan');
  if(!rc){tag.className='rc093tag';tag.textContent='CARPET OPTIONAL';factsBox.innerHTML='<div class="rc093fact"><small>RC lookup</small><b>Choose a Finance RC</b></div>';planBox.innerHTML='Select an RC to see current roll length, location, colour and dye lot.';return}
  const entry=entryFor(rc);
  if(!entry){tag.className='rc093tag bad';tag.textContent='RC NOT FOUND';factsBox.innerHTML=`<div class="rc093fact"><small>RC</small><b>${esc(norm(rc))}</b></div>`;planBox.innerHTML='No matching Finance RC registry or Carpet Inventory roll is currently loaded.';return}
  const f=inventoryFacts(entry),cuts=parseCuts(cutsText);
  if(!f.hasInventory){tag.className='rc093tag warn';tag.textContent='AWAITING RECEIVING';factsBox.innerHTML=`<div class="rc093fact"><small>RC</small><b>${esc(f.rc||'—')}</b></div><div class="rc093fact"><small>Colour</small><b>${esc(f.colour||'—')}</b></div><div class="rc093fact"><small>Dye Lot</small><b>${esc(f.lot||'—')}</b></div><div class="rc093fact"><small>Mill Roll</small><b>${esc(f.mill||'—')}</b></div><div class="rc093fact"><small>PO</small><b>${esc(f.po||'—')}</b></div><div class="rc093fact"><small>Status</small><b>Finance RC only</b></div>`;planBox.innerHTML='RC is registered, but no physical Carpet Inventory roll is linked yet. Length sufficiency cannot be checked.';return}
  const p=planning(f,cuts);tag.className='rc093tag '+p.kind;tag.textContent=p.label;factsBox.innerHTML=`<div class="rc093fact"><small>Current Length</small><b>${esc(feetInches(f.current))}</b></div><div class="rc093fact"><small>Location</small><b>${esc(f.location||'—')}</b></div><div class="rc093fact"><small>Colour</small><b>${esc(f.colour||'—')}</b></div><div class="rc093fact"><small>Dye Lot</small><b>${esc(f.lot||'—')}</b></div><div class="rc093fact"><small>Mill Roll</small><b>${esc(f.mill||'—')}</b></div><div class="rc093fact"><small>PO</small><b>${esc(f.po||'—')}</b></div>`;planBox.innerHTML=`<b>${esc(p.label)}</b> · ${esc(p.detail)}`;
}
function attachRow(row,index){
  if(row.querySelector('.rc093strip'))return;
  const strip=document.createElement('div');strip.className='rc093strip';strip.dataset.rc093Index=String(index);strip.innerHTML=`<div class="rc093top"><label>Carpet RC Number <span style="font-weight:500">(optional)</span><input data-rc093="rc" list="rc093rolls" autocomplete="off" placeholder="Select / type RC…"></label><label>Planned Cuts<input data-rc093="cuts" autocomplete="off" placeholder="e.g. 12x24′9″, 12x17′"></label><span class="rc093tag">CARPET OPTIONAL</span></div><div class="rc093facts"></div><div class="rc093plan"></div><div class="rc093hint">Planning check only · does not reserve or deduct inventory. Saved with this Job line when you press Save Job.</div>`;
  row.appendChild(strip);
  const rcInput=strip.querySelector('[data-rc093="rc"]'),cutsInput=strip.querySelector('[data-rc093="cuts"]');rcInput.value=valueFor(index,'rcNumber');cutsInput.value=valueFor(index,'plannedCuts');
  rcInput.addEventListener('input',()=>{setLineItemField(index,'rcNumber',rcInput.value.trim());renderStrip(strip,index)});rcInput.addEventListener('change',()=>{setLineItemField(index,'rcNumber',rcInput.value.trim());renderStrip(strip,index)});
  cutsInput.addEventListener('input',()=>{setLineItemField(index,'plannedCuts',cutsInput.value.trim());renderStrip(strip,index)});
  renderStrip(strip,index)
}
function decorate(){
  ensureStyle();ensureDatalist();const editor=by('itemsEditor');if(!editor)return;Array.from(editor.querySelectorAll(':scope > .itemRow')).forEach((row,i)=>attachRow(row,i));lastDecoratedAt=Date.now()
}
function renderAllStrips(){ensureDatalist();document.querySelectorAll('.rc093strip').forEach((strip,i)=>renderStrip(strip,Number(strip.dataset.rc093Index??i)))}
async function refreshRCData(){try{const api=window.RUNLUCarpetRCTrackingV092;if(api&&typeof api.refresh==='function')await api.refresh(false)}catch(e){console.warn('[RC093] RC refresh',e?.message||e)}ensureDatalist();renderAllStrips()}
function patchBaseFunctions(){
  if(window.__RUNLU_RC093_PATCHED__)return;window.__RUNLU_RC093_PATCHED__=true;
  if(typeof window.removeItem==='function'){const orig=window.removeItem;window.removeItem=function(i){shiftDraftAfterRemove(Number(i));const r=orig.apply(this,arguments);setTimeout(decorate,0);return r}}
  if(typeof window.addItem==='function'){const orig=window.addItem;window.addItem=function(){const r=orig.apply(this,arguments);setTimeout(decorate,0);return r}}
  if(typeof window.saveJob==='function'){const orig=window.saveJob;window.saveJob=function(){const r=orig.apply(this,arguments);clearDraft();setTimeout(decorate,30);return r}}
  if(typeof window.loadEditor==='function'){const orig=window.loadEditor;window.loadEditor=function(){const r=orig.apply(this,arguments);setTimeout(decorate,0);return r}}
}
function install(){
  ensureStyle();patchBaseFunctions();decorate();
  observer=new MutationObserver(()=>{const now=Date.now();if(now-lastDecoratedAt>20)setTimeout(decorate,0)});observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;if(b.dataset?.page==='jobs'||/Jobs\s*&?\s*Orders|Jobs/i.test(b.textContent||''))setTimeout(()=>{decorate();refreshRCData()},120)},true);
  window.addEventListener('focus',()=>{if(by('jobs')?.classList?.contains('active'))refreshRCData()});
  let tries=0;const timer=setInterval(()=>{tries++;decorate();ensureDatalist();if(combined().length){renderAllStrips();clearInterval(timer)}else if(tries===3)refreshRCData();else if(tries>25)clearInterval(timer)},400);
}
window.RUNLUCarpetLineRCV093={version:'0.3.93',decorate,refresh:refreshRCData,parseCuts,planning,cutAllowanceFeet:CUT_ALLOWANCE_FT,readOnlyInventory:true};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
