/* RUNLU Deerfoot Flooring OS · V0.3.42 Research
   Safe Service / Claims -> Original Claim Invoice bridge.
   No polling. No MutationObserver. No inventory writes. No C-number sequencing.
*/
(function(){
  'use strict';
  if(window.__runluClaimIntegration042)return;
  window.__runluClaimIntegration042=true;

  const JOBS='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
  const CLAIMS='runlu_deerfoot_service_claims_v1';
  const DRAFTS='runlu_deerfoot_claim_invoice_v1';

  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(_){return fallback}}
  function jobs(){const v=readJson(JOBS,[]);return Array.isArray(v)?v:[]}
  function activeJob(){
    try{if(typeof active==='function'){const j=active();if(j)return j}}catch(_){}
    const list=jobs(),id=localStorage.getItem(ACTIVE);return list.find(j=>j.id===id)||list[0]||null;
  }
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function systemInvoiceNo(j){return String(j?.invoiceNumber||j?.jobNumber||'').trim()}
  function legacyRef(j){
    if(!j)return '';
    const key=jobKey(j),claims=readJson(CLAIMS,{}),drafts=readJson(DRAFTS,{});
    return String(drafts[key]?.legacyClaimRef||drafts[key]?.claimNumber||claims[key]?.claimNumber||'').replace(/^C\s*/i,'').trim();
  }

  function openReplica(){
    const j=activeJob();
    if(!j){alert('Select or create a Job / Order first.');return}
    const p=new URLSearchParams();p.set('job',j.jobNumber||j.id||'');p.set('t',Date.now());
    window.open('claim-invoice-v041r1.html?'+p.toString(),'_blank');
  }

  function relabelServiceField(){
    const input=document.getElementById('claimNumberSafe');if(!input)return;
    const wrap=input.parentElement,label=wrap?.querySelector('label');
    if(label)label.textContent='Legacy Claim / Service Ref';
    input.placeholder='C##### / service reference';
    input.title='Operational claim/service reference only. Not the formal Deerfoot Invoice number.';
  }

  function patchEntry(){
    const section=document.getElementById('serviceclaims');if(!section)return false;
    relabelServiceField();
    const j=activeJob(),inv=systemInvoiceNo(j),ref=legacyRef(j);
    let box=document.getElementById('claimInvoiceEntry034');
    if(!box){
      const cards=section.querySelectorAll('.card'),card=cards[cards.length-1];if(!card)return false;
      box=document.createElement('div');box.id='claimInvoiceEntry034';box.className='notice';box.style.marginTop='14px';card.appendChild(box);
    }
    box.dataset.runluV042='1';
    box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Deerfoot Original Claim Invoice · V0.3.42 Research</b>'+
      '<span>Uses the approved white Deerfoot form replica. <b>System Invoice #</b> follows the Regular Invoice'+(inv?' ('+esc(inv)+')':'')+'. C-number is only a <b>Legacy Claim Ref</b>'+(ref?' (C'+esc(ref)+')':'')+'. Alberta GST 5%.</span>';
    const actions=document.createElement('div');actions.className='actions';
    const b=document.createElement('button');b.type='button';b.className='action blue';b.textContent='Open Original Claim Invoice';b.addEventListener('click',openReplica);
    actions.appendChild(b);box.appendChild(actions);
    return true;
  }

  function install(){patchEntry();window.openDeerfootClaimInvoice=openReplica;}
  function scheduleInstall(){setTimeout(install,0);setTimeout(install,220);}

  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('button');
    if(b?.dataset?.page==='serviceclaims'||b?.id==='serviceClaimsModule')scheduleInstall();
  },true);
  window.addEventListener('pageshow',scheduleInstall);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleInstall,{once:true});else scheduleInstall();

  window.RUNLUClaimIntegration042={install,open:openReplica,systemInvoice:()=>systemInvoiceNo(activeJob()),legacyRef:()=>legacyRef(activeJob())};
})();
