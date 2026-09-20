/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 2
   Reintroduces V0.9.1 Warehouse Fulfillment one piece at a time.
   Startup stays light: only a tiny launcher is installed. material-work-sync-v091.js
   is fetched only after the user explicitly opens Warehouse Fulfillment.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE2_V091__)return;
root.__RUNLU_MOBILE_SAFE_PHASE2_V091__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03c';
const MODULE_SRC='material-work-sync-v091.js?v=0403c-safe';
const MODULE_GLOBAL='RUNLUMaterialWorkSyncV091';
const PAGE='warehouseFulfillment';
const LAUNCHER='mw091safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);

function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}

function openInstalled(){
  removeLauncher();
  const moduleBtn=by('mw091module');
  if(moduleBtn){moduleBtn.click();return true}
  const navBtn=document.querySelector('#nav [data-page="'+PAGE+'"]');
  if(navBtn){navBtn.click();return true}
  return false
}

function load(){
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-material-work-v091]');
    if(existing){
      const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else setTimeout(wait,80)};
      wait();return
    }
    const s=document.createElement('script');
    s.src=MODULE_SRC;
    s.async=true;
    s.setAttribute('data-runlu-mobile-material-work-v091','1');
    s.onload=()=>{state=moduleReady()?'loaded':'loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('Warehouse Fulfillment V0.9.1 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}

async function launch(){
  const b=by(LAUNCHER);if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening V0.9.1 read-only fulfillment…'}
  try{
    await load();
    setTimeout(()=>{if(!openInstalled())setTimeout(openInstalled,120)},0)
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 2]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}

function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');
  b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">📦</span><strong>Warehouse Fulfillment</strong><small>V0.9.1 · Stock Picking + Carpet Cutting · load on tap.</small>';
  b.addEventListener('click',launch);
  const wa=by('wa711module');wa?wa.insertAdjacentElement('afterend',b):grid.appendChild(b)
}

function status(){return {version:VERSION,module:'material-work-v091',state,ready:moduleReady(),startup:'launcher-only'}}
function install(){ensureLauncher();setTimeout(ensureLauncher,500);window.addEventListener('pageshow',ensureLauncher);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})}

root.RUNLUMobileSafePhase2V091={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
