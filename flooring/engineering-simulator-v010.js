/* RUNLU LAB · Flooring OS Engineering Simulator V0.1
   Completely isolated synthetic model. NEVER reads/writes Flooring production stores or Supabase.
   Purpose: repeatable scenario, stress and chaos testing of Deerfoot company workflow invariants.
*/
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RUNLUFlooringEngineeringSimulatorV010=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';

const VERSION='0.1.0';
const CUT_ALLOWANCE_FT=0.25;
const ROUND=n=>Math.round((Number(n)||0)*10000)/10000;
const clone=x=>JSON.parse(JSON.stringify(x));
const must=(c,m)=>{if(!c)throw new Error(m)};
const uid=(p,n)=>p+String(n).padStart(5,'0');

function rng(seed=20260914){
  let a=(Number(seed)||1)>>>0;
  return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
}
function pick(r,xs){return xs[Math.floor(r()*xs.length)]}
function int(r,min,max){return min+Math.floor(r()*(max-min+1))}

function freshState(seed=20260914){
  return {
    schema:'runlu.flooring.engineering-simulator.v1',version:VERSION,environment:'LAB_SIMULATION_ONLY',seed:Number(seed)||20260914,
    seq:{order:0,po:0,line:0,event:0},
    stock:{
      'LVP-ART':{A1:80,B1:20},
      'PAD-HC':{'12B':20},
      'GLUE-1':{A2:10}
    },
    stockLedger:{
      'LVP-ART':{opening:100,received:0,returned:0,shipped:0},
      'PAD-HC':{opening:20,received:0,returned:0,shipped:0},
      'GLUE-1':{opening:10,received:0,returned:0,shipped:0}
    },
    rolls:{
      RC2350:{rc:'RC2350',millRoll:'6112',po:'181516',product:'Gentle Guardian',colour:'Quartz',dyeLot:'987270',originalLength:123.75,currentLength:123.75,width:12,location:'14C',status:'Active',cuts:[]},
      RC2351:{rc:'RC2351',millRoll:'7886',po:'',product:'Gentle Guardian',colour:'Quartz',dyeLot:'987270',originalLength:127.75,currentLength:127.75,width:12,location:'14C',status:'Active',cuts:[]},
      RC2344A:{rc:'RC2344A',millRoll:'LEGACY',po:'',product:'Legacy Carpet',colour:'Test',dyeLot:'',originalLength:90,currentLength:90,width:12,location:'3A',status:'Active',cuts:[]}
    },
    orders:{},pos:{},peopleToCall:{},receiptKeys:{},events:[],attempts:[],auditRuns:0,safeRejects:0,unexpectedRejects:0
  };
}
function stockQty(s,sku,loc){return Number(s.stock?.[sku]?.[loc]||0)}
function stockTotal(s,sku){return ROUND(Object.values(s.stock?.[sku]||{}).reduce((a,x)=>a+Number(x||0),0))}
function ensureSku(s,sku){if(!s.stock[sku])s.stock[sku]={};if(!s.stockLedger[sku])s.stockLedger[sku]={opening:0,received:0,returned:0,shipped:0}}
function record(s,type,data={}){const e={id:uid('EV',++s.seq.event),type,...clone(data)};s.events.push(e);return e}
function order(s,id){const o=s.orders[id];must(o,'order missing: '+id);return o}
function po(s,id){const p=s.pos[id];must(p,'PO missing: '+id);return p}
function roll(s,rc){const x=s.rolls[String(rc||'').trim()];must(x,'RC missing: '+rc);return x}
function linkedPOs(s,orderId){return Object.values(s.pos).filter(p=>p.orderId===orderId&&!p.voided)}

