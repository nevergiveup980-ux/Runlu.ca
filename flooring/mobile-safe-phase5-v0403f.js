/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 5
   Reintroduces historical V0.3.93 Carpet Line RC Availability.
   Startup stays light: only a launcher is installed. On explicit tap we first
   ensure the V0.3.92 RC data layer is available, then load V0.3.93 and open Jobs.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE5_V0393__)return;
root.__RUNLU_MOBILE_SAFE_PHASE5_V0393__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03f';
const MODULE_SRC='carpet-line-rc-v093-safe.js?v=0403f-safe';
const MODULE_GLOBAL='RUNLUCarpetLineRCV093';
const LAUNCHER='rc093safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);
function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}

async function ensureRCDependency(){
  if(root.RUNLUCarpetRCTrackingV092)return true;
  if(root.RUNLUMobileSafePhase4V0392?.load){
    await root.RUNLUMobileSafePhase4V0392.load();
    if(root.RUNLUCarpetRCTrackingV092)return true
  }
  throw new Error('V0.3.92 RC Tracking dependency is unavailable')
}

function loadModule(){
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-carpet-line-v0393]');
    if(existing){
      let tries=0;const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else if(++tries<40)setTimeout(wait,75);else{state='failed';reject(new Error('Carpet Line RC Availability did not initialize'))}};
      wait();return
    }
    const s=document.createElement('script');
    s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-mobile-carpet-line-v0393','1');
    s.onload=()=>{state='loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('Carpet Line RC Availability V0.3.93 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}

function jobsButton(){
  return document.querySelector('#nav [data-page="jobs"]')||
    [...document.querySelectorAll('#nav button,button')].find(x=>/^(Jobs|Jobs & Orders)$/i.test(String(x.textContent||'').trim()))||null
}
function openJobs(){
  removeLauncher();
  const b=jobsButton();if(b){b.click();setTimeout(()=>{root[MODULE_GLOBAL]?.decorate?.();root[MODULE_GLOBAL]?.refresh?.()},120);return true}
  return false
}

async function load(){
  await ensureRCDependency();
  return loadModule()
}

async function launch(){
  const b=by(LAUNCHER);
  if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening V0.3.93 live roll check…'}
  try{
    await load();
    setTimeout(()=>{if(!openJobs())setTimeout(openJobs,120)},0)
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 5]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}

function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">📏</span><strong>Carpet Line RC Check</strong><small>V0.3.93 · choose Finance RC + planned cuts and check live roll sufficiency.</small>';
  b.addEventListener('click',launch);
  const anchor=by('rc092safeLauncher')||by('rc092module')||by('r091safeLauncher')||by('r091module');
  anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b)
}

function status(){return {version:VERSION,module:'carpet-line-rc-v0393',state,ready:moduleReady(),startup:'launcher-only',dependency:'v0392'}}

function install(){
  ensureLauncher();
  setTimeout(ensureLauncher,500);
  window.addEventListener('pageshow',ensureLauncher);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})
}

root.RUNLUMobileSafePhase5V0393={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
