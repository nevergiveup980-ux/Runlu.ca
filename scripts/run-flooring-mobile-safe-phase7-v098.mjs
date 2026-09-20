import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const v71=read('flooring/index-v071-pricing-workspace.html');
const fastboot=read('flooring/mobile-safe-fastboot-v0403j.js');
const phase7=read('flooring/mobile-safe-phase7-v0403j.js');
const ack=read('flooring/warehouse-receipt-ack-v098-safe.js');
const historical=read('flooring/warehouse-receipt-ack-v098.js');
const release=read('flooring/index-v0403-release.html');
const frozenQuote=read('flooring/quote-dual-entry-v0403i-stable-frozen.js');

const PO='runlu_deerfoot_supplier_orders_v1';
const CALL='runlu_people_to_call_v066';
const checks=[];
function test(name,fn){try{fn();checks.push([name,true])}catch(e){checks.push([name,false,e.message])}}

function storage(){
  const map=new Map();let fail='';
  return {
    getItem:k=>map.has(String(k))?map.get(String(k)):null,
    setItem(k,v){k=String(k);if(fail===k){fail='';throw new Error('injected '+k)}map.set(k,String(v))},
    removeItem:k=>map.delete(String(k)),
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    raw:k=>map.get(String(k))??null,
    json:k=>JSON.parse(map.get(String(k))||'null'),
    snapshot:()=>JSON.stringify(Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))),
    failNext:k=>{fail=String(k)}
  }
}
function boot(){
  const localStorage=storage();
  const document={
    readyState:'loading',
    visibilityState:'visible',
    getElementById(){return null},
    querySelector(){return null},
    querySelectorAll(){return[]},
    createElement(){return{style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},appendChild(){},insertAdjacentElement(){},addEventListener(){},setAttribute(){},querySelector(){return null},querySelectorAll(){return[]},scrollIntoView(){}}},
    addEventListener(){},
    head:{appendChild(){}},body:{appendChild(){}}
  };
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  const window={document,localStorage,console:quiet,addEventListener(){},scrollTo(){},setTimeout(){return 0},clearTimeout(){}};
  window.window=window;
  window.RUNLUOrdersDrawerV066={
    syncPeopleToCall(){
      const ps=localStorage.json(PO)||[],qs=localStorage.json(CALL)||[];
      for(const p of ps){
        if(String(p.status)==='Received'&&!/deliver/i.test(String(p.fulfillment||'Pickup'))){
          const id='ptc-'+String(p.jobId||p.jobNumber||p.poNumber);
          let q=qs.find(x=>x.id===id);
          if(!q){q={id,orderId:p.jobId||'',orderNumber:p.jobNumber||'',status:'Not Called',sourcePOs:[String(p.poNumber)]};qs.push(q)}
          else if(!q.sourcePOs.includes(String(p.poNumber)))q.sourcePOs.push(String(p.poNumber));
        }
      }
      localStorage.setItem(CALL,JSON.stringify(qs));
      return qs
    },
    refresh(){}
  };
  const box={window,document,localStorage,console:quiet,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  vm.createContext(box);
  vm.runInContext(ack,box,{filename:'warehouse-receipt-ack-v098-safe.js',timeout:1200});
  return {api:window.RUNLUWarehouseReceiptAckV098Safe,store:localStorage,window}
}
function seed(env,n=181700,extraPO={},extraTask={}){
  const po={id:'PO-'+n,jobId:'J-'+n,jobNumber:String(n),poNumber:String(n),status:'Submitted',fulfillment:'Pickup',items:[{style:'LAB TILE',colour:'GREY',qty:10,unit:'BOX'}],...extraPO};
  const task={id:'TASK-'+n,po_number:n,status:'In Progress',fulfillment_method:'Pickup',received_at:'2026-09-20T15:00:00.000Z',inventory_post_status:'Posted',inventory_posted_at:'2026-09-20T15:05:00.000Z',items:[{style:'LAB TILE',colour:'GREY',qty:10,unit:'box'}],received_items:[{style:'LAB TILE',colour:'GREY',ordered_qty:'10',received_qty:'10'}],inventory_postings:[{line:1,quantity:10,received_qty:'10',inventory_id:'INV-1',master_id:'PRD-1'}],...extraTask};
  env.store.seed(PO,[po]);env.store.seed(CALL,[]);
  return {po,task}
}

