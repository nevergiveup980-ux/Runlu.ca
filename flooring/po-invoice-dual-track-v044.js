/* RUNLU Deerfoot Flooring OS · V0.3.44 PO dual-track preview launcher
   Keeps standard Preview Deerfoot Invoice and adds Editable Paper Preview alongside it.
   No MutationObserver. No existing PO engine is modified. */
(function(){
'use strict';
if(window.__runluPOInvoiceDualTrackV044)return;
window.__runluPOInvoiceDualTrackV044=true;
const PREVIEW='runlu_flooring_po_deerfoot_invoice_v040';
const by=id=>document.getElementById(id);
function preparePreview(){
  try{window.RUNLUPODelivery043R3?.persist();window.RUNLUPODelivery043R3?.syncRecord()}catch(_){}
  const realOpen=window.open;let prepared=false;
  try{window.open=function(){prepared=true;return {closed:false}};if(typeof window.runluPOPreview==='function')window.runluPOPreview()}catch(e){console.error('V044 PO preview preparation failed',e)}finally{window.open=realOpen}
  try{const data=JSON.parse(localStorage.getItem(PREVIEW)||'{}')||{},po=String(by('poNumberSafe')?.value||data.poNumber||'').trim();if(po){data.poNumber=po;data.invoiceNumber=po}const delivery=String(by('poDeliverySafe')?.value||'').trim();if(delivery)data.delivery=delivery;localStorage.setItem(PREVIEW,JSON.stringify(data))}catch(e){console.error('V044 PO preview payload patch failed',e)}
  return prepared;
}
function openEditable(){preparePreview();const w=window.open('deerfoot-po-invoice-paper-edit-v044r6.html?t='+Date.now(),'_blank');if(!w)alert('Allow pop-ups to open the editable PO Deerfoot Invoice.')}
function install(){const preview=by('poPreviewBtn');if(!preview)return false;if(!by('poPaperEditV044')){const b=document.createElement('button');b.id='poPaperEditV044';b.type='button';b.className='action blue';b.textContent='Editable Paper Preview';b.onclick=openEditable;preview.insertAdjacentElement('afterend',b)}const card=preview.closest('.card');if(card&&!by('poDualTrackNoteV044')){const note=document.createElement('div');note.id='poDualTrackNoteV044';note.className='notice';note.style.marginTop='10px';note.innerHTML='<b>Dual-track PO preview:</b> Standard Preview stays read-only. Editable Paper Preview lets Sales write directly on the Deerfoot form. Quantity / Price calculate line totals live. Editable full-paper view now keeps the lower-left PO number and signature area reachable on mobile. Save Draft keeps paper only; Save to PO Draft can place an unnumbered draft into the PO Ledger; once numbered, Save to PO updates that PO.';preview.closest('.actions')?.insertAdjacentElement('afterend',note)}return true}
window.RUNLUPOInvoiceDualTrackV044={install,openEditable,preparePreview};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();