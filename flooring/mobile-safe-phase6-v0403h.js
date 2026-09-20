/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 6
   Reintroduces historical V0.3.95 People TO Call Sales Review.
   Startup stays light: only this launcher is hydrated by Safe Fast Boot.
   The review module loads only after the user explicitly opens People TO Call Review.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE6_V0395__)return;
root.__RUNLU_MOBILE_SAFE_PHASE6_V0395__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03h';
const MODULE_SRC='people-to-call-review-v095-safe.js?v=0403h-safe';
const MODULE_GLOBAL='RUNLUPeopleToCallReviewV095';
const LAUNCHER='r095safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);
function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}

function ensureBase(){
  if(root.RUNLUOrdersDrawerV066)return true;
  throw new Error('Orders / People TO Call base workflow is unavailable')
}

function load(){
  ensureBase();
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-people-review-v0395]');
    if(existing){
      let tries=0;
      const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else if(++tries<40)setTimeout(wait,75);else{state='failed';reject(new Error('People TO Call Review did not initialize'))}};
      wait();return
    }
    const s=document.createElement('script');
    s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-mobile-people-review-v0395','1');
    s.onload=()=>{state='loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('People TO Call Review V0.3.95 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}

function ordersButton(){
  return document.querySelector('#nav [data-page="jobs"]')||
    [...document.querySelectorAll('#nav button,button')].find(x=>/^(Orders|Jobs|Jobs & Orders)$/i.test(String(x.textContent||'').trim()))||null
}
function openPeople(){
  removeLauncher();
  const b=ordersButton();
  if(b)b.click();
  setTimeout(()=>{
    try{root[MODULE_GLOBAL]?.refresh?.()}catch(_){}
    const card=by('r66people');if(card?.scrollIntoView)card.scrollIntoView({block:'start',behavior:'smooth'})
  },140);
  return !!b
}

async function launch(){
  const b=by(LAUNCHER);
  if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening V0.3.95 Sales Review…'}
  try{
    await load();
    setTimeout(()=>{if(!openPeople())setTimeout(openPeople,120)},0)
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 6]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}

function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">📞</span><strong>People TO Call Review</strong><small>V0.3.95 · Sales routes received-pickup Orders to Active / Pick Up / keep for follow-up.</small>';
  b.addEventListener('click',launch);
  const anchor=by('rc093safeLauncher')||by('rc092safeLauncher')||by('r091safeLauncher');
  anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b)
}

function status(){return {version:VERSION,module:'people-to-call-review-v0395',state,ready:moduleReady(),startup:'launcher-only',poStatusImmutable:true}}

function install(){
  ensureLauncher();
  setTimeout(ensureLauncher,500);
  window.addEventListener('pageshow',ensureLauncher);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})
}

root.RUNLUMobileSafePhase6V0395={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
