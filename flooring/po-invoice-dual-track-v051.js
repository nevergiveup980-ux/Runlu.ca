/* RUNLU Deerfoot Flooring OS · V0.3.51 PO editable preview launcher */
(function(){
'use strict';
if(window.__runluPOInvoiceDualTrackV051)return;
window.__runluPOInvoiceDualTrackV051=true;
const PREVIEW='runlu_flooring_po_deerfoot_invoice_v040';
const by=id=>document.getElementById(id);
function preparePreview(){
  try{window.RUNLUPODelivery043R3?.persist();window.RUNLUPODelivery043R3?.syncRecord()}catch(_){}
  const realOpen=window.open;
  try{window.open=function(){return {closed:false}};if(typeof window.runluPOPreview==='function')window.runluPOPreview()}catch(e){console.error('V051 PO preview preparation failed',e)}finally{window.open=realOpen}
  try{const data=JSON.parse(localStorage.getItem(PREVIEW)||'{}')||{},po=String(by('poNumberSafe')?.value||data.poNumber||'').trim();if(po){data.poNumber=po;data.invoiceNumber=po}const delivery=String(by('poDeliverySafe')?.value||'').trim();if(delivery)data.delivery=delivery;localStorage.setItem(PREVIEW,JSON.stringify(data))}catch(e){console.error('V051 PO preview payload patch failed',e)}
}
function openEditable(){preparePreview();const w=window.open('deerfoot-po-invoice-paper-edit-v044r7.html?ui=051&t='+Date.now(),'_blank');if(!w)alert('Allow pop-ups to open the editable PO Deerfoot Invoice.')}
function install(){
  const preview=by('poPreviewBtn');if(!preview)return false;
  let b=by('poPaperEditV044');
  if(!b){b=document.createElement('button');b.id='poPaperEditV044';b.type='button';b.className='action blue';b.textContent='Editable Paper Preview';preview.insertAdjacentElement('afterend',b)}
  b.onclick=openEditable;b.title='Open PO Deerfoot paper with interactive checkboxes';b.dataset.runluPoV051='1';
  const note=by('poDualTrackNoteV044');if(note)note.innerHTML='<b>Dual-track PO preview:</b> Standard Preview stays read-only. Editable Paper Preview supports direct paper editing and interactive Deerfoot checkboxes.';
  return true;
}
window.RUNLUPOInvoiceDualTrackV051={install,openEditable,preparePreview};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
setTimeout(install,500);
})();