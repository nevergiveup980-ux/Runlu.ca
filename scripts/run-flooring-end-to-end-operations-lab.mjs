import fs from 'node:fs';
import crypto from 'node:crypto';

const workflowCycles=Math.max(50,Number(process.env.RUNLU_E2E_WORKFLOWS||500));
const chaosAttacks=Math.max(100,Number(process.env.RUNLU_E2E_CHAOS||2000));
const must=(v,m)=>{if(!v)throw new Error(m)};
const clone=v=>JSON.parse(JSON.stringify(v));
const round=n=>Math.round((Number(n)+Number.EPSILON)*10000)/10000;

function fresh(){return{
  jobs:[],pos:[],people:[],pickup:[],inventory:{},events:[],executions:new Set(),
  totals:{received:{},shipped:{},returned:{}},transitionHistory:[]
}}
function serial(s){return JSON.stringify({jobs:s.jobs,pos:s.pos,people:s.people,pickup:s.pickup,inventory:s.inventory,events:s.events,executions:[...s.executions].sort(),totals:s.totals,transitionHistory:s.transitionHistory})}
function qty(skuMap,sku){return Number(skuMap[sku]||0)}
function bump(map,key,n){map[key]=round(qty(map,key)+Number(n));if(Math.abs(map[key])<1e-9)map[key]=0}
function invGet(s,sku,loc){return Number(s.inventory[sku]?.[loc]||0)}
function invAdd(s,sku,loc,n){s.inventory[sku]??={};s.inventory[sku][loc]=round(invGet(s,sku,loc)+Number(n))}
function jobOf(s,id){return s.jobs.find(x=>x.id===id)}
function poOf(s,id){return s.pos.find(x=>x.id===id)}
function allPOsReceived(s,jobId){const p=s.pos.filter(x=>x.jobId===jobId);return p.length>0&&p.every(x=>x.status==='Received')}
function hasOps(s,jobId){return s.pos.some(x=>x.jobId===jobId)||s.events.some(x=>x.jobId===jobId)}
function result(ok,extra={}){return{ok,...extra}}
function once(s,id,fn){if(!id)return result(false,{reason:'execution id required'});if(s.executions.has(id))return result(true,{replay:true});const r=fn();if(r?.ok)s.executions.add(id);return r}
function transition(s,job,to,reason){const from=job.status;if(from===to)return;const allowed={Draft:['In Progress'], 'In Progress':['People To Call'], 'People To Call':['Pick Up','Active'], 'Pick Up':['People To Call'], Active:['Active']};must((allowed[from]||[]).includes(to),`illegal job transition ${from} -> ${to}`);job.status=to;s.transitionHistory.push({jobId:job.id,from,to,reason})}

