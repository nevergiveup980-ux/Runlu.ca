#!/usr/bin/env node
const claim={
 id:"C062-1",
 text:"The three exponential parameter variants in the E059-E061 synthetic fixture should not be counted as three independent structural confirmations.",
 layers:[
  {id:"PARAMETER_ROBUSTNESS",status:"ROBUST",basis:"EXP10/20/30 share the same declared structural form; changing the parameter value does not create structural independence."},
  {id:"MODEL_FORM_ROBUSTNESS",status:"ROBUST",basis:"The claim concerns redundancy among exponential variants, not correctness of exponential versus other families."},
  {id:"ADMISSION_UNCERTAINTY",status:"ROBUST",basis:"Conditional on these variants being admitted, multiplicity does not create independent structure."},
  {id:"FAMILY_DEPENDENCE",status:"ROBUST",basis:"E059 exposes all three as one SMOOTH_RECENCY family."},
  {id:"VOCABULARY_SENSITIVITY",status:"ROBUST",basis:"E061 preserves pairwise similarity 1 and A-side Neff 1 across all three preregistered vocabularies."},
  {id:"EMPIRICAL_OPERATIONAL_BOUNDARY",status:"UNRESOLVED",basis:"No real warehouse telemetry has validated that these model families are operationally appropriate descriptions of fairness memory."}
 ]
};
function overall(layers){
 const a=layers.filter(x=>x.status!=="NOT_APPLICABLE");
 if(a.some(x=>x.status==="SENSITIVE"))return "SENSITIVE";
 if(a.some(x=>x.status==="UNRESOLVED"))return "UNRESOLVED";
 if(a.length && a.every(x=>x.status==="ROBUST"))return "ROBUST";
 return "UNRESOLVED";
}
const status=overall(claim.layers);
if(status!=="UNRESOLVED") throw new Error("empirical boundary must prevent overall robust label");
const methodological=overall(claim.layers.filter(x=>x.id!=="EMPIRICAL_OPERATIONAL_BOUNDARY"));
if(methodological!=="ROBUST") throw new Error("methodological subclaim should be robust");
console.log(JSON.stringify({
 schema:"e062-claim-ledger-v1",
 claim:{...claim,overall_status:status},
 methodological_subclaim_status:methodological,
 conclusion:"The narrow methodological redundancy claim is robust within the synthetic audit, but the broader operational relevance remains unresolved. No averaging is permitted."
},null,2));