const ops={
  createOrder(s,x={}){
    const id=x.id||uid('O',++s.seq.order);must(!s.orders[id],'duplicate order');
    s.orders[id]={id,customer:x.customer||'SIM Customer '+id,status:'Draft',route:'Back',items:[],history:[]};record(s,'ORDER_CREATE',{orderId:id});return id;
  },
  addLine(s,x){const o=order(s,x.orderId),id=x.lineId||uid('L',++s.seq.line);must(!o.items.some(v=>v.id===id),'duplicate line');must(Number(x.qty)>0,'line qty positive');o.items.push({id,sku:x.sku||'LVP-ART',qty:Number(x.qty),unit:x.unit||'CTN',note:x.note||''});record(s,'LINE_ADD',{orderId:o.id,lineId:id});return id},
  editLine(s,x){const o=order(s,x.orderId),l=o.items.find(v=>v.id===x.lineId);must(l,'line missing');if(x.qty!=null){must(Number(x.qty)>0,'line qty positive');l.qty=Number(x.qty)}if(x.note!=null)l.note=String(x.note);record(s,'LINE_EDIT',{orderId:o.id,lineId:l.id})},
  deleteLine(s,x){const o=order(s,x.orderId),i=o.items.findIndex(v=>v.id===x.lineId);must(i>=0,'line missing');o.items.splice(i,1);record(s,'LINE_DELETE',{orderId:o.id,lineId:x.lineId})},
  deleteOrder(s,x){const o=order(s,x.orderId);must(!linkedPOs(s,o.id).some(p=>p.received>0),'cannot delete order with received PO');delete s.peopleToCall[o.id];delete s.orders[o.id];record(s,'ORDER_DELETE',{orderId:o.id})},
  createPO(s,x){
    const o=order(s,x.orderId),id=x.id||uid('PO',++s.seq.po);must(!s.pos[id],'duplicate PO');must(Number(x.qty)>0,'PO qty positive');
    s.pos[id]={id,orderId:o.id,sku:x.sku||'LVP-ART',ordered:Number(x.qty),received:0,status:'Issued',supplier:x.supplier||'SIM SUPPLIER',fulfillment:x.fulfillment||'Pickup',voided:false,receiptKeys:[]};record(s,'PO_CREATE',{poId:id,orderId:o.id});return id;
  },
  voidPO(s,x){const p=po(s,x.poId);must(!p.voided,'PO already voided');must(p.received===0,'received PO cannot be voided');p.voided=true;p.status='Cancelled';record(s,'PO_VOID',{poId:p.id})},
  receivePO(s,x){
    const p=po(s,x.poId);must(!p.voided,'PO voided');const q=Number(x.qty),key=String(x.eventKey||'').trim();must(key,'receipt event key required');must(!s.receiptKeys[key],'duplicate receipt event');must(q>0,'receipt qty positive');must(p.received+q<=p.ordered,'PO over-receipt');
    ensureSku(s,p.sku);const loc=x.location||'RECV';s.stock[p.sku][loc]=ROUND(stockQty(s,p.sku,loc)+q);s.stockLedger[p.sku].received=ROUND(s.stockLedger[p.sku].received+q);p.received=ROUND(p.received+q);p.status=p.received===p.ordered?'Received':'Partially Received';p.receiptKeys.push(key);s.receiptKeys[key]=p.id;record(s,'PO_RECEIVE',{poId:p.id,orderId:p.orderId,qty:q,eventKey:key,status:p.status});
    if(p.status==='Received')sendToPeopleToCall(s,p.orderId,p.id);return p.status;
  },
  transferStock(s,x){const q=Number(x.qty);must(q>0,'transfer qty positive');must(x.from!==x.to,'same transfer location');must(stockQty(s,x.sku,x.from)>=q,'transfer exceeds stock');ensureSku(s,x.sku);s.stock[x.sku][x.from]=ROUND(stockQty(s,x.sku,x.from)-q);s.stock[x.sku][x.to]=ROUND(stockQty(s,x.sku,x.to)+q);record(s,'STOCK_TRANSFER',{sku:x.sku,qty:q,from:x.from,to:x.to})},
  shipStock(s,x){const q=Number(x.qty);must(q>0,'ship qty positive');must(stockQty(s,x.sku,x.location)>=q,'ship exceeds stock');s.stock[x.sku][x.location]=ROUND(stockQty(s,x.sku,x.location)-q);s.stockLedger[x.sku].shipped=ROUND(s.stockLedger[x.sku].shipped+q);record(s,'STOCK_SHIP',{sku:x.sku,qty:q,location:x.location,orderId:x.orderId||''})},
  returnStock(s,x){const q=Number(x.qty);must(q>0,'return qty positive');ensureSku(s,x.sku);s.stock[x.sku][x.location]=ROUND(stockQty(s,x.sku,x.location)+q);s.stockLedger[x.sku].returned=ROUND(s.stockLedger[x.sku].returned+q);record(s,'STOCK_RETURN',{sku:x.sku,qty:q,location:x.location,orderId:x.orderId||''})},
  registerRoll(s,x){const rc=String(x.rc||'').trim();must(rc,'Finance RC required');must(!s.rolls[rc],'duplicate Finance RC');must(Number(x.originalLength)>0,'roll length positive');s.rolls[rc]={rc,millRoll:String(x.millRoll||''),po:String(x.po||''),product:x.product||'SIM Carpet',colour:x.colour||'SIM',dyeLot:x.dyeLot||'',originalLength:Number(x.originalLength),currentLength:Number(x.originalLength),width:Number(x.width)||12,location:x.location||'RECV',status:'Active',cuts:[]};record(s,'ROLL_REGISTER',{rc});return rc},
  transferRoll(s,x){const r=roll(s,x.rc);must(x.to&&x.to!==r.location,'roll destination invalid');const before=r.currentLength;r.location=x.to;record(s,'ROLL_TRANSFER',{rc:r.rc,to:x.to});must(r.currentLength===before,'roll transfer changed length')},
  cutRoll(s,x){const r=roll(s,x.rc),ft=Number(x.length),count=Number(x.cutCount??1),allowance=ROUND(CUT_ALLOWANCE_FT*count),impact=ROUND(ft+allowance);must(ft>0,'cut length positive');must(Number.isInteger(count)&&count>0,'cut count positive integer');must(r.currentLength>=impact,'cut exceeds roll');r.currentLength=ROUND(r.currentLength-impact);r.cuts.push({length:ft,cutCount:count,allowance,impact,orderId:x.orderId||''});if(r.currentLength<=0)r.status='Depleted';record(s,'ROLL_CUT',{rc:r.rc,length:ft,cutCount:count,allowance,impact,remaining:r.currentLength})},
  salesReview(s,x){const o=order(s,x.orderId),q=s.peopleToCall[o.id];must(q&&q.status==='Open','order not in People To Call');const d=String(x.decision||'').toLowerCase();must(['active','pickup','keep'].includes(d),'review decision invalid');const linked=linkedPOs(s,o.id),before=linked.map(p=>({id:p.id,status:p.status,received:p.received}));const h={decision:d,note:x.note||'',sourcePOs:q.sourcePOs.slice()};o.history.push(h);q.history.push(h);if(d==='active'){q.status='Done';o.route='Active';o.status='Ready'}else if(d==='pickup'){q.status='Done';o.route='Pick Up';o.status='Procurement';o.pickupNote=x.note||''}else{o.route='People To Call'}for(const b of before){const p=s.pos[b.id];must(p.status===b.status&&p.received===b.received,'sales review mutated PO')}record(s,'SALES_REVIEW',{orderId:o.id,decision:d,note:x.note||''});return o.route}
};

