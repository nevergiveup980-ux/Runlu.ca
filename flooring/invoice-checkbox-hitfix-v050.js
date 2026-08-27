/* RUNLU Deerfoot Flooring OS · V0.3.50 Checkbox Hit-Target Fix
   Fixes the middle Deerfoot form checkboxes that were visually present but covered by the transparent .data layer.
   Keeps Paper Edit contenteditable fields and data-layer checkboxes interactive.
*/
(function(){
'use strict';
if(window.__runluInvoiceCheckboxHitfixV050)return;
window.__runluInvoiceCheckboxHitfixV050=true;

const by=id=>document.getElementById(id);
const BRIDGE='runlu_flooring_active_invoice_v1';
const STYLE=`
/* V0.3.50 · let clicks reach static-layer Deerfoot checkboxes */
.invoice:not(.overlay) .data{pointer-events:none!important}
.invoice:not(.overlay) .data [contenteditable="true"],
.invoice:not(.overlay) .data .paperEditPrice,
.invoice:not(.overlay) .data .miniBox,
.invoice:not(.overlay) .data .balanceDueCheckBox,
.invoice:not(.overlay) .data .runluCheckV049,
.invoice:not(.overlay) .data .runluCheckV050{
  pointer-events:auto!important;
}
.invoice:not(.overlay) .static .paymentBox,
.invoice:not(.overlay) .static .paymentBox .paycheck,
.invoice:not(.overlay) .static .noticeBlock,
.invoice:not(.overlay) .static .productViewedBox{
  pointer-events:auto!important;
}
.invoice:not(.overlay) .static .paymentBox .paycheck,
.invoice:not(.overlay) .static .productViewedBox,
.runluCheckV050{
  cursor:pointer!important;
}
`;

function readBridge(d){try{return JSON.parse(d.defaultView.localStorage.getItem(BRIDGE)||'{}')||{}}catch(_){return {}}}
function writeBridge(d,patch){try{const data={...readBridge(d),...patch,updatedAt:new Date().toISOString()};d.defaultView.localStorage.setItem(BRIDGE,JSON.stringify(data));return data}catch(_){return null}}
function checked(el){return el.classList.contains('on')||el.textContent.trim()==='✓'||el.getAttribute('aria-checked')==='true'}
function paintSquare(el,on){el.textContent=on?'✓':'';el.setAttribute('aria-checked',String(!!on))}
function keyboardClick(el,ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();el.click()}}
function bindToggle(d,el,key){
  if(!el||el.dataset.runluToggleV049||el.dataset.runluToggleV050)return;
  el.dataset.runluToggleV050='1';el.classList.add('runluCheckV050');el.setAttribute('role','checkbox');el.tabIndex=0;
  const data=readBridge(d);if(typeof data[key]==='boolean')paintSquare(el,data[key]);else el.setAttribute('aria-checked',String(checked(el)));
  el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const next=!checked(el);paintSquare(el,next);writeBridge(d,{[key]:next})});
  el.addEventListener('keydown',ev=>keyboardClick(el,ev));
}
function bindPayments(d){
  const boxes=[...d.querySelectorAll('.paycheck')];
  boxes.forEach(el=>{
    if(el.dataset.runluPaymentV049||el.dataset.runluPaymentV050)return;
    el.dataset.runluPaymentV050='1';el.classList.add('runluCheckV050');el.setAttribute('role','radio');el.tabIndex=0;el.setAttribute('aria-checked',String(el.classList.contains('on')));
    el.addEventListener('click',()=>{boxes.forEach(x=>{x.classList.remove('on');x.setAttribute('aria-checked','false')});el.classList.add('on');el.setAttribute('aria-checked','true');writeBridge(d,{paymentMethod:el.dataset.pay||''})});
    el.addEventListener('keydown',ev=>keyboardClick(el,ev));
  });
}
function bindChecks(d){
  bindPayments(d);
  const mini=[...d.querySelectorAll('.priceBand .miniBox')];
  bindToggle(d,mini[0],'paidBox1');bindToggle(d,mini[1],'paidBox2');
  bindToggle(d,d.querySelector('.balanceDueCheckBox'),'balanceDueBox');
  bindToggle(d,d.querySelector('.productViewedBox'),'productViewedBeforeInstall');
}
function patchDoc(d){
  try{
    if(!d||!d.head)return false;
    if(!d.getElementById('runluInvoiceCheckboxHitfixStyleV050')){const s=d.createElement('style');s.id='runluInvoiceCheckboxHitfixStyleV050';s.textContent=STYLE;d.head.appendChild(s)}
    let n=0;const timer=setInterval(()=>{n++;bindChecks(d);if(n>=30||d.querySelector('.productViewedBox'))clearInterval(timer)},100);
    bindChecks(d);return true;
  }catch(e){console.error('V0.3.50 checkbox hit-target patch failed:',e);return false}
}

function patchInvoiceFrame(){
  const f=by('invoiceFrame');if(!f)return false;
  if(!f.dataset.runluV050){f.dataset.runluV050='1';f.addEventListener('load',()=>setTimeout(()=>patchDoc(f.contentDocument),50))}
  try{patchDoc(f.contentDocument)}catch(_){}return true;
}
function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function patchPaperWindow(w){
  let tries=0;const timer=setInterval(()=>{
    tries++;
    try{
      if(!w||w.closed){clearInterval(timer);return}
      const d=w.document,bar=d.querySelector('.bar'),paper=d.getElementById('paper');
      if(!bar||!paper){if(tries>80)clearInterval(timer);return}
      if(!d.getElementById('runluBackInvoiceV050')){
        const style=d.createElement('style');style.id='runluBackInvoiceStyleV050';style.textContent='.bar #runluBackInvoiceV050{background:#cfe1d9;color:#173d30;border:1px solid rgba(23,61,48,.14)}@media(max-width:760px){.bar #runluBackInvoiceV050{order:-2}.bar b{order:-1}}';d.head.appendChild(style);
        const b=d.createElement('button');b.id='runluBackInvoiceV050';b.type='button';b.textContent='← Back to Invoice';b.title='Return to the Flooring OS Invoice screen';b.onclick=()=>{try{window.focus()}catch(_){}try{w.close()}catch(_){}if(!w.closed){try{w.location.href='index.html'}catch(_){}}};bar.insertBefore(b,bar.firstChild);
      }
      if(!paper.dataset.runluV050){paper.dataset.runluV050='1';paper.addEventListener('load',()=>setTimeout(()=>patchDoc(paper.contentDocument),60));try{patchDoc(paper.contentDocument)}catch(_){}}
      clearInterval(timer);
    }catch(_){if(tries>80)clearInterval(timer)}
  },100);
}
function openPaperV050(){
  try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(_){}
  const j=activeJob()||{},q=encodeURIComponent(j.id||j.jobNumber||'');
  const w=window.open('deerfoot-invoice-paper-edit-v044.html?job='+q+'&ui=050&t='+Date.now(),'_blank');
  if(w)patchPaperWindow(w);
}
function replacePaperButtons(){const a=by('openPaperEditV044'),b=by('paperEditQuickV044');if(a)a.onclick=openPaperV050;if(b)b.onclick=openPaperV050}
function install(){patchInvoiceFrame();replacePaperButtons();return true}
window.RUNLUInvoiceCheckboxHitfixV050={install,patchInvoiceFrame,openPaper:openPaperV050};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,120),{once:true});else setTimeout(install,120);
setTimeout(install,600);setTimeout(install,1400);
})();
