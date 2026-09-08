/* RUNLU Flooring OS · Material Work Orchestration V0.9.1
   Read-only management view for Stock Picking and Carpet Cutting tasks generated from explicit Inventory Holds.
   Flooring plans/observes; Warehouse executes. This layer never changes Warehouse inventory or task status.
*/
(function(){
'use strict';
if(window.__runluMaterialWorkSyncV091)return;
window.__runluMaterialWorkSyncV091=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const ENV='training';
const PAGE='warehouseFulfillment';
const CACHE='runlu-flooring-material-work-v091';
let sb=null,rows=[],busy=false,lastSync='',offline=false;
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,f)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x==null?f:x}catch(_){return f}};
const status=s=>String(s||'Waiting');
function counts(xs=rows){return {waiting:xs.filter(x=>status(x.status)==='Waiting').length,progress:xs.filter(x=>['In Progress','Partial'].includes(status(x.status))).length,completed:xs.filter(x=>status(x.status)==='Completed').length,review:xs.filter(x=>x.review_required).length}}
function active(){return by(PAGE)?.classList?.contains('active')}

async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));
  if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});
  return sb;
}
async function refresh(manual=false){
  if(busy)return;busy=true;paintState('SYNCING…');
  try{
    const c=await client(),s=(await c.auth.getSession()).data?.session||null;
    if(!s){offline=true;paintState('SIGN IN REQUIRED');return}
    const q=await c.from('flooring_warehouse_material_tasks').select('*').eq('environment',ENV).order('created_at',{ascending:false});
    if(q.error)throw q.error;
    rows=Array.isArray(q.data)?q.data:[];lastSync=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});offline=false;
    localStorage.setItem(CACHE,JSON.stringify({rows,lastSync}));render();
    if(manual)alert('Warehouse fulfillment plan refreshed.');
  }catch(e){
    console.warn('[Material Work V091]',e?.message||e);offline=true;const c=read(CACHE,{});rows=Array.isArray(c.rows)?c.rows:rows;lastSync=c.lastSync||lastSync;render();paintState('OFFLINE CACHE');if(manual)alert('Fulfillment refresh failed: '+(e?.message||e));
  }finally{busy=false}
}
function style(){if(by('mw091style'))return;const s=document.createElement('style');s.id='mw091style';s.textContent=`
#warehouseFulfillment .mw091head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.mw091state{font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#e7f3ec;color:#245841}.mw091state.warn{background:#fff1d8;color:#7a5600}.mw091stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.mw091stat{border:1px solid #dce5e0;border-radius:8px;padding:10px;text-align:center;background:#fff}.mw091stat b{display:block;font-size:20px;color:#244f3e}.mw091stat span{font-size:9px;color:#748078}.mw091tools{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.mw091tools select,.mw091tools input{padding:8px;border:1px solid #ccd8d2;border-radius:7px;background:#fff;min-width:160px}.mw091list{display:grid;gap:8px}.mw091row{display:grid;grid-template-columns:130px minmax(180px,1.4fr) 150px 130px 105px;gap:10px;align-items:center;padding:10px;border:1px solid #dce5e0;border-radius:9px;background:#fff}.mw091row b{color:#234b3b}.mw091row small{display:block;color:#748078;margin-top:3px}.mw091badge{font-size:9px;font-weight:900;padding:5px 7px;border-radius:999px;background:#edf3f0;display:inline-block}.mw091review{color:#8a4c00;font-weight:800}.mw091empty{padding:25px;text-align:center;color:#718078;border:1px dashed #cbd7d1;border-radius:8px}@media(max-width:850px){.mw091stats{grid-template-columns:1fr 1fr}.mw091row{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}
function ensure(){
  style();if(by(PAGE))return;
  const main=document.querySelector('main');if(!main)return;
  const p=document.createElement('section');p.id=PAGE;p.className='page';p.innerHTML=`<div class="card"><div class="mw091head"><div><h2>Warehouse Fulfillment</h2><p class="muted">Stock Picking and Carpet Cutting plans created only from explicit Flooring inventory Holds. Warehouse OS is the execution authority.</p></div><span id="mw091state" class="mw091state">CONNECTING</span></div><div id="mw091stats" class="mw091stats"></div><div class="mw091tools"><select id="mw091type"><option value="all">All work types</option><option value="Stock Picking">Stock Picking</option><option value="Carpet Cutting">Carpet Cutting</option></select><select id="mw091status"><option value="open">Open work</option><option value="all">All status</option><option value="Waiting">Waiting</option><option value="In Progress">In Progress / Partial</option><option value="Completed">Completed</option></select><input id="mw091search" placeholder="Search Job, PO, product, roll"><button type="button" class="action primary" id="mw091refresh">Refresh</button></div><div id="mw091list" class="mw091list"></div></div>`;main.appendChild(p);
  by('mw091type').addEventListener('change',render);by('mw091status').addEventListener('change',render);by('mw091search').addEventListener('input',render);by('mw091refresh').addEventListener('click',()=>refresh(true));
  const nav=by('nav');if(nav&&!nav.querySelector(`[data-page="${PAGE}"]`)){const b=document.createElement('button');b.type='button';b.dataset.page=PAGE;b.textContent='Fulfillment';b.addEventListener('click',open);const wa=nav.querySelector('[data-page="warehouseActivity"]');wa?wa.insertAdjacentElement('afterend',b):nav.appendChild(b)}
  const grid=document.querySelector('#command .grid3');if(grid&&!by('mw091module')){const b=document.createElement('button');b.id='mw091module';b.className='module';b.innerHTML='<span class="ico">📦</span><strong>Warehouse Fulfillment</strong><small>Live Stock Picking and Carpet Cutting plan/status.</small>';b.addEventListener('click',open);const wa=by('wa711module');wa?wa.insertAdjacentElement('afterend',b):grid.appendChild(b)}
}
function open(){ensure();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE));document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE));render();refresh(false);window.scrollTo({top:0,behavior:'smooth'})}
function view(){
  const type=by('mw091type')?.value||'all',sf=by('mw091status')?.value||'open',q=(by('mw091search')?.value||'').trim().toLowerCase();let xs=rows.slice();
  if(type!=='all')xs=xs.filter(x=>x.task_type===type);
  if(sf==='open')xs=xs.filter(x=>!['Completed','Cancelled'].includes(status(x.status)));else if(sf==='In Progress')xs=xs.filter(x=>['In Progress','Partial'].includes(status(x.status)));else if(sf!=='all')xs=xs.filter(x=>status(x.status)===sf);
  if(q)xs=xs.filter(x=>[x.task_type,x.item_name,x.colour,x.roll_number,x.location,x.job_number,x.po_number,status(x.status)].some(v=>String(v||'').toLowerCase().includes(q)));
  return xs;
}
function render(){
  ensure();const c=counts(),stats=by('mw091stats');if(stats)stats.innerHTML=`<div class="mw091stat"><b>${c.waiting}</b><span>Waiting</span></div><div class="mw091stat"><b>${c.progress}</b><span>In Progress</span></div><div class="mw091stat"><b>${c.completed}</b><span>Completed</span></div><div class="mw091stat"><b>${c.review}</b><span>Review Required</span></div>`;
  const list=by('mw091list');if(!list)return;const xs=view();list.innerHTML=xs.length?xs.map(x=>`<div class="mw091row"><div><b>${esc(x.task_type)}</b><small>${x.po_number?'PO '+esc(x.po_number):'No PO'}${x.job_number?' · Job '+esc(x.job_number):''}</small></div><div><b>${esc(x.item_name||x.item_kind||'Inventory')}</b><small>${esc([x.colour,x.roll_number&&'Roll '+x.roll_number].filter(Boolean).join(' · ')||'—')}</small></div><div><b>${esc(x.quantity)} ${esc(x.unit)}</b><small>${esc(x.location?'Location '+x.location:'Location not recorded')}</small></div><div><span class="mw091badge">${esc(status(x.status))}</span>${x.review_required?'<small class="mw091review">Review required</small>':''}</div><div><small>Warehouse OS</small></div></div>`).join(''):'<div class="mw091empty">No warehouse fulfillment work matches this view.</div>';paintState();
}
function paintState(force){const e=by('mw091state');if(!e)return;const t=force||(offline?'OFFLINE CACHE':`LIVE · ${lastSync||'READY'}`);if(e.textContent!==t)e.textContent=t;e.classList.toggle('warn',!/LIVE|READY/.test(t))}
function install(){const c=read(CACHE,{});rows=Array.isArray(c.rows)?c.rows:[];lastSync=c.lastSync||'';ensure();render();document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(b&&(b.dataset?.page===PAGE||b.id==='mw091module'))setTimeout(()=>refresh(false),120)},true);window.addEventListener('focus',()=>{if(active())refresh(false)});window.addEventListener('pageshow',()=>{ensure();if(active())refresh(false)});setInterval(()=>{if(document.visibilityState==='visible'&&active())refresh(false)},20000);client().then(()=>refresh(false)).catch(()=>paintState('CONNECTOR UNAVAILABLE'))}
window.RUNLUMaterialWorkSyncV091={refresh,counts,version:'0.9.1'};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
