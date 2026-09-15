import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const FLOOR_V090='flooring/warehouse-work-sync-v090.js';
const FLOOR_V066='flooring/orders-drawer-v066.js';
const FLOOR_V095='flooring/people-to-call-review-v095.js';
const WAREHOUSE_ROOT='_lab_warehouse_ai';
const WAREHOUSE_PICKUP=`${WAREHOUSE_ROOT}/build094-supplier-pickup.js`;
const WAREHOUSE_INDEX=`${WAREHOUSE_ROOT}/index.html`;
const WAREHOUSE_BUILD129=`${WAREHOUSE_ROOT}/build129-general-internal-transfer-conservation.js`;
const WAREHOUSE_VERSION=`${WAREHOUSE_ROOT}/version.json`;

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const floorV090=read(FLOOR_V090);
const floorV066=read(FLOOR_V066);
const floorV095=read(FLOOR_V095);
const warehousePickup=read(WAREHOUSE_PICKUP);
const warehouseIndex=read(WAREHOUSE_INDEX);
const warehouseBuild129=read(WAREHOUSE_BUILD129);
const warehouseVersion=JSON.parse(read(WAREHOUSE_VERSION));
const cycles=Math.max(100,Number(process.env.RUNLU_CROSS_CYCLES||1000));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const must=(c,m)=>{if(!c)throw new Error(m)};

const F={
  JOB:'runlu_deerfoot_flooring_jobs_v1',
  PO:'runlu_deerfoot_supplier_orders_v1',
  CALL:'runlu_people_to_call_v066',
  ACTIVE:'runlu_deerfoot_flooring_active_job_v1',
  SNAP:'runlu_supplier_pickup_by_po_v1',
  WAREHOUSE_CACHE:'runlu-flooring-warehouse-work-v090'
};
const W={
  INVDB:'runlu_inventory_records_v21',ODB:'runlu_orders_v20',EVENTDB:'runlu_event_history_v52',PMDB:'runlu_product_master_v21',
  CARPETDB:'runlu_carpet_inventory_v52',CUTDB:'runlu_cutting_log_v52',RAMDB:'runlu_remnants_v55'
};

function memoryStorage(){
  const map=new Map(),writes=[];let fail=null;
  return {
    getItem:k=>map.has(String(k))?map.get(String(k)):null,
    setItem(k,v){k=String(k);writes.push(k);if(fail===k){fail=null;throw new Error('LAB injected storage failure: '+k)}map.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);if(fail===k){fail=null;throw new Error('LAB injected storage failure: '+k)}map.delete(k)},
    seed(k,v){map.set(String(k),typeof v==='string'?v:JSON.stringify(v))},
    json:k=>JSON.parse(map.get(String(k))||'null'),raw:k=>map.get(String(k))??null,
    writes:()=>writes.slice(),clearWrites(){writes.length=0},failNext(k){fail=String(k)},
    snapshot:()=>Object.fromEntries([...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])))
  };
}

function quietConsole(){return{log(){},info(){},warn(){},error(){},debug(){}}}
function blockedNetwork(counter,name){return function(){counter.count++;throw new Error('LAB blocked network API: '+name)}}
function miniElement(){return{style:{},dataset:{},classList:{contains(){return false},toggle(){},add(){},remove(){}},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},getAttribute(){return null},addEventListener(){},remove(){},textContent:'',innerHTML:'',value:''}}

