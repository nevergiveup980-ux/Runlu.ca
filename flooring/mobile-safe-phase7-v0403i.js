/* RUNLU Deerfoot Flooring OS · V0.3.96 Week Schedule · Mobile Safe Phase 7
   Launcher-only startup. The read-only schedule module is loaded only after an explicit tap.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_PHASE7_V0396__)return;
root.__RUNLU_MOBILE_SAFE_PHASE7_V0396__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;
const VERSION='0.3.96-safe';
const MODULE_SRC='week-schedule-v096-safe.js?v=0403i-safe';
let loadPromise=null;
function doc(){return root.document}
function load(){
  if(root.RUNLUWeekScheduleV096)return Promise.resolve(root.RUNLUWeekScheduleV096);
  if(loadPromise)return loadPromise;
  loadPromise=new Promise((resolve,reject)=>{
    const d=doc(),s=d.createElement('script');s.src=MODULE_SRC;s.async=true;s.setAttribute('data-runlu-week-schedule-v096-safe','1');
    s.onload=()=>resolve(root.RUNLUWeekScheduleV096||true);
    s.onerror=()=>{try{s.remove()}catch(_){}loadPromise=null;reject(new Error('V0.3.96 Week Schedule failed to load'))};
    d.body.appendChild(s)
  });
  return loadPromise
}
async function launch(){
  try{
    await load();
    root.open('index-v096-week-schedule-preview.html?v=0403i-safe','_blank','noopener');
  }catch(e){console.error(e);try{root.alert('Week Schedule could not be opened. Core remains unchanged.')}catch(_){}}
}
function ensureLauncher(){
  const d=doc();if(!d||d.querySelector('[data-runlu-v0396-week-schedule]'))return;
  const host=d.querySelector('#command .actions,#command,.toolbar,.topbar,header');if(!host)return;
  const b=d.createElement('button');b.type='button';b.textContent='Week Schedule';b.setAttribute('data-runlu-v0396-week-schedule','1');
  b.style.minHeight='48px';b.style.fontSize='16px';b.addEventListener('click',launch);host.appendChild(b)
}
function install(){ensureLauncher()}
function status(){return {version:VERSION,module:'week-schedule-v0396',startup:'launcher-only',readOnly:true,networkWrites:false,storageWrites:false,poStatusImmutable:true}}
root.RUNLUMobileSafePhase7V0396={VERSION,install,launch,load,status};
if(d().readyState==='loading')d().addEventListener('DOMContentLoaded',install,{once:true});else install();
})(typeof window!=='undefined'?window:globalThis);
