/* RUNLU Flooring Mobile Safe Phase 8 · V0.3.97 Installer Workload */
(function(root){
'use strict';
if(root.RUNLUMobileSafePhase8V0397)return;
const PREVIEW='index-v097-installer-workload-preview.html?v=0403j-safe';
function launch(){
  try{root.open(PREVIEW,'_blank','noopener');return true}catch(_){return false}
}
function ensureLauncher(){
  if(typeof document==='undefined'||document.querySelector('[data-runlu-mobile-safe-phase8]'))return;
  const b=document.createElement('button');
  b.type='button';b.textContent='Installer Workload';b.setAttribute('data-runlu-mobile-safe-phase8','');
  b.style.cssText='min-height:48px;font-size:16px;padding:10px 14px;border-radius:10px';
  b.addEventListener('click',launch);
  const host=document.querySelector('[data-runlu-mobile-safe-launchers]')||document.body;
  if(host)host.appendChild(b);
}
function install(){ensureLauncher()}
root.RUNLUMobileSafePhase8V0397={version:'0.3.97-safe',install,launch,status:()=>({module:'installer-workload-v0397',startup:'launcher-only',readOnly:true,networkWrites:false,storageWrites:false,poStatusImmutable:true})};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
})(typeof window!=='undefined'?window:globalThis);