function sharedCloud(){
  const tasks=[],events=[],calls=[];let seq=0;
  const findPO=n=>tasks.find(t=>String(t.po_number)===String(n));
  function createSupplierTask(args){
    calls.push({type:'create',args:clone(args)});
    let t=findPO(args.p_po_number);
    if(!t){
      t={id:'TASK-'+(++seq),environment:args.p_environment||'training',po_number:args.p_po_number,job_id:args.p_job_id||'',job_number:args.p_job_number||'',customer_name:args.p_customer_name||'',supplier:args.p_supplier||'Supplier',sales_rep:args.p_sales_rep||'',fulfillment_method:args.p_fulfillment_method||'Pickup',requested_date:args.p_requested_date||null,purchase_type:args.p_purchase_type||'Job-specific',items:clone(args.p_items||[]),received_items:[],status:'Scheduled',warehouse_notes:'',delay_reason:null};
      tasks.push(t);
    }else{
      // Production contract: metadata upsert must not reset Warehouse execution status.
      Object.assign(t,{job_id:args.p_job_id||t.job_id,job_number:args.p_job_number||t.job_number,customer_name:args.p_customer_name||t.customer_name,supplier:args.p_supplier||t.supplier,sales_rep:args.p_sales_rep||t.sales_rep,fulfillment_method:args.p_fulfillment_method||t.fulfillment_method,requested_date:args.p_requested_date||t.requested_date,purchase_type:args.p_purchase_type||t.purchase_type,items:clone(args.p_items||t.items)});
    }
    return clone(t);
  }
  function updateSupplierTask(body){
    calls.push({type:'update',body:clone(body)});
    const t=tasks.find(x=>x.id===body.p_id);if(!t)throw new Error('shared task not found: '+body.p_id);
    const from=t.status;t.status=body.p_status;t.delay_reason=body.p_delay_reason??null;t.warehouse_notes=body.p_warehouse_notes??'';t.received_items=clone(body.p_received_items||[]);
    events.push({id:'EV-'+(events.length+1),po_number:t.po_number,job_number:t.job_number,event_type:'Status Changed',from_status:from,to_status:t.status,occurred_at:new Date().toISOString()});
    return clone(t);
  }
  return {tasks,events,calls,findPO,createSupplierTask,updateSupplierTask};
}

function bootFloorHandoff(storage,cloud){
  const network={count:0};
  const session={user:{id:'LAB-STAFF'},access_token:'LAB'};
  const auth={async getSession(){return{data:{session}}},onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}}};
  function rows(name){if(name==='flooring_supplier_tasks')return cloud.tasks;if(name==='flooring_warehouse_work_events')return cloud.events;return[]}
  function query(name){
    let limitN=null;
    const chain={select(){return chain},eq(){return chain},order(){return chain},limit(n){limitN=n;return chain},then(resolve,reject){let out=clone(rows(name));if(limitN!=null)out=out.slice(0,limitN);return Promise.resolve({data:out,error:null}).then(resolve,reject)}};
    return chain;
  }
  const client={auth,async rpc(name,args){if(name!=='flooring_create_supplier_task')return{data:null,error:{message:'Unexpected RPC '+name}};return{data:cloud.createSupplierTask(args),error:null}},from(name){return query(name)}};
  const doc={readyState:'loading',visibilityState:'visible',documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]},createElement(){return miniElement()},addEventListener(){}};
  const box={document:doc,localStorage:storage,console:quietConsole(),supabase:{createClient(){return client}},alert(){},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},fetch:blockedNetwork(network,'fetch'),XMLHttpRequest:class{constructor(){network.count++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network.count++;throw new Error('LAB blocked WebSocket')}},EventSource:class{constructor(){network.count++;throw new Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,Intl};
  box.window=box;box.addEventListener=()=>{};
  vm.createContext(box,{name:'RUNLU Cross-System Flooring Handoff V090'});
  vm.runInContext(floorV090,box,{filename:FLOOR_V090,timeout:2000});
  must(box.RUNLUWarehouseWorkSyncV090?.version==='0.9.0','Flooring V090 API missing');
  return{box,api:box.RUNLUWarehouseWorkSyncV090,network:()=>network.count};
}

