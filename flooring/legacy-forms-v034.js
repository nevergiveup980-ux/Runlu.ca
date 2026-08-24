/* RUNLU Deerfoot Flooring OS · Electronic Legacy Forms V0.3.35
   Job-bound Site Hazard Assessment + Claim Invoice entry points.
   V0.3.35 adds one shared Invoice Number Authority for Regular and Claim invoices.
   Service / Claim C###### remains the case number; Claim Invoice uses the shared invoice sequence.
   DEMO numbering is isolated from real invoice numbering so validation records cannot contaminate production.
   No inventory/cloud mutations are introduced here.
*/
(function(){
  'use strict';
  if(window.__runluLegacyForms035)return;
  window.__runluLegacyForms035=true;

  const JOBS_KEY='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE_KEY='runlu_deerfoot_flooring_active_job_v1';
  const AUTH_KEY='runlu_deerfoot_invoice_number_authority_v1';

  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(_){return fallback}}
  function jobsFromStore(){const v=readJson(JOBS_KEY,[]);return Array.isArray(v)?v:[]}
  function activeJob(){try{return typeof active==='function'?active():null}catch(_){const list=jobsFromStore(),id=localStorage.getItem(ACTIVE_KEY);return list.find(j=>j.id===id)||null}}
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function jobParam(){const j=activeJob();return encodeURIComponent(j?.jobNumber||j?.id||'')}
  function parseNo(v){const s=String(v??'').trim().replace(/^C\s*/i,'');if(!/^\d+$/.test(s))return 0;const n=Number(s);return Number.isSafeInteger(n)&&n>0?n:0}
  function auth(){const a=readJson(AUTH_KEY,{lastIssued:0,assignments:{},updatedAt:''});return {lastIssued:parseNo(a.lastIssued),assignments:{...(a.assignments||{})},updatedAt:a.updatedAt||''}}
  function saveAuth(a){a.updatedAt=new Date().toISOString();localStorage.setItem(AUTH_KEY,JSON.stringify(a));window.RUNLUInvoiceNumberAuthority=a}
  function knownNumbers(){
    const rows=jobsFromStore(),real=[],demo=[];
    rows.forEach(j=>{const n=parseNo(j.invoiceNumber);if(n)(j.isDemo?demo:real).push(n)});
    const a=auth(),realAssigned=[],demoAssigned=[];
    Object.entries(a.assignments||{}).forEach(([key,value])=>{const n=parseNo(value);if(!n)return;(/demo-/i.test(key)?demoAssigned:realAssigned).push(n)});
    return {real,demo,realAssigned,demoAssigned,last:parseNo(a.lastIssued)};
  }
  function currentFloor(isDemo){
    const k=knownNumbers();
    if(isDemo)return Math.max(0,...k.demo,...k.demoAssigned);
    return Math.max(0,...k.real,...k.realAssigned);
  }
  function reserve(key,n){n=parseNo(n);if(!n)return '';const a=auth();a.assignments[key]=n;a.lastIssued=Math.max(parseNo(a.lastIssued),n);saveAuth(a);return String(n)}
  function assigned(key){const n=parseNo(auth().assignments?.[key]);return n?String(n):''}
  function allocateNext(key,baseline,isDemo){
    const held=assigned(key);if(held)return held;
    const floor=Math.max(currentFloor(!!isDemo),parseNo(baseline));
    if(!floor)return '';
    return reserve(key,floor+1);
  }
  function persistActiveJob(j){
    if(!j)return;
    try{if(typeof saveStore==='function'){saveStore();return}}catch(_){}
    const rows=jobsFromStore(),i=rows.findIndex(x=>x.id===j.id||(j.jobNumber&&x.jobNumber===j.jobNumber));if(i>=0){rows[i]={...rows[i],...j};localStorage.setItem(JOBS_KEY,JSON.stringify(rows))}
  }

  function ensureRegularInvoiceNumber(){
    const j=activeJob();if(!j)return '';
    const key='regular:'+jobKey(j),existing=parseNo(j.invoiceNumber);
    if(existing)return reserve(key,existing);
    let n='';const floor=currentFloor(!!j.isDemo);
    if(floor)n=reserve(key,floor+1);
    else{const seed=parseNo(j.jobNumber);if(seed)n=reserve(key,seed)}
    if(n){j.invoiceNumber=n;j.invoiceDate=j.invoiceDate||new Date().toISOString().slice(0,10);persistActiveJob(j);const field=document.getElementById('invoiceNumber');if(field)field.value=n}
    return n;
  }

  function wrapRegularInvoice(){
    if(window.__runluSharedInvoiceWrapped)return;
    const basePrepare=window.prepareInvoice,baseSave=window.saveJob;
    if(typeof basePrepare==='function')window.prepareInvoice=function(){ensureRegularInvoiceNumber();return basePrepare.apply(this,arguments)};
    if(typeof baseSave==='function'){
      window.saveJob=function(){
        const field=document.getElementById('invoiceNumber'),blankBefore=!!field&&!field.value.trim();
        const out=baseSave.apply(this,arguments),j=activeJob();
        if(j){
          if(blankBefore&&String(j.invoiceNumber||'')===String(j.jobNumber||'')){j.invoiceNumber='';persistActiveJob(j);if(field)field.value=''}
          else if(parseNo(j.invoiceNumber))reserve('regular:'+jobKey(j),j.invoiceNumber);
        }
        return out;
      };
    }
    window.__runluSharedInvoiceWrapped=true;
  }

  function claimInvoiceNumber(j){
    if(!j)return '';
    const key='claim:'+jobKey(j),held=assigned(key);if(held)return held;
    return allocateNext(key,j.invoiceNumber||j.jobNumber,!!j.isDemo);
  }
  function injectClaimNumber(win,n,j){
    try{
      if(!win||win.closed)return;
      const doc=win.document,input=doc.getElementById('claimNumber'),bottom=doc.getElementById('claimNumberBottom'),msg=doc.getElementById('statusMsg');
      if(!input)return;
      input.value=n||'';input.readOnly=true;input.title='Assigned from the same Invoice Number Authority used by Regular Deerfoot invoices.';
      input.dispatchEvent(new win.Event('input',{bubbles:true}));
      if(bottom)bottom.textContent=n||'—';
      if(msg){
        const original=parseNo(j?.invoiceNumber),caseNo=readJson('runlu_deerfoot_service_claims_v1',{})[jobKey(j)]?.claimNumber||'';
        msg.innerHTML=n
          ?'<b>Invoice # C'+n+'</b> · assigned from the shared Regular / Claim invoice sequence.'+(j?.isDemo?' <b>DEMO numbering only.</b>':'')+(caseNo?' &nbsp; Claim case: <b>'+String(caseNo).replace(/[<>]/g,'')+'</b>.':'')+(original?' &nbsp; Previous invoice remains <b>'+original+'</b>.':'')
          :'Invoice number setup is required. Enter or issue the first Regular Invoice #, then reopen this Claim Invoice.';
      }
    }catch(e){console.error('Claim Invoice number injection failed:',e)}
  }

  function openHazard(){window.open('site-hazard-assessment.html?job='+jobParam()+'&t='+Date.now(),'_blank')}
  function openClaimInvoice(){
    const j=activeJob();if(!j){alert('Select or create a Job / Order first.');return}
    const w=window.open('claim-invoice.html?job='+jobParam()+'&t='+Date.now(),'_blank');if(!w)return;
    const n=claimInvoiceNumber(j),apply=()=>injectClaimNumber(w,n,j);
    try{w.addEventListener('load',apply,{once:true})}catch(_){}
    setTimeout(apply,250);
  }

  function button(label,kind,onClick){const b=document.createElement('button');b.type='button';b.className='action '+(kind||'');b.textContent=label;b.addEventListener('click',onClick);return b}
  function installEntry(){
    const section=document.getElementById('install');if(!section||document.getElementById('siteHazardEntry034'))return;
    const card=section.querySelector('.card');if(!card)return;
    const box=document.createElement('div');box.id='siteHazardEntry034';box.className='notice';box.style.marginTop='14px';box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Site Safety</b><span>Job-bound electronic Site Hazard Assessment · printable / PDF-ready.</span>';
    const actions=document.createElement('div');actions.className='actions';actions.appendChild(button('Open Site Hazard Assessment','blue',openHazard));box.appendChild(actions);card.appendChild(box);
  }
  function claimEntry(){
    const section=document.getElementById('serviceclaims');if(!section||document.getElementById('claimInvoiceEntry034'))return;
    const cards=section.querySelectorAll('.card'),card=cards[cards.length-1];if(!card)return;
    const box=document.createElement('div');box.id='claimInvoiceEntry034';box.className='notice';box.style.marginTop='14px';box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Deerfoot Claim Invoice</b><span>White legacy Claim Invoice · Job-bound · shared Invoice # sequence with Regular Invoice.</span>';
    const actions=document.createElement('div');actions.className='actions';actions.appendChild(button('Open Claim Invoice','blue',openClaimInvoice));box.appendChild(actions);card.appendChild(box);
  }
  function commandEntries(){
    const grid=document.querySelector('#command .grid3');if(!grid)return;
    if(!document.getElementById('hazardModule034')){const h=document.createElement('button');h.id='hazardModule034';h.className='module';h.innerHTML='<span class="ico">⚠️</span><strong>Site Hazard Assessment</strong><small>Electronic installer safety assessment tied to the active Job / Order.</small>';h.addEventListener('click',()=>{if(typeof go==='function')go('install');setTimeout(openHazard,50)});grid.appendChild(h)}
  }

  function markVersion(){const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.35 Shared Invoice Number Authority';document.title='RUNLU Deerfoot Flooring OS V0.3.35'}
  function boot(){wrapRegularInvoice();installEntry();claimEntry();commandEntries();markVersion();window.RUNLUInvoiceNumbers={ensureRegular:ensureRegularInvoiceNumber,claimForActive:()=>claimInvoiceNumber(activeJob()),lastReal:()=>currentFloor(false),lastDemo:()=>currentFloor(true)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',boot);
  document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(!b)return;const p=b.dataset?.page;if(p==='install'||p==='serviceclaims'||p==='invoice')setTimeout(boot,0)},true);
  window.openSiteHazardAssessment=openHazard;
  window.openDeerfootClaimInvoice=openClaimInvoice;
})();