function sendToPeopleToCall(s,orderId,poId){
  const o=order(s,orderId),q=s.peopleToCall[o.id]||{orderId:o.id,status:'Open',sourcePOs:[],history:[]};if(!q.sourcePOs.includes(poId))q.sourcePOs.push(poId);q.status='Open';s.peopleToCall[o.id]=q;o.route='People To Call';record(s,'PEOPLE_TO_CALL',{orderId:o.id,poId});
}
function dispatch(s,op){const f=ops[op.kind];must(typeof f==='function','unknown operation: '+op.kind);return f(s,op)}

function audit(s){
  const f=[];
  const finding=(code,detail)=>f.push({code,detail});
  for(const[sku,locs]of Object.entries(s.stock))for(const[loc,q]of Object.entries(locs))if(!Number.isFinite(Number(q))||Number(q)<-1e-9)finding('NEGATIVE_OR_INVALID_STOCK',sku+'@'+loc+'='+q);
  for(const[sku,l]of Object.entries(s.stockLedger)){
    const expected=ROUND(Number(l.opening)+Number(l.received)+Number(l.returned)-Number(l.shipped)),actual=stockTotal(s,sku);if(Math.abs(expected-actual)>.0001)finding('STOCK_LEDGER_IMBALANCE',sku+' expected '+expected+' actual '+actual);
  }
  for(const p of Object.values(s.pos)){
    if(p.received<0||p.received>p.ordered)finding('PO_RECEIPT_RANGE',p.id);
    const expected=p.voided?'Cancelled':p.received===p.ordered?'Received':p.received>0?'Partially Received':'Issued';if(p.status!==expected)finding('PO_STATUS_MISMATCH',p.id+' '+p.status+' vs '+expected);
    if(!s.orders[p.orderId])finding('ORPHAN_PO',p.id);
    const receiptEvents=s.events.filter(e=>e.type==='PO_RECEIVE'&&e.poId===p.id),eventQty=ROUND(receiptEvents.reduce((a,e)=>a+Number(e.qty||0),0));
    if(Math.abs(eventQty-p.received)>.0001)finding('PO_RECEIPT_LEDGER_MISMATCH',p.id+' events '+eventQty+' vs received '+p.received);
    if(receiptEvents.length!==p.receiptKeys.length)finding('PO_RECEIPT_KEY_COUNT_MISMATCH',p.id);
    for(const key of p.receiptKeys)if(s.receiptKeys[key]!==p.id)finding('RECEIPT_KEY_MISMATCH',p.id+' '+key);
  }
  const seen=new Set();for(const[k,v]of Object.entries(s.receiptKeys)){if(seen.has(k))finding('DUPLICATE_RECEIPT_KEY',k);seen.add(k);if(!s.pos[v])finding('ORPHAN_RECEIPT_KEY',k)}
  for(const[rc,r]of Object.entries(s.rolls)){
    if(rc!==r.rc)finding('RC_IDENTITY_MISMATCH',rc);if(r.currentLength<-.0001||r.currentLength-r.originalLength>.0001)finding('ROLL_LENGTH_RANGE',rc);
    const used=ROUND(r.cuts.reduce((a,c)=>a+Number(c.impact||0),0)),expected=ROUND(r.originalLength-used);if(Math.abs(expected-r.currentLength)>.0001)finding('ROLL_LEDGER_IMBALANCE',rc+' expected '+expected+' actual '+r.currentLength);
    for(const c of r.cuts)if(Math.abs(Number(c.allowance)-CUT_ALLOWANCE_FT*Number(c.cutCount||1))>.0001)finding('CUT_ALLOWANCE_MISMATCH',rc);
  }
  for(const[oId,q]of Object.entries(s.peopleToCall)){
    const o=s.orders[oId];if(!o){finding('ORPHAN_PEOPLE_TO_CALL',oId);continue}if(q.status==='Open'&&o.route!=='People To Call')finding('PTC_ROUTE_MISMATCH',oId+' '+o.route);if(q.status==='Done'&&o.route==='People To Call')finding('PTC_DONE_ROUTE_MISMATCH',oId);
    for(const pId of q.sourcePOs){const p=s.pos[pId];if(!p||p.orderId!==oId)finding('PTC_SOURCE_PO_ORPHAN',oId+' '+pId);else if(p.status!=='Received')finding('PTC_SOURCE_PO_NOT_RECEIVED',oId+' '+pId)}
  }
  s.auditRuns++;return f;
}

