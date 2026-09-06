/* RUNLU Deerfoot Flooring OS · V0.3.80 PO Inventory Holds
   Turns the existing Warehouse OS Smart Inventory Picker selection into a controlled PO Hold workflow.
   - Warehouse inventory remains the physical source of truth and is not decremented here.
   - A Hold is written to the existing RLS-protected flooring_inventory_holds table.
   - Hold quantity uses the Warehouse inventory unit. If PO and Warehouse units differ, quantity is never guessed.
   - Release changes Hold status; it does not rewrite Warehouse history or PO history.
*/
(function(){
'use strict';
if(window.__RUNLU_PO_INVENTORY_HOLDS_V080__)return;
window.__RUNLU_PO_INVENTORY_HOLDS_V080__=true;

const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH_STORAGE='runlu-flooring-auth-v1';
const TABLE='flooring_inventory_holds';
const ENV='training';
let sb=null,session=null,holds=[],state='CONNECTING',observer=null,timer=0;
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const str=v=>String(v??'').trim();
const num=v=>{const x=Number(String(v??'').replace(/[$,]/g,''));return Number.isFinite(x)?x:0};
const display=v=>num(v).toLocaleString('en-CA',{maximumFractionDigits:3});
function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function rows(){return [...document.querySelectorAll('[data-po-native-row]')]}
function field(row,f){return row?.querySelector(`[data-f="${f}"]`)}
function fieldValue(row,f){return str(field(row,f)?.value)}
function inventory(){try{return window.RUNLUSmartInventoryPickerV072?.inventory?.()||[]}catch(_){return []}}
function recordMeta(item){if(!item?.id)return null;const m=String(item.id).match(/^(carpet|stock):(.*)$/);if(!m||!m[2])return null;return {datasetKey:m[1]==='carpet'?'runlu_carpet_inventory_v52':'runlu_inventory_records_v21',recordId:m[2]}}
function sourceHas(ref,value){const a=str(ref).toLowerCase(),b=str(value).toLowerCase();return !!a&&!!b&&a.includes(b)}
function matchInventory(row){
  const list=inventory(),ref=fieldValue(row,'sourceRef'),sku=fieldValue(row,'sku'),style=fieldValue(row,'style'),colour=fieldValue(row,'colour');
  if(!list.length||!row)return null;
  let hit=list.find(x=>x.roll&&sourceHas(ref,'roll '+x.roll));if(hit)return hit;
  hit=list.find(x=>x.manufacturerRoll&&sourceHas(ref,x.manufacturerRoll));if(hit)return hit;
  hit=list.find(x=>x.sku&&sku&&str(x.sku).toLowerCase()===sku.toLowerCase());if(hit)return hit;
  const candidates=list.filter(x=>style&&str(x.name).toLowerCase()===style.toLowerCase()&&(!colour||!x.colour||str(x.colour).toLowerCase()===colour.toLowerCase()));
  if(candidates.length===1)return candidates[0];
  hit=candidates.find(x=>x.location&&sourceHas(ref,x.location));return hit||null;
}
function rowIndex(row){return Math.max(0,rows().indexOf(row))}
function holdKey(row,item){const j=activeJob(),meta=recordMeta(item),base=str(j?.id||j?.jobNumber||'no-job');return `job:${base}|inventory:${meta?.recordId||'unknown'}|line:${rowIndex(row)}`}
function currentPO(){return fieldSafe('poNumberSafe')}
function fieldSafe(id){return str(by(id)?.value)}
function currentHold(row,item){
  const meta=recordMeta(item),j=activeJob(),key=holdKey(row,item),po=currentPO();if(!meta)return null;
  return holds.find(h=>h.status==='Held'&&h.hold_key===key)||holds.find(h=>h.status==='Held'&&h.warehouse_dataset_key===meta.datasetKey&&String(h.warehouse_record_id)===String(meta.recordId)&&((j?.id&&h.job_id===j.id)||(j?.jobNumber&&h.job_number===j.jobNumber))&&(!po||!h.po_number||h.po_number===po))||null;
}
function heldTotal(item,excludeId=''){const meta=recordMeta(item);if(!meta)return 0;return holds.filter(h=>h.status==='Held'&&h.id!==excludeId&&h.warehouse_dataset_key===meta.datasetKey&&String(h.warehouse_record_id)===String(meta.recordId)).reduce((s,h)=>s+num(h.quantity),0)}
function effectiveAvailable(item,current=null){return Math.max(0,num(item?.available)-heldTotal(item,current?.id||''))}
function sameUnit(a,b){return str(a).toUpperCase()===str(b).toUpperCase()}

async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));
  if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});return sb;
}
async function refresh(){
  try{
    const c=await client(),s=await c.auth.getSession();session=s?.data?.session||null;
    if(!session){holds=[];state='SIGN IN REQUIRED';renderAll();return false}
    const q=await c.from(TABLE).select('*').eq('environment',ENV).order('created_at',{ascending:false});if(q.error)throw q.error;
    holds=Array.isArray(q.data)?q.data:[];state='SYNCED';renderAll();return true;
  }catch(e){console.error('RUNLU Hold refresh failed',e);state='OFFLINE';renderAll();return false}
}
async function saveHold(row){
  const item=matchInventory(row),meta=recordMeta(item),j=activeJob();if(!item||!meta)return alert('Select a live Warehouse inventory record on this PO line first.');
  if(!j)return alert('Select an active Job / Order first.');
  if(!session&&!(await refresh()))return alert('Connect / sign in to Warehouse inventory before creating a Hold.');
  const existing=currentHold(row,item),input=row.querySelector('[data-v080-hold-qty]'),qty=num(input?.value),unit=str(item.unit||'EA').toUpperCase();
  if(!(qty>0))return alert(`Enter the Hold quantity in ${unit}.`);
  const max=effectiveAvailable(item,existing);if(qty>max+.0001)return alert(`Hold exceeds available inventory. Maximum available for this line is ${display(max)} ${unit}.`);
  const uid=session.user.id,stamp=new Date().toISOString(),payload={user_id:uid,environment:ENV,warehouse_dataset_key:meta.datasetKey,warehouse_record_id:meta.recordId,item_kind:str(item.kind),item_name:str(item.name),colour:str(item.colour),roll_number:str(item.roll||item.manufacturerRoll),location:str(item.location),job_id:str(j.id),job_number:str(j.jobNumber),po_number:currentPO(),hold_key:holdKey(row,item),quantity:qty,unit,status:'Held',note:fieldValue(row,'sourceRef'),updated_by:uid,updated_at:stamp,released_at:null,consumed_at:null};
  try{
    const c=await client();let res;
    if(existing)res=await c.from(TABLE).update(payload).eq('id',existing.id).select().single();
    else res=await c.from(TABLE).insert([{...payload,created_by:uid,created_at:stamp}]).select().single();
    if(res.error)throw res.error;await refresh();markRow(row,item);return true;
  }catch(e){console.error('RUNLU Hold save failed',e);alert('Hold could not be saved. Existing PO and Warehouse inventory were not changed.');return false}
}
async function releaseHold(id){
  const h=holds.find(x=>x.id===id);if(!h)return;if(!session&&!(await refresh()))return;
  if(!confirm(`Release Hold for ${h.item_name||h.roll_number||'inventory'} · ${display(h.quantity)} ${h.unit}?`))return;
  try{const c=await client(),res=await c.from(TABLE).update({status:'Released',released_at:new Date().toISOString(),updated_at:new Date().toISOString(),updated_by:session.user.id}).eq('id',id);if(res.error)throw res.error;await refresh()}catch(e){console.error(e);alert('Hold release failed. No Warehouse quantity was changed.')}
}
function markRow(row,item){
  const badge=row.querySelector('[data-sip72-picked]');if(!badge)return;const h=currentHold(row,item);badge.textContent=h?`Warehouse selected · HOLD ${display(h.quantity)} ${h.unit} · ${fieldValue(row,'sourceRef')}`:`Warehouse selected · NOT HELD · ${fieldValue(row,'sourceRef')}`;
}
function holdControl(row){
  const item=matchInventory(row),old=row.querySelector('[data-v080-hold-control]');if(!item){old?.remove();return}
  const meta=recordMeta(item);if(!meta){old?.remove();return}
  const h=currentHold(row,item),other=heldTotal(item,h?.id||''),available=effectiveAvailable(item,h),unit=str(item.unit||'EA').toUpperCase(),poQty=fieldValue(row,'qty'),poUnit=fieldValue(row,'unit'),suggest=h?display(h.quantity):(sameUnit(poUnit,unit)&&num(poQty)>0?display(poQty):'');
  let box=old;if(!box){box=document.createElement('div');box.dataset.v080HoldControl='1';box.className='v080holdControl';row.appendChild(box)}
  box.innerHTML=`<div class="v080holdTop"><div><b>Inventory Hold</b><small>${esc(item.kind)} · ${esc(item.roll?'Roll '+item.roll:(item.sku||item.name))} · ${esc(item.location||'No location')}</small></div><span class="v080holdBadge ${h?'held':'open'}">${h?'HELD':'NOT HELD'}</span></div><div class="v080holdMetrics"><span>Warehouse available <b>${display(item.available)} ${esc(unit)}</b></span><span>Other Flooring holds <b>${display(other)} ${esc(unit)}</b></span><span>Available for this line <b>${display(available)} ${esc(unit)}</b></span></div><div class="v080holdActions"><label>Hold Qty (${esc(unit)})<input data-v080-hold-qty inputmode="decimal" value="${esc(suggest)}" placeholder="Enter ${esc(unit)}"></label><button type="button" class="action primary" data-v080-hold-save>${h?'Update Hold':'Create Hold'}</button>${h?`<button type="button" class="action" data-v080-hold-release="${esc(h.id)}">Release</button>`:''}</div>${!sameUnit(poUnit,unit)&&poQty?`<div class="v080holdWarn">PO quantity is ${esc(poQty)} ${esc(poUnit.toUpperCase())}, while Warehouse hold is tracked in ${esc(unit)}. Hold quantity is intentionally not auto-converted.</div>`:''}${state!=='SYNCED'?`<div class="v080holdWarn">Hold cloud status: ${esc(state)}.</div>`:''}`;
  box.querySelector('[data-v080-hold-save]')?.addEventListener('click',()=>saveHold(row));box.querySelector('[data-v080-hold-release]')?.addEventListener('click',e=>releaseHold(e.currentTarget.dataset.v080HoldRelease));markRow(row,item);
}
function ensureStyle(){if(by('v080holdStyle'))return;const s=document.createElement('style');s.id='v080holdStyle';s.textContent=`
.v080holdControl{grid-column:1/-1;border:1px solid #d9e5df;border-left:4px solid #315f82;border-radius:8px;background:#f8fbf9;padding:8px;margin-top:2px}.v080holdTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v080holdTop b{color:#173d30;font-size:10px}.v080holdTop small{display:block;color:#6d7973;font-size:8.5px;margin-top:2px}.v080holdBadge{border-radius:999px;padding:4px 7px;font-size:7.5px;font-weight:900}.v080holdBadge.held{background:#e9f3ee;color:#1f5a45}.v080holdBadge.open{background:#fff5d9;color:#79570f}.v080holdMetrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:7px}.v080holdMetrics span{border:1px solid #e1e8e4;border-radius:6px;background:#fff;padding:6px;color:#68766f;font-size:8px}.v080holdMetrics b{display:block;color:#173d30;margin-top:2px}.v080holdActions{display:flex;gap:7px;align-items:end;flex-wrap:wrap;margin-top:7px}.v080holdActions label{font-size:8.5px;font-weight:900;color:#53625a}.v080holdActions input{display:block;margin-top:3px;width:120px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff}.v080holdWarn{margin-top:7px;padding:7px;border-left:3px solid #a97816;background:#fff7e2;color:#6a571d;font-size:8.5px;line-height:1.4}#v080HoldLedger{border-left:5px solid #315f82}.v080holdLedgerHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v080holdLedgerHead h3{margin:0}.v080holdLedgerRows{margin-top:9px;border:1px solid #dfe7e3;border-radius:8px;overflow:hidden}.v080holdLedgerRow{display:grid;grid-template-columns:minmax(170px,1.4fr) 95px 95px 1fr auto;gap:7px;align-items:center;padding:8px;border-top:1px solid #e8edeb;font-size:9px}.v080holdLedgerRow:first-child{border-top:0}.v080holdLedgerRow small{display:block;color:#6d7973;margin-top:2px}.v080holdState{border-radius:999px;padding:4px 7px;background:#e9f3ee;color:#1f5a45;font-size:7.5px;font-weight:900}.v080holdEmpty{padding:9px;color:#6d7973;font-size:9px}@media(max-width:650px){.v080holdMetrics{grid-template-columns:1fr}.v080holdLedgerRow{grid-template-columns:1fr 80px}.v080holdLedgerRow>*:nth-child(3),.v080holdLedgerRow>*:nth-child(4){display:none}}
`;document.head.appendChild(s)}
function activeJobHolds(){const j=activeJob();if(!j)return[];return holds.filter(h=>h.status==='Held'&&((j.id&&h.job_id===j.id)||(j.jobNumber&&h.job_number===j.jobNumber)))}
function ensureLedger(){
  const p=by('purchasing');if(!p)return null;let box=by('v080HoldLedger');if(box)return box;box=document.createElement('div');box.id='v080HoldLedger';box.className='card';const editor=by('poSafeEditorTitle')?.closest('.card');editor?editor.parentNode.insertBefore(box,editor):p.appendChild(box);box.addEventListener('click',e=>{const b=e.target.closest('[data-v080-ledger-release]');if(b)releaseHold(b.dataset.v080LedgerRelease)});return box;
}
function renderLedger(){const box=ensureLedger();if(!box)return;const j=activeJob(),xs=activeJobHolds();box.innerHTML=`<div class="v080holdLedgerHead"><div><h3>PO INVENTORY HOLDS</h3><div class="muted">Selected Warehouse inventory reserved for the active Order · V0.3.80</div></div><span class="tag">${esc(state)}</span></div>${!j?'<div class="v080holdEmpty">Select a Job / Order to review its inventory Holds.</div>':xs.length?`<div class="v080holdLedgerRows">${xs.map(h=>`<div class="v080holdLedgerRow"><span><b>${esc(h.item_name||h.item_kind||'Inventory')}</b><small>${esc([h.colour,h.roll_number&&'Roll '+h.roll_number,h.location].filter(Boolean).join(' · ')||'—')}</small></span><span><b>${display(h.quantity)} ${esc(h.unit)}</b></span><span>${esc(h.po_number?'PO '+h.po_number:'PO draft')}</span><span>${esc(h.note||'')}</span><button type="button" class="action" data-v080-ledger-release="${esc(h.id)}">Release</button></div>`).join('')}</div>`:'<div class="v080holdEmpty">No active Flooring OS Hold is recorded for this Order.</div>'}<div class="notice" style="margin-top:9px"><b>Control:</b> Warehouse quantity is not decremented by a Hold. The Hold is a reservation layer used by Flooring OS; release is explicit and auditable.</div>`}
function renderRows(){rows().forEach(holdControl)}
function renderAll(){ensureStyle();renderRows();renderLedger()}
function observeRows(){
  const root=by('poNativeItems');if(!root||observer?.__root===root)return;
  try{observer?.disconnect()}catch(_){}observer=new MutationObserver(()=>schedule());observer.__root=root;observer.observe(root,{childList:true,subtree:true});
}
function schedule(delay=80){clearTimeout(timer);timer=setTimeout(()=>{observeRows();renderAll()},delay)}
function install(){
  ensureStyle();document.addEventListener('input',e=>{if(e.target?.closest?.('[data-po-native-row]'))schedule(180)},true);document.addEventListener('change',e=>{if(e.target?.closest?.('[data-po-native-row]')||e.target?.id==='poNumberSafe')schedule(100)},true);document.addEventListener('click',e=>{if(e.target?.closest?.('#poAddNativeItemBtn,[data-page="purchasing"],#poNewBtn'))schedule(160)},true);
  setInterval(()=>{observeRows();if(by('purchasing'))renderAll()},1600);setTimeout(()=>refresh(),250);setTimeout(()=>schedule(),500);window.RUNLUPOInventoryHoldsV080={refresh,holds:()=>holds.slice(),render:renderAll,version:'0.3.80'};return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
