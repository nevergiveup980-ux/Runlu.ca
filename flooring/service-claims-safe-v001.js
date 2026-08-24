/* RUNLU Deerfoot Flooring OS · Service / Claims Safe V0.1.5
   Lightweight per-Job service/claim record plus safe Estimate navigation repair,
   final Pricing / Settings / responsive polish, restored Sales Core V0.3.33,
   electronic Site Hazard / Claim Invoice forms, and shared Invoice Number Authority V0.3.35.
   No polling, no inventory mutations, no network writes from this module.
*/
(function(){
  'use strict';
  if(window.__runluServiceClaimsSafeV001)return;
  window.__runluServiceClaimsSafeV001=true;
  const STORE='runlu_deerfoot_service_claims_v1';
  const by=id=>document.getElementById(id);
  function read(){try{const x=JSON.parse(localStorage.getItem(STORE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
  function write(x){localStorage.setItem(STORE,JSON.stringify(x))}
  function activeJob(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function defaultClaim(j){return {claimNumber:'',type:'Service',status:'Open',openedDate:new Date().toISOString().slice(0,10),supplier:'',relatedPO:j?.supplierPO||'',inspector:'',recoveryCredit:'',notes:'',updatedAt:''}}
  function set(id,v){const el=by(id);if(el)el.value=v??''}
  function get(id){return (by(id)?.value||'').trim()}

  function ensureEstimateFrame(){
    const f=by('estimateFrame');
    if(f&&!f.getAttribute('src'))f.setAttribute('src',f.dataset.src||'estimate-assessment.html');
  }
  function ensureEstimateNav(){
    const nav=by('nav');if(!nav)return;
    let btn=nav.querySelector('button[data-page="estimate"]');
    if(!btn){
      btn=document.createElement('button');
      btn.dataset.page='estimate';
      btn.textContent='Estimate';
      btn.addEventListener('click',()=>{ensureEstimateFrame();if(typeof go==='function')go('estimate')});
      const showroom=nav.querySelector('button[data-page="showroom"]');
      const jobs=nav.querySelector('button[data-page="jobs"]');
      if(showroom&&showroom.nextSibling)nav.insertBefore(btn,showroom.nextSibling);
      else if(jobs)nav.insertBefore(btn,jobs);
      else nav.appendChild(btn);
    }
    ensureEstimateFrame();
  }
  function ensureFinalPolish(){
    if(window.__runluFinalPolish032||document.querySelector('script[data-runlu-final-polish="032"]'))return;
    const s=document.createElement('script');
    s.src='final-polish-v032.js?v=032';
    s.async=false;
    s.dataset.runluFinalPolish='032';
    s.onerror=()=>console.error('RUNLU V0.3.32 final polish failed to load.');
    document.body.appendChild(s);
  }
  function ensureSalesCore(){
    if(window.__runluSalesCore033||document.querySelector('script[data-runlu-sales-core="033"]'))return;
    const s=document.createElement('script');
    s.src='sales-core-v033.js?v=033';
    s.async=false;
    s.dataset.runluSalesCore='033';
    s.onerror=()=>console.error('RUNLU V0.3.33 Sales Core failed to load.');
    document.body.appendChild(s);
  }
  function ensureLegacyForms(){
    if(window.__runluLegacyForms035||document.querySelector('script[data-runlu-legacy-forms="035"]'))return;
    const s=document.createElement('script');
    s.src='legacy-forms-v034.js?v=035';
    s.async=false;
    s.dataset.runluLegacyForms='035';
    s.onerror=()=>console.error('RUNLU V0.3.35 electronic forms / invoice numbering failed to load.');
    document.body.appendChild(s);
  }
  function markVersion(){
    const pill=document.querySelector('header .pill');
    if(pill)pill.textContent='V0.3.35 Shared Invoice Number Authority';
    document.title='RUNLU Deerfoot Flooring OS V0.3.35';
  }

  function loadClaim(){
    const j=activeJob(),summary=by('serviceClaimJobSummary');
    if(summary)summary.innerHTML=j?`<b>${j.isDemo?'<span class="tag demoTag">DEMO</span> ':''}${escapeHtml(j.jobNumber||'No #')} · ${escapeHtml(j.customerName||'Unnamed customer')}</b><br>${escapeHtml(j.status||'Draft')} · Linked PO: ${escapeHtml(j.supplierPO||'None')}`:'Select or create a Job / Order first.';
    const db=read(),r=j?(db[jobKey(j)]||defaultClaim(j)):defaultClaim(null);
    set('claimNumberSafe',r.claimNumber);set('claimTypeSafe',r.type||'Service');set('claimStatusSafe',r.status||'Open');set('claimOpenedDateSafe',r.openedDate);set('claimSupplierSafe',r.supplier);set('claimRelatedPOSafe',r.relatedPO||j?.supplierPO||'');set('claimInspectorSafe',r.inspector);set('claimRecoverySafe',r.recoveryCredit);set('claimNotesSafe',r.notes);
    const msg=by('serviceClaimMsg');if(msg)msg.textContent=r.updatedAt?'Last saved '+new Date(r.updatedAt).toLocaleString():'No saved service / claim record for this Job yet.';
  }
  function saveClaim(markResolved){
    const j=activeJob();if(!j){alert('Select or create a Job / Order first.');return}
    const db=read(),key=jobKey(j),old=db[key]||defaultClaim(j);
    const status=markResolved?'Resolved':(get('claimStatusSafe')||'Open');
    db[key]={...old,jobId:j.id||'',jobNumber:j.jobNumber||'',customerName:j.customerName||'',claimNumber:get('claimNumberSafe'),type:get('claimTypeSafe')||'Service',status,openedDate:get('claimOpenedDateSafe'),supplier:get('claimSupplierSafe'),relatedPO:get('claimRelatedPOSafe'),inspector:get('claimInspectorSafe'),recoveryCredit:get('claimRecoverySafe'),notes:get('claimNotesSafe'),updatedAt:new Date().toISOString()};
    write(db);set('claimStatusSafe',status);loadClaim();alert(markResolved?'Service / claim marked Resolved.':'Service / claim saved.');
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
  function boot(){
    ensureEstimateNav();ensureFinalPolish();ensureSalesCore();ensureLegacyForms();markVersion();
    by('serviceClaimSaveBtn')?.addEventListener('click',()=>saveClaim(false));
    by('serviceClaimResolveBtn')?.addEventListener('click',()=>saveClaim(true));
    document.addEventListener('click',ev=>{
      const b=ev.target?.closest?.('button');
      if(b?.dataset?.page==='serviceclaims'||b?.id==='serviceClaimsModule')setTimeout(loadClaim,0);
      if(b?.dataset?.page==='estimate'||String(b?.getAttribute?.('onclick')||'').includes("go('estimate')"))ensureEstimateFrame();
    },true);
    window.runluServiceClaimsLoad=loadClaim;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',()=>{ensureEstimateNav();ensureFinalPolish();ensureSalesCore();ensureLegacyForms();markVersion();});
})();