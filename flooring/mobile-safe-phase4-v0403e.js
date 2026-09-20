/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 4
   Reintroduces historical V0.3.92 Carpet RC Tracking one piece at a time.
   Startup stays light: only a launcher is installed. The RC module is fetched
   only after the user explicitly opens Carpet RC Tracking.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE4_V0392__)return;
root.__RUNLU_MOBILE_SAFE_PHASE4_V0392__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03e';
const MODULE_SRC='carpet-rc-tracking-v092-safe.js?v=0403e-safe';
const MODULE_GLOBAL='RUNLUCarpetRCTrackingV092';
const LAUNCHER='rc092safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);

function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}

function openInstalled(){
  removeLauncher();
  if(root[MODULE_GLOBAL]?.open){root[MODULE_GLOBAL].open();return true}
  const b=by('rc092module')||document.querySelector('#nav [data-page="rcTracking"]');
  if(b){b.click();return true}
  return false
}

function load(){
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-rc-v0392]');
    if(existing){
      let tries=0;const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else if(++tries<40)setTimeout(wait,75);else{state='failed';reject(new Error('Carpet RC Tracking did not initialize'))}};
      wait();return
    }
    const s=document.createElement('script');
    s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-mobile-rc-v0392','1');
    s.onload=()=>{state='loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('Carpet RC Tracking V0.3.92 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}

async function launch(){
  const b=by(LAUNCHER);
  if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening V0.3.92 RC registry…'}
  try{
    await load();
    setTimeout(()=>{if(!openInstalled())setTimeout(openInstalled,120)},0)
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 4]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}

function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">🎟️</span><strong>Carpet RC Tracking</strong><small>V0.3.92 · Finance-assigned RC registry + Carpet Inventory lifecycle.</small>';
  b.addEventListener('click',launch);
  const anchor=by('r091safeLauncher')||by('r091module')||by('mw091module');
  anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b)
}

function status(){return {version:VERSION,module:'carpet-rc-tracking-v0392',state,ready:moduleReady(),startup:'launcher-only'}}

function install(){
  ensureLauncher();
  setTimeout(ensureLauncher,500);
  window.addEventListener('pageshow',ensureLauncher);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})
}

root.RUNLUMobileSafePhase4V0392={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