function bootWarehousePickup(cloud){
  const network={count:0},nodes=new Map(),alerts=[];
  const node=id=>{if(!nodes.has(id))nodes.set(id,miniElement());return nodes.get(id)};
  // Render targets used by exact Build094. Inputs for received quantities are added by the test when needed.
  ['fspList','fspScheduled','fspProgress','fspDelayed','fspFilter','fspSearch'].forEach(node);
  class MutationObserver{observe(){}disconnect(){}}
  const doc={readyState:'loading',body:{},getElementById:id=>nodes.get(id)||null,querySelector(){return null},createElement(){return miniElement()},addEventListener(){}};
  async function cloudRequest(path,options={}){
    if(path.startsWith('/rest/v1/flooring_supplier_tasks?'))return clone(cloud.tasks);
    if(path==='/rest/v1/rpc/flooring_update_supplier_task'&&String(options.method||'GET').toUpperCase()==='POST')return cloud.updateSupplierTask(JSON.parse(options.body||'{}'));
    throw new Error('Unexpected Warehouse cloud request: '+path);
  }
  const box={document:doc,console:quietConsole(),localStorage:memoryStorage(),MutationObserver,showPage(){},cloudEnsureSession:async()=>({access_token:'LAB'}),cloudHeaders(){return{}},cloudRequest,alert:m=>alerts.push(String(m)),prompt(){return null},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},fetch:blockedNetwork(network,'fetch'),XMLHttpRequest:class{constructor(){network.count++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network.count++;throw new Error('LAB blocked WebSocket')}},EventSource:class{constructor(){network.count++;throw new Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,Intl};
  box.window=box;box.addEventListener=()=>{};
  vm.createContext(box,{name:'RUNLU Cross-System Warehouse Supplier Pickup Build094'});
  vm.runInContext(warehousePickup,box,{filename:WAREHOUSE_PICKUP,timeout:2000});
  must(typeof box.refreshFlooringSupplierTasks==='function'&&typeof box.updateFlooringSupplierTask==='function','Warehouse Build094 public bridge missing');
  return{box,nodes,node,alerts,network:()=>network.count};
}

function setWarehouseReceivedInputs(w,task,qtys,notes='LAB verified receipt'){
  (task.items||[]).forEach((x,i)=>{
    const q=w.node(`fspQty-${task.id}-${i}`);q.value=String(qtys[i]??x.qty??'');
    const c=w.node(`fspCond-${task.id}-${i}`);c.value='OK';
  });
  w.node('fspNotes-'+task.id).value=notes;
}

function bootFloorSales(storage,notes=new Map()){
  const network={count:0};
  const doc={readyState:'loading',documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(sel){if(sel==='[data-r95-note]')return[...notes].map(([q,v])=>({dataset:{r95Note:q},value:v,style:{}}));return[]},createElement(){return miniElement()},addEventListener(){}};
  class MutationObserver{observe(){}disconnect(){}}
  const box={document:doc,localStorage:storage,console:quietConsole(),MutationObserver,setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){},fetch:blockedNetwork(network,'fetch'),XMLHttpRequest:class{constructor(){network.count++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network.count++;throw new Error('LAB blocked WebSocket')}},EventSource:class{constructor(){network.count++;throw new Error('LAB blocked EventSource')}},URL,URLSearchParams,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,Intl};
  box.window=box;box.addEventListener=()=>{};
  vm.createContext(box,{name:'RUNLU Cross-System Flooring Sales V066+V095'});
  vm.runInContext(floorV066,box,{filename:FLOOR_V066,timeout:2500});
  vm.runInContext(floorV095,box,{filename:FLOOR_V095,timeout:2500});
  must(typeof box.RUNLUOrdersDrawerV066?.syncPeopleToCall==='function','Flooring V066 queue API missing');
  must(box.RUNLUPeopleToCallReviewV095?.version==='0.3.95r1','Flooring V095 route API missing');
  return{box,drawer:box.RUNLUOrdersDrawerV066,review:box.RUNLUPeopleToCallReviewV095,notes,network:()=>network.count};
}

