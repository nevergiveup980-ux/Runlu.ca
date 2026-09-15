import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ACK_FILE='flooring/warehouse-receipt-ack-v098.js';
const DRAWER_FILE='flooring/orders-drawer-v066.js';
const REVIEW_FILE='flooring/people-to-call-review-v095.js';
const WROOT='_lab_warehouse_ai';
const WINDEX=`${WROOT}/index.html`;
const WVERSION=`${WROOT}/version.json`;
const ackSource=fs.readFileSync(new URL('../'+ACK_FILE,import.meta.url),'utf8');
const drawerSource=fs.readFileSync(new URL('../'+DRAWER_FILE,import.meta.url),'utf8');
const reviewSource=fs.readFileSync(new URL('../'+REVIEW_FILE,import.meta.url),'utf8');
const warehouseIndex=fs.readFileSync(new URL('../'+WINDEX,import.meta.url),'utf8');
const warehouseVersion=JSON.parse(fs.readFileSync(new URL('../'+WVERSION,import.meta.url),'utf8'));
const cycles=Math.max(100,Number(process.env.RUNLU_RECEIPT_ACK_CYCLES||1000));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const must=(c,m)=>{if(!c)throw new Error(m)};

const F={JOB:'runlu_deerfoot_flooring_jobs_v1',PO:'runlu_deerfoot_supplier_orders_v1',CALL:'runlu_people_to_call_v066',ACTIVE:'runlu_deerfoot_flooring_active_job_v1',CACHE:'runlu-flooring-warehouse-work-v090'};
const W={INVDB:'runlu_inventory_records_v21',ODB:'runlu_orders_v20',EVENTDB:'runlu_event_history_v52',PMDB:'runlu_product_master_v21',CARPETDB:'runlu_carpet_inventory_v52',CUTDB:'runlu_cutting_log_v52',RAMDB:'runlu_remnants_v55'};

function storage(){
  const m=new Map(),writes=[];let fail=null;
  return {
    getItem:k=>m.has(String(k))?m.get(String(k)):null,
    setItem(k,v){k=String(k);writes.push(k);if(fail===k){fail=null;throw new Error('LAB injected storage failure: '+k)}m.set(k,String(v))},
    removeItem(k){k=String(k);writes.push(k);if(fail===k){fail=null;throw new Error('LAB injected storage failure: '+k)}m.delete(k)},
    seed(k,v){m.set(String(k),typeof v==='string'?v:JSON.stringify(v))},raw:k=>m.get(String(k))??null,json:k=>JSON.parse(m.get(String(k))||'null'),
    writes:()=>writes.slice(),clearWrites(){writes.length=0},failNext(k){fail=String(k)},reset(){m.clear();writes.length=0;fail=null},
    snapshot:()=>Object.fromEntries([...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])))
  };
}
function quiet(){return{log(){},info(){},warn(){},error(){},debug(){}}}
function blocked(counter,name){return function(){counter.count++;throw new Error('LAB blocked network API: '+name)}}
function elem(){return{style:{},dataset:{},classList:{contains(){return false},toggle(){},add(){},remove(){}},appendChild(){},prepend(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},getAttribute(){return null},addEventListener(){},remove(){},closest(){return null},textContent:'',innerHTML:'',value:''}}

