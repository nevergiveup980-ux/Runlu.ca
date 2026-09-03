/* RUNLU Deerfoot Flooring OS · V0.3.73 Commercial Rates
   Central, editable commercial installation/removal rate book.
   - Bundled baseline is transcribed from the supplied Deerfoot Commercial Rates sheet.
   - Authenticated users sync one rate book through public.user_datasets.
   - Existing estimates/orders are never rewritten when a rate changes.
   - Question marks and Ask Installer remain explicit unresolved statuses.
*/
(function(){
'use strict';
if(window.__runluCommercialRatesV073)return;
window.__runluCommercialRatesV073=true;

const SUPABASE_URL='https://ekrnknlawekeoszzkamd.supabase.co';
const SUPABASE_KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH_STORAGE='runlu-flooring-auth-v1';
const DATASET='runlu_flooring_commercial_rates_v1';
const LOCAL_STORE='runlu_flooring_commercial_rates_v1';
const SOURCE='Commercial Rates sheet supplied 2026-09-03';
const categories=['Carpet','Vinyl','Commercial Stairs','Commercial Removal'];
const row=(id,category,item,rate,unit,convertedRate,convertedUnit,note,status='active')=>({id,category,item,rate,unit,convertedRate,convertedUnit,note,status,effectiveDate:'',updatedAt:''});
const DEFAULTS=[
  row('carpet-glue-down','Carpet','Broadloom - Glue Down',6,'PSY',0.67,'PSF','Glue supplied by installer'),
  row('carpet-double-glue','Carpet','Broadloom - dbl Glue w/commercial Pad',null,'PSY',null,'PSF','Glue supplied by store','price_needed'),
  row('tile-glue-down','Carpet','Tile - Glue Down',5,'PSY',0.55,'PSF','Glue supplied by store'),
  row('tile-metal-squares','Carpet','Tile - Metal Toothed Squares',6,'PSY',0.67,'PSF','Squares supplied by store'),
  row('carpet-base','Carpet','Carpet Base',1,'PLF',null,'','Glue supplied by installer · $0.75 under 200 lnft'),
  row('vinyl-rubber-base-45','Carpet','Vinyl/Rubber Base up to 4.5\"',1,'PLF',null,'','Glue supplied by store'),
  row('vinyl-rubber-base-6','Carpet','Vinyl/Rubber Base 6\"',1.25,'PLF',null,'','Glue supplied by store'),
  row('metals-naploc','Carpet','Metals (Naploc)',5,'PLF',null,'',''),
  row('specialty-metals','Carpet','Specialty Metals (tbar, channel and cap)',6,'PLF',null,'',''),
  row('vinyl-plank-under-500','Vinyl','Vinyl plank/VCT up to 500 sqft',1.25,'PSF',null,'','Glue supplied by store'),
  row('vinyl-plank-over-1000','Vinyl','Vinyl plank/VCT over 1000 sqft',null,'PSF',null,'','Glue supplied by store','installer_quote'),
  row('marmoleum-pvc','Vinyl','Marmoleum/PVC',18,'PSY',null,'','Glue supplied by store'),
  row('marmoleum-pvc-over-1000','Vinyl','Marmoleum/PVC over 1000 sqft',null,'PSY',null,'','Glue supplied by store','installer_quote'),
  row('weld','Vinyl','Weld (Marmo, PVC, Safety)',1.5,'PLF',null,'',''),
  row('flash-cove','Vinyl','Flash Cove',8,'PLF',null,'',''),
  row('inside-outside-corners','Vinyl','Inside/Outside corners',20,'EA',null,'',''),
  row('rubber-stair-tread','Commercial Stairs','Rubber Stair Tread Install (Johnsonite)',5,'PLF',null,'','Epoxy additional'),
  row('rubber-tread-riser','Commercial Stairs','Rubber Tread + Riser',5,'PLF',null,'',''),
  row('rubber-tread-riser-attached','Commercial Stairs','Rubber Tread/Riser attached Install',8,'PLF',null,'',''),
  row('stair-carpet-glue','Commercial Stairs','Carpet - Glue down no pad',15,'EA',null,'',''),
  row('stair-carpet-double-glue','Commercial Stairs','Carpet - Double Glue with commercial pad',20,'EA',null,'',''),
  row('nosing-vinyl','Commercial Stairs','Nosing - Vinyl',2,'PLF',null,'','Store supplied'),
  row('nosing-metal','Commercial Stairs','Nosing - Metal',3,'PLF',null,'','Store supplied'),
  row('stringers','Commercial Stairs','Stringers (two sides)',5,'EA',null,'','Add-on'),
  row('remove-carpet-kicked','Commercial Removal','Carpet - Kicked in Removal',1.25,'PSY',0.14,'PSF',''),
  row('remove-carpet-glued','Commercial Removal','Carpet - Glue Down (broadloom or tile) Removal & Prep for New',2.7,'PSY',0.30,'PSF',''),
  row('remove-carpet-foam','Commercial Removal','Carpet - Foam backed Removal & Prep for New',9,'PSY',1,'PSF',''),
  row('remove-vinyl-sheet','Commercial Removal','Vinyl - Sheet removal & Prep for New',13.5,'PSY',1.5,'PSF',''),
  row('remove-vinyl-tile','Commercial Removal','Vinyl - Tile removal & Prep for New',13.5,'PSY',1.5,'PSF',''),
  row('remove-marmoleum','Commercial Removal','Marmoleum / Safety - Remove and Prep for New',null,'PSY',null,'PSF','','price_needed'),
  row('remove-ceramic','Commercial Removal','Ceramic / Porcelain - Remove and Prep for New',null,'PSY',null,'PSF','','price_needed'),
  row('remove-base','Commercial Removal','Base - Carpet or cove removal',0.10,'PLF',null,'',''),
  row('disposal','Commercial Removal','Disposal (charge to store)',0.75,'PSY',0.09,'PSF','')
];
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const clone=v=>JSON.parse(JSON.stringify(v));
const numeric=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0?Math.round((n+Number.EPSILON)*10000)/10000:null};
let rates=loadLocal(),sb=null,session=null,cloudState='LOCAL BASELINE',installed=false,query='',filter='All';

function normalized(input){
  const map=new Map(DEFAULTS.map(x=>[x.id,x]));
  (Array.isArray(input)?input:[]).forEach(x=>{if(x&&x.id)map.set(x.id,{...(map.get(x.id)||{}),...x})});
  return Array.from(map.values());
}
function loadLocal(){try{const x=JSON.parse(localStorage.getItem(LOCAL_STORE)||'null');if(Array.isArray(x))return normalized(x)}catch(_){}return clone(DEFAULTS)}
function saveLocal(next){rates=normalized(next);localStorage.setItem(LOCAL_STORE,JSON.stringify(rates))}
function statusLabel(s){return s==='price_needed'?'PRICE NEEDED':s==='installer_quote'?'ASK INSTALLER':'ACTIVE'}
function statusClass(s){return s==='active'?'green':'gold'}
function priceText(x){return x.rate==null?'—':`$${Number(x.rate).toFixed(2)} / ${x.unit}`}

function ensureStyle(){
  if(by('r73styleTag'))return;
  const s=document.createElement('style');s.id='r73styleTag';s.textContent=`
#r73commercial{margin-top:12px}.r73card{border:1px solid #dce4e0;border-left:5px solid #a97816;border-radius:11px;background:#fff;padding:12px}.r73head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r73head h3{margin:0;color:#173d30;font-size:15px}.r73muted{color:#697770;font-size:10px;line-height:1.45}.r73pills,.r73actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.r73pill{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:900;white-space:nowrap}.r73pill.green{background:#e9f3ee;color:#1f5a45}.r73pill.gold{background:#fff5d9;color:#79570f}.r73pill.blue{background:#edf4f8;color:#315f82}.r73pill.gray{background:#eef1ef;color:#66716c}.r73tools{display:grid;grid-template-columns:minmax(180px,1fr) auto auto;gap:7px;margin-top:11px}.r73tools input,.r73tools select,.r73rate input,.r73rate select{width:100%;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff;color:#25312b}.r73group{margin-top:11px;border:1px solid #dce4e0;border-radius:10px;overflow:hidden}.r73group h4{margin:0;padding:8px 10px;background:#edf3f0;color:#315f82;font-size:11px}.r73row{display:grid;grid-template-columns:minmax(210px,1.5fr) 100px 72px 100px 72px 120px;gap:7px;align-items:center;padding:8px 9px;border-top:1px solid #e8edeb;font-size:9.5px}.r73row.head{background:#f7f9f8;color:#6b7871;font-size:8px;font-weight:900;border-top:0}.r73item b{color:#173d30}.r73rate{display:contents}.r73note{display:block;margin-top:3px;color:#6c7973;font-size:8.5px}.r73warning{margin-top:10px;padding:9px 10px;border-left:4px solid #a97816;background:#fff7e2;border-radius:0 8px 8px 0;color:#6a571d;font-size:9.5px;line-height:1.45}.r73empty{padding:14px;color:#6b7871;font-size:10px}.r73footer{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:10px}@media(max-width:900px){.r73row{grid-template-columns:minmax(190px,1.4fr) 90px 65px 95px 65px}.r73status{grid-column:1/-1}.r73tools{grid-template-columns:1fr 150px}}@media(max-width:580px){.r73head,.r73footer{display:block}.r73pills{margin-top:7px}.r73tools{grid-template-columns:1fr}.r73row,.r73row.head{grid-template-columns:1.4fr .8fr .6fr}.r73secondary,.r73status{grid-column:auto}.r73row.head span:nth-child(4),.r73row.head span:nth-child(5),.r73row.head span:nth-child(6){display:none}.r73footer .r73actions{margin-top:8px}}
`;document.head.appendChild(s)
}
function filtered(){const q=query.trim().toLowerCase();return rates.filter(x=>(filter==='All'||x.category===filter)&&(!q||[x.item,x.note,x.category,x.unit,x.convertedUnit].join(' ').toLowerCase().includes(q)))}
function rowHtml(x){return `<div class="r73row" data-r73-row="${attr(x.id)}"><div class="r73item"><b>${esc(x.item)}</b>${x.note?`<span class="r73note">${esc(x.note)}</span>`:''}</div><div class="r73rate"><input data-r73-rate type="number" min="0" step="0.01" value="${attr(x.rate??'')}" placeholder="Price"><select data-r73-unit>${['PSY','PSF','PLF','EA'].map(u=>`<option${x.unit===u?' selected':''}>${u}</option>`).join('')}</select></div><div class="r73rate r73secondary"><input data-r73-converted type="number" min="0" step="0.01" value="${attr(x.convertedRate??'')}" placeholder="—"><select data-r73-converted-unit><option value="">—</option>${['PSF','PSY','PLF','EA'].map(u=>`<option${x.convertedUnit===u?' selected':''}>${u}</option>`).join('')}</select></div><select class="r73status" data-r73-status><option value="active"${x.status==='active'?' selected':''}>Active</option><option value="price_needed"${x.status==='price_needed'?' selected':''}>Price Needed</option><option value="installer_quote"${x.status==='installer_quote'?' selected':''}>Ask Installer</option></select></div>`}
function groupHtml(category,list){const xs=list.filter(x=>x.category===category);if(!xs.length)return '';return `<div class="r73group"><h4>${esc(category)} · ${xs.length}</h4><div class="r73row head"><span>WORK ITEM / CONDITION</span><span>RATE</span><span>UNIT</span><span>CONVERTED</span><span>UNIT</span><span>STATUS</span></div>${xs.map(rowHtml).join('')}</div>`}
function render(){
  ensureStyle();const page=by('pricing');if(!page)return false;
  let root=by('r73commercial');if(!root){root=document.createElement('div');root.id='r73commercial';page.appendChild(root)}
  const xs=filtered(),ready=rates.filter(x=>x.status==='active'&&x.rate!=null).length,unresolved=rates.length-ready;
  root.innerHTML=`<div class="r73card"><div class="r73head"><div><h3>COMMERCIAL RATES</h3><div class="r73muted">Central commercial installation and removal rate book. Update a rate here; historical Order/Estimate snapshots remain unchanged.</div></div><div class="r73pills"><span class="r73pill blue">V0.3.73</span><span class="r73pill ${session?'green':'gray'}">${esc(cloudState)}</span><span class="r73pill ${unresolved?'gold':'green'}">${ready} READY · ${unresolved} REVIEW</span></div></div><div class="r73tools"><input data-r73-search value="${attr(query)}" placeholder="Search work item, condition or unit…"><select data-r73-filter><option>All</option>${categories.map(c=>`<option${filter===c?' selected':''}>${esc(c)}</option>`).join('')}</select><button type="button" class="action" data-r73="reload">Reload Central Rates</button></div><div class="r73warning"><b>Source gap preserved:</b> Vinyl plank/VCT lists “up to 500 sqft” and “over 1000 sqft”; 501–1000 sqft still needs confirmation. No rate has been invented. “?” and “Ask Installer” remain review statuses.</div>${xs.length?categories.map(c=>groupHtml(c,xs)).join(''):'<div class="r73empty">No Commercial Rates match this search.</div>'}<div class="r73footer"><div class="r73muted">${esc(SOURCE)} · Last local change ${esc(lastUpdated()||'not changed')}</div><div class="r73actions"><button type="button" class="action" data-r73="reset">Restore Supplied Baseline</button><button type="button" class="action primary" data-r73="save">Save Commercial Rates</button></div></div></div>`;
  return true
}
function lastUpdated(){return rates.map(x=>x.updatedAt||'').sort().pop()||''}
function collect(){
  const next=clone(rates),stamp=new Date().toISOString();
  by('r73commercial')?.querySelectorAll('[data-r73-row]').forEach(el=>{const x=next.find(r=>r.id===el.dataset.r73Row);if(!x)return;x.rate=numeric(el.querySelector('[data-r73-rate]')?.value);x.unit=el.querySelector('[data-r73-unit]')?.value||x.unit;x.convertedRate=numeric(el.querySelector('[data-r73-converted]')?.value);x.convertedUnit=el.querySelector('[data-r73-converted-unit]')?.value||'';x.status=el.querySelector('[data-r73-status]')?.value||'active';if(x.rate==null&&x.status==='active')x.status='price_needed';x.updatedAt=stamp});
  return next
}
async function save(){
  const next=collect();saveLocal(next);
  if(!session){cloudState='SAVED ON THIS DEVICE';render();alert('Commercial Rates were saved on this device. Sign in to Flooring OS central services to sync them across computers.');return}
  cloudState='SAVING…';render();
  const payload={version:1,source:SOURCE,rates:next,updatedAt:new Date().toISOString()};
  const {error}=await sb.from('user_datasets').upsert({user_id:session.user.id,dataset_key:DATASET,payload,device_id:'flooring-os-v073',updated_at:new Date().toISOString()},{onConflict:'user_id,dataset_key'});
  if(error){cloudState='CENTRAL SAVE FAILED';render();alert('Central Commercial Rates save failed: '+error.message);return}
  cloudState='CENTRAL RATES SAVED';render();alert('Commercial Rates saved centrally. Other signed-in Flooring OS computers can reload the same rates.')
}
async function loadCloud(showMessage){
  if(!session){cloudState='SIGN-IN NEEDED FOR SYNC';render();if(showMessage)alert('Sign in to Flooring OS central services first. The supplied baseline remains available locally.');return false}
  cloudState='LOADING CENTRAL RATES…';render();
  const {data,error}=await sb.from('user_datasets').select('payload,updated_at').eq('dataset_key',DATASET).maybeSingle();
  if(error){cloudState='CENTRAL LOAD FAILED';render();if(showMessage)alert('Central Commercial Rates load failed: '+error.message);return false}
  if(data?.payload?.rates){saveLocal(data.payload.rates);cloudState='CENTRAL RATES LOADED';render();if(showMessage)alert('Latest central Commercial Rates loaded.');return true}
  const payload={version:1,source:SOURCE,rates:clone(DEFAULTS),updatedAt:new Date().toISOString()};
  const seeded=await sb.from('user_datasets').upsert({user_id:session.user.id,dataset_key:DATASET,payload,device_id:'flooring-os-v073',updated_at:new Date().toISOString()},{onConflict:'user_id,dataset_key'});
  if(seeded.error){cloudState='BASELINE LOCAL · CENTRAL SEED FAILED';render();if(showMessage)alert('The supplied baseline is ready locally, but central initialization failed: '+seeded.error.message);return false}
  saveLocal(DEFAULTS);cloudState='CENTRAL BASELINE READY';render();if(showMessage)alert('The supplied Commercial Rates baseline is now saved centrally.');return true
}
async function initCloud(){
  for(let i=0;i<40&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,100));
  if(!window.supabase?.createClient){cloudState='LOCAL · CLOUD LIBRARY UNAVAILABLE';render();return}
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,storageKey:AUTH_STORAGE,autoRefreshToken:true,detectSessionInUrl:true}});
  session=(await sb.auth.getSession()).data?.session||null;
  sb.auth.onAuthStateChange((_event,s)=>{session=s;setTimeout(()=>session?loadCloud(false):(cloudState='LOCAL · NOT SIGNED IN',render()),0)});
  if(session)await loadCloud(false);else{cloudState='LOCAL · NOT SIGNED IN';render()}
}
function events(){
  if(window.__runluCommercialRatesEventsV073)return;window.__runluCommercialRatesEventsV073=true;
  document.addEventListener('click',ev=>{const b=ev.target?.closest?.('[data-r73]');if(!b)return;const a=b.dataset.r73;if(a==='save')save();else if(a==='reload')loadCloud(true);else if(a==='reset'&&confirm('Restore the supplied Commercial Rates baseline? Save afterward to replace the central copy.')){saveLocal(DEFAULTS);cloudState='BASELINE RESTORED · NOT YET SAVED';render()}},true);
  document.addEventListener('input',ev=>{if(ev.target?.matches?.('[data-r73-search]')){query=ev.target.value;render();const x=by('r73commercial')?.querySelector('[data-r73-search]');x?.focus();try{x?.setSelectionRange(query.length,query.length)}catch(_){}}},true);
  document.addEventListener('change',ev=>{if(ev.target?.matches?.('[data-r73-filter]')){filter=ev.target.value;render()}},true)
}
function patch(api){if(!api||api.__r73)return;api.__r73=1;['render','refresh'].forEach(k=>{if(typeof api[k]!=='function')return;const old=api[k];api[k]=function(){const z=old.apply(this,arguments);setTimeout(render,0);return z}})}
function label(){try{document.title='RUNLU Deerfoot Flooring OS V0.3.73 Commercial Rates';const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.73 Commercial Rates';const demo=by('command')?.querySelector('.demo');if(demo)demo.textContent='V0.3.73 · Commercial Rates are centrally maintainable; existing Order price snapshots remain unchanged.'}catch(_){}}
function install(){if(installed){render();return}installed=true;ensureStyle();events();patch(window.RUNLUPricingV070);patch(window.RUNLUPricingWorkspaceV071);render();label();initCloud();setTimeout(()=>{patch(window.RUNLUPricingV070);patch(window.RUNLUPricingWorkspaceV071);render();label()},650)}
window.RUNLUCommercialRatesV073={install,render,refresh:render,rates:()=>clone(rates),reload:()=>loadCloud(true)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