function extractFunction(source,name){
  const needle=`function ${name}`;const start=source.indexOf(needle);if(start<0)throw new Error(`Warehouse production function not found: ${name}`);
  const open=source.indexOf('(',start);let pd=0,q='',esc=false,lc=false,bc=false,close=-1;
  for(let i=open;i<source.length;i++){
    const c=source[i],n=source[i+1];if(lc){if(c==='\n')lc=false;continue}if(bc){if(c==='*'&&n==='/'){bc=false;i++}continue}if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}if(c==='/'&&n==='/'){lc=true;i++;continue}if(c==='/'&&n==='*'){bc=true;i++;continue}if(c==='"'||c==="'"||c==='`'){q=c;continue}if(c==='(')pd++;else if(c===')'&&--pd===0){close=i;break}
  }
  const brace=source.indexOf('{',close+1);let depth=0;q='';esc=false;lc=false;bc=false;
  for(let i=brace;i<source.length;i++){
    const c=source[i],n=source[i+1];if(lc){if(c==='\n')lc=false;continue}if(bc){if(c==='*'&&n==='/'){bc=false;i++}continue}if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}if(c==='/'&&n==='/'){lc=true;i++;continue}if(c==='/'&&n==='*'){bc=true;i++;continue}if(c==='"'||c==="'"||c==='`'){q=c;continue}if(c==='{')depth++;else if(c==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`Unclosed Warehouse production function: ${name}`);
}
const warehouseFunctionNames=['load','save','normalizeText','normKey','loadMasters','loadInventoryRecords','inventoryRecordIdentity','findInventoryRecordByIdentity','ensureOperationProductLink','operationStockQuantity','operationStockUnit','carpetTransferParts','validateOperationForImpact','applyInventoryDelta','applyInventoryTransfer','updateLinkedOrder','applySingleOperationImpact'];
const warehouseExactSource=warehouseFunctionNames.map(n=>extractFunction(warehouseIndex,n)).join('\n\n');

function bootWarehouseExecution(){
  const localStorage=memoryStorage(),alerts=[],network={count:0};
  const doc={documentElement:{setAttribute(){}},getElementById(){return null}};
  const box={console:quietConsole(),localStorage,document:doc,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,Intl,alert:m=>alerts.push(String(m)),queueCloudSave(){},isQuotaError(){return false},pruneLocalApplicationCache(){return{}},aggressiveSafeStorageCleanup(){return{}},renderBackupStatus(){},underlaymentSpec(){return null},normalizeInventoryLifecycleRecord:r=>r,finalizeCustomerOrderInventory(){return{records:0,quantity:0}},fetch:blockedNetwork(network,'fetch'),XMLHttpRequest:class{constructor(){network.count++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){network.count++;throw new Error('LAB blocked WebSocket')}},...W};
  box.window=box;box.addEventListener=()=>{};
  vm.createContext(box,{name:'RUNLU Cross-System Warehouse Actual Execution'});
  vm.runInContext(warehouseExactSource,box,{filename:'warehouse-ai/index.html#exact-execution-functions',timeout:3000});
  vm.runInContext(warehouseBuild129,box,{filename:WAREHOUSE_BUILD129,timeout:1500});
  must(box.applyInventoryTransfer?.__build129InternalTransferConservation===true,'Warehouse Build129 conservation patch missing');
  return{box,localStorage,alerts,network:()=>network.count};
}
function seedWarehouseExecution(e,{a=20,b=5}={}){
  e.localStorage.seed(W.INVDB,[{id:'INV-A',inventoryId:'INV-A',masterId:'P1',location:'A1',quantity:a,unit:'Box',inventoryType:'GENERAL',lifecycleStatus:'ACTIVE',warehouseScope:'warehouse'},{id:'INV-B',inventoryId:'INV-B',masterId:'P1',location:'B1',quantity:b,unit:'Box',inventoryType:'GENERAL',lifecycleStatus:'ACTIVE',warehouseScope:'warehouse'}]);
  e.localStorage.seed(W.PMDB,[{id:'P1',name:'LAB LVP',color:'GREY'}]);
  e.localStorage.seed(W.ODB,[{id:'ORDER-A',poNumber:'181700',status:'In Progress'},{id:'ORDER-B',poNumber:'181701',status:'In Progress'}]);
  e.localStorage.seed(W.EVENTDB,[]);e.localStorage.seed(W.CARPETDB,[]);e.localStorage.seed(W.CUTDB,[]);e.localStorage.seed(W.RAMDB,[]);e.localStorage.clearWrites();
}
function warehouseOp(id,type,qty,po='181700',extra={}){return{id,status:'Completed',type,inventoryMode:'Stock',productId:'P1',inventoryRecordId:'INV-A',product:'LAB LVP',quantity:qty,unit:'Box',location:'A1',po,date:'2026-09-15',...extra}}
function runWarehouseImpact(e,r){const ok=e.box.applySingleOperationImpact(r);must(ok===true,`${r.type} rejected: ${e.alerts.at(-1)||'unknown'}`);return r}
const warehouseTotal=e=>(e.localStorage.json(W.INVDB)||[]).reduce((s,x)=>s+Number(x.quantity||0),0);
const warehouseQtyAt=(e,id)=>Number((e.localStorage.json(W.INVDB)||[]).find(x=>x.inventoryId===id)?.quantity||0);

