/* RUNLU Flooring OS · Carpet RC Tracking V0.3.92
   Company-simulation phase: Finance supplies the RC number; Flooring OS records and tracks it.
   Design boundaries:
   - No automatic RC-number generation in this phase.
   - Existing Carpet Inventory remains the source of truth for physical roll quantity/location/status.
   - This module never rewrites Carpet Inventory roll IDs, cut history, transfers, shipping, PO or receiving.
   - Finance RC assignments are stored separately in runlu_carpet_rc_registry_v1 and linked by RC number.
   - RC registry entries are never silently overwritten; duplicate RC numbers are rejected.
*/
(function(){
'use strict';
if(window.__RUNLU_CARPET_RC_TRACKING_V092__)return;
window.__RUNLU_CARPET_RC_TRACKING_V092__=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const INVENTORY_DATASET='runlu_carpet_inventory_v52';
const OPERATIONS_DATASET='runlu_operations_log_v52';
const REGISTRY_DATASET='runlu_carpet_rc_registry_v1';
const PAGE='rcTracking';
let sb=null,session=null,inventory=[],operations=[],registry=[],busy=false,lastSync='',lastError='',mode='all';

const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').trim().toUpperCase();
const obj=v=>v&&typeof v==='object'?v:{};
const num=v=>v==null||String(v).trim()===''?null:(Number.isFinite(Number(v))?Number(v):null);
const today=()=>new Date().toISOString().slice(0,10);
const stamp=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function payload(r){return obj(r?.payload)}
function rcOfInventory(r){const p=payload(r);return String(p.roll||r.record_id||'').trim()}
function opTime(r){const p=payload(r);return p.updatedAt||p.completedAt||p.appliedAt||p.createdAt||r.updated_at||''}
function fmtLength(v){const n=num(v);return n==null?'—':`${n.toFixed(n%1?2:0)} ft`}
function inventoryMap(){const m=new Map();inventory.forEach(r=>{const k=norm(rcOfInventory(r));if(k&&!m.has(k))m.set(k,r)});return m}
function registryMap(){const m=new Map();registry.forEach(r=>{const p=payload(r),k=norm(p.rcNumber||r.record_id);if(k&&!m.has(k))m.set(k,r)});return m}
function opsFor(rc){const k=norm(rc);if(!k)return[];return operations.filter(r=>norm(payload(r).roll)===k)}
function combined(){
  const im=inventoryMap(),rm=registryMap(),out=[];
  registry.forEach(rr=>{const rp=payload(rr),rc=String(rp.rcNumber||rr.record_id||'').trim(),ir=im.get(norm(rc))||null;out.push({key:'registry:'+rr.record_id,rc,registry:rr,inventory:ir,source:'registry'})});
  inventory.forEach(ir=>{const rc=rcOfInventory(ir),k=norm(rc);if(!rm.has(k))out.push({key:'inventory:'+ir.record_id,rc,registry:null,inventory:ir,source:'inventory'})});
  return out;
}
function rowState(x){
  const rp=payload(x.registry);
  if(String(rp.status||'').toUpperCase()==='VOID')return 'void';
  if(x.registry&&x.inventory)return 'linked';
  if(x.registry&&!x.inventory)return 'awaiting';
  if(x.inventory&&!x.registry)return 'existing';
  return 'review';
}
function lifecycle(x){
  const ops=opsFor(x.rc),cuts=ops.filter(r=>String(payload(r).type||'').toLowerCase()==='carpet cutting'),latest=ops.slice().sort((a,b)=>String(opTime(b)).localeCompare(String(opTime(a))))[0]||null;
  return {count:ops.length,cuts:cuts.length,latest};
}
function mergedFields(x){
  const rp=payload(x.registry),ip=payload(x.inventory),life=lifecycle(x);
  return {
    rc:x.rc,
    mill:ip.manufacturerRoll||rp.manufacturerRoll||'',
    po:ip.po||rp.poNumber||'',
    collection:ip.collection||rp.collection||'',
    colour:ip.colour||rp.colour||'',
    lot:ip.lot||rp.dyeLot||'',
    width:ip.width||rp.width||'',
    original:ip.originalLength??rp.originalLength??'',
    current:ip.length??'',
    location:ip.location||'',
    inventoryStatus:ip.status||'',
    registryStatus:rp.status||'',
    assignedAt:rp.assignedAt||'',
    notes:rp.notes||'',
    life
  };
}

function ensureStyle(){
  if(by('rc092style'))return;
  const s=document.createElement('style');s.id='rc092style';s.textContent=`
#rcTracking .rc092head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.rc092state{font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:#e7f3ec;color:#245841}.rc092state.warn{background:#fff1d8;color:#7a5600}.rc092state.err{background:#fff0ee;color:#8b3a32}.rc092stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.rc092stat{padding:10px;border:1px solid #dce5e0;border-radius:9px;background:#fff;text-align:center}.rc092stat b{display:block;font-size:20px;color:#244f3e}.rc092stat span{font-size:8px;font-weight:900;color:#748078}.rc092tools{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:10px 0}.rc092tools input,.rc092tools select{padding:8px;border:1px solid #ccd8d2;border-radius:7px;background:#fff;min-width:170px}.rc092list{display:grid;gap:7px}.rc092row{border:1px solid #dce5e0;border-radius:9px;background:#fff;overflow:hidden}.rc092main{display:grid;grid-template-columns:115px 120px 100px minmax(170px,1.5fr) 130px 120px 24px;gap:8px;align-items:center;width:100%;padding:9px 10px;border:0;background:#fff;text-align:left;color:#26322c;font:inherit;cursor:pointer}.rc092main:hover{background:#fafcfb}.rc092main b{color:#173d30}.rc092main small{display:block;color:#75817b;margin-top:2px}.rc092badge{display:inline-flex;max-width:100%;padding:4px 6px;border-radius:999px;font-size:8px;font-weight:900;white-space:nowrap}.rc092badge.linked{background:#e7f3ec;color:#245841}.rc092badge.awaiting{background:#fff1d8;color:#7a5600}.rc092badge.existing{background:#edf4f8;color:#315f82}.rc092badge.void{background:#f1eeee;color:#6f4a4a}.rc092arrow{font-size:17px;color:#6d7973;text-align:center}.rc092detail{display:none;padding:10px;border-top:1px solid #e4ebe7;background:#fbfcfc}.rc092detail.on{display:block}.rc092grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px 14px}.rc092grid small{display:block;color:#6d7973;line-height:1.45}.rc092grid b{color:#31483d}.rc092form{margin-top:14px;border-top:1px solid #e2e9e5;padding-top:14px}.rc092formgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.rc092formgrid .wide{grid-column:span 2}.rc092formgrid .full{grid-column:1/-1}.rc092form label{font-size:8px;font-weight:900;color:#58665f}.rc092form input,.rc092form textarea{display:block;width:100%;margin-top:4px;padding:8px;border:1px solid #ccd8d2;border-radius:7px;background:#fff}.rc092form textarea{min-height:68px;resize:vertical}.rc092note{margin-top:8px;color:#6d7973;font-size:9px;line-height:1.45}.rc092connect{margin-top:10px;padding:11px;border:1px solid #d9e4de;border-left:4px solid #315f82;border-radius:8px;background:#f8fbf9}.rc092connect.warn{border-left-color:#a97816;background:#fff9ea}.rc092connect.err{border-left-color:#8b3a32;background:#fff4f2}.rc092connect .rc092login{display:flex;gap:7px;flex-wrap:wrap;align-items:end;margin-top:8px}.rc092connect label{font-size:8px;font-weight:900;color:#53625a}.rc092connect input{display:block;margin-top:3px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;min-width:190px}.rc092msg{margin-top:8px;font-size:10px;font-weight:800;color:#315f82}.rc092msg.err{color:#8b3a32}@media(max-width:900px){.rc092main{grid-template-columns:100px 100px 80px minmax(150px,1fr) 110px 95px 20px}.rc092formgrid{grid-template-columns:1fr 1fr}.rc092grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.rc092stats{grid-template-columns:1fr 1fr}.rc092main{grid-template-columns:88px 86px minmax(120px,1fr) 90px 18px}.rc092main .rc092po,.rc092main .rc092life{display:none}.rc092formgrid{grid-template-columns:1fr}.rc092formgrid .wide,.rc092formgrid .full{grid-column:auto}.rc092grid{grid-template-columns:1fr}.rc092tools input,.rc092tools select{min-width:0;flex:1 1 140px}}
`;document.head.appendChild(s);
}
function ensurePage(){
  if(by(PAGE))return;
  const main=document.querySelector('main');if(!main)return;
  const p=document.createElement('section');p.id=PAGE;p.className='page';p.innerHTML=`
<div class="card"><div class="rc092head"><div><h2>Carpet Roll RC Tracking</h2><div class="muted">Company simulation · Finance assigns the RC number. Flooring OS records, validates and follows the roll through inventory activity. No automatic RC generation in this phase.</div></div><div><span id="rc092state" class="rc092state warn">SIGN IN REQUIRED</span> <button id="rc092refresh" type="button" class="action primary">Refresh</button></div></div><div id="rc092connect"></div><div id="rc092private" hidden><div id="rc092stats" class="rc092stats"></div><div class="rc092tools"><input id="rc092search" placeholder="Search RC, mill roll, PO, product, colour"><select id="rc092mode"><option value="all">All rolls</option><option value="linked">Finance RC + Inventory linked</option><option value="awaiting">Awaiting Receiving</option><option value="existing">Existing Inventory / legacy</option><option value="void">Void RC</option></select></div><div id="rc092list" class="rc092list"></div><div class="rc092form"><h3>Register Finance RC</h3><div class="muted">Enter the RC supplied by Finance. Saving the registry entry does not change Carpet Inventory; an exact RC match links automatically when the physical roll appears in Inventory.</div><div class="rc092formgrid"><div><label>RC Number *</label><input id="rc092rc" autocomplete="off" placeholder="e.g. RC2352"></div><div><label>PO Number</label><input id="rc092po" autocomplete="off"></div><div><label>Manufacturer / Mill Roll</label><input id="rc092mill" autocomplete="off"></div><div><label>Assigned Date</label><input id="rc092date" type="date"></div><div class="wide"><label>Product / Collection</label><input id="rc092collection"></div><div class="wide"><label>Colour</label><input id="rc092colour"></div><div><label>Dye Lot / Lot</label><input id="rc092lot"></div><div><label>Width</label><input id="rc092width" placeholder="12"></div><div><label>Original Length (ft)</label><input id="rc092length" inputmode="decimal"></div><div><label>Assigned By</label><input id="rc092assignedBy" value="Finance"></div><div class="full"><label>Notes</label><textarea id="rc092notes"></textarea></div></div><div class="actions"><button type="button" id="rc092save" class="action primary">Save Finance RC</button><button type="button" id="rc092clear" class="action">Clear</button></div><div id="rc092msg" class="rc092msg"></div><div class="rc092note">RC numbers are unique within this company data set. Existing numbers are never silently overwritten. Inventory quantities, locations, cut history, PO and receiving records remain untouched by this registry.</div></div></div></div>`;
  main.appendChild(p);
  by('rc092search')?.addEventListener('input',render);
  by('rc092mode')?.addEventListener('change',()=>{mode=by('rc092mode').value||'all';render()});
  by('rc092refresh')?.addEventListener('click',()=>refresh(true));
  by('rc092save')?.addEventListener('click',saveAssignment);
  by('rc092clear')?.addEventListener('click',clearForm);
  by('rc092date').value=today();
}
function ensureNav(){
  const nav=by('nav');if(!nav||nav.querySelector(`[data-page="${PAGE}"]`))return;
  const b=document.createElement('button');b.type='button';b.dataset.page=PAGE;b.textContent='RC Registry';b.addEventListener('click',open);
  const fulfillment=nav.querySelector('[data-page="warehouseFulfillment"]'),warehouse=nav.querySelector('[data-page="warehouse"]');
  if(fulfillment)fulfillment.insertAdjacentElement('afterend',b);else if(warehouse)warehouse.insertAdjacentElement('afterend',b);else nav.appendChild(b);
}
function ensureModule(){
  const grid=document.querySelector('#command .grid3');if(!grid||by('rc092module'))return;
  const b=document.createElement('button');b.id='rc092module';b.className='module';b.innerHTML='<span class="ico">🎟️</span><strong>Carpet RC Tracking</strong><small>Finance-assigned RC registry · mill roll / PO / Carpet Inventory lifecycle.</small>';b.addEventListener('click',open);
  const anchor=by('mw091module')||Array.from(grid.children).find(x=>/Warehouse Fulfillment/.test(x.textContent));anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b);
}
function open(){ensurePage();ensureNav();ensureModule();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE));document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE));render();refresh(false);window.scrollTo({top:0,behavior:'smooth'})}
function setState(text,cls=''){const e=by('rc092state');if(!e)return;e.textContent=text;e.className='rc092state'+(cls?' '+cls:'')}
function showPrivate(on){const e=by('rc092private');if(e)e.hidden=!on}
function setMessage(text,err=false){const e=by('rc092msg');if(!e)return;e.textContent=text||'';e.className='rc092msg'+(err?' err':'')}
function renderConnect(){
  const box=by('rc092connect');if(!box)return;
  if(lastError){box.className='rc092connect err';box.innerHTML=`<b>RC Tracking connection</b><div class="muted">${esc(lastError)}</div>`;return}
  if(!session){box.className='rc092connect warn';box.innerHTML='<b>Staff sign-in required</b><div class="muted">RC data is internal company workflow data. Use the same Flooring staff account.</div><div class="rc092login"><label>Email<input id="rc092email" type="email" autocomplete="username"></label><label>Password<input id="rc092password" type="password" autocomplete="current-password"></label><button id="rc092signin" type="button" class="action primary">Sign in</button></div>';by('rc092signin')?.addEventListener('click',signIn);return}
  box.className='rc092connect';box.innerHTML='<b>Company RC workflow</b><div class="muted">Authenticated internal view. Finance assignment registry is separate from physical Carpet Inventory and links by exact RC number.</div>';
}
function render(){
  ensureStyle();ensurePage();ensureNav();ensureModule();showPrivate(!!session);renderConnect();if(!session)return;
  const all=combined(),linked=all.filter(x=>rowState(x)==='linked').length,awaiting=all.filter(x=>rowState(x)==='awaiting').length;
  const st=by('rc092stats');if(st)st.innerHTML=`<div class="rc092stat"><b>${inventory.length}</b><span>CARPET INVENTORY ROLLS</span></div><div class="rc092stat"><b>${registry.length}</b><span>FINANCE RC REGISTRY</span></div><div class="rc092stat"><b>${linked}</b><span>LINKED</span></div><div class="rc092stat"><b>${awaiting}</b><span>AWAITING RECEIVING</span></div>`;
  const q=String(by('rc092search')?.value||'').trim().toLowerCase();mode=by('rc092mode')?.value||mode||'all';
  let view=all.filter(x=>mode==='all'||rowState(x)===mode);
  if(q)view=view.filter(x=>{const f=mergedFields(x);return [f.rc,f.mill,f.po,f.collection,f.colour,f.lot,f.location,f.inventoryStatus,f.registryStatus].some(v=>String(v||'').toLowerCase().includes(q))});
  view.sort((a,b)=>String(a.rc||'').localeCompare(String(b.rc||''),undefined,{numeric:true,sensitivity:'base'}));
  const list=by('rc092list');if(!list)return;
  list.innerHTML=view.length?view.map((x,i)=>{const f=mergedFields(x),s=rowState(x),life=f.life,latest=life.latest?payload(life.latest):null,label=s==='linked'?'Linked':s==='awaiting'?'Awaiting Receiving':s==='existing'?'Existing Inventory':'Void';return `<div class="rc092row" data-rc092-row="${i}"><button type="button" class="rc092main" aria-expanded="false"><span><b>${esc(f.rc||'—')}</b><small>${x.registry?'Finance registry':'Inventory record'}</small></span><span><b>${esc(f.mill||'—')}</b><small>Mill roll</small></span><span class="rc092po"><b>${esc(f.po||'—')}</b><small>PO</small></span><span><b>${esc(f.collection||'Unspecified')}</b><small>${esc(f.colour||'—')}</small></span><span><b>${esc(f.location||'—')}</b><small>${esc(f.current!==''?fmtLength(f.current):fmtLength(f.original))}</small></span><span class="rc092life"><span class="rc092badge ${s}">${esc(label)}</span><small>${life.cuts} cut${life.cuts===1?'':'s'} · ${life.count} event${life.count===1?'':'s'}</small></span><span class="rc092arrow">›</span></button><div class="rc092detail"><div class="rc092grid"><small><b>Identity</b><br>RC ${esc(f.rc||'—')}<br>Manufacturer roll ${esc(f.mill||'—')}<br>Dye lot ${esc(f.lot||'—')}</small><small><b>Procurement</b><br>PO ${esc(f.po||'—')}<br>Finance assigned ${esc(f.assignedAt||'—')}<br>Registry ${esc(f.registryStatus||'Legacy / not separately registered')}</small><small><b>Physical roll</b><br>Width ${esc(f.width||'—')}<br>Original ${esc(fmtLength(f.original))}<br>Current ${esc(fmtLength(f.current))}</small><small><b>Warehouse</b><br>Location ${esc(f.location||'—')}<br>Status ${esc(f.inventoryStatus||'Awaiting inventory record')}</small><small><b>Lifecycle</b><br>${life.cuts} carpet cut${life.cuts===1?'':'s'}<br>${life.count} matched operation${life.count===1?'':'s'}${latest?'<br>Latest: '+esc(latest.type||'Activity')+' · '+esc(opTime(life.latest)||'—'):''}</small><small><b>Notes</b><br>${esc(f.notes||'—')}</small></div></div></div>`}).join(''):'<div class="muted" style="padding:22px;text-align:center;border:1px dashed #cad7d1;border-radius:8px">No RC records match this view.</div>';
  list.querySelectorAll('.rc092main').forEach(btn=>btn.addEventListener('click',()=>{const d=btn.nextElementSibling,on=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',on?'true':'false');d?.classList.toggle('on',on)}));
}

function loadSdk(){return new Promise((resolve,reject)=>{if(window.supabase?.createClient)return resolve();let s=by('rc092SupabaseSdk');if(s){let n=0;const t=setInterval(()=>{if(window.supabase?.createClient){clearInterval(t);resolve()}else if(++n>50){clearInterval(t);reject(new Error('Supabase client unavailable'))}},120);return}s=document.createElement('script');s.id='rc092SupabaseSdk';s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=()=>window.supabase?.createClient?resolve():reject(new Error('Supabase client unavailable'));s.onerror=()=>reject(new Error('Could not load Supabase client'));document.head.appendChild(s)})}
async function client(){if(sb)return sb;await loadSdk();sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});sb.auth.onAuthStateChange((_event,s)=>{session=s;if(!s){inventory=[];operations=[];registry=[];setState('SIGN IN REQUIRED','warn');render()}else setTimeout(()=>refresh(false),0)});return sb}
async function signIn(){const email=String(by('rc092email')?.value||'').trim(),password=String(by('rc092password')?.value||'');if(!email||!password){setMessage('Enter staff email and password.',true);return}try{const c=await client(),r=await c.auth.signInWithPassword({email,password});if(r.error)throw r.error;session=r.data?.session||null;lastError='';await refresh(true)}catch(e){lastError=String(e?.message||e);render()}}
async function refresh(manual=false){
  if(busy)return;busy=true;lastError='';setState('SYNCING…');
  const rb=by('rc092refresh');if(rb){rb.disabled=true;rb.textContent='Refreshing…'}
  try{
    const c=await client();session=(await c.auth.getSession()).data?.session||null;if(!session){setState('SIGN IN REQUIRED','warn');render();return}
    const [ir,or,rr]=await Promise.all([
      c.from('warehouse_records').select('record_id,payload,updated_at').eq('dataset_key',INVENTORY_DATASET).is('deleted_at',null).order('updated_at',{ascending:false}).limit(500),
      c.from('warehouse_records').select('record_id,payload,updated_at').eq('dataset_key',OPERATIONS_DATASET).is('deleted_at',null).order('updated_at',{ascending:false}).limit(500),
      c.from('warehouse_records').select('record_id,payload,updated_at').eq('dataset_key',REGISTRY_DATASET).is('deleted_at',null).order('updated_at',{ascending:false}).limit(500)
    ]);
    if(ir.error)throw ir.error;if(or.error)throw or.error;if(rr.error)throw rr.error;
    inventory=Array.isArray(ir.data)?ir.data:[];operations=Array.isArray(or.data)?or.data:[];registry=Array.isArray(rr.data)?rr.data:[];lastSync=stamp();setState(`LIVE · ${inventory.length} ROLLS`);render();if(manual)setMessage(`RC Tracking refreshed at ${lastSync}.`);
  }catch(e){lastError=String(e?.message||e);setState('CONNECTION ERROR','err');render();if(manual)setMessage(lastError,true)}finally{busy=false;if(rb){rb.disabled=false;rb.textContent='Refresh'}}
}
function clearForm(){['rc092rc','rc092po','rc092mill','rc092collection','rc092colour','rc092lot','rc092width','rc092length','rc092notes'].forEach(id=>{const e=by(id);if(e)e.value=''});if(by('rc092date'))by('rc092date').value=today();if(by('rc092assignedBy'))by('rc092assignedBy').value='Finance';setMessage('')}
async function saveAssignment(){
  setMessage('');
  try{
    const c=await client();session=(await c.auth.getSession()).data?.session||null;if(!session){setMessage('Staff sign-in is required.',true);return}
    const rc=norm(by('rc092rc')?.value);if(!rc){setMessage('RC Number is required.',true);return}
    if(registry.some(r=>norm(payload(r).rcNumber||r.record_id)===rc)){setMessage(`${rc} is already in the Finance RC Registry. Nothing was overwritten.`,true);return}
    const linked=inventory.find(r=>norm(rcOfInventory(r))===rc)||null;
    const length=num(by('rc092length')?.value);
    const p={rcNumber:rc,status:'ASSIGNED',assignedByDepartment:String(by('rc092assignedBy')?.value||'Finance').trim()||'Finance',assignedAt:String(by('rc092date')?.value||today()),poNumber:String(by('rc092po')?.value||'').trim(),manufacturerRoll:String(by('rc092mill')?.value||'').trim(),collection:String(by('rc092collection')?.value||'').trim(),colour:String(by('rc092colour')?.value||'').trim(),dyeLot:String(by('rc092lot')?.value||'').trim(),width:String(by('rc092width')?.value||'').trim(),originalLength:length,notes:String(by('rc092notes')?.value||'').trim(),workflow:'COMPANY_SIMULATION_FINANCE_ASSIGNED',linkedInventoryRecordId:linked?.record_id||'',createdAt:new Date().toISOString(),version:'0.3.92'};
    const insert={user_id:session.user.id,dataset_key:REGISTRY_DATASET,record_id:rc,payload:p,version:1,device_id:'flooring-os-rc-v092',origin:'flooring-os-company-sim'};
    const r=await c.from('warehouse_records').insert(insert);if(r.error)throw r.error;
    await refresh(false);clearForm();setMessage(linked?`${rc} registered and linked to existing Carpet Inventory.`:`${rc} registered. Status: Awaiting Receiving / Carpet Inventory match.`);
  }catch(e){const msg=String(e?.message||e);setMessage(/duplicate|23505/i.test(msg)?'That RC Number already exists. Nothing was overwritten.':msg,true)}
}
function install(){ensureStyle();ensurePage();ensureNav();ensureModule();render();client().then(async c=>{session=(await c.auth.getSession()).data?.session||null;render();if(session)refresh(false)}).catch(e=>{lastError=String(e?.message||e);setState('CONNECTOR UNAVAILABLE','err');render()});document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(b&&(b.dataset?.page===PAGE||b.id==='rc092module'))setTimeout(()=>refresh(false),120)},true);window.addEventListener('focus',()=>{if(by(PAGE)?.classList?.contains('active'))refresh(false)})}
window.RUNLUCarpetRCTrackingV092={version:'0.3.92',open,refresh,combined,readOnlyInventory:true,autoGenerateRC:false,registryDataset:REGISTRY_DATASET};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
