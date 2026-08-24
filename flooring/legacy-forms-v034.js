/* RUNLU Deerfoot Flooring OS · Electronic Legacy Forms V0.3.35
   Job-bound Site Hazard Assessment + Claim Invoice entry points.
   Claim Invoice keeps its own C##### invoice-number series.
   Regular and Claim invoices use the same allocation principle (retain assigned number, otherwise take next),
   but their number sequences never mix. DEMO and real Claim sequences are isolated.
*/
(function(){
  'use strict';
  if(window.__runluLegacyForms035)return;
  window.__runluLegacyForms035=true;

  const JOBS_KEY='runlu_deerfoot_flooring_jobs_v1';
  const ACTIVE_KEY='runlu_deerfoot_flooring_active_job_v1';
  const CLAIMS_KEY='runlu_deerfoot_service_claims_v1';
  const CLAIM_DRAFT_KEY='runlu_deerfoot_claim_invoice_v1';
  const CLAIM_AUTH_KEY='runlu_deerfoot_claim_invoice_number_authority_v1';

  function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'?v:fallback}catch(_){return fallback}}
  function jobsFromStore(){const v=readJson(JOBS_KEY,[]);return Array.isArray(v)?v:[]}
  function activeJob(){try{return typeof active==='function'?active():null}catch(_){const list=jobsFromStore(),id=localStorage.getItem(ACTIVE_KEY);return list.find(j=>j.id===id)||null}}
  function jobKey(j){return j?.id||j?.jobNumber||''}
  function jobParam(){const j=activeJob();return encodeURIComponent(j?.jobNumber||j?.id||'')}
  function parseClaimNo(v){const s=String(v??'').trim().replace(/^C\s*/i,'');if(!/^\d+$/.test(s))return 0;const n=Number(s);return Number.isSafeInteger(n)&&n>0?n:0}
  function formatClaimNo(v){const n=parseClaimNo(v);return n?'C'+n:''}
  function jobIsDemo(key){const j=jobsFromStore().find(x=>x.id===key||x.jobNumber===key);return !!j?.isDemo}

  function claimAuth(){const a=readJson(CLAIM_AUTH_KEY,{realLast:0,demoLast:0,assignments:{},updatedAt:''});return {realLast:parseClaimNo(a.realLast),demoLast:parseClaimNo(a.demoLast),assignments:{...(a.assignments||{})},updatedAt:a.updatedAt||''}}
  function saveClaimAuth(a){a.updatedAt=new Date().toISOString();localStorage.setItem(CLAIM_AUTH_KEY,JSON.stringify(a));window.RUNLUClaimInvoiceNumberAuthority=a}
  function assigned(j){const n=parseClaimNo(claimAuth().assignments?.[jobKey(j)]);return n?n:''}
  function reserve(j,n){
    n=parseClaimNo(n);if(!j||!n)return 0;
    const a=claimAuth(),key=jobKey(j),demo=!!j.isDemo;a.assignments[key]=n;
    if(demo)a.demoLast=Math.max(parseClaimNo(a.demoLast),n);else a.realLast=Math.max(parseClaimNo(a.realLast),n);
    saveClaimAuth(a);return n;
  }
  function savedClaimNumber(j){
    if(!j)return 0;const key=jobKey(j),claims=readJson(CLAIMS_KEY,{}),drafts=readJson(CLAIM_DRAFT_KEY,{});
    return parseClaimNo(claims[key]?.claimNumber)||parseClaimNo(drafts[key]?.claimNumber)||assigned(j)||0;
  }
  function claimFloor(isDemo){
    const jobs=jobsFromStore(),claims=readJson(CLAIMS_KEY,{}),drafts=readJson(CLAIM_DRAFT_KEY,{}),a=claimAuth(),nums=[];
    Object.entries(claims).forEach(([key,r])=>{if(jobIsDemo(key)===!!isDemo){const n=parseClaimNo(r?.claimNumber);if(n)nums.push(n)}});
    Object.entries(drafts).forEach(([key,r])=>{if(jobIsDemo(key)===!!isDemo){const n=parseClaimNo(r?.claimNumber);if(n)nums.push(n)}});
    Object.entries(a.assignments||{}).forEach(([key,v])=>{if(jobIsDemo(key)===!!isDemo){const n=parseClaimNo(v);if(n)nums.push(n)}});
    nums.push(isDemo?parseClaimNo(a.demoLast):parseClaimNo(a.realLast));
    return Math.max(0,...nums);
  }
  function ensureClaimInvoiceNumber(j){
    if(!j)return 0;
    const existing=savedClaimNumber(j);if(existing)return reserve(j,existing);
    const floor=claimFloor(!!j.isDemo);return floor?reserve(j,floor+1):0;
  }
  function persistClaimNumber(j,n){
    n=parseClaimNo(n);if(!j||!n)return 0;reserve(j,n);
    const key=jobKey(j),db=readJson(CLAIMS_KEY,{}),old=db[key]||{};
    db[key]={...old,jobId:j.id||'',jobNumber:j.jobNumber||'',customerName:j.customerName||'',claimNumber:formatClaimNo(n),type:old.type||'Claim',status:old.status||'Open',openedDate:old.openedDate||new Date().toISOString().slice(0,10),updatedAt:new Date().toISOString()};
    localStorage.setItem(CLAIMS_KEY,JSON.stringify(db));
    return n;
  }

  function injectClaimNumber(win,j){
    try{
      if(!win||win.closed)return;
      const doc=win.document,input=doc.getElementById('claimNumber'),bottom=doc.getElementById('claimNumberBottom'),msg=doc.getElementById('statusMsg');if(!input)return;
      let n=ensureClaimInvoiceNumber(j);
      if(n){input.value=String(n);input.readOnly=true;input.title='Claim Invoice number · C-series';if(bottom)bottom.textContent=String(n)}
      else{
        input.readOnly=false;input.placeholder='Enter first C-number';input.title='Enter the first confirmed Claim Invoice number. Later Claim invoices can continue automatically.';
        if(msg)msg.innerHTML='<b>Claim Invoice C-number setup:</b> enter the first confirmed number for this Claim series, then Save Draft. Future Claim Invoices can continue from it automatically.';
      }
      input.addEventListener('change',()=>{const chosen=parseClaimNo(input.value);if(!chosen)return;persistClaimNumber(j,chosen);input.value=String(chosen);input.readOnly=true;if(bottom)bottom.textContent=String(chosen);if(msg)msg.innerHTML='<b>Claim Invoice # C'+chosen+'</b> saved as this invoice number. The next Claim Invoice will use the next C-number.';});
      const saveBtn=[...doc.querySelectorAll('.toolbar button')].find(b=>/Save Draft/i.test(b.textContent||''));
      if(saveBtn)saveBtn.addEventListener('click',()=>setTimeout(()=>{const chosen=parseClaimNo(input.value);if(chosen)persistClaimNumber(j,chosen)},0));
      const prev=doc.getElementById('previousInvoice');if(prev&&!prev.value&&j.invoiceNumber)prev.value=j.invoiceNumber;
      if(n&&msg){const prevNo=parseClaimNo(j.invoiceNumber)?String(j.invoiceNumber):String(j.invoiceNumber||'');msg.innerHTML='<b>Claim Invoice # C'+n+'</b> · Claim C-series.'+(j.isDemo?' <b>DEMO only.</b>':'')+(prevNo?' &nbsp; Previous Regular Invoice: <b>'+prevNo.replace(/[<>]/g,'')+'</b>.':'')}
    }catch(e){console.error('Claim Invoice C-number setup failed:',e)}
  }

  function openHazard(){window.open('site-hazard-assessment.html?job='+jobParam()+'&t='+Date.now(),'_blank')}
  function openClaimInvoice(){
    const j=activeJob();if(!j){alert('Select or create a Job / Order first.');return}
    const w=window.open('claim-invoice.html?job='+jobParam()+'&t='+Date.now(),'_blank');if(!w)return;
    const apply=()=>injectClaimNumber(w,j);try{w.addEventListener('load',apply,{once:true})}catch(_){}setTimeout(apply,250);
  }

  function button(label,kind,onClick){const b=document.createElement('button');b.type='button';b.className='action '+(kind||'');b.textContent=label;b.addEventListener('click',onClick);return b}
  function installEntry(){const section=document.getElementById('install');if(!section||document.getElementById('siteHazardEntry034'))return;const card=section.querySelector('.card');if(!card)return;const box=document.createElement('div');box.id='siteHazardEntry034';box.className='notice';box.style.marginTop='14px';box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Site Safety</b><span>Job-bound electronic Site Hazard Assessment · printable / PDF-ready.</span>';const actions=document.createElement('div');actions.className='actions';actions.appendChild(button('Open Site Hazard Assessment','blue',openHazard));box.appendChild(actions);card.appendChild(box)}
  function claimEntry(){const section=document.getElementById('serviceclaims');if(!section||document.getElementById('claimInvoiceEntry034'))return;const cards=section.querySelectorAll('.card'),card=cards[cards.length-1];if(!card)return;const box=document.createElement('div');box.id='claimInvoiceEntry034';box.className='notice';box.style.marginTop='14px';box.innerHTML='<b style="display:block;margin-bottom:5px;color:#173d30">Deerfoot Claim Invoice</b><span>White legacy Claim Invoice · own C-number series · Previous Invoice remains the linked Regular Invoice.</span>';const actions=document.createElement('div');actions.className='actions';actions.appendChild(button('Open Claim Invoice','blue',openClaimInvoice));box.appendChild(actions);card.appendChild(box)}
  function commandEntries(){const grid=document.querySelector('#command .grid3');if(!grid)return;if(!document.getElementById('hazardModule034')){const h=document.createElement('button');h.id='hazardModule034';h.className='module';h.innerHTML='<span class="ico">⚠️</span><strong>Site Hazard Assessment</strong><small>Electronic installer safety assessment tied to the active Job / Order.</small>';h.addEventListener('click',()=>{if(typeof go==='function')go('install');setTimeout(openHazard,50)});grid.appendChild(h)}}
  function markVersion(){const pill=document.querySelector('header .pill');if(pill)pill.textContent='V0.3.35 Claim C-Number Sequence';document.title='RUNLU Deerfoot Flooring OS V0.3.35'}
  function boot(){installEntry();claimEntry();commandEntries();markVersion();window.RUNLUClaimInvoiceNumbers={forActive:()=>ensureClaimInvoiceNumber(activeJob()),lastReal:()=>claimFloor(false),lastDemo:()=>claimFloor(true)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('pageshow',boot);
  document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(!b)return;const p=b.dataset?.page;if(p==='install'||p==='serviceclaims')setTimeout(boot,0)},true);
  window.openSiteHazardAssessment=openHazard;window.openDeerfootClaimInvoice=openClaimInvoice;
})();