function execute(s,op,expectReject=false){
  const beforeEvents=s.events.length;let ok=false,error='';try{dispatch(s,clone(op));ok=true}catch(e){error=e.message||String(e)}
  const rejected=!ok;let unexpected=false;if(expectReject&&!rejected)unexpected=true;if(!expectReject&&rejected)unexpected=true;
  if(expectReject&&rejected)s.safeRejects++;if(!expectReject&&rejected)s.unexpectedRejects++;
  const findings=ok?audit(s):[];if(findings.length)unexpected=true;
  const a={step:s.attempts.length+1,op:clone(op),expectReject,ok,rejected,error,findings,eventDelta:s.events.length-beforeEvents};s.attempts.push(a);
  return {...a,unexpected};
}
function expectOK(s,op){const r=execute(s,op,false);must(!r.unexpected,'unexpected reject/audit: '+(r.error||JSON.stringify(r.findings)));return r}
function expectNO(s,op){const r=execute(s,op,true);must(!r.unexpected,'unsafe operation accepted: '+JSON.stringify(op));return r}

function scenario(name,fn){try{const s=freshState();fn(s);const f=audit(s);must(f.length===0,JSON.stringify(f));return{name,pass:true,operations:s.attempts.length,safeRejects:s.safeRejects}}catch(e){return{name,pass:false,error:e.message}}}
function runScenarios(){
  const tests=[];
  tests.push(scenario('Receive → ship keeps exact stock ledger',s=>{const o=ops.createOrder(s,{id:'O-R1'}),p=ops.createPO(s,{id:'PO-R1',orderId:o,sku:'LVP-ART',qty:10});expectOK(s,{kind:'receivePO',poId:p,qty:10,eventKey:'R1',location:'A1'});expectOK(s,{kind:'shipStock',sku:'LVP-ART',location:'A1',qty:7,orderId:o})}));
  tests.push(scenario('Transfer changes location, never total',s=>{const before=stockTotal(s,'LVP-ART');expectOK(s,{kind:'transferStock',sku:'LVP-ART',from:'A1',to:'B1',qty:15});must(stockTotal(s,'LVP-ART')===before,'transfer changed total')}));
  tests.push(scenario('Partial receipt → full receipt → duplicate key safely rejected',s=>{const o=ops.createOrder(s,{id:'O-R2'}),p=ops.createPO(s,{id:'PO-R2',orderId:o,sku:'PAD-HC',qty:10});expectOK(s,{kind:'receivePO',poId:p,qty:4,eventKey:'R2-A',location:'12B'});must(s.pos[p].status==='Partially Received','partial status');expectOK(s,{kind:'receivePO',poId:p,qty:6,eventKey:'R2-B',location:'12B'});expectNO(s,{kind:'receivePO',poId:p,qty:1,eventKey:'R2-B',location:'12B'})}));
  tests.push(scenario('Received → People To Call → Pick Up → new Received → People To Call → Active',s=>{const o=ops.createOrder(s,{id:'O-PTC'}),p1=ops.createPO(s,{id:'PO-P1',orderId:o,sku:'LVP-ART',qty:2});expectOK(s,{kind:'receivePO',poId:p1,qty:2,eventKey:'P1',location:'A1'});must(s.orders[o].route==='People To Call','not PTC');expectOK(s,{kind:'salesReview',orderId:o,decision:'pickup',note:'Need vent'});must(s.orders[o].route==='Pick Up','not pickup');const p2=ops.createPO(s,{id:'PO-P2',orderId:o,sku:'GLUE-1',qty:1});expectOK(s,{kind:'receivePO',poId:p2,qty:1,eventKey:'P2',location:'A2'});must(s.orders[o].route==='People To Call','not returned to PTC');expectOK(s,{kind:'salesReview',orderId:o,decision:'active'});must(s.orders[o].route==='Active','not active');must(s.pos[p1].status==='Received'&&s.pos[p2].status==='Received','sales mutated PO')}));
  tests.push(scenario('Carpet CUT always consumes requested length + 3 inches per cut',s=>{const before=s.rolls.RC2350.currentLength;expectOK(s,{kind:'cutRoll',rc:'RC2350',length:20,cutCount:1,orderId:'SIM'});must(Math.abs(s.rolls.RC2350.currentLength-(before-20.25))<.0001,'3-inch rule');const remain=s.rolls.RC2350.currentLength;expectOK(s,{kind:'transferRoll',rc:'RC2350',to:'5A'});must(s.rolls.RC2350.currentLength===remain,'transfer length changed')}));
  tests.push(scenario('Legacy alphanumeric RC survives while duplicate Finance RC is rejected',s=>{must(!!s.rolls.RC2344A,'legacy RC missing');expectOK(s,{kind:'registerRoll',rc:'RCX-77A',originalLength:100,millRoll:'M77',location:'3B'});expectNO(s,{kind:'registerRoll',rc:'RCX-77A',originalLength:90})}));
  tests.push(scenario('Order lines can add/edit/delete without orphaning order',s=>{const o=ops.createOrder(s,{id:'O-EDIT'});const l=ops.addLine(s,{orderId:o,sku:'LVP-ART',qty:4});expectOK(s,{kind:'editLine',orderId:o,lineId:l,qty:5,note:'changed'});expectOK(s,{kind:'deleteLine',orderId:o,lineId:l});must(s.orders[o].items.length===0,'line not deleted')}));
  tests.push(scenario('Dangerous quantities are rejected before state mutation',s=>{const before=stockTotal(s,'GLUE-1');expectNO(s,{kind:'shipStock',sku:'GLUE-1',location:'A2',qty:99});expectNO(s,{kind:'transferStock',sku:'GLUE-1',from:'A2',to:'B2',qty:-1});must(stockTotal(s,'GLUE-1')===before,'invalid op mutated stock')}));
  tests.push(scenario('Received PO cannot be silently voided or order-deleted',s=>{const o=ops.createOrder(s,{id:'O-SAFE'}),p=ops.createPO(s,{id:'PO-SAFE',orderId:o,sku:'LVP-ART',qty:1});expectOK(s,{kind:'receivePO',poId:p,qty:1,eventKey:'SAFE',location:'A1'});expectNO(s,{kind:'voidPO',poId:p});expectNO(s,{kind:'deleteOrder',orderId:o})}));
  return {name:'Company workflow scenarios',version:VERSION,tests,passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,pass:tests.every(x=>x.pass)};
}