function seedFlooring(storage){
  const jobs=[{id:'JOB-1',jobNumber:'181600',customerName:'Synthetic Customer',status:'In Progress',peopleToCallHistory:[]}];
  const pos=[
    {id:'PO-A',poNumber:'181700',jobId:'JOB-1',jobNumber:'181600',customerName:'Synthetic Customer',status:'Submitted',supplier:'PROSOL',salesRep:'LAB',fulfillment:'Pickup',requestedDate:'2026-09-20',purchaseType:'Job-specific',items:[{style:'LAB LVP',colour:'GREY',qty:6,unit:'BOX'}]},
    {id:'PO-B',poNumber:'181701',jobId:'JOB-1',jobNumber:'181600',customerName:'Synthetic Customer',status:'Submitted',supplier:'PRIMCO',salesRep:'LAB',fulfillment:'Pickup',requestedDate:'2026-09-22',purchaseType:'Job-specific',items:[{style:'LAB LVP',colour:'GREY',qty:4,unit:'BOX'}]}
  ];
  storage.seed(F.JOB,jobs);storage.seed(F.PO,pos);storage.seed(F.CALL,[]);storage.seed(F.SNAP,{});storage.clearWrites();
}
function markVerifiedFlooringReceipt(storage,cloud,execution,poNumber,expectedQty){
  const task=cloud.findPO(poNumber);must(task?.status==='Ready',`PO ${poNumber} shared task is not Ready`);
  const received=(task.received_items||[]).reduce((s,x)=>s+Number(x.received_qty||0),0);must(received===expectedQty,`PO ${poNumber} shared received qty ${received} != ${expectedQty}`);
  must((execution.localStorage.json(W.EVENTDB)||[]).some(e=>String(e.po||e.poNumber||e.po_number||'')===String(poNumber)||String(e.details||'').includes(String(poNumber)))||warehouseTotal(execution)>25,'Warehouse receipt evidence missing');
  const ps=storage.json(F.PO),p=ps.find(x=>String(x.poNumber)===String(poNumber));must(p,'Flooring PO not found '+poNumber);p.status='Received';p.receivedQty=expectedQty;p.updatedAt=new Date().toISOString();storage.seed(F.PO,ps);
  return p;
}

function check(name,fn){return Promise.resolve().then(fn).then(x=>({name,pass:true,...(x||{})}),err=>({name,pass:false,error:err?.message||String(err)}))}

