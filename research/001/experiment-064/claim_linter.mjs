#!/usr/bin/env node
const rank={ANALYTIC:0,SYNTHETIC:1,OBSERVATIONAL:2,OPERATIONAL:3,PRODUCTION_SAFETY:4};
const rules=[
 {id:"R_PRODUCTION_SAFE",min:"PRODUCTION_SAFETY",re:/\bsafe for production\b/i},
 {id:"R_PRODUCTION_VALIDATED",min:"PRODUCTION_SAFETY",re:/\bproduction[- ]validated\b/i},
 {id:"R_WAREHOUSE_VALIDATED",min:"OBSERVATIONAL",re:/\bvalidated in (the )?warehouse\b/i},
 {id:"R_REAL_OPERATIONS_PROOF",min:"OPERATIONAL",re:/\bproves? (a )?real[- ]world operational benefit\b/i},
 {id:"R_IMPROVES_OPERATIONS",min:"OPERATIONAL",re:/\bimproves? warehouse operations\b/i},
 {id:"R_OBSERVED_DATA",min:"OBSERVATIONAL",re:/\bobserved in warehouse data\b/i},
 {id:"R_SIMULATION",min:"SYNTHETIC",re:/\b(in|under) (this|the) (simulation|synthetic (audit|fixture))\b/i},
 {id:"R_MODEL",min:"ANALYTIC",re:/\b(in|under) (this|the) model\b/i}
];
function lint(scope,text){
 const hits=rules.filter(r=>r.re.test(text)).map(r=>({rule:r.id,min_scope:r.min,overreach:rank[r.min]>rank[scope]}));
 return {scope,text,hits,status:hits.some(h=>h.overreach)?"REVIEW_REQUIRED":"NO_SCOPE_OVERREACH_DETECTED"};
}
const fixtures=[
 lint("SYNTHETIC","In this synthetic audit, the three exponential variants are structurally redundant."),
 lint("SYNTHETIC","This proves a real-world operational benefit."),
 lint("SYNTHETIC","The policy is safe for production."),
 lint("OBSERVATIONAL","This pattern was observed in warehouse data."),
 lint("OPERATIONAL","Controlled evaluation shows it improves warehouse operations.")
];
if(fixtures[0].status!=="NO_SCOPE_OVERREACH_DETECTED")throw new Error("bounded synthetic sentence should pass");
if(fixtures[1].status!=="REVIEW_REQUIRED")throw new Error("operational overreach must flag");
if(fixtures[2].status!=="REVIEW_REQUIRED")throw new Error("production safety overreach must flag");
console.log(JSON.stringify({
 schema:"e064-claim-language-linter-v1",
 rules:rules.map(({id,min})=>({id,min_scope:min})),
 fixtures,
 conclusion:"The linter catches declared high-risk scope phrases, but absence of a flag is not proof that prose is appropriately scoped."
},null,2));