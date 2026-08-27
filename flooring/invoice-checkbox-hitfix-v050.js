/* RUNLU Deerfoot Flooring OS · V0.3.50 Checkbox Hit-Target Fix
   Fixes the middle Deerfoot form checkboxes that were visually present but covered by the transparent .data layer.
   Keeps Paper Edit contenteditable fields and data-layer checkboxes interactive.
*/
(function(){
'use strict';
if(window.__runluInvoiceCheckboxHitfixV050)return;
window.__runluInvoiceCheckboxHitfixV050=true;

const by=id=>document.getElementById(id);
const STYLE=`
/* V0.3.50 · let clicks reach static-layer Deerfoot checkboxes */
.invoice:not(.overlay) .data{pointer-events:none!important}
.invoice:not(.overlay) .data [contenteditable="true"],
.invoice:not(.overlay) .data .paperEditPrice,
.invoice:not(.overlay) .data .miniBox,
.invoice:not(.overlay) .data .balanceDueCheckBox,
.invoice:not(.overlay) .data .runluCheckV049{
  pointer-events:auto!important;
}
.invoice:not(.overlay) .static .paymentBox,
.invoice:not(.overlay) .static .paymentBox .paycheck,
.invoice:not(.overlay) .static .noticeBlock,
.invoice:not(.overlay) .static .productViewedBox{
  pointer-events:auto!important;
}
.invoice:not(.overlay) .static .paymentBox .paycheck,
.invoice:not(.overlay) .static .productViewedBox{
  cursor:pointer!important;
}
`;

function patchDoc(d){
  try{
    if(!d||!d.head)return false;
    if(!d.getElementById('runluInvoiceCheckboxHitfixStyleV050')){
      const s=d.createElement('style');
      s.id='runluInvoiceCheckboxHitfixStyleV050';
      s.textContent=STYLE;
      d.head.appendChild(s);
    }
    try{d.defaultView.RUNLUInvoicePolishV049?.install?.()}catch(_){}
    return true;
  }catch(e){console.error('V0.3.50 checkbox hit-target patch failed:',e);return false}
}

function patchInvoiceFrame(){
  const f=by('invoiceFrame');
  if(!f)return false;
  if(!f.dataset.runluV050){
    f.dataset.runluV050='1';
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
      const d=w.document,paper=d.getElementById('paper');
      if(!paper){if(tries>80)clearInterval(timer);return}
      if(!paper.dataset.runluV050){
        paper.dataset.runluV050='1';
        paper.addEventListener('load',()=>setTimeout(()=>patchDoc(paper.contentDocument),60));
        try{patchDoc(paper.contentDocument)}catch(_){}
      }
      clearInterval(timer);
    }catch(_){if(tries>80)clearInterval(timer)}
  },100);
}
function openPaperV050(){
  try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(_){}
  const j=activeJob()||{},q=encodeURIComponent(j.id||j.jobNumber||'');
  const w=window.open('deerfoot-invoice-paper-edit-v044.html?job='+q+'&ui=050&t='+Date.now(),'_blank');
  if(w){
    try{window.RUNLUInvoicePolishV049?.openPaper?.()}catch(_){}
    patchPaperWindow(w);
  }
}
function replacePaperButtons(){
  const a=by('openPaperEditV044'),b=by('paperEditQuickV044');
  if(a)a.onclick=openPaperV050;
  if(b)b.onclick=openPaperV050;
}
function install(){patchInvoiceFrame();replacePaperButtons();return true}
window.RUNLUInvoiceCheckboxHitfixV050={install,patchInvoiceFrame,openPaper:openPaperV050};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,120),{once:true});else setTimeout(install,120);
setTimeout(install,600);
setTimeout(install,1400);
})();