async function scenarios(){
  const out=[];
  out.push(await check('Exact cross-system modules load with expected safety contracts',async()=>{
    const storage=memoryStorage(),cloud=sharedCloud();seedFlooring(storage);
    const h=bootFloorHandoff(storage,cloud),s=bootFloorSales(storage),w=bootWarehousePickup(cloud),x=bootWarehouseExecution();
    must(h.api.version==='0.9.0','V090 version');must(s.review.poStatusImmutable&&s.review.atomicReviewCommit,'V095 safety flags');must(typeof s.drawer.syncPeopleToCall==='function','V066 queue sync');must(typeof w.box.updateFlooringSupplierTask==='function','Build094 update API');must(x.box.applyInventoryTransfer.__build129InternalTransferConservation===true,'Build129 flag');
    must(h.network()+s.network()+w.network()+x.network()===0,'network attempted');
    return{flooring:{handoff:h.api.version,sales:s.review.version},warehouse:{runtime:`${warehouseVersion.version} Build${warehouseVersion.build}`,build129:true}};
  }));

  out.push(await check('Two-PO Job crosses Flooring → Warehouse → People TO Call → Pick Up → People TO Call → Active',async()=>{
    const storage=memoryStorage(),cloud=sharedCloud();seedFlooring(storage);const poBytesBefore=storage.raw(F.PO);
    const handoff=bootFloorHandoff(storage,cloud);await handoff.api.refresh(false);await handoff.api.refresh(false);
    must(cloud.tasks.length===2,'duplicate handoff created duplicate tasks: '+cloud.tasks.length);must(storage.raw(F.PO)===poBytesBefore,'Flooring V090 mutated PO bytes');
    const wh=bootWarehousePickup(cloud);await wh.box.refreshFlooringSupplierTasks();
    const exec=bootWarehouseExecution();seedWarehouseExecution(exec);const opening=warehouseTotal(exec);

    const ta=cloud.findPO('181700');must(ta,'PO-A task missing');
    setWarehouseReceivedInputs(wh,ta,[''], 'partial pickup started');await wh.box.updateFlooringSupplierTask(ta.id,'In Progress');
    must(storage.json(F.CALL).length===0,'People TO Call opened before PO receipt was verified');
    setWarehouseReceivedInputs(wh,ta,[6]);await wh.box.updateFlooringSupplierTask(ta.id,'Ready');
    const receiveA=warehouseOp(10,'Supplier Pickup / Receiving / Put-away',6,'181700');runWarehouseImpact(exec,receiveA);const once=warehouseTotal(exec);runWarehouseImpact(exec,receiveA);must(warehouseTotal(exec)===once,'same Warehouse receipt object applied twice');
    markVerifiedFlooringReceipt(storage,cloud,exec,'181700',6);

    const sales=bootFloorSales(storage,new Map([['ptc-JOB-1','Remaining material requires second pickup']]));sales.drawer.syncPeopleToCall();
    let q=storage.json(F.CALL)[0];must(q?.status==='Not Called'&&JSON.stringify(q.sourcePOs)===JSON.stringify(['181700']),'first People TO Call queue wrong');
    const beforeSalesPO=storage.raw(F.PO);must(sales.review.route(q.id,'JOB-1','pickup')===true,'pickup review failed');must(storage.raw(F.PO)===beforeSalesPO,'Sales pickup route mutated Received PO');
    let j=storage.json(F.JOB)[0];must(j.salesMaterialRoute==='pickup'&&j.orderDrawerOverride==='back','Job not routed to Pick Up');

    const tb=cloud.findPO('181701');must(tb,'PO-B task missing');setWarehouseReceivedInputs(wh,tb,[4]);await wh.box.updateFlooringSupplierTask(tb.id,'Ready');runWarehouseImpact(exec,warehouseOp(20,'Supplier Pickup / Receiving / Put-away',4,'181701'));markVerifiedFlooringReceipt(storage,cloud,exec,'181701',4);
    sales.drawer.syncPeopleToCall();q=storage.json(F.CALL)[0];must(q.status==='Not Called','second received PO did not reopen People TO Call');must(JSON.stringify(q.sourcePOs)===JSON.stringify(['181700','181701']),'sourcePOs not expanded');
    const beforeFinalSalesPO=storage.raw(F.PO);must(sales.review.route(q.id,'JOB-1','active')===true,'active review failed');must(storage.raw(F.PO)===beforeFinalSalesPO,'Sales active route mutated PO');j=storage.json(F.JOB)[0];must(j.salesMaterialRoute==='active'&&j.orderDrawerOverride==='active','Job not Active');must(storage.json(F.PO).every(p=>p.status==='Received'),'PO status changed after sales review');
    must(warehouseTotal(exec)===opening+10,'Warehouse receiving total mismatch');must(handoff.network()+wh.network()+sales.network()+exec.network()===0,'network attempted');
    return{sharedTasks:cloud.tasks.length,warehouseOpening:opening,warehouseAfterReceiving:warehouseTotal(exec),peopleToCallReopened:true,finalJobRoute:j.salesMaterialRoute,poStatuses:storage.json(F.PO).map(p=>p.status)};
  }));

  out.push(await check('Warehouse downstream transfer / shipping / returns conserve the verified receipt ledger',async()=>{
    const e=bootWarehouseExecution();seedWarehouseExecution(e);const opening=warehouseTotal(e);
    runWarehouseImpact(e,warehouseOp(30,'Supplier Pickup / Receiving / Put-away',10,'181700'));
    runWarehouseImpact(e,warehouseOp(31,'Inventory Transfer',4,'181700',{toLocation:'B1',transferRoute:'Warehouse → Warehouse'}));
    runWarehouseImpact(e,warehouseOp(32,'Shipping',5,'181700'));
    runWarehouseImpact(e,warehouseOp(33,'Customer Return',2,'181700'));
    runWarehouseImpact(e,warehouseOp(34,'Return to Supplier',1,'181700'));
    const expected=opening+10-5+2-1;must(warehouseTotal(e)===expected,`Warehouse conservation ${warehouseTotal(e)} != ${expected}`);must(warehouseQtyAt(e,'INV-B')===9,'internal destination not credited');must(e.network()===0,'network attempted');
    return{opening,expected,actual:warehouseTotal(e),A1:warehouseQtyAt(e,'INV-A'),B1:warehouseQtyAt(e,'INV-B'),events:e.localStorage.json(W.EVENTDB).length};
  }));

  out.push(await check('Sales review rollback remains atomic inside the cross-system harness',async()=>{
    const storage=memoryStorage();seedFlooring(storage);const ps=storage.json(F.PO);ps[0].status='Received';storage.seed(F.PO,ps);const sales=bootFloorSales(storage);sales.drawer.syncPeopleToCall();const q=storage.json(F.CALL)[0],before=JSON.stringify(storage.snapshot());storage.failNext(F.CALL);must(sales.review.route(q.id,'JOB-1','pickup')===false,'injected second write failure reported success');must(JSON.stringify(storage.snapshot())===before,'cross-system sales rollback mismatch');return{rollback:true};
  }));

  out.push(await check('Job/PO identity isolation prevents one received PO from routing another Job',async()=>{
    const storage=memoryStorage();seedFlooring(storage);const jobs=storage.json(F.JOB);jobs.push({id:'JOB-2',jobNumber:'181699',customerName:'Other Synthetic',status:'In Progress'});storage.seed(F.JOB,jobs);const ps=storage.json(F.PO);ps.push({id:'PO-X',poNumber:'181799',jobId:'JOB-2',jobNumber:'181699',status:'Received',supplier:'TAIGA',fulfillment:'Pickup',items:[{style:'Other',qty:1,unit:'BOX'}]});ps[0].status='Received';storage.seed(F.PO,ps);const sales=bootFloorSales(storage);sales.drawer.syncPeopleToCall();const qs=storage.json(F.CALL);must(qs.length===2,'expected two isolated People TO Call queues');const q1=qs.find(q=>q.orderId==='JOB-1'),q2=qs.find(q=>q.orderId==='JOB-2');must(q1&&q2,'queue identity crossed');const before2=clone(storage.json(F.JOB).find(j=>j.id==='JOB-2'));must(sales.review.route(q1.id,'JOB-1','pickup')===true,'JOB-1 route failed');must(JSON.stringify(storage.json(F.JOB).find(j=>j.id==='JOB-2'))===JSON.stringify(before2),'JOB-2 mutated');must(storage.json(F.CALL).find(q=>q.id===q2.id).status!=='Done','JOB-2 queue closed by JOB-1 review');return{queues:qs.map(q=>({id:q.id,orderId:q.orderId}))};
  }));
  return out;
}

