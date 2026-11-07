// AI Director offline budget ledger. Values are integer CAD cents.
// In-memory prototype only: production must use transactional durable storage.
const cents=n=>Number.isSafeInteger(n)&&n>=0;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s);
export class DramaBudgetLedger {
 constructor({budgetCents}){
  if(!cents(budgetCents)||budgetCents===0)throw Error('Positive budget required');
  this.budgetCents=budgetCents;this.confirmed=false;this.attempts=new Map();
 }
 confirm(){this.confirmed=true;}
 get summary(){
  const all=[...this.attempts.values()];
  const chargedCents=all.reduce((n,a)=>n+a.chargedCents,0);
  const reservedCents=all.filter(a=>a.state==='RESERVED'||a.state==='SUBMITTED'||a.state==='UNKNOWN')
    .reduce((n,a)=>n+a.estimateCents,0);
  return {budgetCents:this.budgetCents,chargedCents,reservedCents,
   availableCents:this.budgetCents-chargedCents-reservedCents,confirmed:this.confirmed};
 }
 reserve({attemptId,shotId,estimateCents}){
  if(!this.confirmed)throw Error('User confirmation required');
  if(!id(attemptId)||!id(shotId)||!cents(estimateCents)||estimateCents===0)throw Error('Invalid reservation');
  const existing=this.attempts.get(attemptId);
  if(existing){
   if(existing.shotId!==shotId||existing.estimateCents!==estimateCents)throw Error('Attempt ID collision');
   return {...existing};
  }
  if(this.summary.availableCents<estimateCents)throw Error('Budget limit exceeded');
  const attempt={attemptId,shotId,estimateCents,chargedCents:0,state:'RESERVED'};
  this.attempts.set(attemptId,attempt);return {...attempt};
 }
 submit(attemptId){
  const a=this.attempts.get(attemptId);
  if(!a||a.state!=='RESERVED')throw Error('Reservation required');
  a.state='SUBMITTED';return {...a};
 }
 settle({attemptId,chargedCents}){
  const a=this.attempts.get(attemptId);
  if(!a||!['RESERVED','SUBMITTED','UNKNOWN'].includes(a.state)||!cents(chargedCents))
   throw Error('Invalid settlement');
  // A charge above estimate requires explicit reconciliation; do not silently exceed budget.
  if(chargedCents>this.summary.availableCents+a.estimateCents)throw Error('Charge exceeds remaining budget');
  a.chargedCents=chargedCents;a.state='SETTLED';return {...a};
 }
 markUnknown(attemptId){
  const a=this.attempts.get(attemptId);
  if(!a||a.state!=='SUBMITTED')throw Error('Submitted attempt required');
  a.state='UNKNOWN';return {...a};
 }
 release(attemptId){
  const a=this.attempts.get(attemptId);
  if(!a||a.state!=='RESERVED')throw Error('Only unsubmitted reservations can be released');
  a.state='RELEASED';return {...a};
 }
 retry({priorAttemptId,attemptId,estimateCents}){
  const prior=this.attempts.get(priorAttemptId);
  if(!prior||prior.state!=='SETTLED')throw Error('Prior attempt must be settled before retry');
  return this.reserve({attemptId,shotId:prior.shotId,estimateCents});
 }
}
