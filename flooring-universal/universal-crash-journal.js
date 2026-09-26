/* RUNLU Flooring OS Universal · Crash Journal / Write-Ahead Safety
   Intent marker for important local business mutations. Stores operation metadata only, never record contents. */
(function(){
'use strict';
const STORE='runlu_flooring_universal_u2_crash_journal',MAX=40;
const data=()=>window.RUNLUUniversalData;
function state(){return data().read(STORE,{active:[],history:[]})||{active:[],history:[]}}
function write(s){data().write(STORE,{active:Array.isArray(s.active)?s.active:[],history:Array.isArray(s.history)?s.history.slice(0,MAX):[]});return s}
function uid(){return 'tx-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function begin(type,action,meta){
 const s=state(),tx={id:uid(),type:String(type||'Business'),action:String(action||'mutation'),meta:meta||{},startedAt:new Date().toISOString(),status:'active'};
 s.active.unshift(tx);write(s);return tx;
}
function commit(id,meta){
 const s=state(),i=s.active.findIndex(x=>x.id===id);if(i<0)return null;
 const tx=s.active.splice(i,1)[0],done={...tx,status:'committed',completedAt:new Date().toISOString(),result:meta||{}};
 s.history.unshift(done);write(s);return done;
}
function resolve(id,resolution,note){
 const s=state(),i=s.active.findIndex(x=>x.id===id);if(i<0)return null;
 const tx=s.active.splice(i,1)[0],done={...tx,status:'resolved',resolution:String(resolution||'REVIEWED').slice(0,80),completedAt:new Date().toISOString(),note:String(note||'').slice(0,160)};
 s.history.unshift(done);write(s);return done;
}
function abort(id,reason){
 const s=state(),i=s.active.findIndex(x=>x.id===id);if(i<0)return null;
 const tx=s.active.splice(i,1)[0],done={...tx,status:'aborted',completedAt:new Date().toISOString(),reason:String(reason||'cancelled').slice(0,160)};
 s.history.unshift(done);write(s);return done;
}
function pending(){return state().active}
function get(id){return state().active.find(x=>x.id===id)||null}
function amend(id,meta){const s=state(),tx=s.active.find(x=>x.id===id);if(!tx)return null;tx.meta={...(tx.meta||{}),...(meta||{})};write(s);return tx}
function phase(id,name){const s=state(),tx=s.active.find(x=>x.id===id);if(!tx)return null;tx.phase=String(name||'').slice(0,40);tx.phaseAt=new Date().toISOString();write(s);return tx}
function history(){return state().history}
function inspect(){const s=state();return {active:s.active.length,history:s.history.length,pending:s.active.map(x=>({id:x.id,type:x.type,action:x.action,startedAt:x.startedAt,meta:x.meta||{},phase:x.phase||'BEGIN',phaseAt:x.phaseAt||null}))}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function render(){
 const host=document.getElementById('universalCrashJournal');if(!host)return;const s=state();
 host.innerHTML='<div class="card"><h2>Crash Journal</h2><p class="muted">Write-ahead intent markers for important local business changes. Record contents are not copied into the journal.</p><div class="uJournalHero '+(s.active.length?'hold':'pass')+'"><div><b>'+(s.active.length?'INCOMPLETE OPERATION':'JOURNAL CLEAR ✓')+'</b><span>'+s.active.length+' active · '+s.history.length+' recent committed/resolved/aborted</span></div><strong>'+(s.active.length?'REVIEW':'READY')+'</strong></div></div><div class="card"><h3>Incomplete Operations</h3>'+(s.active.length?s.active.map(x=>'<div class="uJournalRow"><div><b>'+esc(x.type)+' · '+esc(x.action)+'</b><span>'+esc(new Date(x.startedAt).toLocaleString())+'</span></div><strong>OPEN</strong></div>').join(''):'<p class="muted">No incomplete business operation is recorded.</p>')+'<p class="muted">Startup Recovery Guard treats an unfinished journal entry as a critical review condition. Recovery is explicit; the journal never guesses whether a half-finished operation should be replayed.</p></div>';
}
window.RUNLUUniversalCrashJournal=Object.freeze({STORE,begin,commit,resolve,abort,pending,get,amend,phase,history,inspect,render});
})();