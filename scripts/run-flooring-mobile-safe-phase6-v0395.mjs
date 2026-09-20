import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const fastboot=read('flooring/mobile-safe-fastboot-v0403h.js');
const phase6=read('flooring/mobile-safe-phase6-v0403h.js');
const review=read('flooring/people-to-call-review-v095-safe.js');
const historical=read('flooring/people-to-call-review-v095.js');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const JOB='runlu_deerfoot_flooring_jobs_v1';
const PO='runlu_deerfoot_supplier_orders_v1';
const CALL='runlu_people_to_call_v066';
const ACTIVE='runlu_deerfoot_flooring_active_job_v1';

const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

function storage(){
  const map=new Map();let failKey='';
  return {
    getItem:k=>map.has(String(k))?map.get(String(k)):null,
    setItem(k,v){k=String(k);if(failKey===k){failKey='';throw new Error('injected '+k)}map.set(k,String(v))},
    removeItem:k=>map.delete(String(k)),
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    raw:k=>map.get(String(k))??null,
    json:k=>JSON.parse(map.get(String(k))||'null'),
    snapshot:()=>JSON.stringify(Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))),
    failNext:k=>{failKey=k}
  }
}
function bootReview(){
  const localStorage=storage(),notes=new Map();
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  const document={
    readyState:'loading',
    documentElement:{dataset:{}},
    head:{appendChild(){}},body:{appendChild(){},prepend(){}},
    getElementById(){return null},
    querySelectorAll(sel){
      if(sel==='[data-r95-note]')return [...notes].map(([q,v])=>({dataset:{r95Note:q},value:v,style:{}}));
      return []
    },
    createElement(){return{style:{},dataset:{},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){},remove(){}}},
    addEventListener(){}
  };
  class MutationObserver{observe(){}disconnect(){}}
  const window={document,localStorage,console:quiet,MutationObserver,addEventListener(){},setTimeout(){return 0},clearTimeout(){},RUNLUOrdersDrawerV066:{refresh(){},syncPeopleToCall(){}}};
  window.window=window;
  const box={window,document,localStorage,console:quiet,MutationObserver,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  vm.createContext(box);vm.runInContext(review,box,{filename:'people-to-call-review-v095-safe.js',timeout:1000});
  return {api:window.RUNLUPeopleToCallReviewV095,store:localStorage,notes}
}
function seed(env,n=1){
  const id=String(n),jid='J'+id,qid='Q'+id,pid='PO'+id;
  env.store.seed(JOB,[{id:jid,jobNumber:'ORDER-'+id,customerName:'Customer',status:'In Progress',peopleToCallHistory:[]}]);
  env.store.seed(PO,[{id:pid,jobId:jid,jobNumber:'ORDER-'+id,status:'Received',poNumber:'P-'+id}]);
  env.store.seed(CALL,[{id:qid,orderId:jid,orderNumber:'ORDER-'+id,status:'Not Called',sourcePOs:['P-'+id],history:[]}]);
  env.notes.set(qid,'Remaining material / pickup note');
  return {jid,qid,pid}
}

