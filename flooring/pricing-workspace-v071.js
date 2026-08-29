/* RUNLU Deerfoot Flooring OS · V0.3.71 Pricing Workspace
   Unifies Product & Cost, Sales Pricing Rules, and Active Order Pricing.
   - Preserves V0.3.70 Product/Pricing catalog and explicit order price snapshots.
   - Reuses legacy sales pricing profile storage when present; never invents missing company rules.
   - Selling prices change only through explicit per-line Apply actions.
   - Captures an order-line pricing rule snapshot so later rule edits do not rewrite history.
   - Minimum/Floor Price is a guardrail; below-floor application requires an explicit reason + confirmation.
   - Browser-local operational storage only; no Supabase/Bank/G/L claims.
   - No MutationObserver; V0.3.63 remains the stable renderer rollback baseline.
*/
(function(){
'use strict';
if(window.__runluPricingWorkspaceV071)return;
window.__runluPricingWorkspaceV071=true;

const RULE_STORE='runlu_deerfoot_sales_pricing_settings_v1';
const PROFILES=[
  ['standard','Standard / Regular'],
  ['contractor','Contractor'],
  ['repeat','Repeat Customer'],
  ['referral','Referral / Friend'],
  ['large','Large Order / Volume'],
  ['employee','Employee']
];
const BASES=[
  ['rule','Markup Rule'],
  ['retail','Product Retail'],
  ['builder','Builder / Contract'],
  ['promo','Promotion'],
  ['custom','Custom Price']
];
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=v=>esc(v).replace(/"/g,'&quot;');
const round2=n=>Math.round((Number(n||0)+Number.EPSILON)*100)/100;
const money=v=>v==null||v===''||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('en-CA',{style:'currency',currency:'CAD'});
const pct=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
const qty=v=>{const m=String(v??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);const n=m?Number(m[0]):NaN;return Number.isFinite(n)&&n>0?n:0};
const profileLabel=id=>PROFILES.find(x=>x[0]===id)?.[1]||id||'—';
const basisLabel=id=>BASES.find(x=>x[0]===id)?.[1]||id||'—';
let rules=loadRules();

function loadRules(){
  const base={profiles:{standard:'',contractor:'',repeat:'',referral:'',large:'',employee:''}};
  try{
    const saved=JSON.parse(localStorage.getItem(RULE_STORE)||'null');
    if(saved&&typeof saved==='object')return {...saved,profiles:{...base.profiles,...(saved.profiles||{})}};
  }catch(_){}
  return base;
}
function writeRules(next){try{localStorage.setItem(RULE_STORE,JSON.stringify(next));rules=next;return true}catch(_){return false}}
function activeOrder(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function saveOrders(){try{if(typeof window.saveStore==='function'){window.saveStore();return true}}catch(_){}return false}
function pricingApi(){return window.RUNLUPricingV070||null}
function sellUnitCostFromSnapshot(s){
  if(!s)return null;
  const base=s.unitCost!=null?Number(s.unitCost):(s.currentCost!=null?Number(s.currentCost):(s.standardCost!=null?Number(s.standardCost):NaN));
  if(!Number.isFinite(base))return null;
  const pu=String(s.purchaseUnit||'').trim().toUpperCase(),su=String(s.sellUnit||'').trim().toUpperCase(),f=Number(s.conversionFactor||1);
  if(pu&&su&&pu!==su){if(!(f>0))return null;return base/f}
  return base;
}
function snapshotRefs(item){
  const s=item?.pricingSnapshotV070||null;
  return {
    snap:s,
    cost:sellUnitCostFromSnapshot(s),
    retail:s?.retailPrice==null?null:Number(s.retailPrice),
    builder:s?.builderPrice==null?null:Number(s.builderPrice),
    promo:s?.promoPrice==null?null:Number(s.promoPrice),
    minimum:s?.minimumPrice==null?null:Number(s.minimumPrice)
  };
}
function ruleMarkup(id){return pct(rules?.profiles?.[id])}
function selectedProfile(item){return item?.pricingRuleSnapshotV071?.profileId||item?.pricingProfileV071||item?.pricingProfile||'standard'}
function selectedBasis(item){return item?.pricingRuleSnapshotV071?.basis||item?.pricingBasisV071||'rule'}
function profileOptions(selected){return PROFILES.map(([id,label])=>`<option value="${id}"${id===selected?' selected':''}>${esc(label)}</option>`).join('')}
function basisOptions(selected){return BASES.map(([id,label])=>`<option value="${id}"${id===selected?' selected':''}>${esc(label)}</option>`).join('')}
function suggested(item,basis,profile,markupOverride){
  const r=snapshotRefs(item);
  if(basis==='retail')return Number.isFinite(r.retail)?r.retail:null;
  if(basis==='builder')return Number.isFinite(r.builder)?r.builder:null;
  if(basis==='promo')return Number.isFinite(r.promo)?r.promo:null;
  if(basis==='custom')return null;
  const m=markupOverride==null?ruleMarkup(profile):pct(markupOverride);
  if(r.cost==null||m==null)return null;
  return round2(r.cost*(1+m/100));
}
function lineMargin(item,selling){
  const c=snapshotRefs(item).cost,p=Number(selling);
  if(c==null||!Number.isFinite(p)||p<=0)return null;
  return (p-c)/p*100;
}
function lineStatus(item){
  if(!item?.pricingSnapshotV070)return ['gray','PRODUCT SNAPSHOT NEEDED'];
  const s=item.pricingRuleSnapshotV071;
  if(!s)return ['gold','ORDER PRICE NOT APPLIED'];
  const min=snapshotRefs(item).minimum,price=Number(item.price);
  if(min!=null&&Number.isFinite(price)&&price<min)return ['red','BELOW FLOOR · APPROVED'];
  return ['green','ORDER PRICE SNAPSHOT ✓'];
}

function ensureStyle(){
  if(by('r71styleTag'))return;
  const s=document.createElement('style');s.id='r71styleTag';s.textContent=`
#r71workspace{margin-top:12px}.r71hero{border-left:5px solid #1f5a45}.r71head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.r71head h3{margin:0;color:#173d30;font-size:15px}.r71muted{color:#697770;font-size:10px;line-height:1.45}.r71pill{display:inline-flex;border-radius:999px;padding:5px 8px;font-size:8px;font-weight:900;white-space:nowrap}.r71pill.green{background:#e9f3ee;color:#1f5a45}.r71pill.gold{background:#fff5d9;color:#79570f}.r71pill.red{background:#fff0ee;color:#8b3a32}.r71pill.blue{background:#edf4f8;color:#315f82}.r71pill.gray{background:#eef1ef;color:#66716c}.r71section{border:1px solid #dce4e0;border-radius:11px;background:#fff;padding:12px;margin-top:12px}.r71rules{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.r71rule{border:1px solid #e0e7e3;border-radius:9px;padding:9px;background:#fafcfb}.r71rule label{display:block;font-size:9px;font-weight:900;color:#53625a}.r71pct{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;margin-top:5px}.r71pct input{width:100%;padding:8px;border:1px solid #cfd9d4;border-radius:7px;background:#fff}.r71pct span{font-size:9px;color:#697770;font-weight:800}.r71note{margin-top:9px;padding:9px 10px;border-left:4px solid #315f82;background:#edf4f8;border-radius:0 8px 8px 0;color:#496273;font-size:9.5px;line-height:1.45}.r71note.gold{border-left-color:#a97816;background:#fff7e2;color:#6a571d}.r71lines{display:grid;gap:9px;margin-top:10px}.r71line{border:1px solid #dfe7e3;border-radius:10px;padding:10px;background:#fbfcfc}.r71lineTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.r71refs{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.r71ref{border:1px solid #dce4e0;border-radius:999px;padding:4px 7px;font-size:8px;color:#5f6e67;background:#fff}.r71controls{display:grid;grid-template-columns:1.05fr 1fr .75fr .9fr 1.2fr;gap:7px;align-items:end;margin-top:9px}.r71controls label{font-size:8.5px;font-weight:900;color:#53625a}.r71controls select,.r71controls input{width:100%;margin-top:4px;padding:7px;border:1px solid #cfd9d4;border-radius:7px;background:#fff;color:#25312b}.r71preview{margin-top:8px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.r71metric{border:1px solid #e0e7e3;border-radius:8px;padding:7px;background:#fff}.r71metric small{display:block;color:#6b7871;font-size:7.5px;font-weight:900}.r71metric b{display:block;margin-top:3px;color:#173d30;font-size:11px}.r71actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.r71summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:10px}.r71summary .r71metric{padding:9px}.r71summary .r71metric b{font-size:13px}.r71empty{padding:12px 0;color:#6b7871;font-size:10px}@media(max-width:900px){.r71rules{grid-template-columns:repeat(2,minmax(0,1fr))}.r71controls{grid-template-columns:1fr 1fr 1fr}.r71preview{grid-template-columns:repeat(2,minmax(0,1fr))}.r71summary{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:580px){.r71head{display:block}.r71head .r71pill{margin-top:7px}.r71rules{grid-template-columns:1fr 1fr}.r71controls{grid-template-columns:1fr 1fr}.r71controls .r71wide{grid-column:1/-1}.r71summary{grid-template-columns:1fr 1fr}.r71lineTop{display:block}.r71lineTop .r71pill{margin-top:6px}}
`;
  document.head.appendChild(s);
}

function ruleEditorHtml(){
  return `<div class="r71section"><div class="r71head"><div><h3>SALES PRICING RULES</h3><div class="r71muted">Company markup defaults. Blank means no automatic suggestion. Existing legacy profile values on this browser are preserved when present.</div></div><button type="button" class="action primary" data-r71="save-rules">Save Pricing Rules</button></div><div class="r71rules">${PROFILES.map(([id,label])=>`<div class="r71rule"><label>${esc(label)}</label><div class="r71pct"><input id="r71rule_${id}" type="number" step="0.1" min="-100" inputmode="decimal" value="${attr(rules?.profiles?.[id]??'')}" placeholder="Blank"><span>% markup</span></div></div>`).join('')}</div><div class="r71note">Rules are <b>suggestions</b>, not live formulas. Applying a rule to an Order captures the profile and percentage on that Order line, so later rule changes do not rewrite old prices.</div></div>`;
}
function productRefHtml(r){
  return `<div class="r71refs"><span class="r71ref">Cost ${money(r.cost)}</span><span class="r71ref">Retail ${money(r.retail)}</span><span class="r71ref">Contract ${money(r.builder)}</span><span class="r71ref">Promo ${money(r.promo)}</span><span class="r71ref">Floor ${money(r.minimum)}</span></div>`;
}
function orderLineHtml(item,i){
  const r=snapshotRefs(item),profile=selectedProfile(item),basis=selectedBasis(item),rule=ruleMarkup(profile),sg=suggested(item,basis,profile,rule),status=lineStatus(item),applied=item?.pricingRuleSnapshotV071||null,current=Number(item?.price),margin=lineMargin(item,current);
  const sellUnit=r.snap?.sellUnit||'';
  return `<div class="r71line" data-r71-line="${i}"><div class="r71lineTop"><div><b>${esc(item?.style||r.snap?.style||'Item '+(i+1))}</b><div class="r71muted">${esc([item?.colour||r.snap?.colour,item?.supplier||r.snap?.supplier,item?.qty?('Qty '+item.qty):'',sellUnit].filter(Boolean).join(' · '))}</div>${productRefHtml(r)}</div><span class="r71pill ${status[0]}">${status[1]}</span></div><div class="r71controls"><label>Price Basis<select data-r71-basis>${basisOptions(basis)}</select></label><label>Markup Profile<select data-r71-profile>${profileOptions(profile)}</select></label><label>Markup %<input data-r71-markup type="number" step="0.1" inputmode="decimal" value="${rule==null?'':attr(rule)}" placeholder="Blank"></label><label>Selling / Unit<input data-r71-selling type="number" step="0.01" inputmode="decimal" value="${Number.isFinite(current)&&current>0?attr(round2(current)):''}" placeholder="Enter / use suggestion"></label><label class="r71wide">Override / Approval Reason<input data-r71-reason value="${attr(applied?.overrideReason||item?.overrideReason||'')}" placeholder="Required only below floor"></label></div><div class="r71preview"><div class="r71metric"><small>SUGGESTED PRICE</small><b data-r71-suggested>${sg==null?'Not available':money(sg)}</b></div><div class="r71metric"><small>CURRENT ORDER PRICE</small><b data-r71-current>${Number.isFinite(current)&&current>0?money(current):'Not set'}</b></div><div class="r71metric"><small>GROSS MARGIN</small><b data-r71-margin>${margin==null?'—':margin.toFixed(1)+'%'}</b></div><div class="r71metric"><small>APPLIED SOURCE</small><b>${applied?esc(basisLabel(applied.basis)+(applied.profileId?' · '+profileLabel(applied.profileId):'')):'Not captured'}</b></div></div><div class="r71actions"><button type="button" class="action" data-r71="use-suggestion" data-line="${i}">Use Suggestion</button><button type="button" class="action primary" data-r71="apply-line" data-line="${i}">Apply to Order</button></div>${!r.snap?'<div class="r71note gold">Capture the Product / Pricing snapshot above before applying Order pricing. This line will not borrow live catalog data silently.</div>':''}</div>`;
}
function orderSummary(j){
  const items=Array.isArray(j?.items)?j.items:[],api=pricingApi(),est=api?.estimateOrder?.(j)||null;
  let revenue=0,applied=0;
  items.forEach(x=>{const q=qty(x.qty),p=Number(x.price);if(q>0&&Number.isFinite(p))revenue+=q*p;else if(Number.isFinite(Number(x.total)))revenue+=Number(x.total);if(x.pricingRuleSnapshotV071)applied++});
  const cost=est?.complete?Number(est.total):null,gp=cost!=null?revenue-cost:null,gm=gp!=null&&revenue>0?gp/revenue*100:null;
  return `<div class="r71summary"><div class="r71metric"><small>ORDER REVENUE</small><b>${money(round2(revenue))}</b></div><div class="r71metric"><small>MATERIAL COST BASELINE</small><b>${cost==null?'Not captured':money(cost)}</b></div><div class="r71metric"><small>GROSS PROFIT</small><b>${gp==null?'Waiting':money(round2(gp))}</b></div><div class="r71metric"><small>GROSS MARGIN</small><b>${gm==null?'Waiting':gm.toFixed(1)+'%'}</b></div><div class="r71metric"><small>ORDER PRICE SNAPSHOTS</small><b>${applied} / ${items.length}</b></div></div>`;
}
function activeOrderHtml(){
  const j=activeOrder();
  if(!j)return `<div class="r71section"><div class="r71head"><div><h3>ACTIVE ORDER PRICING</h3><div class="r71muted">Select an Order first. Pricing does not invent an Order context.</div></div><span class="r71pill gray">NO ACTIVE ORDER</span></div></div>`;
  const items=Array.isArray(j.items)?j.items:[];
  return `<div class="r71section"><div class="r71head"><div><h3>ACTIVE ORDER PRICING</h3><div class="r71muted">Order ${esc(j.jobNumber||'—')} · ${esc(j.customerName||'Unnamed customer')} · explicit per-line application only.</div></div><span class="r71pill blue">ORDER SNAPSHOT</span></div>${orderSummary(j)}<div class="r71lines">${items.length?items.map(orderLineHtml).join(''):'<div class="r71empty">This Order has no item lines.</div>'}</div><div class="r71note">Price basis can come from a saved markup rule or from the captured Product Retail / Contract / Promotion price. <b>Nothing is applied automatically.</b> Use Suggestion loads a value into the line; Apply to Order writes the selling price and captures the rule snapshot.</div></div>`;
}
function workspaceHtml(){return `<div class="card r71hero"><div class="r71head"><div><h3>PRICING WORKSPACE</h3><div class="r71muted">Product & Cost → Sales Pricing Rules → Active Order Pricing. V0.3.70 product records remain the source layer; V0.3.71 adds the selling-price decision layer.</div></div><span class="r71pill green">V0.3.71</span></div></div>${ruleEditorHtml()}${activeOrderHtml()}`}

function render(){
  ensureStyle();
  rules=loadRules();
  const page=by('pricing');if(!page)return false;
  let root=by('r71workspace');
  if(!root){root=document.createElement('div');root.id='r71workspace';page.appendChild(root)}
  root.innerHTML=workspaceHtml();
  labelVersion();
  return true;
}
function saveRuleInputs(){
  const next=loadRules();next.profiles={...(next.profiles||{})};
  for(const [id] of PROFILES){const raw=by('r71rule_'+id)?.value??'';if(String(raw).trim()===''){next.profiles[id]='';continue}const n=Number(raw);if(!Number.isFinite(n))return alert('Enter a valid markup percentage or leave the field blank.');next.profiles[id]=n}
  if(!writeRules(next))return alert('Pricing rules could not be saved in this browser.');
  render();
}
function rowFor(i){return by('r71workspace')?.querySelector(`[data-r71-line="${i}"]`)||null}
function rowState(row,item){
  const basis=row?.querySelector('[data-r71-basis]')?.value||'rule';
  const profile=row?.querySelector('[data-r71-profile]')?.value||'standard';
  const markup=pct(row?.querySelector('[data-r71-markup]')?.value);
  const sellingRaw=row?.querySelector('[data-r71-selling]')?.value??'';
  const selling=String(sellingRaw).trim()===''?null:Number(sellingRaw);
  const reason=String(row?.querySelector('[data-r71-reason]')?.value||'').trim();
  const sg=suggested(item,basis,profile,markup);
  return {basis,profile,markup,selling:Number.isFinite(selling)?round2(selling):null,reason,suggested:sg==null?null:round2(sg)};
}
function refreshRow(i){
  const j=activeOrder(),item=j?.items?.[i],row=rowFor(i);if(!item||!row)return;
  const state=rowState(row,item),sg=row.querySelector('[data-r71-suggested]'),margin=row.querySelector('[data-r71-margin]');
  if(sg)sg.textContent=state.suggested==null?'Not available':money(state.suggested);
  if(margin){const gm=state.selling==null?null:lineMargin(item,state.selling);margin.textContent=gm==null?'—':gm.toFixed(1)+'%'}
}
function changeBasisOrProfile(target){
  const row=target.closest('[data-r71-line]');if(!row)return;
  const i=Number(row.dataset.r71Line),item=activeOrder()?.items?.[i];if(!item)return;
  if(target.matches('[data-r71-profile]')){
    const m=ruleMarkup(target.value),input=row.querySelector('[data-r71-markup]');if(input)input.value=m==null?'':m;
  }
  refreshRow(i);
}
function useSuggestion(i){
  const j=activeOrder(),item=j?.items?.[i],row=rowFor(i);if(!item||!row)return;
  const state=rowState(row,item);if(state.suggested==null)return alert('No suggestion is available for this line. Check the Product snapshot and the selected price basis / markup rule.');
  const input=row.querySelector('[data-r71-selling]');if(input)input.value=state.suggested;
  refreshRow(i);
}
function applyLine(i){
  const j=activeOrder(),item=j?.items?.[i],row=rowFor(i);if(!j||!item||!row)return;
  if(!item.pricingSnapshotV070)return alert('Capture the Product / Pricing snapshot for this line first.');
  const state=rowState(row,item),refs=snapshotRefs(item);
  if(state.basis==='rule'&&(refs.cost==null||state.markup==null))return alert('This markup rule cannot resolve a selling price yet. Capture cost and enter a markup percentage.');
  if(['retail','builder','promo'].includes(state.basis)&&state.suggested==null)return alert('The selected Product price reference is blank in the captured snapshot.');
  if(state.selling==null||!(state.selling>=0))return alert('Enter a selling price or use the suggested price first.');
  if(refs.minimum!=null&&state.selling<refs.minimum){
    if(!state.reason)return alert('This selling price is below the captured Minimum / Floor Price. Enter an override / approval reason before applying it.');
    if(!confirm(`Selling price ${money(state.selling)} is below the captured floor ${money(refs.minimum)}. Apply with the recorded reason?`))return;
  }
  const q=qty(item.qty),defaultMarkup=ruleMarkup(state.profile),derivedMarkup=refs.cost!=null&&refs.cost>0?round2((state.selling/refs.cost-1)*100):state.markup;
  item.price=state.selling;
  if(q>0)item.total=round2(q*state.selling);
  item.pricingBasisV071=state.basis;
  item.pricingProfileV071=state.profile;
  if(state.basis==='rule')item.pricingProfile=state.profile;
  item.defaultMarkupPct=state.basis==='rule'?(defaultMarkup==null?'':defaultMarkup):'';
  item.markupPct=derivedMarkup==null?'':derivedMarkup;
  if(state.reason)item.overrideReason=state.reason;
  item.pricingRuleSnapshotV071={
    basis:state.basis,basisLabel:basisLabel(state.basis),profileId:state.basis==='rule'?state.profile:'',profileLabel:state.basis==='rule'?profileLabel(state.profile):'',markupPct:state.basis==='rule'?state.markup:derivedMarkup,
    costPerSellUnit:refs.cost,retailPrice:refs.retail,builderPrice:refs.builder,promoPrice:refs.promo,minimumPrice:refs.minimum,
    sellingPrice:state.selling,overrideReason:state.reason||'',productId:item.productId||'',productSnapshotCapturedAt:item.pricingSnapshotV070?.capturedAt||'',appliedAt:new Date().toISOString()
  };
  if(!saveOrders())return alert('Order pricing could not be saved.');
  try{window.renderAll?.()}catch(_){}
  try{window.RUNLUPricingV070?.render?.()}catch(_){}
  setTimeout(()=>{render();try{window.RUNLUAccountingOrderEconomicsV069?.render?.();window.RUNLUPricingV070?.patchAccounting?.()}catch(_){}},60);
}
function eventHooks(){
  if(window.__runluPricingWorkspaceEventsV071)return;window.__runluPricingWorkspaceEventsV071=true;
  document.addEventListener('click',ev=>{
    const action=ev.target?.closest?.('[data-r71]');
    if(action){const a=action.dataset.r71,i=Number(action.dataset.line);if(a==='save-rules')saveRuleInputs();else if(a==='use-suggestion')useSuggestion(i);else if(a==='apply-line')applyLine(i);return}
    const snap=ev.target?.closest?.('#pricing [data-r70="snap"]');if(snap){const j=activeOrder(),i=Number(snap.dataset.line),item=j?.items?.[i];if(item){delete item.pricingRuleSnapshotV071;delete item.pricingBasisV071;delete item.pricingProfileV071}}
    if(ev.target?.closest?.('#pricing [data-r70],nav [data-page="pricing"]')){setTimeout(render,35);setTimeout(labelVersion,80)};
  },true);
  document.addEventListener('change',ev=>{
    const t=ev.target;
    if(t?.matches?.('[data-r71-basis],[data-r71-profile]'))changeBasisOrProfile(t);
    if(t?.matches?.('#pricing [data-r70-link]')){const j=activeOrder(),i=Number(t.dataset.r70Link),item=j?.items?.[i],next=String(t.value||''),prev=String(item?.productId||'');if(item&&next!==prev){delete item.pricingRuleSnapshotV071;delete item.pricingBasisV071;delete item.pricingProfileV071}setTimeout(render,45)}
  },true);
  document.addEventListener('input',ev=>{const row=ev.target?.closest?.('[data-r71-line]');if(row&&ev.target?.matches?.('[data-r71-markup],[data-r71-selling]'))refreshRow(Number(row.dataset.r71Line))},true);
  window.addEventListener('storage',ev=>{if(ev.key===RULE_STORE)setTimeout(render,0)});
}
function patchPricingApi(){
  const api=pricingApi();if(!api||api.__r71)return;
  api.__r71=1;
  ['render','refresh'].forEach(k=>{if(typeof api[k]!=='function')return;const old=api[k];api[k]=function(){const z=old.apply(this,arguments);setTimeout(render,0);return z}});
}
function patchNavLabel(){
  if(typeof window.renderNav!=='function'||window.renderNav.__r71label)return;
  const old=window.renderNav;const wrapped=function(){const z=old.apply(this,arguments);labelVersion();return z};wrapped.__r71label=1;window.renderNav=wrapped;
}
function labelVersion(){
  try{
    document.title='RUNLU Deerfoot Flooring OS V0.3.71 Pricing Workspace';
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.71 Pricing Workspace';
    const brand=document.querySelector('header .brand span');if(brand)brand.textContent='V0.3.63 stable renderer + complete workflow + unified Pricing Workspace';
  }catch(_){}
}
function install(){
  ensureStyle();eventHooks();patchPricingApi();patchNavLabel();render();labelVersion();
  setTimeout(()=>{patchPricingApi();patchNavLabel();render();labelVersion()},150);
  setTimeout(()=>{patchPricingApi();patchNavLabel();render();labelVersion()},650);
}
window.RUNLUPricingWorkspaceV071={install,render,refresh:render,loadRules,applyLine};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
