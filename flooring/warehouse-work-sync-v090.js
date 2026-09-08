/* RUNLU Flooring OS · Warehouse Work Orchestration V0.9.0
   Phase 1: one PO -> one cloud Supplier Pickup work plan -> Warehouse execution ->
   live Pickup status + append-only execution events in Warehouse Activity.
   Planning never changes inventory. Warehouse remains the execution authority.
*/
(function(){
'use strict';
if(window.__runluWarehouseWorkSyncV090)return;
window.__runluWarehouseWorkSyncV090=true;

const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH_STORAGE='runlu-flooring-auth-v1';
const ENV='training';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
const CACHE='runlu-flooring-warehouse-work-v090';
let sb=null,session=null,tasks=[],events=[],busy=false,lastSync='';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?f:v}catch(_){return f}};
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
function uiStatus(s){return s==='Scheduled'?'Waiting':String(s||'Waiting')}
function pageActive(id){const p=by(id);return !!(p&&(p.classList.contains('active')||!p.classList.contains('hidden')))}
function pos(){const x=read(PO_STORE,[]);return Array.isArray(x)?x:[]}
function snaps(){const x=read(SNAP_STORE,{});return x&&typeof x==='object'?x:{}}
function taskByPO(po){return tasks.find(t=>String(t.po_number)===String(po))||null}
function compactItems(a){return (Array.isArray(a)?a:[]).map(x=>({style:x?.style||x?.product||x?.description||'',colour:x?.colour||x?.color||'',sku:x?.sku||'',qty:x?.qty??x?.quantity??'',unit:String(x?.unit||'').toLowerCase(),supplier:x?.supplier||'',size:x?.size||''})).filter(x=>x.style||x.sku||x.qty)}

async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));
  if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});
  session=(await sb.auth.getSession()).data?.session||null;
  sb.auth.onAuthStateChange((_e,s)=>{session=s;setTimeout(()=>{paintConnection();if(s)refresh(false)},0)});
  return sb;
}
async function enrichPlans(){
  if(!session)return;
  const snap=snaps();
  for(const po of pos().filter(x=>x?.poNumber&&x?.status!=='Draft'&&x?.supplier&&x?.status!=='Cancelled')){
    const num=Number(String(po.poNumber).replace(/\D/g,''));if(!num)continue;
    const s=snap[String(po.poNumber)]||{};
    const args={p_environment:ENV,p_po_id:uuid(po.id)?po.id:null,p_po_number:num,p_job_id:po.jobId||'',p_job_number:po.jobNumber||'',p_customer_name:po.customerName||'',p_supplier:po.supplier||'Supplier',p_sales_rep:po.salesRep||'',p_fulfillment_method:/deliver/i.test(String(po.fulfillment||s.fulfillment||''))?'Supplier Delivery':'Pickup',p_requested_date:po.requestedDate||s.requestedDate||po.expectedDate||null,p_purchase_type:/stock/i.test(String(po.purchaseType||s.purchaseType||''))?'Stock':'Job-specific',p_items:compactItems(po.items)};
    const r=await sb.rpc('flooring_create_supplier_task',args);if(r.error)throw r.error;
  }
}
async function refresh(manual){
  if(busy)return;busy=true;paintConnection('SYNCING…');
  try{
    await client();session=(await sb.auth.getSession()).data?.session||null;
    if(!session){paintConnection('SIGN IN REQUIRED');return}
    await enrichPlans();
    const [tr,er]=await Promise.all([
      sb.from('flooring_supplier_tasks').select('*').eq('environment',ENV).order('requested_date',{ascending:true}).order('created_at',{ascending:true}),
      sb.from('flooring_warehouse_work_events').select('*').eq('environment',ENV).order('occurred_at',{ascending:false}).limit(100)
    ]);
    if(tr.error)throw tr.error;if(er.error)throw er.error;
    tasks=tr.data||[];events=er.data||[];lastSync=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    localStorage.setItem(CACHE,JSON.stringify({tasks,events,lastSync}));
    paintAll();
    if(manual)alert('Warehouse work plan refreshed from cloud.');
  }catch(e){
    console.warn('[Warehouse Work V090]',e?.message||e);
    const c=read(CACHE,{});tasks=Array.isArray(c.tasks)?c.tasks:tasks;events=Array.isArray(c.events)?c.events:events;lastSync=c.lastSync||lastSync;paintAll();
    paintConnection('OFFLINE CACHE');
    if(manual)alert('Warehouse work refresh failed: '+(e?.message||e));
  }finally{busy=false}
}

