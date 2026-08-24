/* RUNLU Deerfoot Flooring OS · Electronic Legacy Forms V0.3.34
   Adds Job-bound entry points for the Site Hazard Assessment and Claim Invoice.
   Forms save safe per-Job drafts locally and print cleanly; no inventory/cloud mutations.
*/
(function(){
  'use strict';
  if(window.__runluLegacyForms034)return;
  window.__runluLegacyForms034=true;

  function activeJob(){try{return typeof active==='function'?active():null}catch(_){return null}}
  function jobParam(){const j=activeJob();return encodeURIComponent(j?.jobNumber||j?.id||'')}
  function openHazard(){window.open('site-hazard-assessment.html?job='+jobParam()+'&t='+Date.now(),'_blank')}
  function openClaimInvoice(){window.open('claim-invoice.html?job='+jobParam()+'&t='+Date.now(),'_blank')}

  function button(label,kind,onClick){
    const b=document.createElement('button');
    b.type='button';b.className='action '+(kind||'');b.textContent=label;b.addEventListener('click',onClick);return b;
  }

  function installEntry(){
    const section=document.getElementById('install');
    if(!section||document.getElementById('siteHazardEntry034'))return;
    const card=section.querySelector('.card');if(!card)return;
    const box=document.createElement('div');box.id='siteHazardEntry034';box.className='notice';box.style.marginTop='14px';
    box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Site Safety</b><span>Job-bound electronic Site Hazard Assessment · printable / PDF-ready.</span>';
    const actions=document.createElement('div');actions.className='actions';
    actions.appendChild(button('Open Site Hazard Assessment','blue',openHazard));
    box.appendChild(actions);card.appendChild(box);
  }

  function claimEntry(){
    const section=document.getElementById('serviceclaims');
    if(!section||document.getElementById('claimInvoiceEntry034'))return;
    const cards=section.querySelectorAll('.card');const card=cards[cards.length-1];if(!card)return;
    const box=document.createElement('div');box.id='claimInvoiceEntry034';box.className='notice';box.style.marginTop='14px';
    box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Deerfoot Claim Invoice</b><span>Electronic recreation of the white Service / Complaint / Claim invoice · Job-bound and printable.</span>';
    const actions=document.createElement('div');actions.className='actions';
    actions.appendChild(button('Open Claim Invoice','blue',openClaimInvoice));
    box.appendChild(actions);card.appendChild(box);
  }

  function commandEntries(){
    const grid=document.querySelector('#command .grid3');if(!grid)return;
    if(!document.getElementById('hazardModule034')){
      const h=document.createElement('button');h.id='hazardModule034';h.className='module';h.innerHTML='<span class="ico">⚠️</span><strong>Site Hazard Assessment</strong><small>Electronic installer safety assessment tied to the active Job / Order.</small>';h.addEventListener('click',()=>{if(typeof go==='function')go('install');setTimeout(openHazard,50)});grid.appendChild(h);
    }
  }

  function markVersion(){
    const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.34 Electronic Safety + Claim Forms';
    document.title='RUNLU Deerfoot Flooring OS V0.3.34';
  }
  function boot(){installEntry();claimEntry();commandEntries();markVersion();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',boot);
  document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(!b)return;const p=b.dataset?.page;if(p==='install'||p==='serviceclaims')setTimeout(boot,0)},true);
  window.openSiteHazardAssessment=openHazard;
  window.openDeerfootClaimInvoice=openClaimInvoice;
})();