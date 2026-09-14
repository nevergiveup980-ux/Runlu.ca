import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const MODULE_URL=new URL('../flooring/people-to-call-review-v095.js',import.meta.url);
const source=fs.readFileSync(MODULE_URL,'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const cycles=Math.max(100,Number(process.env.RUNLU_ACTUAL_CYCLES||3000));

const JOB_STORE='runlu_deerfoot_flooring_jobs_v1';
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const CALL_STORE='runlu_people_to_call_v066';
const ACTIVE_STORE='runlu_deerfoot_flooring_active_job_v1';
const ALLOWED_SUCCESS_WRITES=new Set([JOB_STORE,CALL_STORE,ACTIVE_STORE]);
const clone=x=>JSON.parse(JSON.stringify(x));
const must=(c,m)=>{if(!c)throw new Error(m)};

function memoryStorage(){
  const map=new Map(),writes=[];
  let failKey=null;
  return {
    getItem(k){return map.has(String(k))?map.get(String(k)):null},
    setItem(k,v){k=String(k);writes.push(k);if(failKey===k){failKey=null;throw new Error('LAB injected storage failure: '+k)}map.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);if(failKey===k){failKey=null;throw new Error('LAB injected storage failure: '+k)}map.delete(k)},
    clear(){map.clear();writes.length=0;failKey=null},
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    raw(k){return map.has(String(k))?map.get(String(k)):null},
    json(k,f=null){try{const v=JSON.parse(this.raw(k)||'null');return v==null?f:v}catch{return f}},
    clearWrites(){writes.length=0},
    writes(){return writes.slice()},
    failNext(k){failKey=String(k)},
    snapshot(){return Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))}
  };
}

function bootActualModule(){
  const storage=memoryStorage(),notes=new Map();
  let networkCalls=0;
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  const document={
    readyState:'loading',
    documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},
    getElementById(){return null},
    querySelectorAll(selector){
      if(selector==='[data-r95-note]')return [...notes.entries()].map(([qid,value])=>({dataset:{r95Note:String(qid)},value:String(value),style:{}}));
      return [];
    },
    createElement(){return {style:{},dataset:{},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){},remove(){}}},
    addEventListener(){}
  };
  class MutationObserver{observe(){}disconnect(){}}
  const blocked=name=>function(){networkCalls++;throw new Error('LAB blocked network API: '+name)};
  const window={document,localStorage:storage,console:quiet,MutationObserver,addEventListener(){},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){}};
  window.window=window;
  const sandbox={
    window,document,localStorage:storage,console:quiet,MutationObserver,
    setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,
    fetch:blocked('fetch'),XMLHttpRequest:class{constructor(){networkCalls++;throw new Error('LAB blocked network API: XMLHttpRequest')}},
    WebSocket:class{constructor(){networkCalls++;throw new Error('LAB blocked network API: WebSocket')}},
    EventSource:class{constructor(){networkCalls++;throw new Error('LAB blocked network API: EventSource')},
    URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set
  };
  vm.createContext(sandbox,{name:'RUNLU Flooring Actual Module LAB'});
  vm.runInContext(source,sandbox,{filename:'people-to-call-review-v095.js',timeout:1000});
  const api=window.RUNLUPeopleToCallReviewV095;
  must(api&&typeof api.route==='function','actual V095 route API did not load');
  return {api,storage,notes,networkCalls:()=>networkCalls};
}

