// Offline end-to-end simulation: no external API, DB or playable MP4.
import {validateRequest} from "./engine.mjs";
import {BudgetLedger} from "./ledger.mjs";
import {MockVideoProvider} from "./mock-provider.mjs";
export async function simulateStageJob({jobId="demo-job",brief={durationSeconds:30,quality:"standard",format:"cinematic"},budgetCents=1000,reservationCents=500,provider=new MockVideoProvider({billedCad:2})}={}){
 const normalized=validateRequest(brief);
 const ledger=new BudgetLedger();ledger.create(jobId,budgetCents);
 const attemptId="demo-attempt-1";ledger.reserve(jobId,attemptId,reservationCents);
 let output;
 try{
  output=await provider.generate(normalized,{id:jobId,attempt:1,budgetRemainingCad:reservationCents/100});
 }catch(error){
  return {status:"RECONCILIATION_REQUIRED",reason:"Provider threw; billing unknown",ledger:ledger.snapshot(jobId)};
 }
 const bill=output?.billedCad;
 if(!Number.isFinite(bill)||bill<0||!Number.isSafeInteger(Math.round(bill*100))||Math.abs(bill*100-Math.round(bill*100))>1e-7){
  return {status:"RECONCILIATION_REQUIRED",reason:"Invalid provider billing",ledger:ledger.snapshot(jobId)};
 }
 const billedCents=Math.round(bill*100);
 if(billedCents>reservationCents){
  return {status:"RECONCILIATION_REQUIRED",reason:"Provider billed beyond reservation",ledger:ledger.snapshot(jobId)};
 }
 ledger.settle(jobId,attemptId,billedCents);
 return {status:output.ok?"SIMULATED_COMPLETE":"SIMULATED_FAILED",artifact:output.ok?output.artifact:null,ledger:ledger.snapshot(jobId)};
}
