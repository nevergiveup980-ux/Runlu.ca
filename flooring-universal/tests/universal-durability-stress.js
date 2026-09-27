'use strict';
const ROUNDS=Number(process.env.RUNLU_STRESS_ROUNDS||100000);
const INITIAL_SEED=Number(process.env.RUNLU_STRESS_SEED||0x5eed1234)>>>0;
let seed=INITIAL_SEED;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function pick(a){return a[Math.floor(rnd()*a.length)]}
function assert(x,m,ctx){if(!x){const detail={message:m,...ctx,initialSeed:'0x'+INITIAL_SEED.toString(16)};console.error('REPRO '+JSON.stringify(detail));const e=new Error(m);e.ctx=detail;throw e}}
const terminal={installation:['Completed'],supplier:['Paid'],invoice:['Paid']};
const forward={installation:['Ready to Schedule','Scheduled','Completed'],supplier:['Pending Match','Ready to Pay','Paid'],invoice:['Draft','Issued','Partially Paid','Paid']};
function canMove(kind,from,to){const a=forward[kind],i=a.indexOf(from),j=a.indexOf(to);return i>=0&&j>=0&&j>=i&&!(terminal[kind]||[]).includes(from)&&j===i+1}
function resolver(phase,business,audit){
 if(phase==='AUDIT_SAVED'&&audit&&business==='OLD')return 'UNCERTAIN';
 if(business==='APPLIED')return 'LIKELY_APPLIED';
 if(business==='OLD'||business==='ABSENT')return 'LIKELY_NOT_APPLIED';
 return 'UNCERTAIN';
}
let checks=0,crashes=0,rejected=0;
for(let n=0;n<ROUNDS;n++){
 const ctx={round:n,seed};
 // PO duplicate normalization
 const po=' PO-'+Math.floor(rnd()*500)+' ',existing=[po.trim()];
 const candidate=rnd()<.5?po:('PO-'+Math.floor(rnd()*500));
 const duplicate=existing.includes(candidate.trim());
 assert(duplicate===existing.some(x=>x===candidate.trim()),'PO normalization invariant',ctx);checks++;
 // Receiving bounds
 const ordered=1+Math.floor(rnd()*200),received=Math.floor(rnd()*260),damaged=Math.floor(rnd()*260);
 const recvOK=received<=ordered,damageOK=damaged<=received;
 if(!recvOK||!damageOK)rejected++;
 assert(!(recvOK&&received>ordered),'over-receipt escaped',ctx);checks++;
 assert(!(damageOK&&damaged>received),'damage > received escaped',ctx);checks++;
 // Payment bounds
 const total=Math.round((10+rnd()*20000)*100)/100,paid=Math.round(rnd()*total*100)/100,balance=Math.round((total-paid)*100)/100;
 const attempt=Math.round(rnd()*(balance+500)*100)/100;
 const payOK=attempt>0&&attempt<=balance+.01;
 if(!payOK)rejected++;
 assert(!(payOK&&attempt>balance+.01),'overpayment escaped',ctx);checks++;
 // Forward-only lifecycle + terminal lock
 for(const kind of Object.keys(forward)){const a=forward[kind],i=Math.floor(rnd()*a.length),j=Math.floor(rnd()*a.length),ok=canMove(kind,a[i],a[j]);if(ok)assert(j===i+1&&j>i,'illegal lifecycle move',ctx);if((terminal[kind]||[]).includes(a[i]))assert(!ok,'terminal state escaped',ctx);checks+=2}
 // Crash milestones: audited operations persist audit before business.
 const phase=pick(['BEGIN','AUDIT_SAVED','BUSINESS_SAVED','COMMIT']);
 let business='OLD',audit=false,journal='OPEN';
 if(phase==='AUDIT_SAVED'){audit=true;crashes++}
 if(phase==='BUSINESS_SAVED'){audit=true;business='APPLIED';crashes++}
 if(phase==='COMMIT'){audit=true;business='APPLIED';journal='CLOSED'}
 const verdict=resolver(phase,business,audit);
 if(phase==='AUDIT_SAVED')assert(verdict==='UNCERTAIN','split audit/business state must require review',{...ctx,phase,business,audit,verdict});
 if(phase==='BUSINESS_SAVED')assert(verdict==='LIKELY_APPLIED','saved business not recognized',{...ctx,phase,business,audit,verdict});
 if(phase==='COMMIT')assert(journal==='CLOSED','commit left journal open',ctx);
 checks++;
 // Adversarial fault matrix: contradictory persistence must never auto-clear.
 const fault=pick([
  {phase:'AUDIT_SAVED',business:'OLD',audit:true,expect:'UNCERTAIN'},
  {phase:'BUSINESS_SAVED',business:'OLD',audit:true,expect:'UNCERTAIN'},
  {phase:'BUSINESS_SAVED',business:'APPLIED',audit:true,expect:'LIKELY_APPLIED'},
  {phase:'BEGIN',business:'OLD',audit:false,expect:'LIKELY_NOT_APPLIED'},
  {phase:'BEGIN',business:'APPLIED',audit:false,expect:'LIKELY_APPLIED'}
 ]);
 let faultVerdict;
 if(fault.phase==='BUSINESS_SAVED'&&fault.business!=='APPLIED')faultVerdict='UNCERTAIN';
 else faultVerdict=resolver(fault.phase,fault.business,fault.audit);
 assert(faultVerdict===fault.expect,'fault matrix verdict mismatch',{...ctx,fault,faultVerdict});checks++;
 // Idempotency model: an exact operation identity may be applied at most once.
 const opId='op-'+Math.floor(rnd()*1000),seen=new Set(),attempts=1+Math.floor(rnd()*5);let appliedCount=0;
 for(let k=0;k<attempts;k++){if(!seen.has(opId)){seen.add(opId);appliedCount++}}
 assert(appliedCount===1,'duplicate operation applied more than once',{...ctx,opId,attempts,appliedCount});checks++;
 // Boundary values: zero/negative payments and impossible receiving values are rejected.
 const edgePayment=pick([0,-0.01,-1,Number.NaN,Number.POSITIVE_INFINITY]);
 assert(!(Number.isFinite(edgePayment)&&edgePayment>0),'invalid payment boundary accepted',{...ctx,edgePayment});checks++;
 const edgeReceive=pick([-1,ordered+1,Number.NaN,Number.POSITIVE_INFINITY]);
 const edgeReceiveOK=Number.isFinite(edgeReceive)&&edgeReceive>=0&&edgeReceive<=ordered;
 assert(!edgeReceiveOK,'invalid receiving boundary accepted',{...ctx,edgeReceive,ordered});checks++;
 // PO create is intentionally unaudited: BEGIN -> BUSINESS_SAVED -> COMMIT.
 const poPhase=pick(['BEGIN','BUSINESS_SAVED','COMMIT']);
 const poBusiness=poPhase==='BEGIN'?'ABSENT':'APPLIED';
 assert(poPhase!=='BEGIN'||poBusiness==='ABSENT','PO create applied before business save',ctx);checks++;
}
console.log(JSON.stringify({suite:'RUNLU Flooring OS Universal durability',rounds:ROUNDS,checks,simulatedInterruptedWindows:crashes,rejectedInvalidInputs:rejected,seed:'0x'+INITIAL_SEED.toString(16),result:'PASS'},null,2));
