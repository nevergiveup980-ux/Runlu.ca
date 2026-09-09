/* RUNLU Deerfoot Flooring OS · Price Catalog V0.3.90
   Read-only cloud catalog for showroom / retail price references.
   Boundaries:
   - STOCK and NON-STOCK are always shown distinctly.
   - Reads runlu_showroom_price_catalog_v1 only; never changes inventory quantity/location.
   - Uses the existing Flooring auth session when available.
   - No supplier-cost writes, no Warehouse inventory writes, no PO writes.
*/
(function(){
'use strict';
if(window.__RUNLU_PRICE_CATALOG_V090__)return;
window.__RUNLU_PRICE_CATALOG_V090__=true;

const URL='https://ekrnknlawekeoszzkamd.supabase.co';
const KEY='sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn';
const AUTH='runlu-flooring-auth-v1';
const DATASET='runlu_showroom_price_catalog_v1';
const CACHE='runlu_flooring_showroom_price_catalog_v090_cache';
const PAGE='priceCatalog';
let sb=null,rows=[],busy=false,offline=false,lastSync='',lastError='',mode='all';

const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').trim().toLowerCase();
const arr=v=>Array.isArray(v)?v:[];
const obj=v=>v&&typeof v==='object'?v:{};
const money=n=>Number.isFinite(Number(n))?Number(n).toLocaleString('en-CA',{style:'currency',currency:'CAD'}):'—';
function readCache(){try{const x=JSON.parse(localStorage.getItem(CACHE)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function writeCache(v){try{localStorage.setItem(CACHE,JSON.stringify(v))}catch(_){}}
function payload(r){return obj(r?.payload)}
function stockType(r){return String(payload(r).inventoryType||'NON_STOCK').toUpperCase()==='STOCK'?'STOCK':'NON_STOCK'}
function needsReview(r){const p=payload(r),prices=arr(p.prices),hasPrice=prices.some(x=>Number.isFinite(Number(x?.amount)))||Number.isFinite(Number(p.unitPrice));return !hasPrice||p.confirmed!==true||String(p.reviewStatus||'').toUpperCase()!=='CONFIRMED_FROM_PHOTO'||String(p.stockLinkStatus||'').toUpperCase()==='UNMAPPED'}
function priceText(p){const ps=arr(p.prices).filter(x=>Number.isFinite(Number(x?.amount)));if(ps.length)return ps.map(x=>money(x.amount)+' / '+esc(String(x.unit||'UNIT').toUpperCase())).join(' · ');if(Number.isFinite(Number(p.unitPrice)))return money(p.unitPrice)+' / '+esc(String(p.priceUnit||'UNIT').toUpperCase());return 'Price pending review'}
function specsText(p){const s=obj(p.specs);return Object.entries(s).filter(([,v])=>v!==''&&v!=null).slice(0,5).map(([k,v])=>`${k.replace(/([A-Z])/g,' $1').replace(/^./,x=>x.toUpperCase())}: ${v}`).join(' · ')}
function searchText(r){const p=payload(r);return norm([r.record_id,p.brand,p.product,p.category,p.sku,p.notes,arr(p.masterIds).join(' '),JSON.stringify(p.specs||{})].join(' '))}
function stamp(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}

function ensureStyle(){
  if(by('pc90style'))return;
  const s=document.createElement('style');s.id='pc90style';s.textContent=`
#priceCatalog .pc-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.pc-state{font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:#e8f3ed;color:#245841}.pc-state.warn{background:#fff1d6;color:#7a5700}.pc-state.err{background:#fff0ee;color:#8b3a32}.pc-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.pc-metric{border:1px solid #dce5e0;border-radius:9px;padding:10px;text-align:center;background:#fff}.pc-metric b{display:block;font-size:20px;color:#244f3e}.pc-metric span{font-size:8px;font-weight:900;color:#748078}.pc-tools{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:10px 0}.pc-tools input,.pc-tools select{border:1px solid #ccd8d2;border-radius:7px;padding:8px;background:#fff;min-width:170px}.pc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.pc-tab{border:1px solid #cad7d1;background:#fff;color:#355246;border-radius:999px;padding:7px 10px;font-size:9px;font-weight:900}.pc-tab.on{background:#173d30;color:#fff;border-color:#173d30}.pc-list{display:grid;gap:8px}.pc-row{border:1px solid #dce5e0;border-radius:10px;background:#fff;padding:11px;display:grid;grid-template-columns:minmax(190px,1.4fr) minmax(145px,.8fr) minmax(160px,1fr);gap:10px;align-items:start}.pc-name b{color:#173d30;font-size:13px}.pc-name small,.pc-meta small{display:block;color:#748078;margin-top:3px;line-height:1.4}.pc-price{font-weight:900;color:#173d30}.pc-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.pc-badge{font-size:8px;font-weight:900;padding:4px 7px;border-radius:999px;background:#eef2f0;color:#5c6b64}.pc-badge.stock{background:#e8f3ed;color:#245841}.pc-badge.non{background:#edf4f8;color:#315f82}.pc-badge.review{background:#fff1d6;color:#7a5700}.pc-badge.link{background:#edf3f0;color:#315c49}.pc-empty{padding:28px;text-align:center;border:1px dashed #cad7d1;border-radius:9px;color:#718078}.pc-connect{margin-top:10px;padding:11px;border:1px solid #d9e4de;border-left:4px solid #315f82;border-radius:8px;background:#f8fbf9}.pc-connect.warn{border-left-color:#a97816;background:#fff9ea}.pc-connect.err{border-left-color:#8b3a32;background:#fff4f2}.pc-connect .pc-login{display:flex;gap:7px;flex-wrap:wrap;align-items:end;margin-top:8px}.pc-connect label{font-size:8px;font-weight:900;color:#53625a}.pc-connect input{display:block;margin-top:3px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;min-width:190px}.pc-source{margin-top:10px;color:#718078;font-size:8.5px;line-height:1.45}@media(max-width:820px){.pc-row{grid-template-columns:1fr 1fr}.pc-meta{grid-column:1/-1}}@media(max-width:560px){.pc-metrics{grid-template-columns:1fr 1fr}.pc-row{grid-template-columns:1fr}.pc-meta{grid-column:auto}.pc-tools input,.pc-tools select{min-width:0;flex:1 1 145px}.pc-connect input{min-width:0;width:100%}.pc-connect .pc-login{display:grid;grid-template-columns:1fr}}
`;document.head.appendChild(s);
}
function ensurePage(){
  if(by(PAGE))return;
  const main=document.querySelector('main');if(!main)return;
  const section=document.createElement('section');section.id=PAGE;section.className='page';section.innerHTML=`
<div class="card"><div class="pc-head"><div><h2>Price Catalog</h2><div class="muted">Cloud showroom price reference. STOCK links to Product Master; NON-STOCK remains showroom-only and never becomes Warehouse inventory.</div></div><div><span id="pc90state" class="pc-state">CONNECTING</span> <button id="pc90refresh" type="button" class="action primary">Refresh</button></div></div><div id="pc90connect"></div><div id="pc90metrics" class="pc-metrics"></div><div class="pc-tabs"><button class="pc-tab on" data-pc90-mode="all">ALL</button><button class="pc-tab" data-pc90-mode="stock">STOCK</button><button class="pc-tab" data-pc90-mode="nonstock">NON-STOCK</button><button class="pc-tab" data-pc90-mode="review">NEEDS REVIEW</button></div><div class="pc-tools"><input id="pc90search" placeholder="Search brand, product, category, SKU…"><select id="pc90category"><option value="">All categories</option></select></div><div id="pc90list" class="pc-list"></div><div class="pc-source">Read-only dataset: <b>runlu_showroom_price_catalog_v1</b>. This page does not change inventory quantities, locations, supplier cost, receiving, PO or order records.</div></div>`;main.appendChild(section);
  by('pc90search')?.addEventListener('input',render);
  by('pc90category')?.addEventListener('change',render);
  by('pc90refresh')?.addEventListener('click',()=>refresh(true));
  section.addEventListener('click',e=>{const b=e.target.closest?.('[data-pc90-mode]');if(!b)return;mode=b.dataset.pc90Mode||'all';section.querySelectorAll('[data-pc90-mode]').forEach(x=>x.classList.toggle('on',x===b));render()});
}
function ensureNav(){
  const nav=by('nav');if(!nav||nav.querySelector('[data-page="'+PAGE+'"]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.page=PAGE;b.textContent='Price Catalog';b.addEventListener('click',open);
  const showroom=nav.querySelector('[data-page="showroom"]'),accounting=nav.querySelector('[data-page="accounting"]');
  if(showroom)showroom.insertAdjacentElement('afterend',b);else if(accounting)accounting.insertAdjacentElement('beforebegin',b);else nav.appendChild(b);
}
function ensureModule(){
  const grid=document.querySelector('#command .grid3');if(!grid||by('pc90module'))return;
  const b=document.createElement('button');b.id='pc90module';b.className='module';b.innerHTML='<span class="ico">🏷️</span><strong>Price Catalog</strong><small>Cloud price lookup with STOCK / NON-STOCK separation and review flags.</small>';b.addEventListener('click',open);
  const showroom=Array.from(grid.children).find(x=>/Showroom/.test(x.textContent));showroom?showroom.insertAdjacentElement('afterend',b):grid.appendChild(b);
}
function open(){ensurePage();ensureNav();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===PAGE));document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===PAGE));render();window.scrollTo({top:0,behavior:'smooth'});if(!rows.length&&!busy)refresh(false)}

function setState(text,cls=''){const el=by('pc90state');if(!el)return;el.textContent=text;el.className='pc-state'+(cls?' '+cls:'')}
function categories(){return [...new Set(rows.map(r=>String(payload(r).category||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function renderCategory(){const el=by('pc90category');if(!el)return;const cur=el.value,opts=categories();el.innerHTML='<option value="">All categories</option>'+opts.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(opts.includes(cur))el.value=cur}
function renderConnect(){
  const box=by('pc90connect');if(!box)return;
  if(lastError){box.className='pc-connect err';box.innerHTML=`<b>Price Catalog connection</b><div class="muted">${esc(lastError)}</div>`;return}
  if(offline){box.className='pc-connect warn';box.innerHTML='<b>Offline cache</b><div class="muted">Showing the last catalog saved on this device. Refresh when the cloud connection is available.</div>';return}
  box.className='pc-connect';box.innerHTML='<b>Cloud catalog</b><div class="muted">Uses the same Flooring staff sign-in as Warehouse Activity. No separate product-price copy is kept in the app itself.</div>';
}
function render(){
  ensurePage();renderCategory();renderConnect();
  const total=rows.length,stock=rows.filter(r=>stockType(r)==='STOCK').length,non=total-stock,review=rows.filter(needsReview).length;
  const m=by('pc90metrics');if(m)m.innerHTML=`<div class="pc-metric"><b>${total}</b><span>ALL</span></div><div class="pc-metric"><b>${stock}</b><span>STOCK</span></div><div class="pc-metric"><b>${non}</b><span>NON-STOCK</span></div><div class="pc-metric"><b>${review}</b><span>NEEDS REVIEW</span></div>`;
  const q=norm(by('pc90search')?.value),cat=String(by('pc90category')?.value||'');
  let view=rows.slice();if(mode==='stock')view=view.filter(r=>stockType(r)==='STOCK');if(mode==='nonstock')view=view.filter(r=>stockType(r)!=='STOCK');if(mode==='review')view=view.filter(needsReview);if(q)view=view.filter(r=>searchText(r).includes(q));if(cat)view=view.filter(r=>String(payload(r).category||'')===cat);
  view.sort((a,b)=>{const pa=payload(a),pb=payload(b);return String(pa.brand||'').localeCompare(String(pb.brand||''))||String(pa.product||'').localeCompare(String(pb.product||''))});
  const list=by('pc90list');if(!list)return;
  list.innerHTML=view.length?view.map(r=>{const p=payload(r),type=stockType(r),reviewFlag=needsReview(r),links=arr(p.masterIds),spec=specsText(p),linkStatus=String(p.stockLinkStatus||'').toUpperCase();return `<div class="pc-row"><div class="pc-name"><b>${esc(p.product||r.record_id||'Unnamed product')}</b><small>${esc([p.brand,p.category,p.sku?('SKU '+p.sku):''].filter(Boolean).join(' · '))}</small><div class="pc-badges"><span class="pc-badge ${type==='STOCK'?'stock':'non'}">${type==='STOCK'?'STOCK':'NON-STOCK'}</span>${type==='STOCK'&&linkStatus?`<span class="pc-badge ${linkStatus==='LINKED'?'link':'review'}">${esc(linkStatus)}</span>`:''}${reviewFlag?'<span class="pc-badge review">NEEDS REVIEW</span>':''}</div></div><div><div class="pc-price">${priceText(p)}</div><small class="muted">${type==='STOCK'?(links.length?'Product Master '+esc(links.join(', ')):'Stock class · master link pending'):'Showroom only · no inventory quantity'}</small></div><div class="pc-meta"><small>${esc(spec||p.notes||'No additional specifications')}</small><small>Source ${esc(p.sourceDate||'—')} · ${esc(p.reviewStatus||'UNREVIEWED')}</small></div></div>`}).join(''):'<div class="pc-empty">No products match this view.</div>';
}

function loadSdk(){
  return new Promise((resolve,reject)=>{
    if(window.supabase?.createClient)return resolve();
    let s=by('pc90SupabaseSdk');
    if(s){let n=0;const t=setInterval(()=>{if(window.supabase?.createClient){clearInterval(t);resolve()}else if(++n>50){clearInterval(t);reject(new Error('Supabase client unavailable'))}},120);return}
    s=document.createElement('script');s.id='pc90SupabaseSdk';s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=()=>window.supabase?.createClient?resolve():reject(new Error('Supabase client unavailable'));s.onerror=()=>reject(new Error('Could not load the Supabase client'));document.head.appendChild(s);
  })
}
async function client(){if(sb)return sb;await loadSdk();sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,storageKey:AUTH,autoRefreshToken:true,detectSessionInUrl:true}});sb.auth.onAuthStateChange(()=>setTimeout(()=>refresh(false),0));return sb}
async function session(){try{return (await (await client()).auth.getSession()).data?.session||null}catch(_){return null}}
function loginBox(){const box=by('pc90connect');if(!box)return;box.className='pc-connect warn';box.innerHTML='<b>Staff sign-in required</b><div class="muted">Use the same Flooring / Warehouse cloud account. Password is sent to Supabase authentication and is not stored by this module.</div><div class="pc-login"><label>Email<input id="pc90email" type="email" autocomplete="username"></label><label>Password<input id="pc90password" type="password" autocomplete="current-password"></label><button id="pc90signin" type="button" class="action primary">Connect Price Catalog</button></div>';by('pc90signin')?.addEventListener('click',signIn)}
async function signIn(){const email=String(by('pc90email')?.value||'').trim(),password=by('pc90password')?.value||'';if(!email||!password)return alert('Enter the staff email and password.');const b=by('pc90signin');if(b){b.disabled=true;b.textContent='Connecting…'}try{const c=await client(),r=await c.auth.signInWithPassword({email,password});if(r.error)throw r.error;lastError='';await refresh(true)}catch(e){lastError=String(e?.message||e);render();loginBox()}}
async function refresh(userRequested){
  if(busy)return;busy=true;lastError='';offline=false;setState('REFRESHING…');const b=by('pc90refresh');if(b){b.disabled=true;b.textContent='Refreshing…'}
  try{
    const c=await client(),s=(await c.auth.getSession()).data?.session||null;
    if(!s){rows=readCache();offline=rows.length>0;setState(rows.length?'CACHE · SIGN IN':'SIGN IN REQUIRED','warn');render();loginBox();return}
    const q=await c.from('warehouse_records').select('record_id,payload,updated_at').eq('dataset_key',DATASET).is('deleted_at',null).order('updated_at',{ascending:false}).limit(500);
    if(q.error)throw q.error;rows=Array.isArray(q.data)?q.data:[];writeCache(rows);offline=false;lastSync=stamp();setState('LIVE · '+rows.length+' PRODUCTS');render();
  }catch(e){lastError=String(e?.message||e);const cached=readCache();if(cached.length){rows=cached;offline=true;setState('OFFLINE CACHE','warn')}else setState('CONNECTION ERROR','err');render();if(userRequested&&!cached.length)console.error('Price Catalog refresh failed',e)}finally{busy=false;if(b){b.disabled=false;b.textContent='Refresh'}}
}
function install(){ensureStyle();ensurePage();ensureNav();ensureModule();rows=readCache();if(rows.length){offline=true;setState('CACHE · CONNECTING','warn');render()}setTimeout(()=>refresh(false),500);window.RUNLUPriceCatalogV090={version:'0.3.90',open,refresh,render,dataset:DATASET,readOnly:true};return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
