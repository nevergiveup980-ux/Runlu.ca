/* RUNLU Deerfoot Flooring OS · Mobile Safe Phase 7
   Restores historical V0.9.8 Warehouse Verified Receipt Acknowledgement safely.
   Startup stays launcher-only. The receipt module is fetched only after explicit user action.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE7_V098__)return;
root.__RUNLU_MOBILE_SAFE_PHASE7_V098__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03j';
const MODULE_SRC='warehouse-receipt-ack-v098-safe.js?v=0403j-safe';
const MODULE_GLOBAL='RUNLUWarehouseReceiptAckV098Safe';
const LAUNCHER='ra098safeLauncher';
let state='idle',promise=null;

const by=id=>document.getElementById(id);
function moduleReady(){return !!root[MODULE_GLOBAL]}
function removeLauncher(){try{by(LAUNCHER)?.remove()}catch(_){}}

function load(){
  if(moduleReady()){state='loaded';return Promise.resolve(true)}
  if(state==='loading'&&promise)return promise;
  state='loading';
  promise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-runlu-mobile-receipt-ack-v098]');
    if(existing){
      let tries=0;
      const wait=()=>{if(moduleReady()){state='loaded';resolve(true)}else if(++tries<40)setTimeout(wait,75);else{state='failed';reject(new Error('Verified Receipt module did not initialize'))}};
      wait();return
    }
    const s=document.createElement('script');
    s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-mobile-receipt-ack-v098','1');
    s.onload=()=>{state='loaded';resolve(true)};
    s.onerror=()=>{state='failed';try{s.remove()}catch(_){}reject(new Error('Verified Receipt V0.9.8 failed to load'))};
    document.body.appendChild(s)
  });
  return promise
}

async function launch(){
  const b=by(LAUNCHER);
  if(b){b.disabled=true;b.dataset.loading='1';const small=b.querySelector('small');if(small)small.textContent='Opening verified receipt check…'}
  try{
    await load();
    root[MODULE_GLOBAL]?.open?.()
  }catch(e){
    console.warn('[RUNLU Mobile Safe Phase 7]',e?.message||e);
    if(b){b.disabled=false;b.dataset.loading='';const small=b.querySelector('small');if(small)small.textContent='Could not load. Tap to retry.'}
  }
}
function ensureLauncher(){
  if(moduleReady()){removeLauncher();return}
  if(by(LAUNCHER))return;
  const grid=document.querySelector('#command .grid3');if(!grid)return;
  const b=document.createElement('button');b.id=LAUNCHER;b.type='button';b.className='module';
  b.innerHTML='<span class="ico">✅</span><strong>Verified Receipt Check</strong><small>V0.9.8 · verify Warehouse receiving + inventory posting before acknowledging a Pickup PO.</small>';
  b.addEventListener('click',launch);
  const anchor=by('r095safeLauncher')||by('rc093safeLauncher')||by('rc092safeLauncher');
  anchor?anchor.insertAdjacentElement('afterend',b):grid.appendChild(b)
}
function status(){
  return {version:VERSION,module:'warehouse-receipt-ack-v098',state,ready:moduleReady(),startup:'launcher-only',autoAcknowledge:false}
}
function install(){
  ensureLauncher();
  setTimeout(ensureLauncher,500);
  window.addEventListener('pageshow',ensureLauncher);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ensureLauncher()})
}
root.RUNLUMobileSafePhase7V098={VERSION,load,launch,status,ensureLauncher};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
