/* RUNLU Flooring OS Universal · U2 Data / Cloud Status */
(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function render(){
 const host=document.getElementById('universalDataMode');if(!host)return;
 const data=window.RUNLUUniversalData, cfg=data?.backendConfig?.()||{mode:'local',provider:'local'}, health=data?.current?.()?.health?.()||{ok:false,detail:'Adapter unavailable'}, contract=data?.cloudReady?.();
 host.innerHTML='<div class="card"><h2>Data / Cloud</h2><p class="muted">Local-first by default. Cloud is optional and provider-pluggable.</p><div class="uDataMode"><div><b>ACTIVE · '+esc(cfg.mode==='local'?'Local Device':cfg.mode)+'</b><span>'+esc(health.detail||'')+'</span></div><strong>'+(health.ok?'READY':'CHECK')+'</strong></div></div>'+
 '<div class="card"><h3>Cloud-ready paths</h3><div class="uDataPath"><b>Local Device</b><span>Available now · no cloud subscription required.</span></div><div class="uDataPath"><b>RUNLU Managed Cloud</b><span>Reserved interface · not enabled.</span></div><div class="uDataPath"><b>Bring Your Own Cloud</b><span>Reserved interface · customer-controlled provider/account.</span></div><p class="muted">Contract v'+esc(contract?.contractVersion||1)+' · Active provider: '+esc(contract?.activeProvider||'local')+'</p></div>';
}
window.RUNLUUniversalDataStatus=Object.freeze({render});
})();