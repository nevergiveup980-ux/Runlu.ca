/* RUNLU Deerfoot Flooring OS · Price Catalog Table View V0.3.90r1
   Presentation-only enhancement layered on top of price-catalog-v090.js.
   Boundaries:
   - Does not query or write Supabase itself.
   - Does not change STOCK / NON-STOCK classification, Product Master links, prices or review logic.
   - Does not change Warehouse inventory, receiving, supplier cost, PO or order data.
*/
(function(){
'use strict';
if(window.__RUNLU_PRICE_CATALOG_TABLE_V090R1__)return;
window.__RUNLU_PRICE_CATALOG_TABLE_V090R1__=true;

const PAGE='priceCatalog',LIST='pc90list';
let observer=null,sortMode='product',busy=false;
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=(el)=>String(el?.textContent||'').trim().replace(/\s+/g,' ');
const cleanStatus=v=>String(v||'')
  .replace(/CONFIRMED_FROM_PHOTO/gi,'Photo confirmed')
  .replace(/PHOTO_TRANSCRIBED_NEEDS_SPOT_CHECK/gi,'Needs spot check')
  .replace(/UNREVIEWED/gi,'Not reviewed')
  .replace(/UNMAPPED/gi,'Master link pending')
  .replace(/LINKED/gi,'Linked');
function priceNumber(v){const m=String(v||'').replace(/,/g,'').match(/\$\s*([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):Number.POSITIVE_INFINITY}
function sourceDate(v){const m=String(v||'').match(/20\d{2}-\d{2}-\d{2}/);return m?m[0]:''}

function ensureStyle(){
  if(by('pc901style'))return;
  const s=document.createElement('style');s.id='pc901style';s.textContent=`
#priceCatalog .pc901-note{margin:7px 0 10px;color:#6b7871;font-size:9px;line-height:1.4}
#priceCatalog .pc901-head{display:grid;grid-template-columns:minmax(170px,1.65fr) 90px 125px 105px 26px;gap:8px;align-items:center;padding:0 11px 6px;color:#68766f;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.03em}
#priceCatalog .pc-list{display:grid;gap:5px}
#priceCatalog .pc-row{display:block!important;padding:0!important;border:1px solid #dce5e0!important;border-radius:8px!important;overflow:hidden;background:#fff!important}
#priceCatalog .pc901-main{width:100%;display:grid;grid-template-columns:minmax(170px,1.65fr) 90px 125px 105px 26px;gap:8px;align-items:center;padding:9px 11px;border:0;background:#fff;color:#25312b;text-align:left;cursor:pointer;font:inherit}
#priceCatalog .pc901-main:hover{background:#fafcfb}
#priceCatalog .pc901-product{min-width:0}.pc901-product b{display:block;color:#173d30;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pc901-product small{display:block;margin-top:2px;color:#76827c;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#priceCatalog .pc901-type,#priceCatalog .pc901-status{min-width:0}.pc901-chip{display:inline-flex;max-width:100%;padding:4px 6px;border-radius:999px;font-size:7.5px;font-weight:900;white-space:nowrap}.pc901-chip.stock{background:#e8f3ed;color:#245841}.pc901-chip.non{background:#edf4f8;color:#315f82}.pc901-chip.review{background:#fff1d6;color:#7a5700}.pc901-chip.link{background:#edf3f0;color:#315c49}.pc901-chip.pending{background:#fff1d6;color:#7a5700}
#priceCatalog .pc901-price{color:#173d30;font-size:10.5px;font-weight:900;line-height:1.25}.pc901-status{font-size:8.5px;color:#5d6a64;font-weight:800}.pc901-arrow{font-size:17px;color:#6e7c75;text-align:center;transition:transform .15s ease}.pc901-main[aria-expanded="true"] .pc901-arrow{transform:rotate(90deg)}
#priceCatalog .pc901-detail{display:none;padding:9px 11px 11px;border-top:1px solid #e5ebe8;background:#fbfcfc}.pc901-detail.on{display:block}.pc901-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px}.pc901-detail small{display:block;color:#718078;font-size:8.5px;line-height:1.45}.pc901-detail b{color:#31483d}.pc901-detail .full{grid-column:1/-1}
#priceCatalog .pc-tools #pc901sort{border:1px solid #ccd8d2;border-radius:7px;padding:8px;background:#fff;min-width:155px}
@media(max-width:720px){
 #priceCatalog .pc901-head{grid-template-columns:minmax(118px,1.45fr) 66px 87px 73px 18px;gap:5px;padding-left:8px;padding-right:8px;font-size:6.8px}
 #priceCatalog .pc901-main{grid-template-columns:minmax(118px,1.45fr) 66px 87px 73px 18px;gap:5px;padding:8px}
 #priceCatalog .pc901-product b{font-size:10.5px}.pc901-product small{font-size:7.6px}
 #priceCatalog .pc901-chip{font-size:6.5px;padding:3px 5px}.pc901-price{font-size:9px!important}.pc901-status{font-size:7.3px!important}.pc901-arrow{font-size:14px}
 #priceCatalog .pc901-detail-grid{grid-template-columns:1fr}.pc901-detail .full{grid-column:auto}
}
@media(max-width:430px){
 #priceCatalog .pc901-head{grid-template-columns:minmax(102px,1.4fr) 58px 76px 66px 16px;gap:4px}
 #priceCatalog .pc901-main{grid-template-columns:minmax(102px,1.4fr) 58px 76px 66px 16px;gap:4px}
 #priceCatalog .pc901-product b{font-size:9.8px}.pc901-product small{display:none}.pc901-price{font-size:8.5px!important}.pc901-status{font-size:6.8px!important}
}
`;document.head.appendChild(s);
}

function ensureControls(){
  const page=by(PAGE),tools=by('pc90search')?.parentElement,list=by(LIST);if(!page||!tools||!list)return;
  if(!by('pc901sort')){
    const sel=document.createElement('select');sel.id='pc901sort';sel.setAttribute('aria-label','Sort price catalog');
    sel.innerHTML='<option value="product">Sort: Product A–Z</option><option value="brand">Sort: Brand A–Z</option><option value="priceAsc">Sort: Price low–high</option><option value="priceDesc">Sort: Price high–low</option><option value="latest">Sort: Latest source</option>';
    sel.value=sortMode;sel.addEventListener('change',()=>{sortMode=sel.value;sortRows()});tools.appendChild(sel);
  }
  if(!by('pc901note')){const n=document.createElement('div');n.id='pc901note';n.className='pc901-note';n.textContent='Compact table view · tap any row to open product specifications, Product Master link and source details.';list.parentNode.insertBefore(n,list)}
  if(!by('pc901head')){const h=document.createElement('div');h.id='pc901head';h.className='pc901-head';h.innerHTML='<span>Product</span><span>Type</span><span>Price</span><span>Status</span><span></span>';list.parentNode.insertBefore(h,list)}
}

function classifyBadges(row){
  const badges=[...row.querySelectorAll('.pc-badge')].map(x=>txt(x));
  const type=badges.some(x=>x==='STOCK')?'STOCK':'NON-STOCK';
  const review=badges.some(x=>/NEEDS REVIEW/i.test(x));
  const linked=badges.some(x=>/^LINKED$/i.test(x));
  const pending=badges.some(x=>/UNMAPPED|PENDING/i.test(x));
  return {type,review,linked,pending};
}
function patchRow(row){
  if(!row||row.dataset.pc901==='1')return;
  const name=row.querySelector('.pc-name'),meta=row.querySelector('.pc-meta'),priceCol=row.children[1];
  if(!name||!priceCol)return;
  const title=txt(name.querySelector('b'))||'Unnamed product';
  const subtitle=txt(name.querySelector('small'));
  const price=txt(priceCol.querySelector('.pc-price'))||'—';
  const stockNote=txt(priceCol.querySelector('small'));
  const metaSmalls=[...meta?.querySelectorAll('small')||[]].map(x=>cleanStatus(txt(x))).filter(Boolean);
  const b=classifyBadges(row);
  const typeHtml=`<span class="pc901-chip ${b.type==='STOCK'?'stock':'non'}">${b.type==='STOCK'?'STOCK':'NON-STOCK'}</span>`;
  const statusLabel=b.review?'Review':b.linked?'Linked':b.pending?'Link pending':(b.type==='STOCK'?'Stock':'Showroom');
  const statusClass=b.review?'review':b.linked?'link':b.pending?'pending':'';
  row.dataset.pc901='1';row.dataset.pc901Title=title.toLowerCase();row.dataset.pc901Brand=(subtitle.split(' · ')[0]||'').toLowerCase();row.dataset.pc901Price=String(priceNumber(price));row.dataset.pc901Date=sourceDate(metaSmalls.join(' '));
  row.innerHTML=`<button type="button" class="pc901-main" aria-expanded="false"><span class="pc901-product"><b>${esc(title)}</b><small>${esc(subtitle)}</small></span><span class="pc901-type">${typeHtml}</span><span class="pc901-price">${esc(price)}</span><span class="pc901-status">${statusClass?`<span class="pc901-chip ${statusClass}">${esc(statusLabel)}</span>`:esc(statusLabel)}</span><span class="pc901-arrow">›</span></button><div class="pc901-detail"><div class="pc901-detail-grid"><small><b>Product</b><br>${esc(title)}${subtitle?'<br>'+esc(subtitle):''}</small><small><b>Inventory class</b><br>${esc(b.type==='STOCK'?(stockNote||'Stock product'):'Showroom only · no inventory quantity')}</small><small class="full"><b>Specifications</b><br>${esc(metaSmalls[0]||'No additional specifications')}</small><small class="full"><b>Source / review</b><br>${esc(metaSmalls.slice(1).join(' · ')||metaSmalls[0]||'—')}</small></div></div>`;
  const btn=row.querySelector('.pc901-main'),detail=row.querySelector('.pc901-detail');btn?.addEventListener('click',()=>{const on=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',on?'true':'false');detail?.classList.toggle('on',on)});
}
function sortRows(){
  const list=by(LIST);if(!list)return;const rs=[...list.querySelectorAll('.pc-row[data-pc901="1"]')];
  const cmp=(a,b)=>{if(sortMode==='brand')return (a.dataset.pc901Brand||'').localeCompare(b.dataset.pc901Brand||'')||(a.dataset.pc901Title||'').localeCompare(b.dataset.pc901Title||'');if(sortMode==='priceAsc')return Number(a.dataset.pc901Price)-Number(b.dataset.pc901Price);if(sortMode==='priceDesc')return Number(b.dataset.pc901Price)-Number(a.dataset.pc901Price);if(sortMode==='latest')return (b.dataset.pc901Date||'').localeCompare(a.dataset.pc901Date||'')||(a.dataset.pc901Title||'').localeCompare(b.dataset.pc901Title||'');return (a.dataset.pc901Title||'').localeCompare(b.dataset.pc901Title||'')};
  rs.sort(cmp).forEach(r=>list.appendChild(r));
}
function patch(){
  if(busy)return;busy=true;
  try{ensureStyle();ensureControls();const list=by(LIST);if(!list)return;[...list.querySelectorAll('.pc-row')].forEach(patchRow);sortRows()}finally{busy=false}
}
function watch(){
  const list=by(LIST);if(!list)return false;if(observer)observer.disconnect();observer=new MutationObserver(()=>setTimeout(patch,0));observer.observe(list,{childList:true,subtree:true});patch();return true;
}
function install(){
  ensureStyle();let tries=0;const timer=setInterval(()=>{ensureControls();if(watch()||++tries>80)clearInterval(timer)},150);
  const rootObs=new MutationObserver(()=>{if(by(PAGE)&&by(LIST)&&(!observer||observer._pcList!==by(LIST))){watch();observer._pcList=by(LIST)}});try{rootObs.observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
  window.RUNLUPriceCatalogTableV090R1={version:'0.3.90r1',refresh:patch,sort:(v)=>{sortMode=v||'product';if(by('pc901sort'))by('pc901sort').value=sortMode;sortRows()}};
  return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();