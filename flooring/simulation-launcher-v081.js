/* RUNLU Deerfoot Flooring OS · V0.3.81 Simulation Lab Launcher
   Adds a safe entry point into the standalone, synthetic-data Simulation Lab.
   No production data is read or written by this launcher.
*/
(function(){'use strict';
if(window.__RUNLU_SIM_LAUNCHER_V081__)return;window.__RUNLU_SIM_LAUNCHER_V081__=true;
const by=id=>document.getElementById(id);
function openLab(){window.open('simulation-lab-v081.html?v=081&t='+Date.now(),'runluFlooringSimulationLab')}
function style(){if(by('sim081style'))return;const s=document.createElement('style');s.id='sim081style';s.textContent=`.sim081module{border-left:5px solid #315f82!important}.sim081module small{line-height:1.35}.sim081badge{display:inline-block;margin-left:5px;padding:3px 6px;border-radius:999px;background:#edf4f8;color:#315f82;font-size:8px;font-weight:900}`;document.head.appendChild(s)}
function install(){style();const grid=by('command')?.querySelector('.grid3');if(!grid)return false;let b=by('simulationLab081');if(!b){b=document.createElement('button');b.id='simulationLab081';b.type='button';b.className='module sim081module';b.innerHTML='<span class="ico">🧪</span><strong>Simulation Lab <span class="sim081badge">SANDBOX</span></strong><small>Practice Sales → PO → Hold → Receiving → A/R → Commission → Cost Control without touching production data.</small>';b.addEventListener('click',openLab);grid.appendChild(b)}try{const p=document.querySelector('header .pill');if(p)p.textContent='V0.3.81 Simulation Lab'}catch(_){}return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},250);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();window.RUNLUSimulationLauncherV081={install,open:openLab,version:'0.3.81'};
})();