function stressSalesLoop(n){
  let completed=0,failure=null;
  for(let i=0;i<n;i++){
    try{
      const storage=memoryStorage();const jobId='J-'+i,jobNo=String(300000+i),poA=String(400000+i*2),poB=String(400001+i*2);
      storage.seed(F.JOB,[{id:jobId,jobNumber:jobNo,customerName:'Synthetic '+i,status:'In Progress'}]);storage.seed(F.PO,[{id:'A-'+i,poNumber:poA,jobId,jobNumber:jobNo,status:'Received',supplier:'S1',fulfillment:'Pickup'},{id:'B-'+i,poNumber:poB,jobId,jobNumber:jobNo,status:'Submitted',supplier:'S2',fulfillment:'Pickup'}]);storage.seed(F.CALL,[]);
      const sales=bootFloorSales(storage);sales.drawer.syncPeopleToCall();let q=storage.json(F.CALL)[0];must(q&&q.sourcePOs.length===1,`cycle ${i}: first queue`);const poBefore=storage.raw(F.PO);must(sales.review.route(q.id,jobId,'pickup')===true,`cycle ${i}: pickup route`);must(storage.raw(F.PO)===poBefore,`cycle ${i}: pickup mutated PO`);
      const ps=storage.json(F.PO);ps[1].status='Received';storage.seed(F.PO,ps);sales.drawer.syncPeopleToCall();q=storage.json(F.CALL)[0];must(q.status==='Not Called'&&q.sourcePOs.length===2,`cycle ${i}: queue not reopened`);const poBeforeActive=storage.raw(F.PO);must(sales.review.route(q.id,jobId,'active')===true,`cycle ${i}: active route`);must(storage.raw(F.PO)===poBeforeActive,`cycle ${i}: active mutated PO`);must(storage.json(F.JOB)[0].salesMaterialRoute==='active',`cycle ${i}: final route`);must(sales.network()===0,`cycle ${i}: network`);completed++;
    }catch(err){failure={cycle:i,error:err?.message||String(err)};break}
  }
  return{pass:!failure,cyclesRequested:n,cyclesCompleted:completed,failure};
}

