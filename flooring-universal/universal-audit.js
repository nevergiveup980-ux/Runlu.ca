/* RUNLU Flooring OS Universal · U1 Audit Trail
   Append-only local event history. Cloud version will bind actor to authenticated membership. */
(function(){
'use strict';
const STORE='runlu_flooring_universal_u1_audit_events',WS='runlu_flooring_universal_u0_workspace';
const read=(k,d)=>window.RUNLUUniversalData.read(k,d),write=(k,v)=>window.RUNLUUniversalData.write(k,v),esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const workspace=()=>read(WS,null),org=()=>workspace()?.company?.organizationId||'',events=()=>read(STORE,[]).filter(x=>x.organizationId===org());
function log(type,id,action,from,to,meta){const w=workspace();if(!w?.company?.organizationId)return;window.RUNLUUniversalLocalHealth?.capture('Before '+type+' · '+action,{entityType:type,entityId:id||'',action});const xs=read(STORE,[]);xs.unshift({id:'evt-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),organizationId:w.company.organizationId,locationId:w.location?.locationId||'',entityType:type,entityId:id||'',action,from:from??null,to:to??null,meta:meta||{},actor:'Local U1 user',createdAt:new Date().toISOString()});write(STORE,xs)}
function render(){const host=document.getElementById('universalAudit');if(!host)return;const xs=events();host.innerHTML='<div class="card"><h2>Audit Trail</h2><p class="muted">Append-only U1 event history. Cloud actor identity will come from authenticated organization membership.</p></div><div class="card">'+(xs.length?xs.slice(0,100).map(e=>'<div class="uAudit"><div><b>'+esc(e.entityType)+' · '+esc(e.action)+'</b><span>'+esc(e.from??'—')+' → '+esc(e.to??'—')+' · '+esc(e.actor)+'</span></div><time>'+esc(new Date(e.createdAt).toLocaleString())+'</time></div>').join(''):'<p class="muted">No audited lifecycle events yet.</p>')+'</div>'}
window.RUNLUUniversalAudit=Object.freeze({log,events,render});
})();