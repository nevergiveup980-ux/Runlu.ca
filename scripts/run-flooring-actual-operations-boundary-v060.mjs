import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const WAREHOUSE_FILE='flooring/warehouse-work-sync-v090.js';
const MATERIAL_FILE='flooring/material-work-sync-v091.js';
const warehouseSource=fs.readFileSync(new URL('../'+WAREHOUSE_FILE,import.meta.url),'utf8');
const materialSource=fs.readFileSync(new URL('../'+MATERIAL_FILE,import.meta.url),'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const warehouseSha256=sha(warehouseSource),materialSha256=sha(materialSource);
const cycles=Math.max(50,Number(process.env.RUNLU_BOUNDARY_CYCLES||500));
const PO_STORE='runlu_deerfoot_supplier_orders_v1';
const SNAP_STORE='runlu_supplier_pickup_by_po_v1';
const WAREHOUSE_CACHE='runlu-flooring-warehouse-work-v090';
const MATERIAL_CACHE='runlu-flooring-material-work-v091';
const FORBIDDEN_KEYS=['runlu_carpet_inventory_v52','runlu_inventory_records_v21','runlu_deerfoot_flooring_jobs_v1','runlu_people_to_call_v066'];
const must=(c,m)=>{if(!c)throw new Error(m)};
const clone=x=>JSON.parse(JSON.stringify(x));

function storage(){
  const map=new Map(),writes=[];
  return {
    getItem:k=>map.has(String(k))?map.get(String(k)):null,
    setItem(k,v){k=String(k);writes.push(k);map.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);map.delete(k)},
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    raw:k=>map.get(String(k))??null,
    json:k=>JSON.parse(map.get(String(k))||'null'),
    writes:()=>writes.slice(),clearWrites(){writes.length=0},
    snapshot:()=>Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))
  };
}

function dom(){
  const appended=[];
  const document={
    readyState:'loading',visibilityState:'visible',documentElement:{dataset:{}},
    head:{appendChild(x){appended.push(x)}},body:{appendChild(){},prepend(){}},
    getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]},
    createElement(tag){return{tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:{contains(){return false},toggle(){}},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},addEventListener(){},insertAdjacentElement(){},remove(){},textContent:'',innerHTML:''}},
    addEventListener(){}
  };
  return {document,appended};
}

function queryBuilder(data,error=null){
  const chain={
    select(){return chain},eq(){return chain},order(){return chain},limit(){return chain},
    then(resolve,reject){return Promise.resolve({data:clone(data),error}).then(resolve,reject)}
  };
  return chain;
}

function fakeSupabase(fixtures={}){
  const calls={createClient:0,rpc:[],from:[],authGetSession:0,authListeners:0};
  let session=fixtures.session===undefined?{user:{id:'LAB-STAFF'}}:fixtures.session;
  let tableErrors={...(fixtures.tableErrors||{})};
  let tables={...(fixtures.tables||{})};
  const client={
    auth:{
      async getSession(){calls.authGetSession++;return{data:{session}}},
      onAuthStateChange(){calls.authListeners++;return{data:{subscription:{unsubscribe(){}}}}}
    },
    async rpc(name,args){calls.rpc.push({name,args:clone(args)});const e=fixtures.rpcError||null;return{data:e?null:{ok:true},error:e}},
    from(name){calls.from.push(name);return queryBuilder(tables[name]||[],tableErrors[name]||null)}
  };
  return {
    sdk:{createClient(){calls.createClient++;return client}},calls,
    setTable(name,rows){tables[name]=clone(rows)},setTableError(name,error){if(error)tableErrors[name]=error;else delete tableErrors[name]},
    setSession(v){session=v}
  };
}

