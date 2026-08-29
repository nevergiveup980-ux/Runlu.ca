/* RUNLU Deerfoot Flooring OS · V0.3.65 Credit Card Fee Policy
   Deerfoot memo: effective for orders placed 2026-09-01 onward.
   Credit-card fee = 2.5% of taxable project subtotal; fee is a separate NON-TAXABLE line.
   GST remains calculated on the taxable project subtotal only.
   V0.3.63 remains the stable rollback baseline. */
(function(){
'use strict';
if(window.__runluCreditCardFee065)return;window.__runluCreditCardFee065=true;
const STORE='runlu_deerfoot_flooring_jobs_v1',INV='runlu_flooring_active_invoice_v1';
const EFFECTIVE='2026-09-01',RATE=.025;
const $=s=>document.querySelector(s);
const money=n=>'$'+Number(n||0).toLocaleString('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2});
const round=n=>Math.round((Number(n||0)+Number.EPSILON)*100)/100;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let baseCalc=null,basePrepare=null,baseRenderAccounting=null,baseSaveAccounting=null;
function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function save(){try{if(typeof window.saveStore==='function')window.saveStore();else if(Array.isArray(window.jobs))localStorage.setItem(STORE,JSON.stringify(window.jobs));return true}catch(e){console.error(e);return false}}
function orderDate(j){return String(j?.orderDate||j?.date||j?.invoiceDate||'').slice(0,10)}
function cardMethod(j){const m=String(j?.paymentMethod||j?.lastPaymentMethod||'').trim().toLowerCase();return /visa|master\s*card|mastercard|amex|american express|credit\s*card|creditcard/.test(m)}
function baseFor(j){try{return baseCalc?baseCalc(j):{subtotal:0,gst:0,total:0,balance:0}}catch(_){return{subtotal:0,gst:0,total:0,balance:0}}}
function info(j,c=baseFor(j)){
 const d=orderDate(j),effective=!!d&&d>=EFFECTIVE,card=cardMethod(j),waived=!!j?.creditCardFeeWaived,base=round(c.subtotal||0),fee=effective&&card&&!waived?round(base*RATE):0;
 return {date:d,effective,card,waived,base,fee,gst:round(c.gst||0),baseTotal:round(c.total||0),total:round(Number(c.total||0)+fee)};
}
function patchCalc(){
 if(typeof window.calc!=='function'||window.calc.__r65patched)return;
 baseCalc=window.calc;
 const wrapped=function(j){const c=baseCalc(j),x=info(j,c),paid=Number(j?.depositPaid||0);return {...c,taxableSubtotal:x.base,creditCardFee:x.fee,creditCardFeeRate:RATE,creditCardFeeEffectiveDate:EFFECTIVE,total:x.total,balance:Math.max(0,round(x.total-paid))}};
 wrapped.__r65patched=true;wrapped.__r65base=baseCalc;window.calc=wrapped;
}
function augmentBridge(){
 const j=activeJob();if(!j)return;let data=null;try{data=JSON.parse(localStorage.getItem(INV)||'null')}catch(_){}if(!data)return;
 const c=baseFor(j),x=info(j,c),items=Array.isArray(data.items)?data.items.filter(v=>!v?.__runluCreditCardFee065):[];
 if(x.fee>0&&items.length<15)items.push({__runluCreditCardFee065:true,qty:'1',size:'',style:'CREDIT CARD FEE 2.5%',colour:'NON-TAXABLE',supplier:'POLICY 09/01/2026',price:x.fee,total:x.fee});
 data.items=items;data.taxableSubtotal=x.base;data.creditCardFee=x.fee;data.creditCardFeeRate=RATE;data.creditCardFeeEffectiveDate=EFFECTIVE;data.creditCardFeeApplied=x.fee>0;data.creditCardFeeWaived=x.waived;data.creditCardFeeOrderDate=x.date;data.creditCardFeeOverflow=x.fee>0&&items.length>=15&&!items.some(v=>v?.__runluCreditCardFee065);
 /* The paper SUB line reflects all order lines; GST remains based only on taxableSubtotal. */
 data.subtotal=round(x.base+x.fee);data.gst=x.gst;data.grandTotal=x.total;data.balanceDue=Math.max(0,round(x.total-Number(data.depositPaid||j.depositPaid||0)));
 try{localStorage.setItem(INV,JSON.stringify(data))}catch(e){console.error(e)}
}
function patchPrepare(){
 if(typeof window.prepareInvoice!=='function'||window.prepareInvoice.__r65patched)return;
 basePrepare=window.prepareInvoice;
 const wrapped=function(){const r=basePrepare.apply(this,arguments);augmentBridge();setTimeout(decorateInvoiceFrame,80);setTimeout(decorateInvoiceFrame,350);return r};
 wrapped.__r65patched=true;wrapped.__r65base=basePrepare;window.prepareInvoice=wrapped;
}
function style(){if($('#r65style'))return;const s=document.createElement('style');s.id='r65style';s.textContent=`
#creditCardFeeV065{border-left:5px solid #315d49}.r65head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.r65head h3{margin:0}.r65badge{display:inline-flex;align-items:center;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:900;background:#edf5f1;color:#315d49}.r65badge.off{background:#f1f2f1;color:#6f7974}.r65badge.waive{background:#fff4d9;color:#765b16}.r65grid{display:grid;grid-template-columns:repeat(4,minmax(125px,1fr));gap:8px;margin-top:11px}.r65metric{border:1px solid #dce4e0;border-radius:8px;padding:9px;background:#fbfcfb}.r65metric small{display:block;color:#6c7972;font-size:10px}.r65metric b{display:block;margin-top:3px;font-size:15px;color:#203b2f}.r65form{display:grid;grid-template-columns:180px 1fr;gap:9px;margin-top:11px;align-items:end}.r65form label{font-size:11px;font-weight:800;color:#47574f}.r65form input[type=date],.r65form input[type=text]{width:100%;border:1px solid #cfd9d4;border-radius:7px;padding:8px;margin-top:4px;background:#fff}.r65waive{display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid #d9dfdc;border-radius:7px;background:#fff;font-size:11px;font-weight:800}.r65waive input{width:17px;height:17px}.r65note{margin-top:9px;padding:8px 10px;border-radius:7px;background:#f6f9f7;color:#53625a;font-size:11px;line-height:1.45}@media(max-width:760px){.r65grid{grid-template-columns:1fr 1fr}.r65form{grid-template-columns:1fr}}
`;document.head.appendChild(s)}
function statusText(x){if(!x.date)return['Order date needed','off'];if(!x.effective)return['Pre-policy order','off'];if(!x.card)return['No credit-card fee','off'];if(x.waived)return['Fee waived','waive'];return['2.5% fee applied','']}
function ensurePanel(){
 style();const acc=$('#accounting');if(!acc)return null;let box=$('#creditCardFeeV065');if(!box){box=document.createElement('div');box.id='creditCardFeeV065';box.className='card';const first=acc.querySelector('.card');if(first?.nextSibling)acc.insertBefore(box,first.nextSibling);else acc.appendChild(box)}renderPanel();return box
}
function renderPanel(){
 const box=$('#creditCardFeeV065'),j=activeJob();if(!box)return;if(!j){box.innerHTML='<h3>Credit Card Fee Policy</h3><div class="muted">Select a Job / Order first.</div>';return}
 const c=baseFor(j),x=info(j,c),st=statusText(x),method=String(j.paymentMethod||j.lastPaymentMethod||'—');
 box.innerHTML=`<div class="r65head"><div><h3>Credit Card Fee Policy</h3><div class="muted">Effective Sep. 1, 2026 · 2.5% · fee is NON-TAXABLE</div></div><span class="r65badge ${st[1]}">${st[0]}</span></div><div class="r65grid"><div class="r65metric"><small>Taxable Project Subtotal</small><b>${money(x.base)}</b></div><div class="r65metric"><small>Credit Card Fee · 2.5%</small><b>${money(x.fee)}</b></div><div class="r65metric"><small>GST · fee excluded</small><b>${money(x.gst)}</b></div><div class="r65metric"><small>Total With Fee</small><b>${money(x.total)}</b></div></div><div class="r65form"><label>Order Date<input id="r65OrderDate" type="date" value="${esc(x.date)}"></label><div class="r65waive"><input id="r65Waive" type="checkbox"${x.waived?' checked':''}><span>Waive / override credit card fee for this order</span></div><label>Waiver / Override Note<input id="r65Reason" type="text" value="${esc(j.creditCardFeeWaiveReason||'')}" placeholder="Optional reason"></label><div class="r65note"><b>Payment method:</b> ${esc(method)}. The fee turns on automatically only when the order date is Sep. 1, 2026 or later and the payment method is a credit card. GST stays calculated on the taxable project subtotal; the 2.5% line is excluded from GST.</div></div>`;
 const d=$('#r65OrderDate'),w=$('#r65Waive'),r=$('#r65Reason');if(d)d.onchange=()=>{j.orderDate=d.value;j.creditCardFeePolicyVersion=EFFECTIVE;save();refresh(true)};if(w)w.onchange=()=>{j.creditCardFeeWaived=!!w.checked;j.creditCardFeePolicyVersion=EFFECTIVE;save();refresh(true)};if(r)r.onchange=()=>{j.creditCardFeeWaiveReason=r.value.trim();save();augmentBridge()};
}
function decorateInvoiceFrame(){
 const f=$('#invoiceFrame'),d=f?.contentDocument;if(!d)return;let data=null;try{data=JSON.parse(localStorage.getItem(INV)||'null')}catch(_){}if(!data)return;const fee=Number(data.creditCardFee||0),notes=d.querySelector('.notesData');if(notes){let base=String(data.notes||'');if(fee>0){base+=(base?'\n':'')+`CREDIT CARD FEE 2.5% (NON-TAXABLE): ${money(fee)}`;if(data.creditCardFeeOverflow)base+=' · fee line shown here because item rows are full';base+=' · GST excludes this fee.'}notes.textContent=base;notes.style.whiteSpace='pre-line'}const brand=d.querySelector('.brand small');if(brand&&fee>0&&!d.querySelector('#r65invoiceBadge')){const b=d.createElement('span');b.id='r65invoiceBadge';b.textContent=' · CC fee '+money(fee)+' non-taxable';b.style.fontWeight='700';b.style.color='#315d49';brand.appendChild(b)}}
function patchAccounting(){
 if(typeof window.renderAccounting==='function'&&!window.renderAccounting.__r65patched){baseRenderAccounting=window.renderAccounting;const w=function(){const r=baseRenderAccounting.apply(this,arguments);ensurePanel();return r};w.__r65patched=true;window.renderAccounting=w}
 if(typeof window.saveAccounting==='function'&&!window.saveAccounting.__r65patched){baseSaveAccounting=window.saveAccounting;const w=function(){const r=baseSaveAccounting.apply(this,arguments);setTimeout(()=>refresh(false),20);return r};w.__r65patched=true;window.saveAccounting=w}
}
function refresh(hard=false){
 ensurePanel();augmentBridge();try{window.RUNLUPaymentSharedV046?.render?.()}catch(_){}if(hard){try{window.renderCommand?.();window.renderJobs?.()}catch(_){}}setTimeout(decorateInvoiceFrame,60)
}
function bind(){if(document.documentElement.dataset.r65bound)return;document.documentElement.dataset.r65bound='1';document.addEventListener('change',e=>{if(e.target?.id==='paymentMethod'){const j=activeJob();if(j){j.paymentMethod=e.target.value;j.creditCardFeePolicyVersion=EFFECTIVE;save();refresh(true)}}},true);window.addEventListener('storage',e=>{if(e.key===STORE||e.key===INV)setTimeout(()=>refresh(false),30)})}
function install(){patchCalc();patchPrepare();patchAccounting();bind();style();ensurePanel();const f=$('#invoiceFrame');if(f&&!f.dataset.r65bound){f.dataset.r65bound='1';f.addEventListener('load',()=>setTimeout(decorateInvoiceFrame,40))}setTimeout(()=>refresh(true),220);setTimeout(()=>{patchCalc();patchPrepare();patchAccounting();refresh(false)},900)}
window.RUNLUCreditCardFeeV065={install,refresh,info:()=>{const j=activeJob();return j?info(j):null},effectiveDate:EFFECTIVE,rate:RATE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();