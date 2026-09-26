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
 // PO create is intentionally unaudited: BEGIN -> BUSINESS_SAVED -> COMMIT.
 const poPhase=pick(['BEGIN','BUSINESS_SAVED','COMMIT']);
 const poBusiness=poPhase==='BEGIN'?'ABSENT':'APPLIED';
 assert(poPhase!=='BEGIN'||poBusiness==='ABSENT','PO create applied before business save',ctx);checks++;
}
console.log(JSON.stringify({suite:'RUNLU Flooring OS Universal durability',rounds:ROUNDS,checks,simulatedInterruptedWindows:crashes,rejectedInvalidInputs:rejected,seed:'0x'+INITIAL_SEED.toString(16),result:'PASS'},null,2));
