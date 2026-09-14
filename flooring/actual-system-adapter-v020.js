/* RUNLU LAB · Flooring OS Actual-System Adapter V0.2
   Loads the exact repository V0.3.95r1 module source into a Web Worker.
   Worker has synthetic DOM + in-memory storage and blocked network APIs.
   Host Flooring production localStorage/Supabase are never exposed to the tested module. */
(function(root){
'use strict';
const VERSION='0.2.0';
const MODULE='people-to-call-review-v095.js?v=095r1';
const LAB_KEY='runlu_lab_flooring_actual_adapter_v020_last_report';

function workerPreamble(){return `
self.window=self;
const JOB_STORE='runlu_deerfoot_flooring_jobs_v1',PO_STORE='runlu_deerfoot_supplier_orders_v1',CALL_STORE='runlu_people_to_call_v066',ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const __map=new Map(),__writes=[],__notes=new Map();let __fail=null,__network=0;
self.localStorage={getItem(k){k=String(k);return __map.has(k)?__map.get(k):null},setItem(k,v){k=String(k);__writes.push(k);if(__fail===k){__fail=null;throw Error('LAB injected failure '+k)}__map.set(k,String(v))},removeItem(k){k=String(k);__writes.push(k);if(__fail===k){__fail=null;throw Error('LAB injected failure '+k)}__map.delete(k)}};
self.document={readyState:'loading',documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},getElementById(){return null},querySelectorAll(s){if(s==='[data-r95-note]')return[...__notes.entries()].map(([q,v])=>({dataset:{r95Note:String(q)},value:String(v),style:{}}));return[]},createElement(){return{style:{},dataset:{},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){},remove(){}}},addEventListener(){}};
self.MutationObserver=class{observe(){}disconnect(){}};
self.addEventListener=()=>{};self.setTimeout=()=>0;self.clearTimeout=()=>{};self.setInterval=()=>0;self.clearInterval=()=>{};
const __blocked=n=>function(){__network++;throw Error('LAB blocked network '+n)};self.fetch=__blocked('fetch');self.XMLHttpRequest=class{constructor(){__network++;throw Error('LAB blocked XMLHttpRequest')}};self.WebSocket=class{constructor(){__network++;throw Error('LAB blocked WebSocket')}};self.EventSource=class{constructor(){__network++;throw Error('LAB blocked EventSource')}};
`}
function workerPostamble(){return `
(function(){
const api=self.RUNLUPeopleToCallReviewV095,allowed=new Set([JOB_STORE,CALL_STORE,ACTIVE_STORE]);
const must=(c,m)=>{if(!c)throw Error(m)},snap=()=>Object.fromEntries([...__map.entries()].sort((a,b)=>a[0].localeCompare(b[0]))),json=k=>JSON.parse(__map.get(k)||'null');
function reset(){__map.clear();__writes.length=0;__notes.clear();__fail=null}
function seed(n){reset();const s=String(n),jid='LAB-J'+s,qid='LAB-Q'+s,pid='LAB-PO'+s;__map.set(JOB_STORE,JSON.stringify([{id:jid,jobNumber:'LAB-'+s,customerName:'Synthetic Customer',status:'In Progress',peopleToCallHistory:[]} ]));__map.set(PO_STORE,JSON.stringify([{id:pid,jobId:jid,jobNumber:'LAB-'+s,status:'Received',orderedQty:10,receivedQty:10,supplier:'LAB SUPPLIER'}]));__map.set(CALL_STORE,JSON.stringify([{id:qid,orderId:jid,orderNumber:'LAB-'+s,status:'Open',sourcePOs:[pid],history:[]} ]));__notes.set(qid,'Remaining material requires pickup');__writes.length=0;return{jid,qid,pid}}
function allowedWrites(){return __writes.every(k=>allowed.has(k))&&!__writes.includes(PO_STORE)}
function test(name,fn){try{return{name,pass:true,...(fn()||{})}}catch(e){return{name,pass:false,error:e.message||String(e)}}}
function scenarios(){const out=[];
out.push(test('Actual module loaded',()=>{must(api&&api.version==='0.3.95r1','actual module version mismatch');must(api.atomicReviewCommit===true,'atomic contract missing');return{moduleVersion:api.version}}));
out.push(test('Pickup keeps PO immutable',()=>{const x=seed(1),p=__map.get(PO_STORE);must(api.route(x.qid,x.jid,'pickup')===true,'route failed');const j=json(JOB_STORE)[0],q=json(CALL_STORE)[0];must(q.status==='Done'&&j.salesMaterialRoute==='pickup'&&j.orderDrawerOverride==='back','pickup invariant');must(j.pickupReviewNote==='Remaining material requires pickup','note missing');must(__map.get(PO_STORE)===p,'PO mutated');must(allowedWrites(),'unexpected write');must(__network===0,'network used')}));
out.push(test('Active keeps PO immutable',()=>{const x=seed(2),p=__map.get(PO_STORE);must(api.route(x.qid,x.jid,'active')===true,'route failed');const j=json(JOB_STORE)[0],q=json(CALL_STORE)[0];must(q.status==='Done'&&j.salesMaterialRoute==='active'&&j.orderDrawerOverride==='active','active invariant');must(__map.get(PO_STORE)===p,'PO mutated');must(allowedWrites(),'unexpected write')}));
out.push(test('Keep remains in People TO Call',()=>{const x=seed(3),p=__map.get(PO_STORE);must(api.route(x.qid,x.jid,'keep')===true,'route failed');const j=json(JOB_STORE)[0],q=json(CALL_STORE)[0];must(q.status==='Open'&&j.salesMaterialRoute==='people','keep invariant');must(__map.get(PO_STORE)===p,'PO mutated')}));
out.push(test('Unknown route rejected',()=>{const x=seed(4),b=JSON.stringify(snap());must(api.route(x.qid,x.jid,'bad-route')===false,'bad route accepted');must(JSON.stringify(snap())===b,'bad route mutated state');must(__writes.length===0,'bad route wrote state');return{safeReject:true}}));
out.push(test('Second-write failure rolls back',()=>{const x=seed(5),b=JSON.stringify(snap());__fail=CALL_STORE;must(api.route(x.qid,x.jid,'pickup')===false,'failure reported success');must(JSON.stringify(snap())===b,'rollback mismatch');must(!__writes.includes(ACTIVE_STORE),'active pointer changed');return{safeReject:true}}));
return{pass:out.every(x=>x.pass),passed:out.filter(x=>x.pass).length,failed:out.filter(x=>!x.pass).length,tests:out}}
function stress(n){let fail=null;for(let i=0;i<n;i++){try{const x=seed(1000+i),d=['pickup','active','keep'][i%3],p=__map.get(PO_STORE);must(api.route(x.qid,x.jid,d)===true,'route false');const j=json(JOB_STORE)[0],q=json(CALL_STORE)[0];if(d==='pickup')must(q.status==='Done'&&j.salesMaterialRoute==='pickup','pickup');if(d==='active')must(q.status==='Done'&&j.salesMaterialRoute==='active','active');if(d==='keep')must(q.status==='Open'&&j.salesMaterialRoute==='people','keep');must(__map.get(PO_STORE)===p,'PO mutation');must(allowedWrites(),'unexpected write');must(__network===0,'network')}catch(e){fail={cycle:i,error:e.message||String(e),writes:__writes.slice()};break}}return{pass:!fail,cyclesRequested:n,cyclesCompleted:fail?fail.cycle:n,failure:fail,networkCalls:__network}}
self.onmessage=e=>{if(e.data?.type!=='RUN')return;const n=Math.max(10,Math.min(10000,Number(e.data.cycles)||500)),s=scenarios(),st=runStressSafe(n);self.postMessage({schema:'runlu.flooring.actual-system-adapter.browser.v1',version:'0.2.0',environment:'WEB_WORKER_ISOLATED_ACTUAL_PRODUCTION_MODULE',generatedAt:new Date().toISOString(),moduleVersion:api?.version||null,pass:s.pass&&st.pass,scenarios:s,stress:st,isolation:{hostLocalStorageExposed:false,productionSupabaseExposed:false,networkApisBlocked:true,workerStorage:'ephemeral Map'},boundaries:['Exact static module source is executed inside an isolated Worker harness.','This V0.2 browser adapter tests V0.3.95r1 Sales Review routing only.']})};
function runStressSafe(n){try{return stress(n)}catch(e){return{pass:false,cyclesRequested:n,cyclesCompleted:0,failure:{error:e.message||String(e)},networkCalls:__network}}}
self.postMessage({type:'READY',moduleVersion:api?.version||null});
})();
`}
async function sha256(text){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(_){return null}}
async function run(opts={}){
  const cycles=Math.max(10,Math.min(10000,Number(opts.cycles)||500));
  const res=await fetch(MODULE,{cache:'no-store',credentials:'omit'});if(!res.ok)throw new Error('Could not load actual module source: HTTP '+res.status);const source=await res.text(),hash=await sha256(source);
  return await new Promise((resolve,reject)=>{
    const code=workerPreamble()+'\n'+source+'\n'+workerPostamble(),url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));let worker;
    try{worker=new Worker(url)}catch(e){URL.revokeObjectURL(url);reject(e);return}
    const timer=setTimeout(()=>{worker.terminate();URL.revokeObjectURL(url);reject(new Error('Actual-system LAB worker timed out'))},30000);
    worker.onerror=e=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);reject(new Error(e.message||'LAB worker failed'))};
    worker.onmessage=e=>{if(e.data?.type==='READY'){worker.postMessage({type:'RUN',cycles});return}clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);const report={...e.data,actualModule:'flooring/people-to-call-review-v095.js',actualModuleSha256:hash};try{localStorage.setItem(LAB_KEY,JSON.stringify(report))}catch(_){}resolve(report)};
  });
}
root.RUNLUFlooringActualSystemAdapterV020={version:VERSION,module:MODULE,run,labStorageKey:LAB_KEY};
})(typeof window!=='undefined'?window:globalThis);