test('Phase 6 launcher compiles',()=>new Function(phase6));
test('Safe V0.3.95 module compiles',()=>new Function(review));
test('Safe Core uses the Phase 6 Fast Boot extension',()=>{
  assert(v71.includes('mobile-safe-fastboot-v0403h.js?v=0403h'));
  assert(v71.includes('n=s?"mobile-safe-0403h":Date.now()'));
  assert.equal(v71.includes('mobile-safe-phase6-v0403h.js?v=0403h'),false);
});
test('Fast Boot preserves Phases 1–5 and adds Phase 6 last',()=>{
  const names=[1,2,3,4,5,6].map(i=>fastboot.indexOf("name:'phase"+i+"'"));
  assert(names.every(x=>x>0));for(let i=1;i<names.length;i++)assert(names[i]>names[i-1]);
  assert(fastboot.includes("mobile-safe-phase6-v0403h.js?v=0403h"));
  assert.equal(fastboot.includes('people-to-call-review-v095-safe.js'),false);
});
test('Phase 6 startup is launcher-only',()=>{
  const install=phase6.slice(phase6.indexOf('function install()'),phase6.indexOf('root.RUNLUMobileSafePhase6V0395'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase6.includes("b.addEventListener('click',launch)"));
});
test('Explicit tap loads only the safe V0.3.95 review module and opens Orders',()=>{
  assert(phase6.includes("const MODULE_SRC='people-to-call-review-v095-safe.js?v=0403h-safe'"));
  const launch=phase6.slice(phase6.indexOf('async function launch()'),phase6.indexOf('function ensureLauncher()'));
  assert(launch.includes('await load()'));assert(launch.includes('openPeople()'));
  assert(phase6.includes('data-page="jobs"'));
});
test('Safe review preserves PO status and uses only local Job/People queue state',()=>{
  assert(review.includes("const PO_STORE='runlu_deerfoot_supplier_orders_v1'"));
  assert.equal(review.includes('write(PO_STORE'),false);
  assert.equal(review.includes('localStorage.setItem(PO_STORE'),false);
  assert(review.includes('poStatusImmutable:true'));
  assert(review.includes('networkWrites:false'));
  for(const banned of ['fetch(','XMLHttpRequest','WebSocket','supabase','.rpc('])assert.equal(review.includes(banned),false,banned);
});
test('Active review route is atomic and leaves Received PO untouched',()=>{
  const e=bootReview(),x=seed(e,1),beforePO=e.store.raw(PO);
  assert.equal(e.api.route(x.qid,x.jid,'active'),true);
  assert.equal(e.store.raw(PO),beforePO);
  const j=e.store.json(JOB)[0],q=e.store.json(CALL)[0];
  assert.equal(j.salesMaterialRoute,'active');assert.equal(j.orderDrawerOverride,'active');assert.equal(q.status,'Done');
});
test('Pickup review route is atomic and leaves Received PO untouched',()=>{
  const e=bootReview(),x=seed(e,2),beforePO=e.store.raw(PO);
  assert.equal(e.api.route(x.qid,x.jid,'pickup'),true);
  assert.equal(e.store.raw(PO),beforePO);
  const j=e.store.json(JOB)[0],q=e.store.json(CALL)[0];
  assert.equal(j.salesMaterialRoute,'pickup');assert.equal(j.orderDrawerOverride,'back');assert.equal(q.status,'Done');
  assert.equal(j.pickupReviewNote,'Remaining material / pickup note');
});
test('Keep route leaves order in People TO Call and PO untouched',()=>{
  const e=bootReview(),x=seed(e,3),beforePO=e.store.raw(PO);
  assert.equal(e.api.route(x.qid,x.jid,'keep'),true);
  assert.equal(e.store.raw(PO),beforePO);
  const j=e.store.json(JOB)[0],q=e.store.json(CALL)[0];
  assert.equal(j.salesMaterialRoute,'people');assert.equal(q.status,'Not Called');
});
test('Unknown route fails closed with zero state mutation',()=>{
  const e=bootReview(),x=seed(e,4),before=e.store.snapshot();
  assert.equal(e.api.route(x.qid,x.jid,'destroy'),false);
  assert.equal(e.store.snapshot(),before);
});
test('Second atomic write failure restores the exact previous state',()=>{
  const e=bootReview(),x=seed(e,5),before=e.store.snapshot();
  e.store.failNext(CALL);
  assert.equal(e.api.route(x.qid,x.jid,'pickup'),false);
  assert.equal(e.store.snapshot(),before);
});
test('Safe V0.3.95 removes unbounded observer retry and uses bounded deferred refreshes',()=>{
  assert.equal(review.includes('setTimeout(attachPeopleObserver,250)'),false);
  assert.equal(review.includes('setInterval('),false);
  assert(review.includes('[80,320,900,1800].forEach'));
  assert(review.includes('if(!list)return false'));
});
test('iPhone review controls use native touch-safe sizing',()=>{
  assert(review.includes('.r95reviewControls{grid-template-columns:1fr}'));
  assert(review.includes('min-height:48px;font-size:16px'));
  assert(review.includes('.r66peopleRow select{min-height:48px;font-size:16px}'));
});
test('Historical V0.3.95 module remains untouched as the r1 reference',()=>{
  assert(historical.includes("version:'0.3.95r1'"));
  assert(historical.includes('setTimeout(attachPeopleObserver,250)'));
  assert(review.includes("version:'0.3.95r2-safe'"));
});
test('Production iPhone route remains shallow and cache token advances to h',()=>{
  assert(release.includes("mobileSafe?'index-v071-pricing-workspace.html"));
  assert(release.includes("mobileSafe&&v==='core'?'mobile-safe-0403h':Date.now()"));
});
test('Frozen Quote production baseline remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Phase 6 exposes real-device diagnostics and immutable-PO boundary',()=>{
  assert(phase6.includes('RUNLUMobileSafePhase6V0395'));
  assert(phase6.includes("module:'people-to-call-review-v0395'"));
  assert(phase6.includes("startup:'launcher-only'"));
  assert(phase6.includes('poStatusImmutable:true'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