function ensureStyle(){if(by('ww090style'))return;const s=document.createElement('style');s.id='ww090style';s.textContent=`
.ww090bar{margin:10px 0;padding:10px 12px;border:1px solid #cddbd4;border-radius:10px;background:#f5faf7;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.ww090bar b{color:#173d30}.ww090pill{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:#e5f2eb;color:#245841}.ww090pill.warn{background:#fff2d8;color:#7b5700}.ww090event{display:grid;grid-template-columns:160px minmax(0,1fr) 110px;gap:10px;padding:10px;border-top:1px solid #e0e7e3;align-items:center}.ww090event:first-child{border-top:0}.ww090event b{color:#234b3b}.ww090event small{display:block;color:#718078;margin-top:3px}.ww090events{margin-top:12px}.ww090events h3{margin-bottom:4px}@media(max-width:760px){.ww090event{grid-template-columns:1fr}.ww090event>div:last-child{text-align:left!important}}
`;document.head.appendChild(s)}
function ensurePickupBar(){
  const page=by('supplierPickupPage');if(!page||by('ww090pickupBar'))return;
  const first=page.querySelector('.card')||page.firstElementChild;if(!first)return;
  const bar=document.createElement('div');bar.id='ww090pickupBar';bar.className='ww090bar';bar.innerHTML='<div><b>Cloud Warehouse Work Plan</b><div class="muted" id="ww090pickupMeta">PO creates the plan once; Warehouse changes the execution status.</div></div><div style="display:flex;gap:7px;align-items:center"><span id="ww090pickupState" class="ww090pill">CONNECTING</span><button type="button" class="action" id="ww090pickupRefresh">Refresh Work Plan</button></div>';
  first.appendChild(bar);by('ww090pickupRefresh')?.addEventListener('click',()=>refresh(true));
}
function decoratePickup(){
  ensurePickupBar();
  document.querySelectorAll('#supplierPickupPage .pickupPlanTask').forEach(row=>{
    const m=(row.textContent||'').match(/PO\s*#\s*(\d+)/i);if(!m)return;const t=taskByPO(m[1]);if(!t)return;
    const badge=row.querySelector('.pickupSafeStatus');if(badge&&badge.textContent!==uiStatus(t.status)){badge.textContent=uiStatus(t.status);badge.dataset.cloudWork='1'}
  });
  const waiting=tasks.filter(t=>['Waiting','Scheduled'].includes(t.status)).length;
  const progress=tasks.filter(t=>['In Progress','Partial'].includes(t.status)).length;
  const ready=tasks.filter(t=>['Picked Up','Ready'].includes(t.status)).length;
  const completed=tasks.filter(t=>t.status==='Completed').length;
  if(by('pickupScheduledSafe')){by('pickupScheduledSafe').textContent=waiting;const l=by('pickupScheduledSafe').parentElement?.querySelector('span');if(l&&l.textContent!=='Waiting')l.textContent='Waiting'}
  if(by('pickupInProgressSafe'))by('pickupInProgressSafe').textContent=progress;
  if(by('pickupReadySafe'))by('pickupReadySafe').textContent=ready;
  if(by('pickupCompletedSafe'))by('pickupCompletedSafe').textContent=completed;
  if(by('pickupTotalSafe'))by('pickupTotalSafe').textContent=tasks.length;
  const meta=by('ww090pickupMeta');if(meta)meta.textContent=`${tasks.length} cloud task${tasks.length===1?'':'s'} · last sync ${lastSync||'—'} · Waiting is plan only; execution changes become Activity.`;
}
function ensureEventCard(){
  const page=by('warehouseActivity');if(!page)return null;let card=by('ww090activityEvents');if(card)return card;
  card=document.createElement('div');card.id='ww090activityEvents';card.className='card ww090events';card.innerHTML='<div class="statusLine"><div><h3>Warehouse Work Status Timeline</h3><div class="muted">Execution facts from the shared cloud work plan. Waiting plans are intentionally excluded.</div></div><span class="ww090pill">CLOUD EVENTS</span></div><div id="ww090eventList"></div>';
  page.appendChild(card);return card;
}
function renderEvents(){
  const card=ensureEventCard();if(!card)return;const list=by('ww090eventList');if(!list)return;
  const html=events.length?events.map(e=>`<div class="ww090event"><div><b>${esc(e.event_type||'Warehouse Work')}</b><small>${esc(e.occurred_at?new Date(e.occurred_at).toLocaleString():'—')}</small></div><div>${e.po_number?'PO '+esc(e.po_number):''}${e.job_number?' · Job '+esc(e.job_number):''}${e.customer_name?' · '+esc(e.customer_name):''}${e.supplier?' · '+esc(e.supplier):''}</div><div style="text-align:right"><span class="wa-badge">${esc(uiStatus(e.to_status))}</span></div></div>`).join(''):'<div class="muted" style="padding:14px 0">No execution status events yet. Waiting work plans do not create activity.</div>';
  if(list.innerHTML!==html)list.innerHTML=html;
}
function paintConnection(force){
  ensurePickupBar();const el=by('ww090pickupState');if(!el)return;const text=force||(session?`LIVE · ${lastSync||'READY'}`:'SIGN IN REQUIRED');if(el.textContent!==text)el.textContent=text;el.classList.toggle('warn',!/LIVE|READY/.test(text));
}
function paintAll(){ensureStyle();decoratePickup();renderEvents();paintConnection()}
function install(){
  ensureStyle();
  const cached=read(CACHE,{});tasks=Array.isArray(cached.tasks)?cached.tasks:[];events=Array.isArray(cached.events)?cached.events:[];lastSync=cached.lastSync||'';paintAll();
  document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b)return;const relevant=b.dataset?.page==='supplierPickupPage'||b.dataset?.page==='warehouseActivity'||/^(Pickup|Warehouse Activity)$/.test(b.textContent?.trim()||'');if(relevant){setTimeout(paintAll,40);setTimeout(()=>refresh(false),120)}},true);
  document.addEventListener('change',e=>{if(e.target.closest?.('#supplierPickupPage'))setTimeout(paintAll,0)},true);
  window.addEventListener('focus',()=>refresh(false));window.addEventListener('pageshow',()=>refresh(false));
  setInterval(()=>{if(document.visibilityState==='visible'&&(pageActive('supplierPickupPage')||pageActive('warehouseActivity')))refresh(false)},20000);
  client().then(()=>refresh(false)).catch(()=>paintConnection('CONNECTOR UNAVAILABLE'));
}
window.RUNLUWarehouseWorkSyncV090={refresh,taskByPO,version:'0.9.0'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