function createJob(s,id,jobNumber,lines){if(jobOf(s,id)||!Array.isArray(lines)||!lines.length||lines.some(x=>!x.sku||!(x.qty>0)))return result(false);s.jobs.push({id,jobNumber,status:'Draft',lines:clone(lines),salesRoute:'draft',flows:{}});const j=jobOf(s,id);transition(s,j,'In Progress','job created');return result(true)}
function editLine(s,jobId,sku,newQty){const j=jobOf(s,jobId);if(!j||!(newQty>0)||hasOps(s,jobId))return result(false);const line=j.lines.find(x=>x.sku===sku);if(!line)return result(false);line.qty=Number(newQty);return result(true)}
function deleteJob(s,jobId){const j=jobOf(s,jobId);if(!j||hasOps(s,jobId)||s.people.some(x=>x.jobId===jobId)||s.pickup.some(x=>x.jobId===jobId))return result(false);s.jobs=s.jobs.filter(x=>x.id!==jobId);return result(true)}
function issuePO(s,id,jobId,sku,orderedQty,supplier='LAB SUPPLIER'){const j=jobOf(s,jobId),line=j?.lines.find(x=>x.sku===sku);if(!j||!line||poOf(s,id)||!(orderedQty>0))return result(false);s.pos.push({id,jobId,sku,orderedQty:Number(orderedQty),receivedQty:0,status:'Open',supplier});return result(true)}
function enqueuePeople(s,jobId,poId){const j=jobOf(s,jobId);if(!j)return;let q=s.people.find(x=>x.jobId===jobId&&x.status==='Open');if(!q){q={id:`PTC-${jobId}`,jobId,status:'Open',sourcePOs:[],history:[]};s.people.push(q)}if(poId&&!q.sourcePOs.includes(poId))q.sourcePOs.push(poId);s.pickup=s.pickup.filter(x=>x.jobId!==jobId);if(j.status==='In Progress'||j.status==='Pick Up')transition(s,j,'People To Call','PO Received');j.salesRoute='people'}
function receivePO(s,executionId,poId,amount){return once(s,executionId,()=>{const p=poOf(s,poId);if(!p||!(amount>0)||p.status==='Received'||p.receivedQty+amount>p.orderedQty+1e-9)return result(false);p.receivedQty=round(p.receivedQty+amount);p.status=p.receivedQty>=p.orderedQty-1e-9?'Received':'Partial';invAdd(s,p.sku,'WH',amount);bump(s.totals.received,p.sku,amount);s.events.push({id:executionId,type:'Receive',jobId:p.jobId,poId:p.id,sku:p.sku,qty:amount});if(p.status==='Received')enqueuePeople(s,p.jobId,p.id);return result(true)})}
function review(s,executionId,jobId,dest,note=''){return once(s,executionId,()=>{const j=jobOf(s,jobId),q=s.people.find(x=>x.jobId===jobId&&x.status==='Open');if(!j||!q||!['keep','pickup','active'].includes(dest))return result(false);if(dest==='keep'){q.history.push({executionId,dest});j.salesRoute='people';return result(true)}if(dest==='active'&&!allPOsReceived(s,jobId))return result(false);q.status='Done';q.history.push({executionId,dest,note});if(dest==='pickup'){transition(s,j,'Pick Up','sales review incomplete');j.salesRoute='pickup';s.pickup=s.pickup.filter(x=>x.jobId!==jobId);s.pickup.push({jobId,note:String(note||''),sourcePOs:q.sourcePOs.slice()})}else{transition(s,j,'Active','sales review complete');j.salesRoute='active';s.pickup=s.pickup.filter(x=>x.jobId!==jobId)}return result(true)})}
function transfer(s,executionId,sku,from,to,amount){return once(s,executionId,()=>{if(!sku||!from||!to||from===to||!(amount>0)||invGet(s,sku,from)+1e-9<amount)return result(false);invAdd(s,sku,from,-amount);invAdd(s,sku,to,amount);s.events.push({id:executionId,type:'Transfer',sku,from,to,qty:amount});return result(true)})}
function flow(j,sku){j.flows[sku]??={shipped:0,returned:0};return j.flows[sku]}
function ship(s,executionId,jobId,sku,loc,amount){return once(s,executionId,()=>{const j=jobOf(s,jobId);if(!j||j.status!=='Active'||!(amount>0)||invGet(s,sku,loc)+1e-9<amount)return result(false);invAdd(s,sku,loc,-amount);const f=flow(j,sku);f.shipped=round(f.shipped+amount);bump(s.totals.shipped,sku,amount);s.events.push({id:executionId,type:'Ship',jobId,sku,loc,qty:amount});return result(true)})}
function returnMaterial(s,executionId,jobId,sku,loc,amount){return once(s,executionId,()=>{const j=jobOf(s,jobId),f=j?flow(j,sku):null;if(!j||!(amount>0)||!f||f.shipped-f.returned+1e-9<amount)return result(false);invAdd(s,sku,loc,amount);f.returned=round(f.returned+amount);bump(s.totals.returned,sku,amount);s.events.push({id:executionId,type:'Return',jobId,sku,loc,qty:amount});return result(true)})}