function stressBootstrap(s){for(let i=0;i<6;i++){const o=ops.createOrder(s,{id:'S-O'+i});ops.addLine(s,{orderId:o,sku:'LVP-ART',qty:2+i});const p=ops.createPO(s,{id:'S-PO'+i,orderId:o,sku:i%2?'PAD-HC':'LVP-ART',qty:5+i});ops.receivePO(s,{poId:p,qty:5+i,eventKey:'BOOT-'+i,location:i%2?'12B':'A1'})}ops.registerRoll(s,{rc:'SIM-RC-1',originalLength:250,millRoll:'SIM-M1',location:'3A'});audit(s)}
function validRandomOp(s,r,i){
  const orderIds=Object.keys(s.orders),poIds=Object.keys(s.pos),routes=orderIds.filter(id=>s.orders[id].route==='People To Call');const k=int(r,0,11);
  if(k===0){const a=stockQty(s,'LVP-ART','A1'),b=stockQty(s,'LVP-ART','B1');if(Math.max(a,b)<=0)return{kind:'returnStock',sku:'LVP-ART',location:'A1',qty:1,orderId:pick(r,orderIds)};const from=a>=b?'A1':'B1',to=from==='A1'?'B1':'A1',q=Math.min(stockQty(s,'LVP-ART',from),int(r,1,3));return{kind:'transferStock',sku:'LVP-ART',from,to,qty:q}}
  if(k===1){const a=stockQty(s,'LVP-ART','A1'),b=stockQty(s,'LVP-ART','B1');if(Math.max(a,b)<=0)return{kind:'returnStock',sku:'LVP-ART',location:'A1',qty:1,orderId:pick(r,orderIds)};const location=a>=b?'A1':'B1';return{kind:'shipStock',sku:'LVP-ART',location,qty:Math.min(stockQty(s,'LVP-ART',location),1),orderId:pick(r,orderIds)}}
  if(k===2)return{kind:'returnStock',sku:'LVP-ART',location:pick(r,['A1','B1']),qty:1,orderId:pick(r,orderIds)};
  if(k===3){const o=pick(r,orderIds);return{kind:'addLine',orderId:o,sku:pick(r,['LVP-ART','PAD-HC','GLUE-1']),qty:int(r,1,8),unit:'CTN'}}
  if(k===4)return{kind:'createOrder',id:'ST-O-'+i,customer:'Stress Customer '+i};
  if(k===5){const o=pick(r,orderIds),id='ST-PO-'+i;return{kind:'createPO',id,orderId:o,sku:pick(r,['LVP-ART','PAD-HC','GLUE-1']),qty:int(r,1,6)}}
  if(k===6&&routes.length)return{kind:'salesReview',orderId:pick(r,routes),decision:pick(r,['active','pickup','keep']),note:'stress '+i};
  if(k===7&&s.rolls['SIM-RC-1'].currentLength>2)return{kind:'cutRoll',rc:'SIM-RC-1',length:Math.min(1,s.rolls['SIM-RC-1'].currentLength-.25),cutCount:1,orderId:pick(r,orderIds)};
  if(k===8){const open=poIds.filter(id=>s.pos[id].received<s.pos[id].ordered&&!s.pos[id].voided);if(open.length){const p=pick(r,open),remain=ROUND(s.pos[p].ordered-s.pos[p].received);return{kind:'receivePO',poId:p,qty:remain,eventKey:'ST-R-'+i,location:'RECV'}}}
  if(k===9){const candidates=orderIds.filter(id=>s.orders[id].items.length);if(candidates.length){const o=pick(r,candidates),l=pick(r,s.orders[o].items);return{kind:'editLine',orderId:o,lineId:l.id,qty:int(r,1,12),note:'stress edit '+i}}}
  if(k===10){const candidates=orderIds.filter(id=>s.orders[id].items.length);if(candidates.length){const o=pick(r,candidates),l=pick(r,s.orders[o].items);return{kind:'deleteLine',orderId:o,lineId:l.id}}}
  if(k===11){const candidates=orderIds.filter(id=>linkedPOs(s,id).length===0);if(candidates.length)return{kind:'deleteOrder',orderId:pick(r,candidates)}}
  return{kind:'transferRoll',rc:'SIM-RC-1',to:s.rolls['SIM-RC-1'].location==='3A'?'4A':'3A'};
}
function runStress(count=1000,seed=20260914){
  const s=freshState(seed),r=rng(seed);stressBootstrap(s);let failure=null;
  for(let i=0;i<Number(count||0);i++){
    let op;try{op=validRandomOp(s,r,i);const rr=execute(s,op,false);if(rr.unexpected){failure=rr;break}}catch(e){failure={step:s.attempts.length+1,error:e.message,op:op||null};break}
  }
  const findings=audit(s);if(!failure&&findings.length)failure={step:s.attempts.length,findings};
  return report('STRESS',s,count,seed,failure);
}
function chaosOp(s,r,i){
  const orderIds=Object.keys(s.orders),poIds=Object.keys(s.pos),rcs=Object.keys(s.rolls),kind=int(r,0,8);
  if(kind===0){const p=pick(r,poIds);return{kind:'receivePO',poId:p,qty:s.pos[p].ordered+99,eventKey:'BAD-OVER-'+i,location:'A1'}}
  if(kind===1)return{kind:'shipStock',sku:'PAD-HC',location:'12B',qty:9999};
  if(kind===2)return{kind:'transferStock',sku:'LVP-ART',from:'A1',to:'B1',qty:-5};
  if(kind===3){const rc=pick(r,rcs);return{kind:'registerRoll',rc,originalLength:100}}
  if(kind===4){const rc=pick(r,rcs);return{kind:'cutRoll',rc,length:s.rolls[rc].currentLength+20,cutCount:1}}
  if(kind===5){const o=pick(r,orderIds);if(s.orders[o].route==='People To Call')return{kind:'salesReview',orderId:o,decision:'bogus'};return{kind:'salesReview',orderId:o,decision:'active'}}
  if(kind===6)return{kind:'voidPO',poId:pick(r,poIds)};
  if(kind===7){const p=pick(r,poIds),key=s.pos[p].receiptKeys[0];if(key)return{kind:'receivePO',poId:p,qty:1,eventKey:key,location:'A1'};return{kind:'receivePO',poId:p,qty:0,eventKey:'BAD-Z-'+i,location:'A1'}}
  return{kind:'deleteOrder',orderId:pick(r,orderIds)};
}
function runChaos(count=500,seed=20260915){
  const s=freshState(seed),r=rng(seed);stressBootstrap(s);let failure=null;
  for(let i=0;i<Number(count||0);i++){
    const op=chaosOp(s,r,i),rr=execute(s,op,true);if(rr.unexpected){failure=rr;break}const f=audit(s);if(f.length){failure={step:s.attempts.length,op,findings:f};break}
  }
  return report('CHAOS',s,count,seed,failure);
}
function report(mode,s,requested,seed,failure){
  return {schema:'runlu.flooring.simulator-report.v1',version:VERSION,mode,environment:s.environment,seed:Number(seed),requestedOperations:Number(requested),attemptedOperations:s.attempts.length,safeRejects:s.safeRejects,unexpectedRejects:s.unexpectedRejects,auditRuns:s.auditRuns,pass:!failure,failure:failure?clone(failure):null,summary:{orders:Object.keys(s.orders).length,pos:Object.keys(s.pos).length,rolls:Object.keys(s.rolls).length,events:s.events.length,stockSkus:Object.keys(s.stock).length},replay:{seed:Number(seed),attempts:clone(s.attempts.map(a=>({op:a.op,expectReject:a.expectReject})))}};
}
function replay(payload){const s=freshState(payload?.seed||20260914);stressBootstrap(s);let failure=null;for(const a of payload?.attempts||[]){const rr=execute(s,a.op,!!a.expectReject);if(rr.unexpected){failure=rr;break}}return report('REPLAY',s,(payload?.attempts||[]).length,payload?.seed||20260914,failure)}
function runAll(opts={}){const scenarios=runScenarios(),stress=runStress(opts.stress??2000,opts.seed??20260914),chaos=runChaos(opts.chaos??500,(opts.seed??20260914)+1);return{schema:'runlu.flooring.engineering-report.v1',version:VERSION,generatedAt:new Date().toISOString(),environment:'LAB_SIMULATION_ONLY',scenarios,stress,chaos,pass:scenarios.pass&&stress.pass&&chaos.pass,boundaries:['Synthetic isolated model only; never certifies production by itself.','No Supabase, production localStorage keys, customer records or live inventory are read or written.','Finance RC is supplied explicitly; simulator never auto-generates an official company RC.','Each carpet CUT consumes requested length plus 0.25 ft (3 inches) allowance.']}}

return {version:VERSION,CUT_ALLOWANCE_FT,freshState,ops,dispatch,audit,execute,runScenarios,runStress,runChaos,replay,runAll,stockTotal};
});
