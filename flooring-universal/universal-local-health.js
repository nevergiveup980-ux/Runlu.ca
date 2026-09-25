/* RUNLU Flooring OS Universal · Local Data Health + Recovery Points
   Bounded local snapshots for audited lifecycle actions. */
(function(){
'use strict';
const SNAP='runlu_flooring_universal_u2_recovery_points',PREFIX='runlu_flooring_universal_',MAX=12,WS='runlu_flooring_universal_u0_workspace',GUARD='runlu_flooring_universal_u2_startup_guard';
const data=()=>window.RUNLUUniversalData, esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function points(){return data().read(SNAP,[])||[]}
function capture(reason,meta){
 if(data().backendConfig().mode!=='local')return null;
 const adapter=data().current(),payload={};
 (adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!==SNAP&&k!==GUARD&&k!=='runlu_flooring_universal_data_backend').forEach(k=>payload[k]=adapter.read(k,null));
 const p={id:'rp-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),createdAt:new Date().toISOString(),reason:reason||'Checkpoint',meta:meta||{},organizationId:data().read(WS,null)?.company?.organizationId||'',payload};
 data().write(SNAP,[p,...points()].slice(0,MAX));return p;
}
function restore(id){
 if(data().backendConfig().mode!=='local')throw new Error('Recovery Point restore is available only in Local Device mode.');
 const p=points().find(x=>x.id===id);if(!p)throw new Error('Recovery Point not found.');
 const adapter=data().current(),safety=capture('Safety checkpoint before Recovery Point restore',{restorePoint:id});
 (adapter.rawKeys?.()||[]).filter(k=>k.startsWith(PREFIX)&&k!==SNAP&&k!==GUARD&&k!=='runlu_flooring_universal_data_backend').forEach(k=>adapter.remove(k));
 Object.entries(p.payload||{}).forEach(([k,v])=>{if(k.startsWith(PREFIX)&&k!==SNAP&&k!==GUARD&&k!=='runlu_flooring_universal_data_backend')adapter.write(k,v)});
 return {point:p,safety};
}
async function health(){
 const adapter=data().current(),keys=adapter.rawKeys?.()||[],bad=[],sizes=[];
 for(const k of keys){if(!k.startsWith(PREFIX))continue;const raw=adapter.raw?.(k);if(raw===null||raw===undefined)continue;try{JSON.parse(raw)}catch(_){bad.push(k)}sizes.push([k,new Blob([raw]).size])}
 let storage=null;try{if(navigator.storage?.estimate)storage=await navigator.storage.estimate()}catch(_){}
 const total=sizes.reduce((s,x)=>s+x[1],0),workspace=data().read(WS,null);
 return {ok:bad.length===0&&!!workspace?.company?.organizationId,adapter:adapter.id,keys:keys.length,bytes:total,corruptKeys:bad,workspaceReady:!!workspace?.company?.organizationId,recoveryPoints:points().length,latestPoint:points()[0]?.createdAt||null,storage};
}
function fmtBytes(n){if(!Number.isFinite(n))return '—';if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(1)+' KB';return (n/1048576).toFixed(1)+' MB'}
async function render(){
 const host=document.getElementById('universalLocalHealth');if(!host)return;
 host.innerHTML='<div class="card"><h2>Local Data Health</h2><p class="muted">Checking local workspace integrity…</p></div>';
 const h=await health(),ps=points(),quota=h.storage?.quota,usage=h.storage?.usage;
 host.innerHTML='<div class="card"><h2>Local Data Health</h2><div class="uHealth '+(h.ok?'pass':'fail')+'"><b>'+(h.ok?'HEALTHY':'CHECK')+'</b><span>'+h.keys+' Universal data groups · '+fmtBytes(h.bytes)+'</span></div><div class="uHealthFacts"><span>Workspace <b>'+(h.workspaceReady?'Ready':'Missing')+'</b></span><span>JSON integrity <b>'+(h.corruptKeys.length?'Review':'Pass')+'</b></span><span>Recovery Points <b>'+h.recoveryPoints+'/'+MAX+'</b></span><span>Browser storage <b>'+(quota?fmtBytes(usage)+' / '+fmtBytes(quota):'Estimate unavailable')+'</b></span></div>'+(h.corruptKeys.length?'<p class="uHealthWarn">Unreadable: '+h.corruptKeys.map(esc).join(', ')+'</p>':'')+'</div><div class="card"><div class="uHealthHead"><div><h3>Recovery Points</h3><p class="muted">Created before audited lifecycle changes. Maximum '+MAX+' rolling checkpoints.</p></div><button id="uHealthCheckpoint">Create Checkpoint</button></div>'+(ps.length?ps.map(p=>'<div class="uPoint"><div><b>'+esc(p.reason)+'</b><span>'+esc(new Date(p.createdAt).toLocaleString())+'</span></div><button data-restore-point="'+esc(p.id)+'">Restore</button></div>').join(''):'<p class="muted">No Recovery Points yet.</p>')+'</div>';
 document.getElementById('uHealthCheckpoint').onclick=()=>{capture('Manual checkpoint');render()};
 host.querySelectorAll('[data-restore-point]').forEach(b=>b.onclick=()=>{if(!confirm('Restore this Recovery Point? A safety checkpoint of the current state will be created first.'))return;try{restore(b.dataset.restorePoint);alert('Recovery Point restored. The app will reload.');location.reload()}catch(e){alert(e.message)}});
}
window.RUNLUUniversalLocalHealth=Object.freeze({capture,points,restore,health,render,MAX});
})();