const tests=await scenarios();
const stress=stressSalesLoop(cycles);
const pass=tests.every(x=>x.pass)&&stress.pass;
const evidence={
  schema:'runlu.flooring-warehouse.cross-system-lab.v1',version:'0.7.0',generatedAt:new Date().toISOString(),pass,
  source:{
    flooring:[{file:FLOOR_V090,sha256:sha(floorV090)},{file:FLOOR_V066,sha256:sha(floorV066)},{file:FLOOR_V095,sha256:sha(floorV095)}],
    warehouse:{runtime:`${warehouseVersion.version} Build${warehouseVersion.build}`,files:[{file:'build094-supplier-pickup.js',sha256:sha(warehousePickup)},{file:'index.html exact execution functions',sha256:sha(warehouseExactSource)},{file:'build129-general-internal-transfer-conservation.js',sha256:sha(warehouseBuild129)}]}
  },
  scenarios:{passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests},stress,
  isolation:{productionSupabaseAccess:false,realNetworkApisBlocked:true,hostLocalStorageAccess:false,storage:'ephemeral in-memory stores',sharedCloud:'in-memory Flooring/Warehouse supplier-task transport',warehouseRepoCheckout:'pinned by CI workflow'},
  boundaries:[
    'Executes exact Flooring V090 handoff/observer, V066 People TO Call sync, and V095 sales-review source from this repository.',
    'Executes exact Warehouse Build094 supplier-pickup bridge plus exact current Warehouse inventory mutation functions and active Build129 conservation patch from the pinned warehouse-ai checkout.',
    'The LAB deliberately does not invent an automatic cross-repo PO-status writer. After both the shared task and Warehouse inventory receipt are verified, the harness advances the synthetic Flooring PO to Received to exercise the documented authority boundary.',
    'This verifies isolated cross-system business logic and identity/state conservation; it is not live Supabase or real-browser certification.'
  ]
};
fs.writeFileSync('flooring-warehouse-cross-system-v070-report.json',JSON.stringify(evidence,null,2));
for(const t of tests)console.log(`${t.pass?'PASS':'FAIL'} · ${t.name}${t.error?' · '+t.error:''}`);
console.log(`${stress.pass?'PASS':'FAIL'} · two-PO People TO Call loop stress · ${stress.cyclesCompleted}/${stress.cyclesRequested}`);
console.log(`Warehouse runtime · ${evidence.source.warehouse.runtime}`);
console.log('Isolation · shared in-memory cloud + VM storage only · real network blocked');
console.log(`CROSS-SYSTEM LAB V0.7: ${pass?'PASS':'FAIL'}`);
if(!pass){if(stress.failure)console.error(stress.failure);process.exit(1)}