test('Phase 7 launcher compiles',()=>new Function(phase7));
test('Safe V0.9.8 module compiles',()=>new Function(ack));
test('Safe Core uses Fast Boot j and does not directly load Phase 7 business code',()=>{
  assert(v71.includes('mobile-safe-fastboot-v0403j.js?v=0403j'));
  assert(v71.includes('n=s?"mobile-safe-0403j":Date.now()'));
  assert.equal(v71.includes('mobile-safe-phase7-v0403j.js?v=0403j'),false);
  assert.equal(v71.includes('warehouse-receipt-ack-v098-safe.js'),false);
});
test('Fast Boot preserves Phases 1–6 and appends Phase 7',()=>{
  const names=[1,2,3,4,5,6,7].map(i=>fastboot.indexOf("name:'phase"+i+"'"));
  assert(names.every(x=>x>0));for(let i=1;i<names.length;i++)assert(names[i]>names[i-1]);
  assert(fastboot.includes("mobile-safe-phase7-v0403j.js?v=0403j"));
  assert.equal(fastboot.includes('warehouse-receipt-ack-v098-safe.js'),false);
});
test('Phase 7 is launcher-only and business module loads only after explicit tap',()=>{
  const install=phase7.slice(phase7.indexOf('function install()'),phase7.indexOf('root.RUNLUMobileSafePhase7V098'));
  assert(install.includes('ensureLauncher()'));
  assert.equal(install.includes('load()'),false);
  assert.equal(install.includes('launch()'),false);
  assert(phase7.includes("b.addEventListener('click',launch)"));
  assert(phase7.includes("const MODULE_SRC='warehouse-receipt-ack-v098-safe.js?v=0403j-safe'"));
});
test('Safe V0.9.8 reads current supplier-task proof schema and never writes cloud',()=>{
  for(const token of ['received_at','inventory_post_status','inventory_posted_at','inventory_postings'])assert(ack.includes(token),token);
  assert(ack.includes("from('flooring_supplier_tasks').select('*')"));
  for(const banned of ['.insert(','.update(','.upsert(','.delete(','.rpc('])assert.equal(ack.includes(banned),false,banned);
  assert(ack.includes('cloudReadOnly:true'));
  assert(ack.includes('warehouseReadOnly:true'));
});
test('Checking valid proof is read-only and requires full receipt plus posted inventory',()=>{
  const e=boot(),x=seed(e),before=e.store.snapshot();
  const r=e.api.evaluatePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,true);assert.equal(r.code,'VERIFIED_FULL_RECEIPT');
  assert.equal(e.store.snapshot(),before);
  assert(e.api.requiresFullReceipt&&e.api.requiresInventoryPost);
});
test('Explicit acknowledgement changes local Pickup PO and creates People TO Call only after proof passes',()=>{
  const e=boot(),x=seed(e,181701),beforePO=e.store.raw(PO);
  const check=e.api.evaluatePO(x.po.poNumber,[x.task]);assert(check.ok);
  assert.equal(e.store.raw(PO),beforePO);
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,true);assert.equal(r.changed,true);assert.equal(r.code,'ACKNOWLEDGED');
  const po=e.store.json(PO)[0],q=e.store.json(CALL)[0];
  assert.equal(po.status,'Received');assert.equal(po.warehouseReceiptPostStatus,'Posted');
  assert.equal(q.status,'Not Called');assert(q.sourcePOs.includes(String(x.po.poNumber)));
});
test('Partial receipt is blocked with zero mutation',()=>{
  const e=boot(),x=seed(e,181702,{}, {received_items:[{style:'LAB TILE',colour:'GREY',ordered_qty:'10',received_qty:'9'}]}),before=e.store.snapshot();
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,false);assert.equal(r.code,'NOT_FULL_RECEIPT');assert.equal(e.store.snapshot(),before);
});
test('Inventory posting mismatch is blocked with zero mutation',()=>{
  const e=boot(),x=seed(e,181703,{}, {inventory_postings:[{line:1,quantity:9,inventory_id:'INV-1'}]}),before=e.store.snapshot();
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,false);assert.equal(r.code,'POSTING_QUANTITY_MISMATCH');assert.equal(e.store.snapshot(),before);
});
test('Missing received_at or non-Posted inventory fails closed',()=>{
  const e1=boot(),x1=seed(e1,181704,{}, {received_at:null});
  assert.equal(e1.api.evaluatePO(x1.po.poNumber,[x1.task]).code,'WAREHOUSE_RECEIPT_TIME_MISSING');
  const e2=boot(),x2=seed(e2,181705,{}, {inventory_post_status:'Pending'});
  assert.equal(e2.api.evaluatePO(x2.po.poNumber,[x2.task]).code,'INVENTORY_NOT_POSTED');
});
test('Duplicate Warehouse tasks fail closed',()=>{
  const e=boot(),x=seed(e,181706),before=e.store.snapshot();
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task,{...x.task,id:'TASK-DUP'}]);
  assert.equal(r.ok,false);assert.equal(r.code,'DUPLICATE_WAREHOUSE_TASK');assert.equal(e.store.snapshot(),before);
});
test('Supplier Delivery is intentionally blocked before any local write',()=>{
  const e=boot(),x=seed(e,181707,{fulfillment:'Supplier Delivery'},{fulfillment_method:'Supplier Delivery'}),before=e.store.snapshot();
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,false);assert.equal(r.code,'SUPPLIER_DELIVERY_NOT_AUTHORIZED');assert.equal(e.store.snapshot(),before);
  assert(e.api.supplierDeliveryBlocked);
});
test('People TO Call failure rolls the PO and queue back exactly',()=>{
  const e=boot(),x=seed(e,181708),before=e.store.snapshot();
  e.window.RUNLUOrdersDrawerV066.syncPeopleToCall=()=>{throw new Error('injected queue failure')};
  const r=e.api.acknowledgePO(x.po.poNumber,[x.task]);
  assert.equal(r.ok,false);assert.equal(r.code,'PEOPLE_TO_CALL_COMMIT_FAILED');assert.equal(e.store.snapshot(),before);
});
test('UI requires Check first and never auto-acknowledges',()=>{
  assert(ack.includes('id="ra098ack" disabled'));
  assert(ack.includes("if(!lastCheck?.ok"));
  assert(ack.includes('productionAutoAcknowledge:false'));
  assert.equal(ack.includes('reconcile()'),false);
});
test('Historical V0.9.8 candidate remains untouched as non-production reference',()=>{
  assert(historical.includes("version:VERSION"));
  assert(historical.includes('productionAutoInstall:false'));
  assert(historical.includes("const VERSION='0.9.8'"));
  assert(ack.includes("const VERSION='0.9.8-safe'"));
});
test('Production iPhone route remains shallow and token advances to j',()=>{
  assert(release.includes("mobileSafe?'index-v071-pricing-workspace.html"));
  assert(release.includes("mobileSafe&&v==='core'?'mobile-safe-0403j':Date.now()"));
});
test('Frozen Quote production baseline remains untouched',()=>{
  assert(release.includes("quote:'index-v0403i-quote-stable-frozen.html?prod=1&release=0403i&frozen=1'"));
  assert(frozenQuote.includes('EDITING THE ACTUAL QUOTE · V0.4.03i'));
});
test('Phase 7 exposes real-device safety diagnostics',()=>{
  assert(phase7.includes('RUNLUMobileSafePhase7V098'));
  assert(phase7.includes("module:'warehouse-receipt-ack-v098'"));
  assert(phase7.includes("startup:'launcher-only'"));
  assert(phase7.includes('autoAcknowledge:false'));
});

for(const [name,ok,error] of checks)console.log((ok?'PASS':'FAIL')+'  '+name+(error?'  '+error:''));
const failed=checks.filter(x=>!x[1]);
console.log('\n'+(checks.length-failed.length)+'/'+checks.length+' checks passed.');
if(failed.length)process.exit(1);
