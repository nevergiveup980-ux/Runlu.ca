/* RUNLU Flooring OS Universal · Data Version + Migration Registry
   Non-destructive schema evolution for Local-First workspaces. */
(function(){
'use strict';
const META='runlu_flooring_universal_u2_data_schema',CURRENT=1;
const data=()=>window.RUNLUUniversalData;
const registry=new Map();

function meta(){
 return data().read(META,null)||{schemaVersion:0,migrationHistory:[],updatedAt:null};
}
function register(from,to,id,run){
 if(!Number.isInteger(from)||!Number.isInteger(to)||to!==from+1||!id||typeof run!=='function')throw new Error('Invalid migration registration.');
 const key=from+'>'+to;if(registry.has(key))throw new Error('Duplicate migration '+key);
 registry.set(key,{from,to,id,run});return true;
}
function writeMeta(m){data().write(META,m);return m}
function stampExistingV1(){
 const m=meta();if(m.schemaVersion!==0)return m;
 const p=window.RUNLUUniversalLocalHealth?.capture?.('Before data schema initialization',{from:0,to:1});
 const next={schemaVersion:1,migrationHistory:[...(m.migrationHistory||[]),{id:'baseline-local-u1',from:0,to:1,appliedAt:new Date().toISOString(),recoveryPointId:p?.id||null}],updatedAt:new Date().toISOString()};
 return writeMeta(next);
}
function migrate(){
 let m=meta();
 if(m.schemaVersion>CURRENT)return {ok:false,status:'future',from:m.schemaVersion,to:CURRENT,error:'Workspace data is newer than this app.'};
 if(m.schemaVersion===0)m=stampExistingV1();
 const start=m.schemaVersion,applied=[];
 while(m.schemaVersion<CURRENT){
  const step=registry.get(m.schemaVersion+'>'+(m.schemaVersion+1));
  if(!step)return {ok:false,status:'missing',from:start,to:CURRENT,applied,error:'Missing migration from '+m.schemaVersion+' to '+(m.schemaVersion+1)+'.'};
  const point=window.RUNLUUniversalLocalHealth?.capture?.('Before migration '+step.id,{from:step.from,to:step.to});
  step.run({data:data(),from:step.from,to:step.to});
  const event={id:step.id,from:step.from,to:step.to,appliedAt:new Date().toISOString(),recoveryPointId:point?.id||null};
  m={...m,schemaVersion:step.to,migrationHistory:[...(m.migrationHistory||[]),event],updatedAt:event.appliedAt};writeMeta(m);applied.push(event);
 }
 return {ok:true,status:applied.length?'migrated':'current',from:start,to:m.schemaVersion,applied};
}
function status(){const m=meta();return {currentVersion:CURRENT,workspaceVersion:m.schemaVersion,compatible:m.schemaVersion<=CURRENT,history:m.migrationHistory||[],pending:Math.max(0,CURRENT-m.schemaVersion)}}
function render(){
 const host=document.getElementById('universalDataVersion');if(!host)return;const s=status(),last=s.history[s.history.length-1];
 host.innerHTML='<div class="card"><h2>Data Version</h2><p class="muted">Workspace schema passport for safe future upgrades.</p><div class="uVersion '+(s.compatible?'pass':'fail')+'"><div><b>Schema v'+s.workspaceVersion+'</b><span>App supports v'+s.currentVersion+' · '+(s.pending?s.pending+' migration(s) pending':'current')+'</span></div><strong>'+(s.compatible?'COMPATIBLE':'NEWER DATA')+'</strong></div></div><div class="card"><h3>Migration Registry</h3>'+(s.history.length?s.history.slice().reverse().map(x=>'<div class="uMigration"><div><b>'+String(x.id).replace(/[&<>"]/g,'')+'</b><span>v'+x.from+' → v'+x.to+'</span></div><time>'+new Date(x.appliedAt).toLocaleString()+'</time></div>').join(''):'<p class="muted">No migration history yet.</p>')+(last?'<p class="muted">Latest schema change is recorded in this workspace.</p>':'')+'</div>';
}
window.RUNLUUniversalDataVersion=Object.freeze({CURRENT,META,register,migrate,status,render});
})();