function seed(env,n=1){
  const id=String(n),jid='LAB-J'+id,qid='LAB-Q'+id,pid='LAB-PO'+id;
  const jobs=[{id:jid,jobNumber:'LAB-'+id,customerName:'Synthetic Customer',status:'In Progress',peopleToCallHistory:[]}];
  const pos=[{id:pid,jobId:jid,jobNumber:'LAB-'+id,status:'Received',orderedQty:10,receivedQty:10,supplier:'LAB SUPPLIER'}];
  const calls=[{id:qid,orderId:jid,orderNumber:'LAB-'+id,status:'Open',sourcePOs:[pid],history:[]}];
  env.storage.clear();env.notes.clear();env.storage.seed(JOB_STORE,jobs);env.storage.seed(PO_STORE,pos);env.storage.seed(CALL_STORE,calls);env.notes.set(qid,'Remaining material requires pickup');env.storage.clearWrites();
  return{jid,qid,pid,jobs,pos,calls};
}
function onlyAllowedWrites(keys){return keys.every(k=>ALLOWED_SUCCESS_WRITES.has(k))&&!keys.includes(PO_STORE)}
function result(name,fn){try{const detail=fn()||{};return{name,pass:true,...detail}}catch(e){return{name,pass:false,error:e.message||String(e)}}

function runScenarios(){
  const tests=[];
  tests.push(result('Actual module loads inside isolated VM',()=>{const e=bootActualModule();must(e.api.version==='0.3.95r1','unexpected actual module version '+e.api.version);must(e.api.poStatusImmutable===true,'PO immutability contract missing');must(e.api.atomicReviewCommit===true,'atomic review commit contract missing');return{moduleVersion:e.api.version}}));
  tests.push(result('Actual Pickup route changes Job/queue but never PO',()=>{const e=bootActualModule(),x=seed(e,1),poBefore=e.storage.raw(PO_STORE);const ok=e.api.route(x.qid,x.jid,'pickup');must(ok===true,'pickup route did not commit');const j=e.storage.json(JOB_STORE,[])[0],q=e.storage.json(CALL_STORE,[])[0];must(q.status==='Done','queue not Done');must(j.orderDrawerOverride==='back'&&j.salesMaterialRoute==='pickup','Job not routed to Pick Up');must(j.pickupReviewNote==='Remaining material requires pickup','pickup note missing');must(e.storage.raw(PO_STORE)===poBefore,'PO changed');must(onlyAllowedWrites(e.storage.writes()),'unexpected storage write: '+e.storage.writes().join(','));must(e.networkCalls()===0,'network call attempted');return{writes:e.storage.writes()}}));
  tests.push(result('Actual Active route completes Sales review without changing PO',()=>{const e=bootActualModule(),x=seed(e,2),poBefore=e.storage.raw(PO_STORE);const ok=e.api.route(x.qid,x.jid,'active');must(ok===true,'active route did not commit');const j=e.storage.json(JOB_STORE,[])[0],q=e.storage.json(CALL_STORE,[])[0];must(q.status==='Done','queue not Done');must(j.orderDrawerOverride==='active'&&j.salesMaterialRoute==='active','Job not Active');must(e.storage.raw(PO_STORE)===poBefore,'PO changed');must(onlyAllowedWrites(e.storage.writes()),'unexpected write');return{writes:e.storage.writes()}}));
  tests.push(result('Actual Keep route stays in People TO Call',()=>{const e=bootActualModule(),x=seed(e,3),poBefore=e.storage.raw(PO_STORE);const ok=e.api.route(x.qid,x.jid,'keep');must(ok===true,'keep route did not commit');const j=e.storage.json(JOB_STORE,[])[0],q=e.storage.json(CALL_STORE,[])[0];must(q.status==='Open','queue should remain Open');must(j.salesMaterialRoute==='people','Job route should remain People TO Call');must(e.storage.raw(PO_STORE)===poBefore,'PO changed');return{writes:e.storage.writes()}}));
  tests.push(result('Unknown route is rejected with zero mutation',()=>{const e=bootActualModule(),x=seed(e,4),before=e.storage.snapshot();const ok=e.api.route(x.qid,x.jid,'destroy-everything');must(ok===false,'unknown route accepted');must(JSON.stringify(e.storage.snapshot())===JSON.stringify(before),'unknown route mutated storage');must(e.storage.writes().length===0,'unknown route wrote storage');return{safeReject:true}}));
  tests.push(result('Missing Job is rejected with zero mutation',()=>{const e=bootActualModule(),x=seed(e,5),before=e.storage.snapshot();const ok=e.api.route(x.qid,'MISSING-JOB','pickup');must(ok===false,'missing Job accepted');must(JSON.stringify(e.storage.snapshot())===JSON.stringify(before),'missing Job mutated storage');must(e.storage.writes().length===0,'missing Job wrote storage');return{safeReject:true}}));
  tests.push(result('Injected second-write failure rolls back Job and queue',()=>{const e=bootActualModule(),x=seed(e,6),before=e.storage.snapshot();e.storage.failNext(CALL_STORE);const ok=e.api.route(x.qid,x.jid,'pickup');must(ok===false,'injected write failure reported success');must(JSON.stringify(e.storage.snapshot())===JSON.stringify(before),'partial review commit survived rollback');must(!e.storage.writes().includes(ACTIVE_STORE),'active pointer changed after failed commit');must(e.storage.raw(PO_STORE)===JSON.stringify(x.pos),'PO changed during rollback');return{safeReject:true,writes:e.storage.writes()}}));
  tests.push(result('Injected first-write failure also restores exact prior state',()=>{const e=bootActualModule(),x=seed(e,7),before=e.storage.snapshot();e.storage.failNext(JOB_STORE);const ok=e.api.route(x.qid,x.jid,'active');must(ok===false,'injected first-write failure reported success');must(JSON.stringify(e.storage.snapshot())===JSON.stringify(before),'state changed after first-write failure');must(!e.storage.writes().includes(ACTIVE_STORE),'active pointer changed after failed commit');return{safeReject:true,writes:e.storage.writes()}}));
  return{pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests};
}

function runStress(count=cycles){
  const env=bootActualModule();let failure=null;
  for(let i=0;i<count;i++){
    const x=seed(env,10000+i),dest=['pickup','active','keep'][i%3],poBefore=env.storage.raw(PO_STORE);
    try{
      const ok=env.api.route(x.qid,x.jid,dest);must(ok===true,'route failed at cycle '+i);const j=env.storage.json(JOB_STORE,[])[0],q=env.storage.json(CALL_STORE,[])[0];
      if(dest==='pickup')must(q.status==='Done'&&j.salesMaterialRoute==='pickup'&&j.orderDrawerOverride==='back','pickup invariant '+i);
      if(dest==='active')must(q.status==='Done'&&j.salesMaterialRoute==='active'&&j.orderDrawerOverride==='active','active invariant '+i);
      if(dest==='keep')must(q.status==='Open'&&j.salesMaterialRoute==='people','keep invariant '+i);
      must(env.storage.raw(PO_STORE)===poBefore,'PO mutation at cycle '+i);must(onlyAllowedWrites(env.storage.writes()),'unexpected write at cycle '+i);must(env.networkCalls()===0,'network call at cycle '+i);
    }catch(e){failure={cycle:i,dest,error:e.message||String(e),writes:env.storage.writes()};break}
  }
  return{pass:!failure,cyclesRequested:count,cyclesCompleted:failure?failure.cycle:count,failure,networkCalls:env.networkCalls()};
}

const scenarios=runScenarios(),stress=runStress(cycles);
const report={
  schema:'runlu.flooring.actual-system-adapter.v1',version:'0.2.0',environment:'NODE_VM_ISOLATED_ACTUAL_PRODUCTION_MODULE',generatedAt:new Date().toISOString(),
  actualModule:'flooring/people-to-call-review-v095.js',actualModuleSha256:sourceSha256,actualModuleVersion:scenarios.tests[0]?.moduleVersion||null,
  pass:scenarios.pass&&stress.pass,scenarios,stress,
  isolation:{productionSupabaseAccess:false,hostLocalStorageAccess:false,networkApisBlocked:true,storage:'ephemeral in-memory Map',allowedActualModuleWrites:[JOB_STORE,CALL_STORE,ACTIVE_STORE],forbiddenWrite:PO_STORE},
  boundaries:['Executes the exact repository production module source inside a Node VM with synthetic data.','V0.2 does not yet execute Supabase-backed RC Tracking; that requires a fake Supabase transport before the module is allowed into LAB.','This is actual module-path verification, not browser end-to-end certification.']
};
fs.writeFileSync('flooring-actual-system-adapter-report.json',JSON.stringify(report,null,2));
console.log(`${scenarios.pass?'PASS':'FAIL'} · Actual V095 module scenarios · ${scenarios.passed}/${scenarios.tests.length}`);
console.log(`${stress.pass?'PASS':'FAIL'} · Actual V095 module stress · ${stress.cyclesCompleted}/${stress.cyclesRequested} route cycles`);
console.log(`Module SHA-256 · ${sourceSha256}`);
console.log('Isolation · VM memory only · network blocked · production Supabase/localStorage access: NONE');
if(!report.pass){console.error('ACTUAL-SYSTEM ADAPTER: FAIL');for(const t of scenarios.tests.filter(x=>!x.pass))console.error(t.name+': '+t.error);if(stress.failure)console.error(stress.failure);process.exit(1)}
console.log('ACTUAL-SYSTEM ADAPTER: PASS');