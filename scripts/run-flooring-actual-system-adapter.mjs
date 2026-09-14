import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const source=fs.readFileSync(new URL('../flooring/people-to-call-review-v095.js',import.meta.url),'utf8');
const sourceSha256=crypto.createHash('sha256').update(source).digest('hex');
const cycles=Math.max(100,Number(process.env.RUNLU_ACTUAL_CYCLES||3000));
const JOB='runlu_deerfoot_flooring_jobs_v1',PO='runlu_deerfoot_supplier_orders_v1',CALL='runlu_people_to_call_v066',ACTIVE='runlu_deerfoot_flooring_active_job_v1';
const allowed=new Set([JOB,CALL,ACTIVE]);
const must=(c,m)=>{if(!c)throw new Error(m)};

function storage(){
  const map=new Map(),writes=[];let fail=null;
  return {
    getItem:k=>map.has(String(k))?map.get(String(k)):null,
    setItem(k,v){k=String(k);writes.push(k);if(fail===k){fail=null;throw Error('LAB injected storage failure: '+k)}map.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);if(fail===k){fail=null;throw Error('LAB injected storage failure: '+k)}map.delete(k)},
    reset(){map.clear();writes.length=0;fail=null},seed(k,v){map.set(k,typeof v==='string'?v:JSON.stringify(v))},raw:k=>map.get(k)??null,
    json(k){return JSON.parse(map.get(k)||'null')},clearWrites(){writes.length=0},writes:()=>writes.slice(),failNext(k){fail=k},
    snapshot:()=>Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))
  };
}

