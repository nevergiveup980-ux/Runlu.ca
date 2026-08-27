/* RUNLU Deerfoot Flooring OS · V0.3.49 Invoice Polish
   - Keeps V0.3.48 continuous White / Yellow / Pink paper colour.
   - Restores a clean single grid in the item table (no line bleed/double grid).
   - Makes Deerfoot form checkboxes interactive in normal Invoice and Paper Edit Mode.
   - Payment method remains single-select; independent boxes toggle on/off.
*/
(function(){
'use strict';
if(window.__runluInvoicePolishV049)return;
window.__runluInvoicePolishV049=true;

const by=id=>document.getElementById(id);
const BRIDGE='runlu_flooring_active_invoice_v1';
const STYLE=`
/* V0.3.49 · clean item grid while preserving copy colour */
.invoice:not(.overlay) .items,
.invoice:not(.overlay) .items th,
.invoice:not(.overlay) .items td{
  background-color:var(--copy-bg)!important;
  background-image:none!important;
}
.invoice:not(.overlay) .items th,
.invoice:not(.overlay) .items td{
  border-color:#5f666a!important;
}
.runluCheckV049{cursor:pointer!important;user-select:none;-webkit-user-select:none}
.runluCheckV049:focus{outline:.45mm solid rgba(36,79,63,.35);outline-offset:.35mm}
@media print{
  .invoice:not(.overlay) .items,
  .invoice:not(.overlay) .items th,
  .invoice:not(.overlay) .items td{
    background-color:var(--copy-bg)!important;
    background-image:none!important;
  }
  .runluCheckV049{outline:none!important}
}
`;

function readBridge(d){
  try{return JSON.parse(d.defaultView.localStorage.getItem(BRIDGE)||'{}')||{}}catch(_){return {}}
}
function writeBridge(d,patch){
  try{
    const data={...readBridge(d),...patch,updatedAt:new Date().toISOString()};
    d.defaultView.localStorage.setItem(BRIDGE,JSON.stringify(data));
    return data;
  }catch(_){return null}
}
function checked(el){return el.classList.contains('on')||el.textContent.trim()==='✓'||el.getAttribute('aria-checked')==='true'}
function paintSquare(el,on){
  el.textContent=on?'✓':'';
  el.setAttribute('aria-checked',String(!!on));
}
function keyboardClick(el,ev){
  if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();el.click()}
}
function bindToggle(d,el,key){
  if(!el||el.dataset.runluToggleV049)return;
  el.dataset.runluToggleV049='1';
  el.classList.add('runluCheckV049');
  el.setAttribute('role','checkbox');
  el.tabIndex=0;
  const data=readBridge(d);
  if(typeof data[key]==='boolean')paintSquare(el,data[key]);
  else el.setAttribute('aria-checked',String(checked(el)));
  el.addEventListener('click',ev=>{
    ev.preventDefault();
    ev.stopPropagation();
    const next=!checked(el);
    paintSquare(el,next);
    writeBridge(d,{[key]:next});
  });
  el.addEventListener('keydown',ev=>keyboardClick(el,ev));
}
function bindPayments(d){
  const boxes=[...d.querySelectorAll('.paycheck')];
  boxes.forEach(el=>{
    if(el.dataset.runluPaymentV049)return;
    el.dataset.runluPaymentV049='1';
    el.classList.add('runluCheckV049');
    el.setAttribute('role','radio');
    el.tabIndex=0;
    el.setAttribute('aria-checked',String(el.classList.contains('on')));
    el.addEventListener('click',()=>{
      boxes.forEach(x=>{x.classList.remove('on');x.setAttribute('aria-checked','false')});
      el.classList.add('on');
      el.setAttribute('aria-checked','true');
      writeBridge(d,{paymentMethod:el.dataset.pay||''});
    });
    el.addEventListener('keydown',ev=>keyboardClick(el,ev));
  });
}
function bindChecks(d){
  try{
    bindPayments(d);
    const mini=[...d.querySelectorAll('.priceBand .miniBox')];
    bindToggle(d,mini[0],'paidBox1');
    bindToggle(d,mini[1],'paidBox2');
    bindToggle(d,d.querySelector('.balanceDueCheckBox'),'balanceDueBox');
    bindToggle(d,d.querySelector('.productViewedBox'),'productViewedBeforeInstall');
  }catch(e){console.error('V0.3.49 checkbox bind failed:',e)}
}
function patchDoc(d){
  try{
    if(!d||!d.head)return false;
    if(!d.getElementById('runluInvoicePolishStyleV049')){
      const s=d.createElement('style');
      s.id='runluInvoicePolishStyleV049';
      s.textContent=STYLE;
      d.head.appendChild(s);
    }
    let n=0;
    const timer=setInterval(()=>{
      n++;
      bindChecks(d);
      if(n>=24||d.querySelector('.productViewedBox'))clearInterval(timer);
    },100);
    bindChecks(d);
    return true;
  }catch(e){console.error('V0.3.49 invoice patch failed:',e);return false}
}
function patchInvoiceFrame(){
  const f=by('invoiceFrame');
  if(!f)return false;
  if(!f.dataset.runluV049){
    f.dataset.runluV049='1';
    f.addEventListener('load',()=>setTimeout(()=>patchDoc(f.contentDocument),50));
  }
  try{patchDoc(f.contentDocument)}catch(_){}
  return true;
}
function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function patchPaperWindow(w){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{
      if(!w||w.closed){clearInterval(timer);return}
      const d=w.document,bar=d.querySelector('.bar');
      if(!bar){if(tries>80)clearInterval(timer);return}
      if(!d.getElementById('runluBackInvoiceV049')){
        const style=d.createElement('style');
        style.id='runluBackInvoiceStyleV049';
        style.textContent='.bar #runluBackInvoiceV049{background:#cfe1d9;color:#173d30;border:1px solid rgba(23,61,48,.14)}@media(max-width:760px){.bar #runluBackInvoiceV049{order:-2}.bar b{order:-1}}';
        d.head.appendChild(style);
        const b=d.createElement('button');
        b.id='runluBackInvoiceV049';b.type='button';b.textContent='← Back to Invoice';b.title='Return to the Flooring OS Invoice screen';
        b.onclick=()=>{try{window.focus()}catch(_){}try{w.close()}catch(_){}if(!w.closed){try{w.location.href='index.html'}catch(_){}}};
        bar.insertBefore(b,bar.firstChild);
      }
      const paper=d.getElementById('paper');
      if(paper&&!paper.dataset.runluV049){
        paper.dataset.runluV049='1';
        paper.addEventListener('load',()=>setTimeout(()=>patchDoc(paper.contentDocument),60));
        try{patchDoc(paper.contentDocument)}catch(_){}
      }
      clearInterval(timer);
    }catch(_){if(tries>80)clearInterval(timer)}
  },100);
}
function openPaperV049(){
  try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(_){}
  const j=activeJob()||{},q=encodeURIComponent(j.id||j.jobNumber||'');
  const w=window.open('deerfoot-invoice-paper-edit-v044.html?job='+q+'&ui=049&t='+Date.now(),'_blank');
  if(w)patchPaperWindow(w);
}
function replacePaperButtons(){
  const a=by('openPaperEditV044'),b=by('paperEditQuickV044');
  if(a)a.onclick=openPaperV049;
  if(b)b.onclick=openPaperV049;
  try{if(window.RUNLUInvoiceDualTrackV044)window.RUNLUInvoiceDualTrackV044.openPaper=openPaperV049}catch(_){}
}
function install(){
  patchInvoiceFrame();
  replacePaperButtons();
  return true;
}
window.RUNLUInvoicePolishV049={install,patchInvoiceFrame,openPaper:openPaperV049};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100),{once:true});else setTimeout(install,100);
setTimeout(install,500);
setTimeout(install,1200);
})();
