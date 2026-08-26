/* RUNLU Deerfoot Flooring OS · V0.3.47 Central Customer Payment Research
   - Uses authenticated Supabase training tables only.
   - Reuses auth storage key from Central PO Training.
   - Production V0.3.44 and verified V0.3.46 remain untouched.
   - No MutationObserver and no global polling.
*/
(function(){
'use strict';
if(window.__runluPaymentCloudV047)return;
window.__runluPaymentCloudV047=true;

const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const ENV='training';
const LOCAL='runlu_flooring_payment_lifecycle_v045';
const CLOUD_ENABLED='runlu_flooring_payment_cloud_enabled_v047';
const AUTH_STORAGE='runlu-flooring-auth-v1';
let sb=null,session=null,lastSync='',busy=false;
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function jobKey(j=activeJob()){
  const n=String(j?.jobNumber||j?.invoiceNumber||'').trim();
  return n||'';
}
function localDb(){try{return JSON.parse(localStorage.getItem(LOCAL)||'{}')}catch(_){return {}}}
function setLocalDb(v){localStorage.setItem(LOCAL,JSON.stringify(v))}
function localKey(j=activeJob()){return j?.id||j?.jobNumber||'blank'}
function localLedger(j=activeJob()){const db=localDb();return db[localKey(j)]||{jobId:j?.id||'',jobNumber:j?.jobNumber||'',depositRequired:Number(j?.depositRequired||j?.depositDue||0),payments:[]}}
function saveLocalLedger(entry,j=activeJob()){const db=localDb();db[localKey(j)]={...entry,jobId:j?.id||'',jobNumber:j?.jobNumber||'',savedAt:new Date().toISOString()};setLocalDb(db)}
function cloudEnabled(){return localStorage.getItem(CLOUD_ENABLED)==='1'}
function centralActive(){return !!(cloudEnabled()&&session&&sb&&jobKey())}
function fmtTime(){return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
function paymentMap(x){return {id:x.client_payment_id,type:x.payment_type||'Payment',amount:Number(x.amount||0),date:x.payment_date||'',method:x.payment_method||'',reference:x.reference||'',note:x.note||'',recordedFrom:x.recorded_from||'Cloud',createdAt:x.created_at||''}}

function loadSupabaseLibrary(){
  return new Promise((resolve,reject)=>{
    if(window.supabase?.createClient)return resolve();
    const old=document.querySelector('script[data-runlu-supabase-v047]');
    if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.dataset.runluSupabaseV047='1';s.onload=resolve;s.onerror=()=>reject(new Error('Supabase client library failed to load'));document.head.appendChild(s);
  })
}

async function initClient(){
  try{
    await loadSupabaseLibrary();
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});
    session=(await sb.auth.getSession()).data?.session||null;
    sb.auth.onAuthStateChange((_e,s)=>{session=s;setTimeout(()=>{renderPanels();if(centralActive())syncFromCloud(false)},0)});
    renderPanels();
    if(centralActive())await syncFromCloud(false);
  }catch(e){console.error(e);renderPanels(String(e.message||e))}
}

async function ensureCloudLedger(createIfMissing){
  const j=activeJob(),jk=jobKey(j);if(!j||!jk)return {header:null,payments:[]};
  let q=await sb.from('flooring_customer_payment_ledgers').select('*').eq('environment',ENV).eq('job_key',jk).maybeSingle();
  if(q.error)throw q.error;
  let header=q.data||null;
  if(!header&&createIfMissing){
    const l=localLedger(j);
    const payload={environment:ENV,job_key:jk,job_id:j.id||'',job_number:j.jobNumber||'',invoice_number:j.invoiceNumber||'',customer_name:j.customerName||'',deposit_required:Number(l.depositRequired||0),updated_at:new Date().toISOString(),updated_by:session.user.id};
    const ins=await sb.from('flooring_customer_payment_ledgers').upsert(payload,{onConflict:'environment,job_key'}).select('*').single();
    if(ins.error)throw ins.error;header=ins.data;
  }
  let payments=[];
  if(header){const p=await sb.from('flooring_customer_payments').select('*').eq('environment',ENV).eq('ledger_id',header.id).order('payment_date',{ascending:true}).order('created_at',{ascending:true});if(p.error)throw p.error;payments=p.data||[]}
  return {header,payments};
}

async function uploadInitialLocal(header){
  const j=activeJob(),l=localLedger(j),jk=jobKey(j);if(!header||!j||!jk)return;
  if(Number(l.depositRequired||0)!==Number(header.deposit_required||0)){
    const u=await sb.from('flooring_customer_payment_ledgers').update({deposit_required:Number(l.depositRequired||0),updated_at:new Date().toISOString(),updated_by:session.user.id,job_id:j.id||'',job_number:j.jobNumber||'',invoice_number:j.invoiceNumber||'',customer_name:j.customerName||''}).eq('id',header.id).eq('environment',ENV);if(u.error)throw u.error;
  }
  const rows=(l.payments||[]).map(p=>({environment:ENV,ledger_id:header.id,job_key:jk,client_payment_id:String(p.id||('pay-'+Date.now()+Math.random())),payment_date:p.date||new Date().toISOString().slice(0,10),payment_type:p.type||'Payment',amount:Number(p.amount||0),payment_method:p.method||'',reference:p.reference||'',note:p.note||'',recorded_from:p.recordedFrom||'Local opening',updated_at:new Date().toISOString()})).filter(x=>x.amount>0);
  if(rows.length){const r=await sb.from('flooring_customer_payments').upsert(rows,{onConflict:'environment,job_key,client_payment_id'});if(r.error)throw r.error}
}

async function syncFromCloud(showAlert){
  if(!centralActive())return false;if(busy)return false;busy=true;renderPanels();
  try{
    const j=activeJob(),cloud=await ensureCloudLedger(false);
    if(!cloud.header){
      const created=await ensureCloudLedger(true);await uploadInitialLocal(created.header);const fresh=await ensureCloudLedger(false);applyCloudLocal(fresh,j);
    }else applyCloudLocal(cloud,j);
    lastSync=fmtTime();renderPanels();window.RUNLUPaymentSharedV046?.render?.();
    if(showAlert)alert('Central customer payment ledger synced from Supabase.');return true;
  }catch(e){console.error(e);if(showAlert)alert('Central payment sync failed: '+e.message);return false}finally{busy=false;renderPanels()}
}
function applyCloudLocal(cloud,j){
  const entry={jobId:j.id||'',jobNumber:j.jobNumber||'',depositRequired:Number(cloud.header?.deposit_required||0),payments:(cloud.payments||[]).map(paymentMap),savedAt:new Date().toISOString(),central:true};
  saveLocalLedger(entry,j);window.RUNLUPaymentSharedV046?.applyToJob?.(true);
}

async function pushDeposit(){
  if(!centralActive())return;try{const j=activeJob(),l=localLedger(j),c=await ensureCloudLedger(true);const r=await sb.from('flooring_customer_payment_ledgers').update({deposit_required:Number(l.depositRequired||0),job_id:j.id||'',job_number:j.jobNumber||'',invoice_number:j.invoiceNumber||'',customer_name:j.customerName||'',updated_at:new Date().toISOString(),updated_by:session.user.id}).eq('id',c.header.id).eq('environment',ENV);if(r.error)throw r.error;lastSync=fmtTime();renderPanels()}catch(e){console.error(e);alert('Central deposit sync failed: '+e.message)}
}
async function pushLocalPayments(){
  if(!centralActive())return;try{const j=activeJob(),l=localLedger(j),c=await ensureCloudLedger(true),jk=jobKey(j),rows=(l.payments||[]).map(p=>({environment:ENV,ledger_id:c.header.id,job_key:jk,client_payment_id:String(p.id),payment_date:p.date||new Date().toISOString().slice(0,10),payment_type:p.type||'Payment',amount:Number(p.amount||0),payment_method:p.method||'',reference:p.reference||'',note:p.note||'',recorded_from:p.recordedFrom||'Flooring OS',updated_at:new Date().toISOString()})).filter(x=>x.amount>0);if(rows.length){const r=await sb.from('flooring_customer_payments').upsert(rows,{onConflict:'environment,job_key,client_payment_id'});if(r.error)throw r.error}lastSync=fmtTime();renderPanels()}catch(e){console.error(e);alert('Central payment write failed: '+e.message)}
}
async function deleteCloudPayment(clientId){
  if(!centralActive()||!clientId)return;try{const jk=jobKey();const r=await sb.from('flooring_customer_payments').delete().eq('environment',ENV).eq('job_key',jk).eq('client_payment_id',clientId);if(r.error)throw r.error;lastSync=fmtTime();renderPanels()}catch(e){console.error(e);alert('Central payment delete failed: '+e.message)}
}

function panelHtml(prefix,where,error){
  const j=activeJob(),jk=jobKey(j),enabled=cloudEnabled();
  if(error)return `<h3>Central Customer Payments · V0.3.47</h3><div class="notice" style="color:#8b2f2f">${esc(error)}</div>`;
  if(!sb)return '<h3>Central Customer Payments · V0.3.47</h3><div class="muted">Loading secure cloud connector…</div>';
  if(!j)return '<h3>Central Customer Payments · V0.3.47</h3><div class="muted">Select a Job / Order first.</div>';
  if(!jk)return '<h3>Central Customer Payments · V0.3.47</h3><div class="notice"><b>Job / Invoice # required.</b> A stable number is needed so another device can find the same payment ledger.</div>';
  if(!session)return `<div class="statusLine"><div><h3 style="margin:0">Central Customer Payments · V0.3.47</h3><div class="muted">Authenticated training sync · Job / Invoice #${esc(jk)}</div></div><span class="tag demoTag">LOCAL DEVICE</span></div><div class="formgrid" style="margin-top:10px"><div><label>Staff Email</label><input id="${prefix}Email" type="email" autocomplete="username"></div><div><label>Password</label><input id="${prefix}Password" type="password" autocomplete="current-password"></div></div><div class="actions"><button class="action primary" id="${prefix}SignIn">Sign In</button></div>`;
  if(!enabled)return `<div class="statusLine"><div><h3 style="margin:0">Central Customer Payments · V0.3.47</h3><div class="muted">Signed in · Job / Invoice #${esc(jk)}</div></div><span class="tag demoTag">CENTRAL OFF</span></div><div class="notice" style="margin-top:10px"><b>Safe start:</b> V0.3.46 remains local until Central Payment Training is enabled. If cloud already has this Job #, cloud data wins on first sync; otherwise this device seeds the cloud ledger.</div><div class="actions"><button class="action primary" id="${prefix}Enable">Enable Central Payment Training</button><button class="action" id="${prefix}SignOut">Sign Out</button></div>`;
  return `<div class="statusLine"><div><h3 style="margin:0">Central Customer Payments · V0.3.47</h3><div class="muted">Job / Invoice #${esc(jk)} · same ledger across signed-in devices${lastSync?' · last sync '+esc(lastSync):''}</div></div><span class="tag">${busy?'SYNCING…':'CENTRAL TRAINING ACTIVE'}</span></div><div class="notice" style="margin-top:10px"><b>${esc(where)}:</b> Deposit Required and each customer payment are now stored in Supabase training tables. Local V0.3.46 remains a working cache.</div><div class="actions"><button class="action primary" id="${prefix}Sync">Sync From Cloud</button><button class="action" id="${prefix}Disable">Return to Local Mode</button><button class="action" id="${prefix}SignOut">Sign Out</button></div>`;
}
function ensurePanel(parentId,panelId,beforeId){const parent=by(parentId);if(!parent)return null;let box=by(panelId);if(!box){box=document.createElement('div');box.id=panelId;box.className='card';const before=beforeId?by(beforeId):null;if(before&&before.parentNode===parent)parent.insertBefore(box,before);else parent.appendChild(box)}return box}
function wirePanel(prefix){
  by(prefix+'SignIn')?.addEventListener('click',()=>signIn(prefix));
  by(prefix+'Enable')?.addEventListener('click',enableCentral);
  by(prefix+'Sync')?.addEventListener('click',()=>syncFromCloud(true));
  by(prefix+'Disable')?.addEventListener('click',disableCentral);
  by(prefix+'SignOut')?.addEventListener('click',signOut);
}
function renderPanels(error=''){
  const p=ensurePanel('purchasing','paymentCloudPOV047','paymentPOV046'),a=ensurePanel('accounting','paymentCloudAccountingV047','paymentAccountingV046');
  if(p){p.innerHTML=panelHtml('poCloudPay047','PO',error);wirePanel('poCloudPay047')}
  if(a){a.innerHTML=panelHtml('accCloudPay047','Accounting',error);wirePanel('accCloudPay047')}
}
async function signIn(prefix){const email=(by(prefix+'Email')?.value||'').trim(),password=by(prefix+'Password')?.value||'';if(!email||!password)return alert('Enter staff email and password.');const r=await sb.auth.signInWithPassword({email,password});if(r.error)return alert('Sign in failed: '+r.error.message);session=r.data?.session||null;renderPanels()}
async function signOut(){localStorage.removeItem(CLOUD_ENABLED);if(sb)await sb.auth.signOut();session=null;renderPanels();alert('Signed out. Customer payments are back in local device mode.')}
async function enableCentral(){if(!session)return alert('Sign in first.');if(!jobKey())return alert('Enter a Job / Invoice number first.');if(!confirm('Enable CENTRAL PAYMENT TRAINING for this device? V0.3.46 local data will remain as a cache.'))return;localStorage.setItem(CLOUD_ENABLED,'1');renderPanels();await syncFromCloud(true)}
function disableCentral(){if(!confirm('Return this device to LOCAL payment mode? Central training records will remain in Supabase.'))return;localStorage.removeItem(CLOUD_ENABLED);renderPanels()}

function bindChangeBridge(){
  document.addEventListener('click',ev=>{
    const t=ev.target.closest?.('button,[data-pay046-remove],nav button');if(!t)return;
    const id=t.id||'';
    let removeId='';
    if(t.hasAttribute('data-pay046-remove')){const i=Number(t.dataset.pay046Remove),l=localLedger();removeId=l.payments?.[i]?.id||''}
    if(['poPay046SaveDeposit','accPay046SaveDeposit'].includes(id))setTimeout(()=>pushDeposit(),180);
    if(['poPay046Add','accPay046Add'].includes(id))setTimeout(()=>pushLocalPayments(),220);
    if(removeId)setTimeout(()=>{const still=(localLedger().payments||[]).some(p=>p.id===removeId);if(!still)deleteCloudPayment(removeId)},260);
    const page=t.dataset?.page||'';
    if((page==='purchasing'||page==='accounting')&&centralActive())setTimeout(()=>syncFromCloud(false),180);
    setTimeout(()=>renderPanels(),60);
  },true);
  window.addEventListener('focus',()=>{if(centralActive())syncFromCloud(false)});
}

window.RUNLUPaymentCloudV047={render:renderPanels,sync:syncFromCloud,enabled:centralActive};
function boot(){renderPanels();bindChangeBridge();initClient()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