function bootFlooring(){
  const s=storage(),notes=new Map(),net={count:0};
  const document={readyState:'loading',visibilityState:'visible',documentElement:{dataset:{}},head:{appendChild(){}},body:{appendChild(){},prepend(){}},
    getElementById(){return null},querySelector(){return null},querySelectorAll(sel){if(sel==='[data-r95-note]')return[...notes].map(([q,v])=>({dataset:{r95Note:q},value:v,style:{}}));return[]},createElement(){return elem()},addEventListener(){}};
  class MutationObserver{observe(){}disconnect(){}}
  const window={document,localStorage:s,console:quiet(),MutationObserver,addEventListener(){},setTimeout(){return 0},clearTimeout(){},setInterval(){return 0},clearInterval(){}};window.window=window;
  const box={window,document,localStorage:s,console:window.console,MutationObserver,Intl,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,URL,URLSearchParams,
    setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,setInterval:window.setInterval,clearInterval:window.clearInterval,
    fetch:blocked(net,'fetch'),XMLHttpRequest:class{constructor(){net.count++;throw new Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){net.count++;throw new Error('LAB blocked WebSocket')}},EventSource:class{constructor(){net.count++;throw new Error('LAB blocked EventSource')}}};
  vm.createContext(box,{name:'RUNLU Flooring Receipt Ack V0.8'});
  vm.runInContext(drawerSource,box,{filename:DRAWER_FILE,timeout:1500});
  const drawer=window.RUNLUOrdersDrawerV066;must(drawer&&typeof drawer.syncPeopleToCall==='function','Orders Drawer authority missing');
  window.RUNLUOrdersDrawerV066={syncPeopleToCall:drawer.syncPeopleToCall,refresh(){}};
  vm.runInContext(reviewSource,box,{filename:REVIEW_FILE,timeout:1500});
  vm.runInContext(ackSource,box,{filename:ACK_FILE,timeout:1500});
  const ack=window.RUNLUWarehouseReceiptAckV098,review=window.RUNLUPeopleToCallReviewV095;
  must(ack&&typeof ack.acknowledgePO==='function','receipt ack candidate missing');must(review&&typeof review.route==='function','sales review authority missing');
  return{s,notes,ack,review,net:()=>net.count,window};
}

