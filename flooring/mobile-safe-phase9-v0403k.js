/* RUNLU Flooring Mobile Safe Phase 9 · V0.3.98 Dispatch Morning */
(function(root){'use strict';
if(root.RUNLUMobileSafePhase9V0398)return;
const PREVIEW='index-v098-dispatch-morning-preview.html?v=0403k-safe';
function launch(){try{root.open(PREVIEW,'_blank','noopener');return true}catch(_){return false}}
function install(){
 if(typeof document==='undefined'||document.querySelector('[data-runlu-mobile-safe-phase9]'))return;
 const b=document.createElement('button');b.type='button';b.textContent='Dispatch Morning';
 b.setAttribute('data-runlu-mobile-safe-phase9','');b.style.cssText='min-height:48px;font-size:16px;padding:10px 14px;border-radius:10px';
 b.addEventListener('click',launch);const host=document.querySelector('[data-runlu-mobile-safe-launchers]')||document.body;if(host)host.appendChild(b);
}
root.RUNLUMobileSafePhase9V0398={version:'0.3.98-safe',install,launch,status:()=>({module:'dispatch-morning-v0398',startup:'launcher-only',readOnly:true,networkWrites:false,storageWrites:false,poStatusImmutable:true})};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
})(typeof window!=='undefined'?window:globalThis);
