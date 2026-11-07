// Validate server-provided AI Director snapshot before it reaches the UI.
// This is a transport-safe projection, not an authentication or API implementation.
const STATES=new Set(['READY','RESERVED','SUBMITTED','UNKNOWN','FAILED','SUCCEEDED']);
const ATTEMPTS=new Set(['RESERVED','SUBMITTED','UNKNOWN','SETTLED']);
const ID=/^[a-zA-Z0-9_-]{1,100}$/;
const validMoney=v=>Number.isSafeInteger(v)&&v>=0;
export function projectDirectorDashboard(snapshot){
 if(!snapshot||typeof snapshot!=='object'||!ID.test(snapshot.episodeId??''))
  throw Error('Invalid director snapshot identity');
 const b=snapshot.budget;
 if(!b||!validMoney(b.limitCents)||!validMoney(b.committedCents)||
    !Number.isSafeInteger(b.remainingCents)||b.remainingCents!==b.limitCents-b.committedCents||
    typeof b.paused!=='boolean')
  throw Error('Invalid director budget snapshot');
 if(!Array.isArray(snapshot.shots)||!Array.isArray(snapshot.attempts)||snapshot.shots.length>500||
    snapshot.attempts.length>5000)throw Error('Invalid director snapshot collections');
 const shots=snapshot.shots.map(s=>{
  if(!s||!ID.test(s.shotId??'')||!STATES.has(s.state))throw Error('Invalid shot status');
  return {shotId:s.shotId,state:s.state,hasOutput:Boolean(s.outputAssetId)};
 });
 if(new Set(shots.map(s=>s.shotId)).size!==shots.length)throw Error('Duplicate shot IDs');
 const attempts=snapshot.attempts.map(a=>{
  if(!a||!ID.test(a.attemptId??'')||!ID.test(a.shotId??'')||
     !ATTEMPTS.has(a.state)||!validMoney(a.estimateCents)||
     (a.chargedCents!==null&&!validMoney(a.chargedCents)))
   throw Error('Invalid attempt record');
  return {attemptId:a.attemptId,shotId:a.shotId,state:a.state,
    estimateCents:a.estimateCents,chargedCents:a.chargedCents,
    overBudget:a.overBudget===true};
 });
 const unknown=attempts.some(a=>a.state==='UNKNOWN');
 const overcharge=attempts.some(a=>a.overBudget);
 const alert=snapshot.alerts;
 if(!alert||typeof alert.unknownProviderOutcome!=='boolean'||
    typeof alert.overBudgetCharge!=='boolean'||typeof alert.requiresAttention!=='boolean')
  throw Error('Invalid alert snapshot');
 if(unknown&&!alert.unknownProviderOutcome||overcharge&&!alert.overBudgetCharge||
    (b.paused||alert.unknownProviderOutcome||alert.overBudgetCharge)&&!alert.requiresAttention)
  throw Error('Inconsistent director alert snapshot');
 return {
  episodeId:snapshot.episodeId,
  budget:{limitCents:b.limitCents,committedCents:b.committedCents,
    remainingCents:b.remainingCents,paused:b.paused,pauseReason:b.pauseReason??null},
  shots,attempts,
  progress:{total:shots.length,completed:shots.filter(s=>s.state==='SUCCEEDED').length},
  alerts:{...alert}
 };
}