function extractFunction(name){
  const needle=`function ${name}`;const start=warehouseIndex.indexOf(needle);if(start<0)throw new Error('Warehouse function missing: '+name);
  const open=warehouseIndex.indexOf('(',start);let pd=0,q='',esc=false,lc=false,bc=false,close=-1;
  for(let i=open;i<warehouseIndex.length;i++){const c=warehouseIndex[i],n=warehouseIndex[i+1];if(lc){if(c==='\n')lc=false;continue}if(bc){if(c==='*'&&n==='/'){bc=false;i++}continue}if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}if(c==='/'&&n==='/'){lc=true;i++;continue}if(c==='/'&&n==='*'){bc=true;i++;continue}if(c==='"'||c==="'"||c==='`'){q=c;continue}if(c==='(')pd++;else if(c===')'&&--pd===0){close=i;break}}
  const brace=warehouseIndex.indexOf('{',close+1);let depth=0;q='';esc=false;lc=false;bc=false;
  for(let i=brace;i<warehouseIndex.length;i++){const c=warehouseIndex[i],n=warehouseIndex[i+1];if(lc){if(c==='\n')lc=false;continue}if(bc){if(c==='*'&&n==='/'){bc=false;i++}continue}if(q){if(esc){esc=false;continue}if(c==='\\'){esc=true;continue}if(c===q)q='';continue}if(c==='/'&&n==='/'){lc=true;i++;continue}if(c==='/'&&n==='*'){bc=true;i++;continue}if(c==='"'||c==="'"||c==='`'){q=c;continue}if(c==='{')depth++;else if(c==='}'&&--depth===0)return warehouseIndex.slice(start,i+1)}
  throw new Error('Unclosed Warehouse function: '+name);
}
const warehouseFns=['load','save','normalizeText','normKey','loadMasters','loadInventoryRecords','inventoryRecordIdentity','findInventoryRecordByIdentity','ensureOperationProductLink','operationStockQuantity','operationStockUnit','carpetTransferParts','validateOperationForImpact','applyInventoryDelta','applyInventoryTransfer','updateLinkedOrder','applySingleOperationImpact'];
const warehouseExact=warehouseFns.map(extractFunction).join('\n\n');
function bootWarehouse(){
  const s=storage(),net={count:0},alerts=[];const document={documentElement:{setAttribute(){}},getElementById(){return null}};
  const box={console:quiet(),localStorage:s,document,Date,JSON,Math,Number,String,Array,Object,Boolean,RegExp,Error,TypeError,Promise,Map,Set,...W,
    alert:m=>alerts.push(String(m)),queueCloudSave(){},isQuotaError(){return false},pruneLocalApplicationCache(){return{}},aggressiveSafeStorageCleanup(){return{}},renderBackupStatus(){},underlaymentSpec(){return null},normalizeInventoryLifecycleRecord:r=>r,finalizeCustomerOrderInventory(){return{records:0,quantity:0}},
    fetch:blocked(net,'fetch'),XMLHttpRequest:class{constructor(){net.count++;throw Error('LAB blocked XMLHttpRequest')}},WebSocket:class{constructor(){net.count++;throw Error('LAB blocked WebSocket')}}};box.window=box;box.window.addEventListener=()=>{};
  vm.createContext(box,{name:'RUNLU Warehouse Receipt Proof V0.8'});vm.runInContext(warehouseExact,box,{filename:'warehouse-index-exact-functions',timeout:2000});return{s,box,alerts,net:()=>net.count};
}
function seedWarehouse(e){
  e.s.seed(W.PMDB,[{id:'P1',name:'LAB TILE',color:'GREY'},{id:'P2',name:'LAB ADHESIVE',color:'WHITE'}]);
  e.s.seed(W.INVDB,[{id:'INV1',inventoryId:'INV1',masterId:'P1',location:'A1',quantity:0,unit:'Box',inventoryType:'GENERAL',lifecycleStatus:'ACTIVE',warehouseScope:'warehouse'},{id:'INV2',inventoryId:'INV2',masterId:'P2',location:'A2',quantity:0,unit:'Pail',inventoryType:'GENERAL',lifecycleStatus:'ACTIVE',warehouseScope:'warehouse'}]);
  e.s.seed(W.ODB,[]);e.s.seed(W.EVENTDB,[]);e.s.seed(W.CARPETDB,[]);e.s.seed(W.CUTDB,[]);e.s.seed(W.RAMDB,[]);e.s.clearWrites();
}
function whReceive(e,{id,po,productId,inventoryRecordId,product,quantity,unit,location}){
  const r={id,status:'Completed',type:'Supplier Pickup / Receiving / Put-away',inventoryMode:'Stock',productId,inventoryRecordId,product,quantity,unit,location,po:String(po),date:'2026-09-15',customer:'',supplier:'LAB SUPPLIER'};
  const ok=e.box.applySingleOperationImpact(r);must(ok===true,'Warehouse receipt rejected: '+(e.alerts.at(-1)||'unknown'));must(r.impactApplied===true,'Warehouse receipt did not mark impactApplied');return r;
}
function task(po,qty=10,extra={}){return{id:'TASK-'+po,po_number:Number(po),status:'Ready',fulfillment_method:'Pickup',items:[{style:'LAB TILE',colour:'GREY',qty,unit:'box'}],received_items:[{style:'LAB TILE',colour:'GREY',ordered_qty:String(qty),received_qty:String(qty),condition:'OK'}],...extra}}
function certify(taskRow,ops){
  const k=String(taskRow.po_number),ordered=taskRow.items||[],received=taskRow.received_items||[];must(ordered.length&&received.length===ordered.length,'certificate task lines invalid');
  must(ops.length===ordered.length,'certificate operation count mismatch');
  const verified=[];
  for(let i=0;i<ordered.length;i++){const o=ops[i],oq=Number(ordered[i].qty),rq=Number(received[i].received_qty);must(o&&o.impactApplied&&o.status==='Completed'&&o.type==='Supplier Pickup / Receiving / Put-away','operation not inventory-applied');must(String(o.po).replace(/\D/g,'')===String(k).replace(/\D/g,''),'operation PO mismatch');must(Number(o.quantity)===oq&&rq===oq,'operation quantity mismatch');must(String(o.unit||'').toLowerCase()===String(ordered[i].unit||'').toLowerCase(),'operation unit mismatch');verified.push({ordered_qty:oq,received_qty:rq,operation_id:String(o.id)})}
  return {...clone(taskRow),inventory_verified:true,inventory_verified_po_number:k,inventory_verified_at:'2026-09-15T22:30:00.000Z',inventory_operation_ids:ops.map(o=>String(o.id)),inventory_verified_items:verified};
}
function seedFloor(e,{jobs,pos,tasks}){e.s.reset();e.notes.clear();e.s.seed(F.JOB,jobs);e.s.seed(F.PO,pos);e.s.seed(F.CALL,[]);e.s.seed(F.CACHE,{tasks,events:[],lastSync:'LAB'});e.s.clearWrites()}
function job(id,num){return{id,jobNumber:String(num),customerName:'Synthetic Customer',status:'In Progress',peopleToCallHistory:[]}}
function po(id,jid,num,poNum,qty=10,extra={}){return{id,jobId:jid,jobNumber:String(num),poNumber:String(poNum),customerName:'Synthetic Customer',status:'Submitted',supplier:'LAB SUPPLIER',fulfillment:'Pickup',items:[{style:'LAB TILE',colour:'GREY',qty,unit:'BOX'}],...extra}}
function check(name,fn){try{return{name,pass:true,...(fn()||{})}}catch(e){return{name,pass:false,error:e?.message||String(e)}}

const tests=[];
tests.push(check('Candidate exposes fail-closed safety contract',()=>{const e=bootFlooring();must(e.ack.version==='0.9.8','version');must(e.ack.requiresInventoryCertificate&&e.ack.requiresFullReceipt&&e.ack.duplicateEvidenceFailsClosed&&e.ack.atomicPOAndPeopleToCall,'safety flags');must(e.ack.productionAutoInstall===false,'candidate auto-installs');return{version:e.ack.version}}));

tests.push(check('Exact Warehouse receipt creates inventory proof used by one full PO acknowledgement',()=>{
  const w=bootWarehouse();seedWarehouse(w);const op=whReceive(w,{id:8001,po:181700,productId:'P1',inventoryRecordId:'INV1',product:'LAB TILE',quantity:10,unit:'Box',location:'A1'});must(w.s.json(W.INVDB).find(x=>x.id==='INV1').quantity===10,'Warehouse stock not posted');const t=certify(task(181700),[op]);
  const f=bootFlooring(),j=job('J1',181700),p=po('PO1','J1',181700,181700);seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const r=f.ack.acknowledgePO('181700');must(r.ok&&r.changed&&r.code==='ACKNOWLEDGED','ack failed '+JSON.stringify(r));must(f.s.json(F.PO)[0].status==='Received','PO not Received');const q=f.s.json(F.CALL)[0];must(q&&q.status==='Not Called'&&q.sourcePOs.includes('181700'),'People TO Call not created');must(w.net()===0&&f.net()===0,'network attempted');return{warehouseQty:10,poStatus:'Received',peopleToCall:q.status};
}));

for(const [name,mutate,code] of [
  ['Missing inventory certificate is blocked',t=>t,'INVENTORY_NOT_VERIFIED'],
  ['Partial received quantity is blocked',t=>{t.received_items[0].received_qty='9';return t},'NOT_FULL_RECEIPT'],
  ['Over received quantity is blocked',t=>{t.received_items[0].received_qty='11';return t},'NOT_FULL_RECEIPT'],
  ['Blank received quantity is blocked',t=>{t.received_items[0].received_qty='';return t},'INVALID_QUANTITY'],
  ['Non-final Warehouse task is blocked',t=>{t.status='In Progress';return t},'TASK_NOT_RECEIVED'],
  ['Certificate PO mismatch is blocked',t=>{t.inventory_verified_po_number='999999';return t},'CERT_PO_MISMATCH'],
  ['Certificate quantity mismatch is blocked',t=>{t.inventory_verified_items[0].received_qty=9;return t},'CERT_QUANTITY_MISMATCH']
])tests.push(check(name,()=>{const f=bootFlooring(),j=job('J1',181701),p=po('PO1','J1',181701,181701);let t=task(181701);if(code!=='INVENTORY_NOT_VERIFIED')t={...t,inventory_verified:true,inventory_verified_po_number:'181701',inventory_verified_at:'LAB',inventory_operation_ids:['OP1'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};t=mutate(t);seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const before=JSON.stringify(f.s.snapshot()),r=f.ack.acknowledgePO('181701');must(!r.ok&&r.code===code,`expected ${code}, got ${r.code}`);must(JSON.stringify(f.s.snapshot())===before,'blocked evidence mutated state');return{blocked:code}}));

tests.push(check('Duplicate Warehouse task rows fail closed',()=>{const f=bootFlooring(),j=job('J1',181702),p=po('PO1','J1',181702,181702),t={...task(181702),inventory_verified:true,inventory_verified_po_number:'181702',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t,{...t,id:'TASK-DUP'}]});const before=JSON.stringify(f.s.snapshot()),r=f.ack.acknowledgePO(181702);must(!r.ok&&r.code==='DUPLICATE_WAREHOUSE_TASK','duplicate task accepted');must(JSON.stringify(f.s.snapshot())===before,'mutation');return{safeReject:true}}));
tests.push(check('Duplicate local PO rows fail closed',()=>{const f=bootFlooring(),j=job('J1',181703),p=po('PO1','J1',181703,181703),t={...task(181703),inventory_verified:true,inventory_verified_po_number:'181703',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p,{...p,id:'PO2'}],tasks:[t]});const before=JSON.stringify(f.s.snapshot()),r=f.ack.acknowledgePO(181703);must(!r.ok&&r.code==='DUPLICATE_LOCAL_PO','duplicate PO accepted');must(JSON.stringify(f.s.snapshot())===before,'mutation');return{safeReject:true}}));
tests.push(check('Local line count mismatch fails closed',()=>{const f=bootFlooring(),j=job('J1',181704),p=po('PO1','J1',181704,181704),t={...task(181704),inventory_verified:true,inventory_verified_po_number:'181704',inventory_verified_at:'LAB',inventory_operation_ids:['OP1','OP2'],items:[{style:'LAB TILE',colour:'GREY',qty:10,unit:'box'},{style:'LAB ADHESIVE',colour:'WHITE',qty:2,unit:'pail'}],received_items:[{ordered_qty:10,received_qty:10},{ordered_qty:2,received_qty:2}],inventory_verified_items:[{ordered_qty:10,received_qty:10},{ordered_qty:2,received_qty:2}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const r=f.ack.acknowledgePO(181704);must(!r.ok&&r.code==='LOCAL_LINE_COUNT','line mismatch accepted');return{safeReject:true}}));

tests.push(check('Acknowledgement is durable-idempotent on refresh/retry',()=>{const f=bootFlooring(),j=job('J1',181705),p=po('PO1','J1',181705,181705),t={...task(181705),inventory_verified:true,inventory_verified_po_number:'181705',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});must(f.ack.acknowledgePO(181705).changed,'first ack');const before=f.s.raw(F.PO),hist=f.s.json(F.PO)[0].warehouseReceiptHistory.length;f.s.clearWrites();const r=f.ack.acknowledgePO(181705);must(r.ok&&!r.changed&&r.code==='ALREADY_ACKNOWLEDGED','retry not idempotent');must(f.s.raw(F.PO)===before&&f.s.json(F.PO)[0].warehouseReceiptHistory.length===hist,'retry mutated PO');must(f.s.writes().length===0,'retry wrote storage');return{history:hist}}));

tests.push(check('PO-store write failure leaves exact pre-ack state',()=>{const f=bootFlooring(),j=job('J1',181706),p=po('PO1','J1',181706,181706),t={...task(181706),inventory_verified:true,inventory_verified_po_number:'181706',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const before=JSON.stringify(f.s.snapshot());f.s.failNext(F.PO);const r=f.ack.acknowledgePO(181706);must(!r.ok&&r.code==='PO_WRITE_FAILED','write failure reported success');must(JSON.stringify(f.s.snapshot())===before,'PO failure rollback mismatch');return{safeRollback:true}}));
tests.push(check('People TO Call write failure rolls PO + queue back exactly',()=>{const f=bootFlooring(),j=job('J1',181707),p=po('PO1','J1',181707,181707),t={...task(181707),inventory_verified:true,inventory_verified_po_number:'181707',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const before=JSON.stringify(f.s.snapshot());f.s.failNext(F.CALL);const r=f.ack.acknowledgePO(181707);must(!r.ok&&r.code==='PEOPLE_TO_CALL_COMMIT_FAILED','queue failure reported success');must(JSON.stringify(f.s.snapshot())===before,'cross-store rollback mismatch');return{rollback:r.rollback}}));

tests.push(check('Supplier Delivery is safely held until People TO Call authority supports it',()=>{const f=bootFlooring(),j=job('J1',181708),p=po('PO1','J1',181708,181708,10,{fulfillment:'Supplier Delivery'}),t={...task(181708),fulfillment_method:'Supplier Delivery',inventory_verified:true,inventory_verified_po_number:'181708',inventory_verified_at:'LAB',inventory_operation_ids:['OP'],inventory_verified_items:[{ordered_qty:10,received_qty:10}]};seedFloor(f,{jobs:[j],pos:[p],tasks:[t]});const before=JSON.stringify(f.s.snapshot()),r=f.ack.acknowledgePO(181708);must(!r.ok&&r.code==='PEOPLE_TO_CALL_COMMIT_FAILED','delivery bypassed queue authority');must(JSON.stringify(f.s.snapshot())===before,'delivery hold mutated state');return{held:true}}));

tests.push(check('Two-PO Job closes the full Warehouse → People TO Call → Pick Up → People TO Call → Active loop',()=>{
  const w=bootWarehouse();seedWarehouse(w);const op1=whReceive(w,{id:9001,po:181710,productId:'P1',inventoryRecordId:'INV1',product:'LAB TILE',quantity:10,unit:'Box',location:'A1'});const op2=whReceive(w,{id:9002,po:181711,productId:'P2',inventoryRecordId:'INV2',product:'LAB ADHESIVE',quantity:2,unit:'Pail',location:'A2'});
  const t1=certify(task(181710),[op1]);const t2base=task(181711,2,{items:[{style:'LAB ADHESIVE',colour:'WHITE',qty:2,unit:'pail'}],received_items:[{style:'LAB ADHESIVE',colour:'WHITE',ordered_qty:'2',received_qty:'2',condition:'OK'}]});const t2=certify(t2base,[op2]);
  const f=bootFlooring(),j=job('JLOOP',181799),p1=po('P1','JLOOP',181799,181710),p2=po('P2','JLOOP',181799,181711,2,{items:[{style:'LAB ADHESIVE',colour:'WHITE',qty:2,unit:'PAIL'}]});seedFloor(f,{jobs:[j],pos:[p1,p2],tasks:[t1,t2]});
  must(f.ack.acknowledgePO(181710).ok,'first ack');let q=f.s.json(F.CALL)[0];f.notes.set(q.id,'Second PO still pending');must(f.review.route(q.id,'JLOOP','pickup')===true,'pickup route failed');must(f.s.json(F.PO).find(x=>x.id==='P1').status==='Received'&&f.s.json(F.PO).find(x=>x.id==='P2').status==='Submitted','PO split wrong after first review');
  must(f.ack.acknowledgePO(181711).ok,'second ack');q=f.s.json(F.CALL)[0];must(q.status==='Not Called'&&q.sourcePOs.length===2,'People TO Call did not reopen');f.notes.set(q.id,'All material verified received');must(f.review.route(q.id,'JLOOP','active')===true,'active route failed');const jf=f.s.json(F.JOB)[0];must(jf.salesMaterialRoute==='active'&&jf.orderDrawerOverride==='active','Job not Active');must(f.s.json(F.PO).every(x=>x.status==='Received'),'Sales route mutated PO');must(w.net()===0&&f.net()===0,'network attempted');return{warehouse:[w.s.json(W.INVDB).find(x=>x.id==='INV1').quantity,w.s.json(W.INVDB).find(x=>x.id==='INV2').quantity],finalRoute:jf.salesMaterialRoute,sourcePOs:q.sourcePOs};
}));

function stress(n){let completed=0,failure=null;for(let i=0;i<n;i++){try{const f=bootFlooring(),jobNo=300000+i,jid='J'+i,p1=400000+i*2,p2=p1+1,j=job(jid,jobNo);const mk=(p,q)=>({...task(p,q),inventory_verified:true,inventory_verified_po_number:String(p),inventory_verified_at:'LAB-STRESS',inventory_operation_ids:['OP-'+p],inventory_verified_items:[{ordered_qty:q,received_qty:q}]});seedFloor(f,{jobs:[j],pos:[po('A'+i,jid,jobNo,p1,5),po('B'+i,jid,jobNo,p2,7)],tasks:[mk(p1,5),mk(p2,7)]});must(f.ack.acknowledgePO(p1).ok,'first ack');let q=f.s.json(F.CALL)[0];f.notes.set(q.id,'pending');must(f.review.route(q.id,jid,'pickup')===true,'pickup');must(f.ack.acknowledgePO(p2).ok,'second ack');q=f.s.json(F.CALL)[0];must(q.status==='Not Called'&&q.sourcePOs.length===2,'reopen');f.notes.set(q.id,'complete');must(f.review.route(q.id,jid,'active')===true,'active');must(f.s.json(F.PO).every(x=>x.status==='Received'),'PO immutable');must(f.s.json(F.JOB)[0].salesMaterialRoute==='active','route');must(f.net()===0,'network');completed++}catch(e){failure={cycle:i,error:e?.message||String(e)};break}}return{pass:!failure,cyclesRequested:n,cyclesCompleted:completed,failure}}
const stressResult=stress(cycles);
const pass=tests.every(x=>x.pass)&&stressResult.pass;
const report={gate:'RUNLU Flooring ↔ Warehouse Verified Receipt Ack LAB V0.8',pass,generatedAt:new Date().toISOString(),candidate:{file:ACK_FILE,version:'0.9.8',sha256:sha(ackSource),productionAutoInstall:false},warehouse:{runtime:`${warehouseVersion.version} Build${warehouseVersion.build}`,indexSha256:sha(warehouseIndex),exactFunctionsSha256:sha(warehouseExact),functions:warehouseFns},authorities:{ordersDrawer:{file:DRAWER_FILE,sha256:sha(drawerSource)},salesReview:{file:REVIEW_FILE,sha256:sha(reviewSource)}},scenarios:{passed:tests.filter(x=>x.pass).length,total:tests.length,tests},stress:stressResult,isolation:{productionSupabaseAccess:false,hostLocalStorageAccess:false,networkApisBlocked:true,storage:'ephemeral in-memory Map'},contract:['A Flooring PO may auto-ack Received only from one exact shared Warehouse task.','Task must be Ready/Completed with every received quantity exactly equal to ordered quantity.','Task must carry a second inventory-verification certificate tied to the same PO and one or more applied Warehouse operation IDs.','PO Received and People TO Call routing commit together or both stores restore.','Sales Review remains unable to mutate Received PO status.','This LAB defines and verifies the certificate consumer contract; it does not publish the certificate to production Supabase or load V098 in production.'],knownHold:['Current V066 People TO Call authority only queues Pickup fulfillment; Supplier Delivery acknowledgement therefore fails closed until that authority is generalized.']};
fs.writeFileSync('flooring-warehouse-receipt-ack-v080-report.json',JSON.stringify(report,null,2));
for(const t of tests)console.log(`${t.pass?'PASS':'FAIL'} · ${t.name}${t.error?' · '+t.error:''}`);console.log(`${stressResult.pass?'PASS':'FAIL'} · verified-receipt two-PO stress · ${stressResult.cyclesCompleted}/${stressResult.cyclesRequested}`);console.log(`Warehouse runtime · ${report.warehouse.runtime}`);console.log('Isolation · VM memory only · network blocked · production Supabase/localStorage: NONE');console.log(`VERIFIED RECEIPT ACK V0.8: ${pass?'PASS':'FAIL'}`);if(!pass)process.exit(1);