function audit(s){const errors=[];const jids=new Set(s.jobs.map(x=>x.id));const pids=new Set(s.pos.map(x=>x.id));if(jids.size!==s.jobs.length)errors.push('duplicate job id');if(pids.size!==s.pos.length)errors.push('duplicate PO id');
  for(const [sku,locs] of Object.entries(s.inventory))for(const [loc,v] of Object.entries(locs))if(!Number.isFinite(v)||v<-1e-9)errors.push(`negative inventory ${sku}/${loc}`);
  for(const p of s.pos){if(!jids.has(p.jobId))errors.push(`orphan PO ${p.id}`);if(p.receivedQty<-1e-9||p.receivedQty>p.orderedQty+1e-9)errors.push(`PO received bounds ${p.id}`);if(p.status==='Received'&&Math.abs(p.receivedQty-p.orderedQty)>1e-9)errors.push(`Received PO mismatch ${p.id}`)}
  const openPeople=s.people.filter(x=>x.status==='Open');if(new Set(openPeople.map(x=>x.jobId)).size!==openPeople.length)errors.push('duplicate open People To Call');if(new Set(s.pickup.map(x=>x.jobId)).size!==s.pickup.length)errors.push('duplicate Pickup queue');
  for(const q of openPeople){if(!jids.has(q.jobId))errors.push(`orphan People To Call ${q.jobId}`);for(const id of q.sourcePOs){const p=poOf(s,id);if(!p||p.status!=='Received')errors.push(`People To Call source PO not Received ${id}`)}}
  for(const j of s.jobs){const inPeople=openPeople.some(x=>x.jobId===j.id),inPickup=s.pickup.some(x=>x.jobId===j.id);if(j.status==='Active'&&(inPeople||inPickup))errors.push(`Active job queued ${j.id}`);if(j.status==='Pick Up'&&(!inPickup||inPeople))errors.push(`Pick Up routing mismatch ${j.id}`);if(j.status==='People To Call'&&!inPeople)errors.push(`People To Call routing mismatch ${j.id}`)}
  const skus=new Set([...Object.keys(s.inventory),...Object.keys(s.totals.received),...Object.keys(s.totals.shipped),...Object.keys(s.totals.returned)]);for(const sku of skus){const onHand=round(Object.values(s.inventory[sku]||{}).reduce((a,b)=>a+Number(b),0)),expected=round(qty(s.totals.received,sku)+qty(s.totals.returned,sku)-qty(s.totals.shipped,sku));if(Math.abs(onHand-expected)>1e-8)errors.push(`conservation ${sku}: ${onHand} != ${expected}`)}
  if(new Set(s.events.map(x=>x.id)).size!==s.events.length)errors.push('duplicate event id');return{pass:errors.length===0,errors}
}
function assertAudit(s,label){const a=audit(s);must(a.pass,`${label}: ${a.errors.join('; ')}`);return a}
function expectRejectUnchanged(s,label,fn){const before=serial(s),r=fn();must(r?.ok===false,`${label}: expected rejection`);must(serial(s)===before,`${label}: rejected operation mutated state`)}
function expectReplayUnchanged(s,label,fn){const before=serial(s),r=fn();must(r?.ok===true&&r.replay===true,`${label}: expected idempotent replay`);must(serial(s)===before,`${label}: replay mutated state`)}

function runWorkflow(s,n){const id=`J${n}`,a=`SKU-A-${n}`,b=`SKU-B-${n}`,p1=`PO-A-${n}`,p2=`PO-B-${n}`;let actions=0;
  must(createJob(s,id,`LAB-${n}`,[{sku:a,qty:10},{sku:b,qty:5}]).ok,'create');actions++;
  must(editLine(s,id,a,12).ok,'pre-PO edit');actions++;
  must(issuePO(s,p1,id,a,12,'SUPPLIER A').ok,'PO A');actions++;
  must(issuePO(s,p2,id,b,5,'SUPPLIER B').ok,'PO B');actions++;
  must(receivePO(s,`R-${n}-1`,p1,5).ok,'partial receive');actions++;must(poOf(s,p1).status==='Partial','partial status');must(!s.people.some(x=>x.jobId===id&&x.status==='Open'),'partial should not trigger PTC');
  must(receivePO(s,`R-${n}-2`,p1,7).ok,'complete first PO');actions++;must(jobOf(s,id).status==='People To Call','first received should trigger PTC');
  must(review(s,`REV-${n}-1`,id,'pickup','Waiting for second supplier PO').ok,'route pickup');actions++;must(poOf(s,p1).status==='Received','sales review mutated PO');
  must(receivePO(s,`R-${n}-3`,p2,5).ok,'second PO');actions++;must(jobOf(s,id).status==='People To Call','second received should re-enter PTC');
  must(review(s,`REV-${n}-2`,id,'active').ok,'route active');actions++;must(poOf(s,p1).status==='Received'&&poOf(s,p2).status==='Received','active mutated PO');
  must(transfer(s,`T-${n}`,a,'WH','STAGING',4).ok,'transfer');actions++;
  must(ship(s,`S-${n}`,id,a,'STAGING',3).ok,'ship');actions++;
  must(returnMaterial(s,`RET-${n}`,id,a,'WH',1).ok,'return');actions++;
  expectReplayUnchanged(s,'ship replay',()=>ship(s,`S-${n}`,id,a,'STAGING',3));actions++;
  expectRejectUnchanged(s,'delete after history',()=>deleteJob(s,id));actions++;
  expectRejectUnchanged(s,'edit after PO',()=>editLine(s,id,a,99));actions++;
  assertAudit(s,`workflow ${n}`);return{actions,id,a,b,p1,p2}
}

