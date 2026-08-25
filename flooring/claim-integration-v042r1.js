/* RUNLU Deerfoot Flooring OS · V0.3.42R1 Research
   Explicit Service / Claims -> Original Claim Invoice handoff.
   Dual channel: one-time localStorage payload + postMessage fallback.
   No polling. No MutationObserver. No inventory writes. No automatic C-number sequencing.
*/
(function(){
  'use strict';
  if(window.__runluClaimIntegration042R1)return;
  window.__runluClaimIntegration042R1=true;

  const JOBS='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE='runlu_deerfoot_flooring_active_job_v1';
  const CLAIMS='runlu_deerfoot_service_claims_v1';
  const HANDOFF='runlu_claim_handoff_v042r1_';
  const pending={};

  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(_){return fallback}}
  function jobs(){const v=readJson(JOBS,[]);return Array.isArray(v)?v:[]}
  function activeJob(){
    try{if(typeof active==='function'){const j=active();if(j)return j}}catch(_){}
    const list=jobs(),id=localStorage.getItem(ACTIVE);return list.find(j=>j.id===id)||list[0]||null;
  }
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function field(id){return String(document.getElementById(id)?.value||'').trim()}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function claimNo(v){return String(v||'').trim()}

  function jobSnapshot(j){
    return {
      id:j?.id||'',jobNumber:j?.jobNumber||'',invoiceNumber:j?.invoiceNumber||'',customerName:j?.customerName||'',
      soldToAddress:j?.soldToAddress||'',shipToAddress:j?.shipToAddress||'',phoneHome:j?.phoneHome||'',phoneWork:j?.phoneWork||'',cell:j?.cell||'',
      salesRep:j?.salesRep||'',salesperson:j?.salesperson||'',installer:j?.installer||'',installDate:j?.installDate||'',
      items:Array.isArray(j?.items)?j.items.map(x=>({style:x?.style||'',colour:x?.colour||'',supplier:x?.supplier||'',sourceRef:x?.sourceRef||''})):[]
    };
  }
  function claimSnapshot(j){
    const stored=readJson(CLAIMS,{})[jobKey(j)]||{};
    return {
      claimNumber:field('claimNumberSafe')||stored.claimNumber||'',
      type:field('claimTypeSafe')||stored.type||'Service',
      status:field('claimStatusSafe')||stored.status||'Open',
      openedDate:field('claimOpenedDateSafe')||stored.openedDate||'',
      supplier:field('claimSupplierSafe')||stored.supplier||'',
      relatedPO:field('claimRelatedPOSafe')||stored.relatedPO||'',
      inspector:field('claimInspectorSafe')||stored.inspector||'',
      recoveryCredit:field('claimRecoverySafe')||stored.recoveryCredit||'',
      notes:field('claimNotesSafe')||stored.notes||''
    };
  }
  function snapshot(){
    const j=activeJob();if(!j)return null;
    return {version:'0.3.42R1',createdAt:new Date().toISOString(),job:jobSnapshot(j),claim:claimSnapshot(j)};
  }
  function token(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
  function send(win,t,payload){try{win?.postMessage({type:'RUNLU_CLAIM_HANDOFF_V042R1',token:t,payload},location.origin)}catch(_){}}

  function openReplica(){
    const payload=snapshot();
    if(!payload){alert('Select or create a Job / Order first.');return}
    const t=token();pending[t]=payload;
    try{localStorage.setItem(HANDOFF+t,JSON.stringify(payload))}catch(_){}
    const p=new URLSearchParams({token:t,t:String(Date.now())});
    const w=window.open('claim-invoice-v041r2.html?'+p.toString(),'_blank');
    if(!w)return;
    setTimeout(()=>send(w,t,payload),120);
    setTimeout(()=>send(w,t,payload),450);
    setTimeout(()=>send(w,t,payload),1100);
    setTimeout(()=>{try{localStorage.removeItem(HANDOFF+t)}catch(_){};delete pending[t]},60000);
  }

  window.addEventListener('message',e=>{
    if(e.origin!==location.origin)return;
    const m=e.data||{};
    if(m.type!=='RUNLU_CLAIM_HANDOFF_REQUEST_V042R1'||!m.token)return;
    const payload=pending[m.token];if(payload)send(e.source,m.token,payload);
  });

  function relabelServiceField(){
    const input=document.getElementById('claimNumberSafe');if(!input)return;
    const label=input.parentElement?.querySelector('label');
    if(label)label.textContent='Claim Invoice / Service #';
    input.placeholder='C##### or service reference';
    input.title='For a Deerfoot Claim Invoice, the C-number is the Claim Invoice number. Regular Invoice remains Previous Invoice(s).';
  }
  function currentClaimNo(){const j=activeJob(),stored=readJson(CLAIMS,{})[jobKey(j)]||{};return claimNo(field('claimNumberSafe')||stored.claimNumber||'')}

  function patchEntry(){
    const section=document.getElementById('serviceclaims');if(!section)return false;
    relabelServiceField();
    const j=activeJob(),cno=currentClaimNo(),prev=String(j?.invoiceNumber||'').trim();
    let box=document.getElementById('claimInvoiceEntry034');
    if(!box){const cards=section.querySelectorAll('.card'),card=cards[cards.length-1];if(!card)return false;box=document.createElement('div');box.id='claimInvoiceEntry034';box.className='notice';box.style.marginTop='14px';card.appendChild(box)}
    box.dataset.runluV042R1='1';
    box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Deerfoot Original Claim Invoice · V0.3.42R1</b>'+
      '<span>Approved white Deerfoot replica. <b>Claim Invoice #</b> uses the C-number'+(cno?' ('+esc(cno)+')':'')+'. <b>Previous Invoice(s)</b> uses the linked Regular Invoice'+(prev?' ('+esc(prev)+')':'')+'. Current Job + Service / Claims data is handed over explicitly. Alberta GST 5%.</span>';
    const actions=document.createElement('div');actions.className='actions';
    const b=document.createElement('button');b.type='button';b.className='action blue';b.textContent='Open Original Claim Invoice';b.addEventListener('click',openReplica);
    actions.appendChild(b);box.appendChild(actions);return true;
  }

  function install(){patchEntry();window.openDeerfootClaimInvoice=openReplica}
  function scheduleInstall(){setTimeout(install,0);setTimeout(install,220)}
  document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(b?.dataset?.page==='serviceclaims'||b?.id==='serviceClaimsModule')scheduleInstall()},true);
  window.addEventListener('pageshow',scheduleInstall);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleInstall,{once:true});else scheduleInstall();
  window.RUNLUClaimIntegration042R1={install,open:openReplica,snapshot};
})();
