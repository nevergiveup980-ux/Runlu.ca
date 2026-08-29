/* RUNLU Deerfoot Flooring OS · V0.3.70 Pricing Foundation
   Product/pricing master-data framework and safe links to Order Economics.
   Principles:
   - No fake prices are seeded.
   - Pricing is a source; an Order uses an explicit captured price snapshot.
   - Historical Order estimates never silently follow later catalog price changes.
   - Existing Order / PO / Vendor Bill / Accounting storage remains backward compatible.
   - Current storage is browser-local operational storage; Supabase is a future backend target.
   - No MutationObserver; V0.3.63 remains the stable renderer rollback baseline.

   Future backend entity shape (reserved):
   pricing_product(id, sku, style, colour, manufacturer, supplier, category,
     purchase_unit, sell_unit, conversion_factor,
     standard_cost, current_supplier_cost,
     retail_price, builder_price, promo_price, minimum_price,
     effective_from, effective_to, branch, price_source, active, notes,
     created_at, updated_at)

   Order line additive link fields (reserved / backward compatible):
     productId
     pricingSnapshotV070 { productId, sku, style, colour, supplier,
       purchaseUnit, sellUnit, conversionFactor, unitCost,
       standardCost, currentCost, retailPrice, builderPrice, promoPrice,
       minimumPrice, effectiveFrom, effectiveTo, priceSource, capturedAt }
*/
(function(){
'use strict';
if(window.__runluPricingFoundationV070)return;
window.__runluPricingFoundationV070=true;

const CAT='runlu_pricing_catalog_v070';
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const money=v=>v==null||v===''?'—':Number(v||0).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const numOrNull=v=>{if(v==null||String(v).trim()==='')return null;const x=Number(String(v).replace(/[$,]/g,''));return Number.isFinite(x)?Math.round((x+Number.EPSILON)*10000)/10000:null};
const round2=x=>Math.round((Number(x||0)+Number.EPSILON)*100)/100;
const now=()=>new Date().toISOString();
const today=()=>new Date().toISOString().slice(0,10);
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
let editId=null;

function readCatalog(){try{const x=JSON.parse(localStorage.getItem(CAT)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function writeCatalog(xs){try{localStorage.setItem(CAT,JSON.stringify(xs));return true}catch(_){return false}}
function activeOrder(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function saveOrders(){try{if(typeof window.saveStore==='function'){window.saveStore();return true}}catch(_){}return false}
function keyText(p){return [p.sku,p.style,p.colour,p.supplier].filter(Boolean).join(' · ')||p.id}
function effective(p,d=today()){
  if(!p||p.active===false)return false;
  if(p.effectiveFrom&&String(p.effectiveFrom)>d)return false;
  if(p.effectiveTo&&String(p.effectiveTo)<d)return false;
  return true;
}
function catalogSorted(){return readCatalog().slice().sort((a,b)=>collator.compare(String(a.sku||a.style||a.id),String(b.sku||b.style||b.id)))}
function getProduct(id){return readCatalog().find(p=>String(p.id)===String(id))||null}
function resolvedUnitCost(p){if(!p)return null;return p.currentCost!=null?p.currentCost:p.standardCost!=null?p.standardCost:null}
function sellUnitCostFromProduct(p){
  const c=resolvedUnitCost(p);if(c==null)return null;
  const pu=String(p.purchaseUnit||'').trim().toUpperCase(),su=String(p.sellUnit||'').trim().toUpperCase();
  const f=Number(p.conversionFactor||1);
  if(pu&&su&&pu!==su){if(!(f>0))return null;return c/f}
  return c;
}
function snapshotProduct(p){
  if(!p)return null;
  return {
    productId:p.id,sku:p.sku||'',style:p.style||'',colour:p.colour||'',manufacturer:p.manufacturer||'',supplier:p.supplier||'',category:p.category||'',
    purchaseUnit:p.purchaseUnit||'',sellUnit:p.sellUnit||'',conversionFactor:Number(p.conversionFactor||1),
    unitCost:resolvedUnitCost(p),standardCost:p.standardCost??null,currentCost:p.currentCost??null,
    retailPrice:p.retailPrice??null,builderPrice:p.builderPrice??null,promoPrice:p.promoPrice??null,minimumPrice:p.minimumPrice??null,
    effectiveFrom:p.effectiveFrom||'',effectiveTo:p.effectiveTo||'',branch:p.branch||'Deerfoot',priceSource:p.priceSource||'',capturedAt:now()
  };
}
function qtyNumber(item){const m=String(item?.qty??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):0}
function estimateOrder(j){
  const lines=Array.isArray(j?.items)?j.items:[];
  if(!lines.length)return {complete:false,total:null,covered:0,lines:0,missing:0,details:[]};
  let total=0,covered=0;
  const details=lines.map((item,index)=>{
    const snap=item?.pricingSnapshotV070||null,q=qtyNumber(item);
    let unitCost=null,reason='Price snapshot missing';
    if(snap){
      const base=snap.unitCost!=null?Number(snap.unitCost):null;
      const pu=String(snap.purchaseUnit||'').trim().toUpperCase(),su=String(snap.sellUnit||'').trim().toUpperCase(),f=Number(snap.conversionFactor||1);
      if(base==null||!Number.isFinite(base))reason='Cost missing in snapshot';
      else if(pu&&su&&pu!==su&&!(f>0))reason='Unit conversion missing';
      else if(!(q>0))reason='Quantity missing';
      else {unitCost=pu&&su&&pu!==su?base/f:base;covered++;total+=q*unitCost;reason='Captured'}
    }
    return {index,item,qty:q,snapshot:snap,unitCost,estimated:unitCost==null?null:round2(q*unitCost),reason};
  });
  return {complete:covered===lines.length,total:covered===lines.length?round2(total):null,partialTotal:round2(total),covered,lines:lines.length,missing:lines.length-covered,details};
}

function blankProduct(){return {id:'',sku:'',style:'',colour:'',manufacturer:'',supplier:'',category:'',purchaseUnit:'',sellUnit:'',conversionFactor:1,standardCost:null,currentCost:null,retailPrice:null,builderPrice:null,promoPrice:null,minimumPrice:null,effectiveFrom:'',effectiveTo:'',branch:'Deerfoot',priceSource:'',active:true,notes:''}}
function formValue(id){return by(id)?.value??''}
function checked(id){return !!by(id)?.checked}
function collectForm(){
  return {
    sku:formValue('r70sku').trim(),style:formValue('r70style').trim(),colour:formValue('r70colour').trim(),manufacturer:formValue('r70manufacturer').trim(),supplier:formValue('r70supplier').trim(),category:formValue('r70category').trim(),
    purchaseUnit:formValue('r70purchaseUnit').trim(),sellUnit:formValue('r70sellUnit').trim(),conversionFactor:numOrNull(formValue('r70factor'))??1,
    standardCost:numOrNull(formValue('r70standardCost')),currentCost:numOrNull(formValue('r70currentCost')),retailPrice:numOrNull(formValue('r70retailPrice')),builderPrice:numOrNull(formValue('r70builderPrice')),promoPrice:numOrNull(formValue('r70promoPrice')),minimumPrice:numOrNull(formValue('r70minimumPrice')),
    effectiveFrom:formValue('r70from'),effectiveTo:formValue('r70to'),branch:formValue('r70branch').trim()||'Deerfoot',priceSource:formValue('r70source').trim(),active:checked('r70active'),notes:formValue('r70notes').trim()
  };
}
function saveProduct(){
  const p=collectForm();
  if(!p.sku&&!p.style)return alert('Enter at least a SKU or Style / Product name.');
  if(p.purchaseUnit&&p.sellUnit&&p.purchaseUnit.toUpperCase()!==p.sellUnit.toUpperCase()&&!(p.conversionFactor>0))return alert('Enter a conversion factor when purchase and selling units differ.');
  const xs=readCatalog(),stamp=now();
  if(editId){const i=xs.findIndex(x=>x.id===editId);if(i<0)return;xs[i]={...xs[i],...p,updatedAt:stamp}}
  else xs.push({...blankProduct(),...p,id:'prd-'+Date.now(),createdAt:stamp,updatedAt:stamp});
  if(!writeCatalog(xs))return alert('Pricing could not be saved in this browser.');
  editId=null;render();
}
function editProduct(id){editId=id;render();setTimeout(()=>by('r70form')?.scrollIntoView({block:'start',behavior:'smooth'}),0)}
function newProduct(){editId=null;render();setTimeout(()=>by('r70sku')?.focus(),0)}
function deactivateProduct(id){const xs=readCatalog(),i=xs.findIndex(x=>x.id===id);if(i<0)return;xs[i].active=!xs[i].active;xs[i].updatedAt=now();writeCatalog(xs);render()}

function ensureStyle(){if(by('r70styleTag'))return;const s=document.createElement('style');s.id='r70styleTag';s.textContent=`
#pricing{padding-bottom:28px}.r70hero{border-left:5px solid #315f82}.r70hero h2{margin:0;color:#173d30}.r70hero p{margin:5px 0 0;color:#68756f;font-size:11px;line-height:1.45}.r70head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r70status{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.r70pill{border-radius:999px;padding:5px 8px;font-size:9px;font-weight:900}.r70pill.green{background:#e9f3ee;color:#1f5a45}.r70pill.gold{background:#fff5d9;color:#79570f}.r70pill.blue{background:#edf4f8;color:#315f82}.r70pill.gray{background:#eef1ef;color:#66716c}.r70flow{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:12px}.r70node{border:1px solid #dce4e0;border-radius:9px;padding:8px;background:#fff;text-align:center;font-size:9px;font-weight:900;color:#315f82}.r70node.on{border-left:4px solid #1f5a45;color:#1f5a45}.r70node.wait{border-left:4px solid #a97816;color:#79570f}.r70grid{display:grid;grid-template-columns:1.05fr .95fr;gap:12px;margin-top:12px}.r70box{border:1px solid #dce4e0;border-radius:11px;background:#fff;padding:12px}.r70box h3{margin:0 0 9px;color:#173d30;font-size:14px}.r70form{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.r70form label{font-size:9.5px;font-weight:800;color:#53625a}.r70form input,.r70form select,.r70form textarea{width:100%;margin-top:4px;padding:8px;border:1px solid #cfd9d4;border-radius:7px;background:#fff;color:#25312b}.r70form textarea{min-height:68px;resize:vertical}.r70span2{grid-column:span 2}.r70span3{grid-column:span 3}.r70check{display:flex;gap:7px;align-items:center;padding-top:17px}.r70check input{width:auto;margin:0}.r70actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.r70catalog{margin-top:12px;border:1px solid #dce4e0;border-radius:10px;overflow:hidden}.r70row{display:grid;grid-template-columns:minmax(160px,1.4fr) 110px 105px 100px 100px 95px 90px;gap:7px;align-items:center;padding:8px 9px;border-bottom:1px solid #e8edeb;font-size:9.5px}.r70row:last-child{border-bottom:0}.r70row.head{background:#f7f9f8;color:#6b7871;font-weight:900}.r70row b{color:#173d30}.r70muted{color:#6c7973}.r70badge{display:inline-flex;border-radius:999px;padding:4px 6px;font-size:8px;font-weight:900}.r70badge.green{background:#e9f3ee;color:#1f5a45}.r70badge.gray{background:#eef1ef;color:#66716c}.r70badge.gold{background:#fff5d9;color:#79570f}.r70order{display:grid;gap:7px}.r70line{display:grid;grid-template-columns:minmax(150px,1.25fr) minmax(150px,1fr) 118px 92px;gap:7px;align-items:center;padding:8px;border:1px solid #e2e8e5;border-radius:8px;background:#fafcfb;font-size:9.5px}.r70line select{width:100%;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff}.r70note{margin-top:9px;padding:9px 10px;border-left:4px solid #315f82;background:#edf4f8;border-radius:0 8px 8px 0;color:#496273;font-size:10px;line-height:1.45}.r70note.gold{border-left-color:#a97816;background:#fff7e2;color:#6a571d}.r70estimate{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.r70metric{border:1px solid #dce4e0;border-radius:8px;padding:8px}.r70metric small{display:block;color:#6c7973;font-size:8.5px}.r70metric b{display:block;margin-top:4px;color:#173d30;font-size:13px}@media(max-width:900px){.r70flow{grid-template-columns:repeat(3,1fr)}.r70grid{grid-template-columns:1fr}.r70row{grid-template-columns:minmax(150px,1.4fr) 95px 90px 82px}.r70hideTablet{display:none}.r70line{grid-template-columns:1fr 1fr 105px}}@media(max-width:580px){.r70flow{grid-template-columns:1fr 1fr}.r70form{grid-template-columns:1fr 1fr}.r70span2,.r70span3{grid-column:span 2}.r70row{grid-template-columns:1fr 80px}.r70hideMobile{display:none}.r70line{grid-template-columns:1fr}.r70estimate{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function ensurePage(){
  ensureStyle();let p=by('pricing');if(p)return p;
  const accounting=by('accounting');if(!accounting)return null;
  p=document.createElement('section');p.id='pricing';p.className='page';
  accounting.parentElement.insertBefore(p,accounting);
  p.addEventListener('click',ev=>{
    const b=ev.target.closest('[data-r70]');if(!b)return;
    const a=b.dataset.r70,id=b.dataset.id;
    if(a==='new')newProduct();else if(a==='save')saveProduct();else if(a==='cancel'){editId=null;render()}else if(a==='edit')editProduct(id);else if(a==='toggle')deactivateProduct(id);else if(a==='snap')captureLine(Number(b.dataset.line));else if(a==='refresh')render();
  });
  p.addEventListener('change',ev=>{const s=ev.target.closest('[data-r70-link]');if(s)linkLine(Number(s.dataset.r70Link),s.value)});
  return p;
}
function ensureNav(){
  const nav=by('nav');if(!nav||nav.querySelector('[data-page="pricing"]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.page='pricing';b.textContent='Pricing';b.onclick=openPricing;
  const settings=nav.querySelector('[data-page="settings"]');nav.insertBefore(b,settings||null);
}
function patchNav(){
  if(typeof window.renderNav==='function'&&!window.renderNav.__r70){const old=window.renderNav;const w=function(){const z=old.apply(this,arguments);ensureNav();return z};w.__r70=1;window.renderNav=w}
  ensureNav();
}
function openPricing(){
  ensurePage();ensureNav();
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='pricing'));
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='pricing'));
  render();window.scrollTo({top:0,behavior:'smooth'});
}

function productOptions(selected){return '<option value="">— Unlinked —</option>'+catalogSorted().filter(p=>p.active!==false).map(p=>`<option value="${attr(p.id)}"${String(selected||'')===String(p.id)?' selected':''}>${esc(keyText(p))}</option>`).join('')}
function linkLine(i,id){
  const j=activeOrder();if(!j||!Array.isArray(j.items)||!j.items[i])return;
  if(!id){delete j.items[i].productId;delete j.items[i].pricingSnapshotV070}
  else j.items[i].productId=id;
  saveOrders();render();scheduleAccounting();
}
function captureLine(i){
  const j=activeOrder();if(!j||!Array.isArray(j.items)||!j.items[i])return;
  const item=j.items[i],p=getProduct(item.productId);
  if(!p)return alert('Choose a Pricing Product first.');
  if(!effective(p)&&!confirm('This pricing record is inactive or outside its effective dates. Capture it anyway?'))return;
  item.pricingSnapshotV070=snapshotProduct(p);saveOrders();render();scheduleAccounting();
}
function lineStatus(item){
  if(!item.productId)return '<span class="r70badge gray">UNLINKED</span>';
  if(!item.pricingSnapshotV070)return '<span class="r70badge gold">LINKED · SNAPSHOT NEEDED</span>';
  return item.pricingSnapshotV070.unitCost==null?'<span class="r70badge gold">SNAPSHOT · COST MISSING</span>':'<span class="r70badge green">SNAPSHOT ✓</span>';
}
function orderLinkHtml(){
  const j=activeOrder();if(!j)return '<div class="r70note gold">Select an Order first. Pricing never invents an Order link.</div>';
  const items=Array.isArray(j.items)?j.items:[],est=estimateOrder(j);
  if(!items.length)return `<div class="r70note gold">Order ${esc(j.jobNumber||'')} has no item lines to link.</div>`;
  return `<div class="r70order">${items.map((x,i)=>`<div class="r70line"><div><b>${esc(x.style||'Item '+(i+1))}</b><br><span class="r70muted">${esc(x.colour||'')} · ${esc(x.qty||'Qty not set')}</span></div><select data-r70-link="${i}">${productOptions(x.productId)}</select><button type="button" class="action" data-r70="snap" data-line="${i}">Capture / Refresh</button><span>${lineStatus(x)}</span></div>`).join('')}</div><div class="r70estimate"><div class="r70metric"><small>PRICE SNAPSHOT COVERAGE</small><b>${est.covered} / ${est.lines}</b></div><div class="r70metric"><small>ESTIMATED MATERIAL COST</small><b>${est.complete?money(est.total):'Not captured'}</b></div><div class="r70metric"><small>ACCOUNTING STATUS</small><b>${est.complete?'Ready':'Waiting'}</b></div></div><div class="r70note ${est.complete?'':'gold'}">${est.complete?'All Order lines have usable captured cost snapshots. Accounting Estimate may now use this baseline.':`${est.missing} line${est.missing===1?'':'s'} still lack a usable captured cost snapshot. Accounting must continue to show Not captured.`}</div>`;
}

function formHtml(p){
  return `<div id="r70form" class="r70box"><div class="r70head"><div><h3>${editId?'EDIT PRODUCT / PRICE':'NEW PRODUCT / PRICE'}</h3><div class="r70muted">Blank values stay blank. Nothing is inferred.</div></div><span class="r70pill blue">${editId?'EDIT':'DATA ENTRY'}</span></div><div class="r70form" style="margin-top:9px">
  <label>SKU / Product Code<input id="r70sku" value="${attr(p.sku)}"></label><label>Style / Product Name<input id="r70style" value="${attr(p.style)}"></label><label>Colour<input id="r70colour" value="${attr(p.colour)}"></label>
  <label>Manufacturer<input id="r70manufacturer" value="${attr(p.manufacturer)}"></label><label>Supplier<input id="r70supplier" value="${attr(p.supplier)}"></label><label>Category<input id="r70category" placeholder="Carpet / LVP / Hardwood / Sundry…" value="${attr(p.category)}"></label>
  <label>Purchase Unit<input id="r70purchaseUnit" placeholder="ROLL / CARTON / SY / PAIL" value="${attr(p.purchaseUnit)}"></label><label>Sell Unit<input id="r70sellUnit" placeholder="SY / SQFT / EA" value="${attr(p.sellUnit)}"></label><label>Sell units per 1 purchase unit<input id="r70factor" type="number" step="0.0001" value="${attr(p.conversionFactor??1)}"></label>
  <label>Standard Cost<input id="r70standardCost" type="number" step="0.0001" value="${attr(p.standardCost??'')}"></label><label>Current Supplier Cost<input id="r70currentCost" type="number" step="0.0001" value="${attr(p.currentCost??'')}"></label><label>Retail Price<input id="r70retailPrice" type="number" step="0.0001" value="${attr(p.retailPrice??'')}"></label>
  <label>Builder / Contract Price<input id="r70builderPrice" type="number" step="0.0001" value="${attr(p.builderPrice??'')}"></label><label>Promotion Price<input id="r70promoPrice" type="number" step="0.0001" value="${attr(p.promoPrice??'')}"></label><label>Minimum / Floor Price<input id="r70minimumPrice" type="number" step="0.0001" value="${attr(p.minimumPrice??'')}"></label>
  <label>Effective From<input id="r70from" type="date" value="${attr(p.effectiveFrom)}"></label><label>Effective To<input id="r70to" type="date" value="${attr(p.effectiveTo)}"></label><label>Branch / Location<input id="r70branch" value="${attr(p.branch||'Deerfoot')}"></label>
  <label class="r70span2">Price Source / Reference<input id="r70source" placeholder="Supplier list / contract / manual confirmation…" value="${attr(p.priceSource)}"></label><label class="r70check"><input id="r70active" type="checkbox"${p.active!==false?' checked':''}> Active</label>
  <label class="r70span3">Notes<textarea id="r70notes">${esc(p.notes||'')}</textarea></label></div><div class="r70actions"><button type="button" class="action primary" data-r70="save">${editId?'Save Changes':'Save Product / Price'}</button>${editId?'<button type="button" class="action" data-r70="cancel">Cancel</button>':''}</div></div>`;
}
function catalogHtml(xs){
  if(!xs.length)return '<div class="r70note gold">Pricing Catalog is empty. This is intentional: RUNLU does not seed demo or invented business prices.</div>';
  return `<div class="r70catalog"><div class="r70row head"><span>PRODUCT</span><span>SUPPLIER</span><span>UNITS</span><span>CURRENT COST</span><span>RETAIL</span><span class="r70hideTablet">EFFECTIVE</span><span>STATUS</span></div>${xs.map(p=>`<div class="r70row"><div><b>${esc(p.sku||p.style||p.id)}</b><br><span class="r70muted">${esc([p.style,p.colour].filter(Boolean).join(' · '))}</span></div><span>${esc(p.supplier||'—')}</span><span>${esc((p.purchaseUnit||'—')+' → '+(p.sellUnit||'—'))}</span><span>${money(p.currentCost!=null?p.currentCost:p.standardCost)}</span><span>${money(p.retailPrice)}</span><span class="r70hideTablet">${esc(p.effectiveFrom||'—')}${p.effectiveTo?' → '+esc(p.effectiveTo):''}</span><span><span class="r70badge ${effective(p)?'green':'gray'}">${effective(p)?'ACTIVE':'INACTIVE'}</span><br><button type="button" class="action" style="margin-top:4px;padding:4px 6px" data-r70="edit" data-id="${attr(p.id)}">Edit</button> <button type="button" class="action" style="margin-top:4px;padding:4px 6px" data-r70="toggle" data-id="${attr(p.id)}">${p.active===false?'Enable':'Disable'}</button></span></div>`).join('')}</div>`;
}
function render(){
  const page=ensurePage();if(!page)return;ensureNav();
  const xs=catalogSorted(),p=editId?getProduct(editId)||blankProduct():blankProduct(),j=activeOrder(),est=estimateOrder(j);
  page.innerHTML=`<div class="card r70hero"><div class="r70head"><div><h2>PRODUCT & PRICING FOUNDATION</h2><p>Pricing is the financial source layer. Orders use explicit price snapshots; PO and Vendor Bills remain the committed / actual layers.</p></div><div class="r70status"><span class="r70pill blue">V0.3.70</span><span class="r70pill ${xs.length?'green':'gray'}">${xs.length} PRICING RECORD${xs.length===1?'':'S'}</span><span class="r70pill gray">BACKEND · NOT CONNECTED</span></div></div><div class="r70flow"><div class="r70node ${xs.length?'on':'wait'}">PRODUCT</div><div class="r70node ${xs.length?'on':'wait'}">PRICING</div><div class="r70node ${est.complete?'on':'wait'}">ORDER SNAPSHOT</div><div class="r70node on">PO · COMMITTED</div><div class="r70node on">VENDOR BILL · ACTUAL</div><div class="r70node ${est.complete?'on':'wait'}">ACCOUNTING · ESTIMATE</div></div><div class="r70note">Reserved data path: <b>Product → Pricing → Order Price Snapshot → PO → Vendor Bill → Accounting</b>. Current Pricing records are browser-local operational data until the central Supabase layer is connected.</div></div>
  <div class="r70grid">${formHtml(p)}<div class="r70box"><div class="r70head"><div><h3>ACTIVE ORDER · PRICING LINK</h3><div class="r70muted">${j?`Order ${esc(j.jobNumber||'—')} · ${esc(j.customerName||'')}`:'No active Order'}</div></div><button type="button" class="action" data-r70="refresh">Refresh</button></div><div style="margin-top:9px">${orderLinkHtml()}</div></div></div>
  <div class="r70box" style="margin-top:12px"><div class="r70head"><div><h3>PRICING CATALOG</h3><div class="r70muted">Current price source. Existing Order snapshots do not change when this catalog is edited later.</div></div><button type="button" class="action primary" data-r70="new">+ New Product / Price</button></div>${catalogHtml(xs)}</div>`;
}

function patchAccounting(){
  const root=by('r69economics'),j=activeOrder();if(!root||!j)return;
  const step=root.querySelector('.r69steps .r69step');if(!step)return;
  const est=estimateOrder(j),small=step.querySelector('small'),b=step.querySelector('b'),span=step.querySelector('span');
  if(small)small.textContent='ESTIMATE · PRICING SNAPSHOT';
  step.classList.remove('green','gold','blue','red','gray');
  if(est.complete){step.classList.add('green');if(b)b.textContent=money(est.total);if(span)span.textContent=`Captured baseline from ${est.lines} / ${est.lines} Order line price snapshots. Later catalog changes do not alter this historical snapshot.`}
  else {step.classList.add('gray');if(b)b.textContent='Not captured';if(span)span.textContent=est.lines?`${est.covered} / ${est.lines} Order lines have usable captured cost snapshots. Estimate stays unavailable until coverage is complete.`:'No Order lines are available for a pricing estimate.'}
}
let timer=0;function scheduleAccounting(){clearTimeout(timer);timer=setTimeout(()=>{try{window.RUNLUAccountingOrderEconomicsV069?.render?.()}catch(_){}setTimeout(patchAccounting,40)},90)}
function patchAccountingHooks(){
  if(typeof window.renderAccounting==='function'&&!window.renderAccounting.__r70){const old=window.renderAccounting;const w=function(){const z=old.apply(this,arguments);scheduleAccounting();return z};w.__r70=1;window.renderAccounting=w}
  document.addEventListener('click',ev=>{if(ev.target?.closest?.('#accounting button,#accounting .action'))scheduleAccounting()},true);
}
function install(){ensurePage();patchNav();patchAccountingHooks();render();scheduleAccounting();setTimeout(()=>{patchNav();scheduleAccounting()},500)}
window.RUNLUPricingV070={install,open:openPricing,render,refresh:render,catalog:readCatalog,getProduct,snapshotProduct,estimateOrder,resolveUnitCost:sellUnitCostFromProduct,patchAccounting};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();