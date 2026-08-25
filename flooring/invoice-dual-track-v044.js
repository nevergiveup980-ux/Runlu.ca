/* RUNLU Deerfoot Flooring OS · V0.3.44 Dual-Track Invoice launcher
   Adds Paper Edit Mode alongside the existing database/form-driven invoice workflow.
   No MutationObserver. No existing invoice renderer is modified. */
(function(){
'use strict';
if(window.__runluInvoiceDualTrackV044)return;
window.__runluInvoiceDualTrackV044=true;
const by=id=>document.getElementById(id);
function activeJob(){try{return typeof window.active==='function'?window.active():null}catch(_){return null}}
function openPaper(){
  try{if(typeof window.prepareInvoice==='function')window.prepareInvoice()}catch(_){}
  const j=activeJob()||{},q=encodeURIComponent(j.id||j.jobNumber||'');
  window.open('deerfoot-invoice-paper-edit-v044.html?job='+q+'&t='+Date.now(),'_blank');
}
function install(){
  const sec=by('invoice');if(!sec)return false;
  const card=sec.querySelector('.card');if(!card)return false;
  if(!by('invoiceDualTrackV044')){
    const box=document.createElement('div');box.id='invoiceDualTrackV044';box.className='notice';box.style.marginTop='12px';
    box.innerHTML='<div style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div style="min-width:230px;flex:1"><b style="display:block;color:#173d30;margin-bottom:4px">Dual-Track Invoice · V0.3.44 Research</b><span class="muted">Database / Form Mode stays exactly as before. Paper Edit Mode lets Sales type directly on the Deerfoot invoice, save a draft, or save the edits back to the Job / Invoice.</span></div><button id="openPaperEditV044" class="action blue" type="button">Open Editable Paper Invoice</button></div>';
    card.appendChild(box);by('openPaperEditV044').onclick=openPaper;
  }
  const status=sec.querySelector('.statusLine');if(status&&!by('paperEditQuickV044')){const b=document.createElement('button');b.id='paperEditQuickV044';b.className='action blue';b.textContent='Paper Edit Mode';b.onclick=openPaper;status.appendChild(b)}
  return true;
}
window.RUNLUInvoiceDualTrackV044={install,openPaper};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});else setTimeout(install,0);
})();
