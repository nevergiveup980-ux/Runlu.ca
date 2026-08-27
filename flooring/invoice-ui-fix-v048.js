/* RUNLU Deerfoot Flooring OS · V0.3.48 Invoice UI Fix
   - Keeps the existing V0.3.47 central-payment workflow intact.
   - Makes White / Yellow / Pink Full Form previews use one continuous paper colour.
   - Adds an explicit Back to Invoice button to Paper Edit Mode.
   - Overlay mode remains white/data-only for preprinted 3-part stock.
*/
(function(){
'use strict';
if(window.__runluInvoiceUIFixV048)return;
window.__runluInvoiceUIFixV048=true;

const by=id=>document.getElementById(id);
const COPY_STYLE=`
/* V0.3.48 · continuous 3-part copy colour */
.invoice:not(.overlay){
  background-color:var(--copy-bg)!important;
  print-color-adjust:exact!important;
  -webkit-print-color-adjust:exact!important;
}
.invoice:not(.overlay) .static,
.invoice:not(.overlay) .data,
.invoice:not(.overlay) .items,
.invoice:not(.overlay) .items th,
.invoice:not(.overlay) .items td,
.invoice:not(.overlay) .priceBand,
.invoice:not(.overlay) .priceBand .head,
.invoice:not(.overlay) .priceBand .head div,
.invoice:not(.overlay) .priceBand .grid,
.invoice:not(.overlay) .priceBand .totals,
.invoice:not(.overlay) .priceBand .totalRow,
.invoice:not(.overlay) .priceBand .totalRow .lab,
.invoice:not(.overlay) .priceBand .totalRow .amt,
.invoice:not(.overlay) .priceBand .depositRow,
.invoice:not(.overlay) .priceBand .balanceRow,
.invoice:not(.overlay) .priceBand .balanceRow .lab,
.invoice:not(.overlay) .priceBand .balanceRow .amt{
  background-color:transparent!important;
  background-image:none!important;
}
@media print{
  .invoice:not(.overlay){background-color:var(--copy-bg)!important}
  .invoice:not(.overlay) .items,
  .invoice:not(.overlay) .items th,
  .invoice:not(.overlay) .items td,
  .invoice:not(.overlay) .priceBand,
  .invoice:not(.overlay) .priceBand .head,
  .invoice:not(.overlay) .priceBand .head div,
  .invoice:not(.overlay) .priceBand .grid,
  .invoice:not(.overlay) .priceBand .totals,
  .invoice:not(.overlay) .priceBand .totalRow,
  .invoice:not(.overlay) .priceBand .totalRow .lab,
  .invoice:not(.overlay) .priceBand .totalRow .amt,
  .invoice:not(.overlay) .priceBand .depositRow,
  .invoice:not(.overlay) .priceBand .balanceRow,
  .invoice:not(.overlay) .priceBand .balanceRow .lab,
  .invoice:not(.overlay) .priceBand .balanceRow .amt{
    background-color:transparent!important;
    background-image:none!important;
  }
  .invoice.overlay{background:#fff!important}
}
`;

function patchInvoiceDocument(d){
  try{
    if(!d||!d.head)return false;
    if(!d.getElementById('runluInvoiceCopyColorV048')){
      const s=d.createElement('style');
      s.id='runluInvoiceCopyColorV048';
      s.textContent=COPY_STYLE;
      d.head.appendChild(s);
    }
    return true;
  }catch(e){console.error('V0.3.48 invoice colour patch failed:',e);return false}
}

function patchInvoiceFrame(){
  const f=by('invoiceFrame');
  if(!f)return false;
  if(!f.dataset.runluV048){
    f.dataset.runluV048='1';
    f.addEventListener('load',()=>setTimeout(()=>patchInvoiceDocument(f.contentDocument),40));
  }
  try{patchInvoiceDocument(f.contentDocument)}catch(_){}
  return true;
}

function activeJob(){
  try{return typeof window.active==='function'?window.active():null}catch(_){return null}
}

function patchPaperWindow(w){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    try{
      if(!w||w.closed){clearInterval(timer);return}
      const d=w.document;
      const bar=d.querySelector('.bar');
      if(!bar){if(tries>80)clearInterval(timer);return}

      if(!d.getElementById('runluBackInvoiceV048')){
        const style=d.createElement('style');
        style.id='runluBackInvoiceStyleV048';
        style.textContent='.bar #runluBackInvoiceV048{background:#cfe1d9;color:#173d30;border:1px solid rgba(23,61,48,.14)}@media(max-width:760px){.bar #runluBackInvoiceV048{order:-2}.bar b{order:-1}}';
        d.head.appendChild(style);

        const b=d.createElement('button');
        b.id='runluBackInvoiceV048';
        b.type='button';
        b.textContent='← Back to Invoice';
        b.title='Return to the Flooring OS Invoice screen';
        b.onclick=()=>{
          try{window.focus()}catch(_){}
          try{w.close()}catch(_){}
          if(!w.closed){try{w.location.href='index.html'}catch(_){}}
        };
        bar.insertBefore(b,bar.firstChild);
      }

      const paper=d.getElementById('paper');
      if(paper&&!paper.dataset.runluV048){
        paper.dataset.runluV048='1';
        paper.addEventListener('load',()=>setTimeout(()=>patchInvoiceDocument(paper.contentDocument),40));
        try{patchInvoiceDocument(paper.contentDocument)}catch(_){}
      }
      clearInterval(timer);
    }catch(e){if(tries>80)clearInterval(timer)}
  },100);
}

function openPaperV048(){
  try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(_){}
  const j=activeJob()||{},q=encodeURIComponent(j.id||j.jobNumber||'');
  const w=window.open('deerfoot-invoice-paper-edit-v044.html?job='+q+'&ui=048&t='+Date.now(),'_blank');
  if(w)patchPaperWindow(w);
}

function replacePaperButtons(){
  const a=by('openPaperEditV044'),b=by('paperEditQuickV044');
  if(a)a.onclick=openPaperV048;
  if(b)b.onclick=openPaperV048;
  try{if(window.RUNLUInvoiceDualTrackV044)window.RUNLUInvoiceDualTrackV044.openPaper=openPaperV048}catch(_){}
}

function install(){
  patchInvoiceFrame();
  replacePaperButtons();
  return true;
}

window.RUNLUInvoiceUIFixV048={install,patchInvoiceFrame,openPaper:openPaperV048};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,80),{once:true});
else setTimeout(install,80);
setTimeout(install,500);
})();
