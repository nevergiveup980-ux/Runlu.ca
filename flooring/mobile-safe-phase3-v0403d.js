/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 3
   Reintroduces historical V0.3.91 Mixed Order Routing one piece at a time.
   Startup stays light: only a launcher is installed. The routing module is
   fetched only after the user explicitly opens Mixed Order Routing.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE3_V0391__)return;
root.__RUNLU_MOBILE_SAFE_PHASE3_V0391__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03d';
const MODULE_SRC='mixed-order-routing-v091-safe.js?v=0403d-safe';
const MODULE_GLOBAL='RUNLUMixedOrderRoutingV091';
const LAUNCHER='r091safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);

function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}
function jobsButton(){
  return document.querySelector('#nav [data-page="jobs"]')||
    [...document.querySelectorAll('#nav button,button')].find(x=>String(x.textContent||'').trim()==='Jobs')||null
}
function openJobs(){
  removeLauncher();
  const b=jobsButton();if(b){b.click();return true}
  return false
}
function load(){
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-mixed-routing-v0391]');
    if(existing){
      let tries=0;const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else if(++tries<40)setTimeout(wait,75);else{state='failed';reject(new Error('Mixed Order Routing did not initialize'))}};
      wait();return
    }
    const s=document.createElement('script');s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-mobile-mixed-routing-v0391','1');
    s.onload=()=>{state='loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('Mixed Order Routing V0.3.91 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}
async function launch(){
  const b=by(LAUNCHER);if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening V0.3.91 line routing…'}
  try{
    await load();
    setTimeout(()=>{if(!openJobs())setTimeout(openJobs,120)},0)
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 3]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}
function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">🔀</span><strong>Mixed Order Routing</strong><small>V0.3.91 · route saved Job lines to Warehouse / Installation / Procurement.</small>';
  b.addEventListener('click',launch);
  const anchor=by('mw091safeLauncher')||by('mw091module');
  anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b)
}
function status(){return {version:VERSION,module:'mixed-order-routing-v0391',state,ready:moduleReady(),startup:'launcher-only'}}
function install(){
  ensureLauncher();
  setTimeout(ensureLauncher,500);
  window.addEventListener('pageshow',ensureLauncher);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})
}
root.RUNLUMobileSafePhase3V0391={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