function boot(source,globalName,fixtures={}){
  const s=storage(),d=dom(),fake=fakeSupabase(fixtures);let network=0,alerts=[];
  const quiet={log(){},info(){},warn(){},error(){},debug(){}};
  const blocked=n=>function(){network++;throw Error('LAB blocked network API: '+n)};
  const window={document:d.document,localStorage:s,console:quiet,supabase:fake.sdk,addEventListener(){},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},scrollTo(){},alert:m=>alerts.push(String(m))};window.window=window;
  const box={window,document:d.document,localStorage:s,console:quiet,alert:window.alert,setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,fetch:blocked('fetch'),XMLHttpRequest:class{constructor(){network++;throw Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network++;throw Error('LAB blocked WebSocket')}},EventSource:class{constructor(){network++;throw Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set};
  vm.createContext(box,{name:'RUNLU Flooring Actual Operations Boundary LAB'});
  vm.runInContext(source,box,{filename:globalName+'.js',timeout:1000});
  const api=window[globalName];must(api,'actual module API missing: '+globalName);
  return{api,s,fake,network:()=>network,alerts,d};
}

function forbiddenWrites(e){return e.s.writes().filter(k=>FORBIDDEN_KEYS.includes(k)||k===PO_STORE||k===SNAP_STORE)}
function check(name,fn){return Promise.resolve().then(fn).then(x=>({name,pass:true,...(x||{})}),err=>({name,pass:false,error:err?.message||String(err)}))}

async function warehouseScenarios(){
  const tests=[];
  tests.push(await check('Actual V090 loads with expected public contract',async()=>{
    const e=boot(warehouseSource,'RUNLUWarehouseWorkSyncV090');
    must(e.api.version==='0.9.0','version '+e.api.version);must(typeof e.api.refresh==='function','refresh missing');must(typeof e.api.taskByPO==='function','taskByPO missing');
    return{moduleVersion:e.api.version};
  }));
  tests.push(await check('Actual V090 creates plans only for eligible POs and never mutates PO bytes',async()=>{
    const rows=[{id:'po1',poNumber:'181604',jobId:'j1',jobNumber:'181604',customerName:'Synthetic Customer',status:'Received',supplier:'PROSOL',salesRep:'LAB',fulfillment:'Pickup',requestedDate:'2026-09-20',purchaseType:'Job-specific',items:[{style:'Wall Base',colour:'Brown 47',qty:2,unit:'BOX'}]},{id:'po2',poNumber:'181605',status:'Draft',supplier:'PRIMCO',items:[{style:'Pad',qty:2,unit:'ROLL'}]},{id:'po3',poNumber:'181606',status:'Cancelled',supplier:'TAIGA',items:[]}];
    const e=boot(warehouseSource,'RUNLUWarehouseWorkSyncV090',{tables:{flooring_supplier_tasks:[{po_number:181604,status:'Waiting'}],flooring_warehouse_work_events:[]}});e.s.seed(PO_STORE,rows);e.s.seed(SNAP_STORE,{});const before=e.s.raw(PO_STORE);e.s.clearWrites();await e.api.refresh(false);
    must(e.fake.calls.rpc.length===1,'eligible RPC count '+e.fake.calls.rpc.length);const c=e.fake.calls.rpc[0];must(c.name==='flooring_create_supplier_task','unexpected RPC '+c.name);must(c.args.p_po_number===181604,'wrong PO');must(c.args.p_items?.[0]?.unit==='box','unit not normalized');must(e.s.raw(PO_STORE)===before,'PO bytes mutated');must(e.api.taskByPO('181604')?.status==='Waiting','taskByPO failed');must(e.s.writes().every(k=>k===WAREHOUSE_CACHE),'unexpected local write '+e.s.writes());must(forbiddenWrites(e).length===0,'forbidden write '+forbiddenWrites(e));must(e.network()===0,'real network attempted');
    return{rpcCalls:e.fake.calls.rpc.length,writes:e.s.writes()};
  }));
  tests.push(await check('Actual V090 successful refresh caches observer data only',async()=>{
    const e=boot(warehouseSource,'RUNLUWarehouseWorkSyncV090',{tables:{flooring_supplier_tasks:[{po_number:319,status:'In Progress'},{po_number:320,status:'Completed'}],flooring_warehouse_work_events:[{event_type:'Status Changed',to_status:'Completed'}]}});e.s.seed(PO_STORE,[]);e.s.clearWrites();await e.api.refresh(false);const c=e.s.json(WAREHOUSE_CACHE);must(c.tasks.length===2&&c.events.length===1,'cache payload mismatch');must(e.s.writes().every(k=>k===WAREHOUSE_CACHE),'non-cache write');must(e.network()===0,'real network attempted');return{tasks:c.tasks.length,events:c.events.length};
  }));
  tests.push(await check('Actual V090 cloud failure falls back without posting inventory',async()=>{
    const cached={tasks:[{po_number:999,status:'Waiting'}],events:[],lastSync:'LAB'};const e=boot(warehouseSource,'RUNLUWarehouseWorkSyncV090',{tables:{flooring_supplier_tasks:[],flooring_warehouse_work_events:[]},tableErrors:{flooring_supplier_tasks:{message:'LAB injected query failure'}}});e.s.seed(PO_STORE,[]);e.s.seed(WAREHOUSE_CACHE,cached);e.s.clearWrites();await e.api.refresh(false);must(e.api.taskByPO('999')?.status==='Waiting','cache fallback failed');must(forbiddenWrites(e).length===0,'forbidden write');must(e.network()===0,'real network attempted');return{fallback:true};
  }));
  return tests;
}

async function materialScenarios(){
  const tests=[];
  tests.push(await check('Actual V091 loads with expected public contract',async()=>{
    const e=boot(materialSource,'RUNLUMaterialWorkSyncV091');must(e.api.version==='0.9.1','version '+e.api.version);must(typeof e.api.refresh==='function','refresh missing');must(typeof e.api.counts==='function','counts missing');return{moduleVersion:e.api.version};
  }));
  tests.push(await check('Actual V091 reads fulfillment tasks, counts status, and writes cache only',async()=>{
    const rows=[{task_type:'Stock Picking',status:'Waiting',review_required:false},{task_type:'Carpet Cutting',status:'In Progress',review_required:false},{task_type:'Carpet Cutting',status:'Partial',review_required:true},{task_type:'Stock Picking',status:'Completed',review_required:false}];const e=boot(materialSource,'RUNLUMaterialWorkSyncV091',{tables:{flooring_warehouse_material_tasks:rows}});e.s.clearWrites();await e.api.refresh(false);const c=e.api.counts();must(JSON.stringify(c)===JSON.stringify({waiting:1,progress:2,completed:1,review:1}),'count mismatch '+JSON.stringify(c));must(e.s.writes().every(k=>k===MATERIAL_CACHE),'unexpected write '+e.s.writes());must(forbiddenWrites(e).length===0,'forbidden write');must(e.network()===0,'real network attempted');return{counts:c,writes:e.s.writes()};
  }));
  tests.push(await check('Actual V091 source cannot post warehouse inventory or task status through public API',async()=>{
    const e=boot(materialSource,'RUNLUMaterialWorkSyncV091',{tables:{flooring_warehouse_material_tasks:[{status:'Waiting',review_required:false}]}});const names=Object.keys(e.api).sort();must(JSON.stringify(names)===JSON.stringify(['counts','refresh','version']),'unexpected mutator exposed '+names.join(','));await e.api.refresh(false);must(forbiddenWrites(e).length===0,'forbidden write');must(e.fake.calls.rpc.length===0,'material module called RPC');must(e.network()===0,'real network attempted');return{publicAPI:names};
  }));
  tests.push(await check('Actual V091 cloud failure preserves cached observer view only',async()=>{
    const e=boot(materialSource,'RUNLUMaterialWorkSyncV091',{tableErrors:{flooring_warehouse_material_tasks:{message:'LAB injected query failure'}}});e.s.seed(MATERIAL_CACHE,{rows:[{status:'Partial',review_required:true}],lastSync:'LAB'});e.s.clearWrites();await e.api.refresh(false);const c=e.api.counts();must(c.progress===1&&c.review===1,'fallback counts mismatch');must(forbiddenWrites(e).length===0,'forbidden write');must(e.network()===0,'real network attempted');return{fallback:true,counts:c};
  }));
  return tests;
}

async function stress(n){
  const w=boot(warehouseSource,'RUNLUWarehouseWorkSyncV090',{tables:{flooring_supplier_tasks:[],flooring_warehouse_work_events:[]}});const m=boot(materialSource,'RUNLUMaterialWorkSyncV091',{tables:{flooring_warehouse_material_tasks:[]}});let failure=null;
  for(let i=0;i<n;i++){
    const num=190000+i;const po=[{id:'LAB-'+i,poNumber:String(num),jobId:'J'+i,jobNumber:'J'+i,customerName:'Synthetic',status:'Received',supplier:i%2?'PROSOL':'PRIMCO',fulfillment:i%3?'Pickup':'Supplier Delivery',purchaseType:i%4?'Job-specific':'Stock',items:[{style:'LAB Material',qty:(i%9)+1,unit:i%2?'BOX':'ROLL'}]}];
    const wt=[{po_number:num,status:['Waiting','In Progress','Partial','Completed'][i%4]}],we=i%4?[{event_type:'Status Changed',po_number:num,to_status:wt[0].status}]:[];
    const mt=[{task_type:i%2?'Stock Picking':'Carpet Cutting',status:['Waiting','In Progress','Partial','Completed'][i%4],review_required:i%11===0}];
    w.s.seed(PO_STORE,po);w.s.clearWrites();w.fake.setTable('flooring_supplier_tasks',wt);w.fake.setTable('flooring_warehouse_work_events',we);m.s.clearWrites();m.fake.setTable('flooring_warehouse_material_tasks',mt);
    try{
      await w.api.refresh(false);await m.api.refresh(false);must(w.api.taskByPO(String(num))?.status===wt[0].status,'warehouse task mismatch');must(w.s.writes().every(k=>k===WAREHOUSE_CACHE),'warehouse unexpected write');must(m.s.writes().every(k=>k===MATERIAL_CACHE),'material unexpected write');must(forbiddenWrites(w).length===0&&forbiddenWrites(m).length===0,'forbidden key write');must(w.network()===0&&m.network()===0,'network attempted');must(m.fake.calls.rpc.length===0,'material RPC attempted');
    }catch(err){failure={cycle:i,error:err?.message||String(err),warehouseWrites:w.s.writes(),materialWrites:m.s.writes()};break}
  }
  return{pass:!failure,cyclesRequested:n,cyclesCompleted:failure?failure.cycle:n,failure,warehouseRpcCalls:w.fake.calls.rpc.length,realNetworkCalls:w.network()+m.network()};
}

const warehouseTests=await warehouseScenarios();const materialTests=await materialScenarios();const st=await stress(cycles);const tests=[...warehouseTests,...materialTests];const pass=tests.every(x=>x.pass)&&st.pass;
const report={schema:'runlu.flooring.actual-operations-boundary.v1',version:'0.6.0',generatedAt:new Date().toISOString(),pass,modules:[{file:WAREHOUSE_FILE,sha256:warehouseSha256,version:warehouseTests[0]?.moduleVersion||null,role:'Flooring supplier-pickup planner/observer; Warehouse execution authority remains external to this module.'},{file:MATERIAL_FILE,sha256:materialSha256,version:materialTests[0]?.moduleVersion||null,role:'Read-only fulfillment observer for Hold-derived Stock Picking / Carpet Cutting work.'}],scenarios:{pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests},stress:st,isolation:{productionSupabaseAccess:false,realNetworkApisBlocked:true,hostLocalStorageAccess:false,storage:'ephemeral in-memory Map',supabase:'in-memory fake transport',allowedLocalWrites:[WAREHOUSE_CACHE,MATERIAL_CACHE],forbiddenLocalWrites:[PO_STORE,SNAP_STORE,...FORBIDDEN_KEYS]},boundaries:['Executes exact repository V090 and V091 module source inside Node VM with fake Supabase and synthetic data.','Verifies Flooring-side planning/observation boundaries; it does not certify Warehouse OS receiving, transfer, shipping, return, or inventory-posting execution code when that execution authority is outside these modules.','Browser rendering and live Supabase RLS/network behavior remain outside this isolated adapter.']};
fs.writeFileSync('flooring-actual-operations-boundary-v060-report.json',JSON.stringify(report,null,2));
console.log(`${tests.every(x=>x.pass)?'PASS':'FAIL'} · exact Flooring operations-boundary scenarios · ${tests.filter(x=>x.pass).length}/${tests.length}`);console.log(`${st.pass?'PASS':'FAIL'} · exact V090/V091 boundary stress · ${st.cyclesCompleted}/${st.cyclesRequested} cycles`);console.log(`V090 SHA-256 · ${warehouseSha256}`);console.log(`V091 SHA-256 · ${materialSha256}`);console.log('Isolation · fake Supabase + VM memory only · real network/production data: NONE');console.log('Boundary · Flooring plans/observes; Warehouse execution remains outside V090/V091');if(!pass){for(const x of tests.filter(x=>!x.pass))console.error(x.name+': '+x.error);if(st.failure)console.error(st.failure);console.error('ACTUAL OPERATIONS BOUNDARY V0.6: FAIL');process.exit(1)}console.log('ACTUAL OPERATIONS BOUNDARY V0.6: PASS');