function scenarioTests(){const tests=[];const check=(name,fn)=>{try{tests.push({name,pass:true,...(fn()||{})})}catch(e){tests.push({name,pass:false,error:e?.message||String(e)})}};
  check('Pre-operation edit/delete safety',()=>{const s=fresh();must(createJob(s,'E1','EDIT-1',[{sku:'X',qty:2}]).ok,'create');must(editLine(s,'E1','X',3).ok,'edit');must(deleteJob(s,'E1').ok,'delete');assertAudit(s,'edit/delete');return{safe:true}});
  check('Partial Receive does not enter People To Call',()=>{const s=fresh();createJob(s,'P1','P-1',[{sku:'X',qty:10}]);issuePO(s,'PO1','P1','X',10);must(receivePO(s,'RX1','PO1',4).ok,'receive');must(poOf(s,'PO1').status==='Partial','not partial');must(!s.people.length,'PTC created early');assertAudit(s,'partial');return{status:'Partial'}});
  check('Received → People To Call → Pick Up → Received → People To Call → Active',()=>{const s=fresh(),r=runWorkflow(s,1);const j=jobOf(s,r.id);must(j.status==='Active','not Active');must(s.pickup.every(x=>x.jobId!==r.id),'pickup not cleared');must(s.people.filter(x=>x.jobId===r.id&&x.status==='Open').length===0,'PTC still open');return{finalStatus:j.status,poStates:s.pos.filter(x=>x.jobId===r.id).map(x=>x.status)}});
  check('Invalid Active while material outstanding is zero-mutation reject',()=>{const s=fresh();createJob(s,'A1','A-1',[{sku:'X',qty:5},{sku:'Y',qty:5}]);issuePO(s,'PX','A1','X',5);issuePO(s,'PY','A1','Y',5);receivePO(s,'AR1','PX',5);expectRejectUnchanged(s,'premature active',()=>review(s,'AR2','A1','active'));assertAudit(s,'premature active');return{safeReject:true}});
  check('Inventory transfer conserves stock; ship/return post once',()=>{const s=fresh(),r=runWorkflow(s,2),on=Object.values(s.inventory[r.a]).reduce((a,b)=>a+b,0);must(on===10,'expected 10 on hand after receive 12, ship 3, return 1');must(s.events.filter(x=>x.id==='S-2').length===1,'duplicate ship event');return{onHand:on}});
  check('Over-receive / over-ship / over-return / negative transfer reject without mutation',()=>{const s=fresh(),r=runWorkflow(s,3);expectRejectUnchanged(s,'overreceive',()=>receivePO(s,'BAD-R',r.p1,1));expectRejectUnchanged(s,'overship',()=>ship(s,'BAD-S',r.id,r.a,'STAGING',999));expectRejectUnchanged(s,'overreturn',()=>returnMaterial(s,'BAD-RET',r.id,r.a,'WH',999));expectRejectUnchanged(s,'negative transfer',()=>transfer(s,'BAD-T',r.a,'WH','STAGING',-1));assertAudit(s,'invalid ops');return{safeReject:true}});
  return{pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,tests};
}

