/* RUNLU Flooring OS · Warehouse Activity Auth/Refresh Feedback V0.7.12
   Fixes the silent-refresh UX around the read-only Warehouse Activity bridge.
   Important boundary: warehouse.runlu.ca and runlu.ca do not share browser localStorage.
   This helper reuses the existing Flooring Supabase auth storage, never stores passwords,
   never weakens RLS, and never writes Warehouse inventory/activity data.
*/
(function(){
'use strict';
if(window.__RUNLU_WAREHOUSE_ACTIVITY_AUTH_V0712__)return;
window.__RUNLU_WAREHOUSE_ACTIVITY_AUTH_V0712__=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const DATASET='runlu_operations_log_v52';
let sb=null,busy=false,visibleCount=null,lastError='';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function client(){
  if(sb)return sb;
  for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,200));
  if(!window.supabase?.createClient)throw new Error('Supabase client unavailable');
  sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});
  sb.auth.onAuthStateChange(()=>setTimeout(()=>render(),0));
  return sb;
}
async function session(){try{return (await (await client()).auth.getSession()).data?.session||null}catch(_){return null}}

function ensureStyle(){
  if(by('wa712style'))return;
  const s=document.createElement('style');s.id='wa712style';s.textContent=`
#wa712connect{margin:10px 0 2px;padding:10px 11px;border:1px solid #d9e4de;border-left:4px solid #315f82;border-radius:8px;background:#f8fbf9;color:#53625a;font-size:9.5px;line-height:1.45}
#wa712connect.ok{border-left-color:#1f5a45;background:#f4faf7}#wa712connect.warn{border-left-color:#a97816;background:#fff9ea}#wa712connect.err{border-left-color:#8b3a32;background:#fff4f2}
#wa712connect b{color:#173d30}#wa712connect .wa712row{display:flex;gap:7px;align-items:end;flex-wrap:wrap;margin-top:8px}#wa712connect label{font-size:8px;font-weight:900;color:#53625a}#wa712connect input{display:block;margin-top:3px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff;min-width:190px}#wa712connect small{display:block;color:#718078;margin-top:4px}.wa-state.auth{background:#fff1d6;color:#7a5700}.wa-state.err{background:#fff0ee;color:#8b3a32}
#wa711refresh[disabled]{opacity:.62;cursor:wait}`;document.head.appendChild(s);
}
function box(){
  const page=by('warehouseActivity');if(!page)return null;
  let b=by('wa712connect');if(b)return b;
  b=document.createElement('div');b.id='wa712connect';
  const stats=by('wa711stats');stats?.parentNode?.insertBefore(b,stats);
  return b;
}
function setState(text,cls=''){
  const s=by('wa711state');if(!s)return;
  s.textContent=text;s.classList.remove('off','auth','err');if(cls)s.classList.add(cls);
}
function setButton(on,label){const b=by('wa711refresh');if(!b)return;b.disabled=!!on;b.textContent=label||'Refresh'}

async function render(){
  ensureStyle();const b=box();if(!b)return;
  const s=await session();
  if(!s){
    visibleCount=null;
    setState('SIGN IN REQUIRED','auth');
    b.className='warn';
    b.innerHTML=`<b>Connect Warehouse Feed</b><small>Warehouse OS is signed in at warehouse.runlu.ca, but this runlu.ca Flooring OS page has a separate browser session. Sign in here once with the same staff account so the RLS-protected Warehouse activity feed can be read.</small><div class="wa712row"><label>Staff Email<input id="wa712email" type="email" autocomplete="username"></label><label>Password<input id="wa712password" type="password" autocomplete="current-password"></label><button type="button" class="action primary" id="wa712signin">Connect Warehouse Feed</button></div>`;
    by('wa712signin')?.addEventListener('click',signIn);
    return;
  }
  b.className=lastError?'err':'ok';
  const who=esc(s.user?.email||'signed-in staff');
  const visible=visibleCount==null?'Cloud session connected. Press Refresh to verify the Warehouse feed.':visibleCount>0?`${visibleCount} Warehouse activity record${visibleCount===1?'':'s'} are visible to this account.`:'Cloud session is valid, but 0 Warehouse activity records are visible to this account.';
  b.innerHTML=`<b>Warehouse Feed Connected</b><small>${who} · ${esc(visible)}</small>${lastError?`<small><b>Refresh problem:</b> ${esc(lastError)}</small>`:''}`;
}

async function signIn(){
  const email=String(by('wa712email')?.value||'').trim(),password=by('wa712password')?.value||'';
  if(!email||!password)return alert('Enter the same staff email and password used for the Warehouse cloud account.');
  const btn=by('wa712signin');if(btn){btn.disabled=true;btn.textContent='Connecting…'}
  try{
    const c=await client(),r=await c.auth.signInWithPassword({email,password});
    if(r.error)throw r.error;
    lastError='';await render();await refresh();
  }catch(e){lastError=String(e?.message||e);await render()}
}

async function preflight(){
  const c=await client(),s=(await c.auth.getSession()).data?.session||null;
  if(!s)throw new Error('Flooring OS cloud sign-in required');
  const q=await c.from('warehouse_records').select('record_id',{count:'exact',head:true}).eq('dataset_key',DATASET).is('deleted_at',null);
  if(q.error)throw q.error;
  visibleCount=Number(q.count||0);
  if(visibleCount===0)throw new Error('Signed in, but this staff account cannot see the Warehouse activity dataset. Company/owner access must match the Warehouse account.');
  return visibleCount;
}

async function refresh(){
  if(busy)return;busy=true;lastError='';setButton(true,'Refreshing…');setState('REFRESHING…');
  try{
    const count=await preflight();
    await window.RUNLUWarehouseActivityBridgeV0711?.refresh?.(false);
    lastError='';setState(`LIVE · ${count} VISIBLE`);
  }catch(e){
    lastError=String(e?.message||e);
    const s=await session();setState(s?'ACCESS CHECK':'SIGN IN REQUIRED',s?'err':'auth');
  }finally{busy=false;setButton(false,'Refresh');await render()}
}

function replaceRefresh(){
  const old=by('wa711refresh');if(!old||old.dataset.wa712)return;
  const b=old.cloneNode(true);b.dataset.wa712='1';old.replaceWith(b);b.addEventListener('click',refresh);
}
function decorate(){ensureStyle();box();replaceRefresh();render()}
function install(){
  decorate();
  const o=new MutationObserver(()=>{if(by('warehouseActivity')){box();replaceRefresh()}});try{o.observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  setTimeout(()=>{session().then(s=>{if(s)refresh();else render()})},450);
  window.RUNLUWarehouseActivityAuthV0712={refresh,render,version:'0.7.12'};
  return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
