/* RUNLU Deerfoot Flooring OS · V0.3.94 Fast Boot · Safe Reintroduction
   Historical V0.3.94 idea: show the Core first, then bring enhancements in behind it.
   Safe Core version:
   - this file is the only post-Core startup payload that V071 waits for;
   - Phase 1–7 launcher scripts load after Core reveal, in the background;
   - business modules remain lazy and still load only after explicit user navigation/tap;
   - no deep V078/V090 wrapper is restored on iPhone.
*/
(function(root){
'use strict';
if(root.__RUNLU_MOBILE_SAFE_FASTBOOT_V0394__)return;
root.__RUNLU_MOBILE_SAFE_FASTBOOT_V0394__=true;
if(!root.__RUNLU_MOBILE_SAFE__)return;

const VERSION='0.4.03j';
const modules=[
  {name:'phase1',src:'mobile-safe-phase1-v0403b.js?v=0403b',marker:'data-runlu-mobile-safe-phase1',global:'RUNLUMobileSafePhase1V0403B'},
  {name:'phase2',src:'mobile-safe-phase2-v0403c.js?v=0403c',marker:'data-runlu-mobile-safe-phase2',global:'RUNLUMobileSafePhase2V091'},
  {name:'phase3',src:'mobile-safe-phase3-v0403d.js?v=0403d',marker:'data-runlu-mobile-safe-phase3',global:'RUNLUMobileSafePhase3V0391'},
  {name:'phase4',src:'mobile-safe-phase4-v0403e.js?v=0403e',marker:'data-runlu-mobile-safe-phase4',global:'RUNLUMobileSafePhase4V0392'},
  {name:'phase5',src:'mobile-safe-phase5-v0403f.js?v=0403f',marker:'data-runlu-mobile-safe-phase5',global:'RUNLUMobileSafePhase5V0393'},
  {name:'phase6',src:'mobile-safe-phase6-v0403h.js?v=0403h',marker:'data-runlu-mobile-safe-phase6',global:'RUNLUMobileSafePhase6V0395'},
  {name:'phase7',src:'mobile-safe-phase7-v0403j.js?v=0403j',marker:'data-runlu-mobile-safe-phase7',global:'RUNLUMobileSafePhase7V098'}
];
const report={version:VERSION,state:'scheduled',loaded:[],failed:[],startedAt:'',completedAt:''};
let startPromise=null;

function existing(m){return document.querySelector('script['+m.marker+']')}
function loadOne(m){
  if(root[m.global]){if(!report.loaded.includes(m.name))report.loaded.push(m.name);return Promise.resolve(true)}
  const found=existing(m);
  if(found)return new Promise(resolve=>{
    let tries=0;
    const wait=()=>{if(root[m.global]){if(!report.loaded.includes(m.name))report.loaded.push(m.name);resolve(true)}else if(++tries<40)setTimeout(wait,50);else resolve(false)};
    wait()
  });
  return new Promise(resolve=>{
    const s=document.createElement('script');
    s.src=m.src;s.async=true;s.setAttribute(m.marker,'1');
    s.onload=()=>{if(!report.loaded.includes(m.name))report.loaded.push(m.name);resolve(true)};
    s.onerror=()=>{if(!report.failed.includes(m.name))report.failed.push(m.name);try{s.remove()}catch(_){}resolve(false)};
    document.body.appendChild(s)
  })
}
async function start(){
  if(startPromise)return startPromise;
  report.state='loading-launchers';report.startedAt=new Date().toISOString();
  startPromise=Promise.allSettled(modules.map(loadOne)).then(()=>{
    report.state=report.failed.length?'ready-with-launcher-errors':'ready';
    report.completedAt=new Date().toISOString();
    try{root.dispatchEvent(new CustomEvent('runlu:mobile-safe-fastboot-ready',{detail:status()}))}catch(_){}
    return status()
  });
  return startPromise
}
function schedule(){
  if(report.state!=='scheduled')return;
  const kick=()=>setTimeout(()=>start().catch(()=>{}),80);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kick,{once:true});
  else kick()
}
function status(){
  return {
    version:VERSION,
    state:report.state,
    loaded:[...report.loaded],
    failed:[...report.failed],
    startedAt:report.startedAt,
    completedAt:report.completedAt,
    startup:'core-first-background-launchers',
    heavyBusinessModulesAtStartup:false
  }
}

root.RUNLUMobileSafeFastBootV0394={VERSION,start,status,modules};
schedule();
})(typeof window!=='undefined'?window:globalThis);