function boot(){
  const s=storage(),notes=new Map();let network=0;
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  const document={readyState:'loading',documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},getElementById(){return null},querySelectorAll(sel){return sel==='[data-r95-note]'?[...notes].map(([q,v])=>({dataset:{r95Note:q},value:v,style:{}})):[]},createElement(){return{style:{},dataset:{},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){},remove(){}}},addEventListener(){}};
  class MutationObserver{observe(){}disconnect(){}}
  const blocked=n=>function(){network++;throw Error('LAB blocked network API: '+n)};
  const window={document,localStorage:s,console:quiet,MutationObserver,addEventListener(){},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){}};window.window=window;
  const box={window,document,localStorage:s,console:quiet,MutationObserver,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,fetch:blocked('fetch'),XMLHttpRequest:class{constructor(){network++;throw Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network++;throw Error('LAB blocked WebSocket')}},EventSource:class{constructor(){network++;throw Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  vm.createContext(box,{name:'RUNLU Flooring Actual Module LAB'});vm.runInContext(source,box,{filename:'people-to-call-review-v095.js',timeout:1000});
  const api=window.RUNLUPeopleToCallReviewV095;must(api&&typeof api.route==='function','actual V095 route API missing');
  return{api,s,notes,network:()=>network};
}
function seed(e,n){const x=String(n),jid='LAB-J'+x,qid='LAB-Q'+x,pid='LAB-PO'+x,jobs=[{id:jid,jobNumber:'LAB-'+x,customerName:'Synthetic Customer',status:'In Progress',peopleToCallHistory:[]}],pos=[{id:pid,jobId:jid,jobNumber:'LAB-'+x,status:'Received',orderedQty:10,receivedQty:10,supplier:'LAB SUPPLIER'}],calls=[{id:qid,orderId:jid,orderNumber:'LAB-'+x,status:'Open',sourcePOs:[pid],history:[]}];e.s.reset();e.notes.clear();e.s.seed(JOB,jobs);e.s.seed(PO,pos);e.s.seed(CALL,calls);e.notes.set(qid,'Remaining material requires pickup');e.s.clearWrites();return{jid,qid,pid,pos}}
const writesOK=e=>e.s.writes().every(k=>allowed.has(k))&&!e.s.writes().includes(PO);
function check(name,fn){try{return{name,pass:true,...(fn()||{})}}catch(e){return{name,pass:false,error:e.message||String(e)}}}
function scenarios(){
  const t=[];
  t.push(check('Actual module loads in isolated VM',()=>{const e=boot();must(e.api.version==='0.3.95r1','version '+e.api.version);must(e.api.poStatusImmutable&&e.api.atomicReviewCommit,'safety contract missing');return{moduleVersion:e.api.version}}));
  for(const [n,d] of [[1,'pickup'],[2,'active'],[3,'keep']])t.push(check('Actual '+d+' route preserves Received PO',()=>{const e=boot(),x=seed(e,n),p=e.s.raw(PO);must(e.api.route(x.qid,x.jid,d)===true,'route failed');const j=e.s.json(JOB)[0],q=e.s.json(CALL)[0];if(d==='pickup')must(q.status==='Done'&&j.salesMaterialRoute==='pickup'&&j.orderDrawerOverride==='back'&&j.pickupReviewNote,'pickup invariant');if(d==='active')must(q.status==='Done'&&j.salesMaterialRoute==='active'&&j.orderDrawerOverride==='active','active invariant');if(d==='keep')must(q.status==='Open'&&j.salesMaterialRoute==='people','keep invariant');must(e.s.raw(PO)===p,'PO mutated');must(writesOK(e),'unexpected write '+e.s.writes());must(e.network()===0,'network attempted');return{writes:e.s.writes()}}));
  t.push(check('Unknown route rejects with zero mutation',()=>{const e=boot(),x=seed(e,4),b=JSON.stringify(e.s.snapshot());must(e.api.route(x.qid,x.jid,'destroy')===false,'unknown route accepted');must(JSON.stringify(e.s.snapshot())===b,'state mutated');must(e.s.writes().length===0,'write occurred');return{safeReject:true}}));
  t.push(check('Missing Job rejects with zero mutation',()=>{const e=boot(),x=seed(e,5),b=JSON.stringify(e.s.snapshot());must(e.api.route(x.qid,'MISSING','pickup')===false,'missing Job accepted');must(JSON.stringify(e.s.snapshot())===b,'state mutated');must(e.s.writes().length===0,'write occurred');return{safeReject:true}}));
  t.push(check('Second write failure rolls back exact state',()=>{const e=boot(),x=seed(e,6),b=JSON.stringify(e.s.snapshot());e.s.failNext(CALL);must(e.api.route(x.qid,x.jid,'pickup')===false,'failure reported success');must(JSON.stringify(e.s.snapshot())===b,'rollback mismatch');must(!e.s.writes().includes(ACTIVE),'active pointer changed');return{safeReject:true,writes:e.s.writes()}}));
  t.push(check('First write failure rolls back exact state',()=>{const e=boot(),x=seed(e,7),b=JSON.stringify(e.s.snapshot());e.s.failNext(JOB);must(e.api.route(x.qid,x.jid,'active')===false,'failure reported success');must(JSON.stringify(e.s.snapshot())===b,'rollback mismatch');must(!e.s.writes().includes(ACTIVE),'active pointer changed');return{safeReject:true,writes:e.s.writes()}}));
  return{pass:t.every(x=>x.pass),passed:t.filter(x=>x.pass).length,failed:t.filter(x=>!x.pass).length,tests:t};
}
function stress(n){const e=boot();let failure=null;for(let i=0;i<n;i++){const x=seed(e,10000+i),d=['pickup','active','keep'][i%3],p=e.s.raw(PO);try{must(e.api.route(x.qid,x.jid,d)===true,'route false');const j=e.s.json(JOB)[0],q=e.s.json(CALL)[0];if(d==='pickup')must(q.status==='Done'&&j.salesMaterialRoute==='pickup','pickup');if(d==='active')must(q.status==='Done'&&j.salesMaterialRoute==='active','active');if(d==='keep')must(q.status==='Open'&&j.salesMaterialRoute==='people','keep');must(e.s.raw(PO)===p,'PO mutation');must(writesOK(e),'unexpected write');must(e.network()===0,'network')}catch(err){failure={cycle:i,dest:d,error:err.message||String(err),writes:e.s.writes()};break}}return{pass:!failure,cyclesRequested:n,cyclesCompleted:failure?failure.cycle:n,failure,networkCalls:e.network()}}

const s=scenarios(),st=stress(cycles);const report={schema:'runlu.flooring.actual-system-adapter.v1',version:'0.2.0',environment:'NODE_VM_ISOLATED_ACTUAL_PRODUCTION_MODULE',generatedAt:new Date().toISOString(),actualModule:'flooring/people-to-call-review-v095.js',actualModuleSha256:sourceSha256,actualModuleVersion:s.tests[0]?.moduleVersion||null,pass:s.pass&&st.pass,scenarios:s,stress:st,isolation:{productionSupabaseAccess:false,hostLocalStorageAccess:false,networkApisBlocked:true,storage:'ephemeral in-memory Map',allowedActualModuleWrites:[JOB,CALL,ACTIVE],forbiddenWrite:PO},boundaries:['Executes exact repository production module source inside Node VM with synthetic data.','Supabase-backed RC Tracking remains excluded until a fake Supabase transport is installed.','Actual module-path verification is not browser end-to-end certification.']};
fs.writeFileSync('flooring-actual-system-adapter-report.json',JSON.stringify(report,null,2));
console.log(`${s.pass?'PASS':'FAIL'} · Actual V095 module scenarios · ${s.passed}/${s.tests.length}`);console.log(`${st.pass?'PASS':'FAIL'} · Actual V095 module stress · ${st.cyclesCompleted}/${st.cyclesRequested} route cycles`);console.log(`Module SHA-256 · ${sourceSha256}`);console.log('Isolation · VM memory only · network blocked · production Supabase/localStorage access: NONE');if(!report.pass){console.error('ACTUAL-SYSTEM ADAPTER: FAIL');for(const x of s.tests.filter(x=>!x.pass))console.error(x.name+': '+x.error);if(st.failure)console.error(st.failure);process.exit(1)}console.log('ACTUAL-SYSTEM ADAPTER: PASS');