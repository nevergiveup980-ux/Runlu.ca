// RUNLU STAGE 2.0 in-memory prototype queue. NOT production persistent storage.
import { validateRequest } from "./engine.mjs";
export class JobQueue {
 constructor({provider, maxAttempts=2, maxSpendCad=25, onEvent=()=>{}}) {
  if(!provider || typeof provider.generate !== "function") throw new Error("Provider required");
  if(!Number.isInteger(maxAttempts)||maxAttempts<1||maxAttempts>5) throw new Error("Invalid maxAttempts");
  if(!Number.isFinite(maxSpendCad)||maxSpendCad<=0) throw new Error("Invalid maxSpendCad");
  this.provider=provider; this.maxAttempts=maxAttempts; this.maxSpendCad=maxSpendCad; this.onEvent=onEvent;
  this.jobs=new Map(); this.nextId=1;
 }
 submit(input, estimatedCad) {
  const brief=validateRequest(input);
  if(!Number.isFinite(estimatedCad)||estimatedCad<0) throw new Error("Invalid estimated cost");
  if(estimatedCad>this.maxSpendCad) throw new Error("Estimated cost exceeds job budget");
  const id="STAGE-"+String(this.nextId++).padStart(5,"0");
  const job={id,brief,status:"QUEUED",attempts:0,spentCad:0,events:[],result:null};
  this.jobs.set(id,job); this.#emit(job,"QUEUED"); return this.snapshot(id);
 }
 #emit(job,status,detail) {
  job.status=status; const e={status,attempt:job.attempts,spentCad:job.spentCad,...(detail?{detail}:{})};
  job.events.push(e); this.onEvent(job.id,e);
 }
 snapshot(id) {
  const job=this.jobs.get(id); if(!job) throw new Error("Job not found");
  return structuredClone(job);
 }
 async run(id) {
  const job=this.jobs.get(id);
  if(!job) throw new Error("Job not found");
  if(job.status!=="QUEUED") throw new Error("Job is not queued");
  for(let attempt=1;attempt<=this.maxAttempts;attempt++){
   job.attempts=attempt;
   this.#emit(job,"GENERATING");
   let response;
   try { response=await this.provider.generate(job.brief,{id,attempt,budgetRemainingCad:this.maxSpendCad-job.spentCad}); }
   catch(e){ this.#emit(job,"RETRYABLE_ERROR",String(e?.message||e)); continue; }
   const billed=Number(response?.billedCad);
   if(!Number.isFinite(billed)||billed<0){this.#emit(job,"FAILED","Invalid provider billing");return this.snapshot(id);}
   job.spentCad=Number((job.spentCad+billed).toFixed(2));
   if(job.spentCad>this.maxSpendCad){this.#emit(job,"BUDGET_EXCEEDED");return this.snapshot(id);}
   if(response?.ok && response?.artifact?.kind==="mock-video" && response.artifact.simulated===true && response.artifact.verified===false){
    job.result=response.artifact; this.#emit(job,"SIMULATED_COMPLETE");return this.snapshot(id);
   }
   this.#emit(job,"RETRYABLE_ERROR","Provider did not return a verified artifact");
  }
  this.#emit(job,"FAILED","Attempt limit reached"); return this.snapshot(id);
 }
}
