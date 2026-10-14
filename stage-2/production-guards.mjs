// Prototype-only safety wrapper. Does not replace durable DB transactions or billing reconciliation.
import { validateRequest } from "./engine.mjs";
export class GuardedJobRunner {
 #jobs=new Map(); #counter=0;
 constructor({provider,maxAttempts=2,maxBudgetCad=25,attemptReserveCad=5}={}){
  if(typeof provider?.generate!=="function")throw Error("Provider required");
  if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>5)throw Error("Invalid attempts");
  if(!Number.isFinite(maxBudgetCad)||maxBudgetCad<=0||!Number.isFinite(attemptReserveCad)||attemptReserveCad<=0)throw Error("Invalid budgets");
  this.provider=provider;this.maxAttempts=maxAttempts;this.maxBudgetCad=maxBudgetCad;this.attemptReserveCad=attemptReserveCad;
 }
 submit(brief){
  const spec=validateRequest(brief);const id="STG-"+String(++this.#counter).padStart(6,"0");
  this.#jobs.set(id,{id,spec,state:"QUEUED",attempts:0,spentCad:0,reservedCad:0,events:[{type:"QUEUED"}]});
  return this.get(id);
 }
 get(id){const job=this.#jobs.get(id);if(!job)throw Error("Not found");return structuredClone(job);}
 async run(id){
  const job=this.#jobs.get(id);if(!job)throw Error("Not found");
  // Synchronous state transition before the first await prevents concurrent duplicate execution.
  if(job.state!=="QUEUED")throw Error("Not queued");
  job.state="RUNNING";
  for(let n=1;n<=this.maxAttempts;n++){
   if(job.spentCad+this.attemptReserveCad>this.maxBudgetCad){
    job.state="BUDGET_BLOCKED";job.events.push({type:"BUDGET_BLOCKED"});return this.get(id);
   }
   job.attempts=n;job.reservedCad=this.attemptReserveCad;
   job.events.push({type:"RESERVED",attempt:n,amountCad:this.attemptReserveCad});
   let result;
   try{result=await this.provider.generate(job.spec,{id,attempt:n,maxChargeCad:this.attemptReserveCad});}
   catch(error){
    // Unknown actual billing after a network exception: hold reservation and require reconciliation.
    job.state="RECONCILIATION_REQUIRED";job.events.push({type:"UNKNOWN_BILLING",attempt:n});
    return this.get(id);
   }
   const billed=result?.billedCad;
   if(typeof billed!=="number"||!Number.isFinite(billed)||billed<0||billed>this.attemptReserveCad){
    job.state="RECONCILIATION_REQUIRED";job.events.push({type:"BILLING_MISMATCH",attempt:n});return this.get(id);
   }
   job.spentCad=Math.round((job.spentCad+billed)*100)/100;job.reservedCad=0;
   job.events.push({type:"CHARGED",attempt:n,amountCad:billed});
   if(result.ok===true&&result.artifact?.kind==="mock-video"&&result.artifact?.verified===true){
    job.state="SIMULATED_COMPLETE";job.artifact=structuredClone(result.artifact);
    job.events.push({type:"SIMULATED_COMPLETE"});return this.get(id);
   }
  }
  job.state="FAILED";job.events.push({type:"FAILED"});return this.get(id);
 }
}