function stress(n){const s=fresh();let actions=0,failure=null;for(let i=0;i<n;i++){try{const r=runWorkflow(s,10000+i);actions+=r.actions;if(i%25===0)assertAudit(s,`stress ${i}`)}catch(e){failure={workflow:i,error:e?.message||String(e)};break}}const finalAudit=audit(s);return{pass:!failure&&finalAudit.pass,workflowsRequested:n,workflowsCompleted:failure?failure.workflow:n,actions,failure,finalAudit,counts:{jobs:s.jobs.length,pos:s.pos.length,events:s.events.length,people:s.people.length,pickup:s.pickup.length}}}
function chaos(n){const s=fresh(),r=runWorkflow(s,900000);let completed=0,failure=null;const attacks=[
  ()=>expectRejectUnchanged(s,'chaos overreceive',()=>receivePO(s,`C-R-${completed}`,r.p1,1)),
  ()=>expectRejectUnchanged(s,'chaos overship',()=>ship(s,`C-S-${completed}`,r.id,r.a,'STAGING',99999)),
  ()=>expectRejectUnchanged(s,'chaos overreturn',()=>returnMaterial(s,`C-RET-${completed}`,r.id,r.a,'WH',99999)),
  ()=>expectRejectUnchanged(s,'chaos invalid route',()=>review(s,`C-REV-${completed}`,r.id,'destroy')),
  ()=>expectRejectUnchanged(s,'chaos negative transfer',()=>transfer(s,`C-T-${completed}`,r.a,'WH','STAGING',-5)),
  ()=>expectRejectUnchanged(s,'chaos delete',()=>deleteJob(s,r.id)),
  ()=>expectRejectUnchanged(s,'chaos edit',()=>editLine(s,r.id,r.a,1)),
  ()=>expectReplayUnchanged(s,'chaos receipt replay',()=>receivePO(s,'R-900000-3',r.p2,5)),
  ()=>expectReplayUnchanged(s,'chaos ship replay',()=>ship(s,'S-900000',r.id,r.a,'STAGING',3))
];
  for(let i=0;i<n;i++){try{attacks[i%attacks.length]();if(i%50===0)assertAudit(s,`chaos ${i}`);completed++}catch(e){failure={attack:i,error:e?.message||String(e)};break}}const finalAudit=audit(s);return{pass:!failure&&finalAudit.pass,attacksRequested:n,attacksCompleted:completed,failure,finalAudit}}

const scenarios=scenarioTests(),stressResult=stress(workflowCycles),chaosResult=chaos(chaosAttacks),pass=scenarios.pass&&stressResult.pass&&chaosResult.pass;
const source=fs.readFileSync(new URL(import.meta.url),'utf8');
const report={schema:'runlu.flooring.end-to-end-operations-lab.v1',version:'0.5.0',generatedAt:new Date().toISOString(),pass,scenarios,stress:stressResult,chaos:chaosResult,isolation:{productionSupabaseAccess:false,networkAccess:false,storage:'ephemeral in-memory model',productionFlooringEntryChanged:false},businessRules:['PO Received triggers People To Call; PO status stays Received during sales routing.','Sales review routes the Job/Order to Pick Up, Active, or keeps it in People To Call.','A later Received PO can move a Pick Up Job back to People To Call for another sales review.','Transfers conserve inventory; Ship decrements once; Return increments once.','Operational history blocks destructive Job edit/delete in this LAB safety model.'],boundaries:['Broad end-to-end operations are exercised with a synthetic in-memory domain model.','The workflow separately executes the exact repository People To Call V095 module in its existing isolated VM adapter.','This is not certification of live Supabase concurrency or browser UI automation.'],runnerSha256:crypto.createHash('sha256').update(source).digest('hex')};
fs.writeFileSync('flooring-end-to-end-operations-lab-report.json',JSON.stringify(report,null,2));
console.log(`${scenarios.pass?'PASS':'FAIL'} · E2E scenarios · ${scenarios.passed}/${scenarios.tests.length}`);
console.log(`${stressResult.pass?'PASS':'FAIL'} · workflow stress · ${stressResult.workflowsCompleted}/${stressResult.workflowsRequested} workflows · ${stressResult.actions} business actions`);
console.log(`${chaosResult.pass?'PASS':'FAIL'} · destructive/duplicate chaos · ${chaosResult.attacksCompleted}/${chaosResult.attacksRequested}`);
console.log('Isolation · memory only · no Supabase/network · production entry untouched');
console.log(`END-TO-END OPERATIONS GATE · ${pass?'PASS':'HOLD'}`);
if(!pass){for(const t of scenarios.tests.filter(x=>!x.pass))console.error('SCENARIO FAIL · '+t.name+' · '+t.error);if(stressResult.failure)console.error(stressResult.failure);if(chaosResult.failure)console.error(chaosResult.failure);process.exitCode=1}
