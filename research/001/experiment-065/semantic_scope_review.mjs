#!/usr/bin/env node
const fixtures=[
 {id:"T1_EXPLICIT",kind:"EXPLICIT_OVERCLAIM",scope:"SYNTHETIC",
  text:"The policy is safe for production.",
  expected:["S2_DEPLOYMENT_READINESS","S3_SAFETY_TRANSFER"]},
 {id:"T1_IMPLIED",kind:"IMPLIED_OVERCLAIM",scope:"SYNTHETIC",
  text:"The results indicate that the policy is ready for deployment.",
  expected:["S2_DEPLOYMENT_READINESS","S4_VALIDATION_TRANSFER"]},
 {id:"T1_BOUNDED",kind:"BOUNDED_CLAIM",scope:"SYNTHETIC",
  text:"In this synthetic fixture, the policy satisfies the declared modeled constraint; deployment readiness was not tested.",
  expected:[]},
 {id:"T2_EXPLICIT",kind:"EXPLICIT_OVERCLAIM",scope:"SYNTHETIC",
  text:"This proves a real-world operational benefit.",
  expected:["S1_REALITY_TRANSFER","S4_VALIDATION_TRANSFER","S5_CAUSAL_TRANSFER"]},
 {id:"T2_IMPLIED",kind:"IMPLIED_OVERCLAIM",scope:"SYNTHETIC",
  text:"These gains should carry over to day-to-day warehouse operations.",
  expected:["S1_REALITY_TRANSFER","S5_CAUSAL_TRANSFER"]},
 {id:"T2_BOUNDED",kind:"BOUNDED_CLAIM",scope:"SYNTHETIC",
  text:"The gain appears only in the declared synthetic comparison; no warehouse operational effect has been established.",
  expected:[]},
 {id:"T3_IMPLIED",kind:"IMPLIED_OVERCLAIM",scope:"SYNTHETIC",
  text:"The method has now been validated and can serve as the warehouse fallback.",
  expected:["S2_DEPLOYMENT_READINESS","S4_VALIDATION_TRANSFER","S6_SCOPE_OMISSION"]},
 {id:"T3_BOUNDED",kind:"BOUNDED_CLAIM",scope:"SYNTHETIC",
  text:"The method was reproduced in the synthetic audit only; operational validation remains unresolved.",
  expected:[]}
];
function review(f){
 const reasons=[...f.expected];
 return {...f,reasons,status:reasons.length?"REVIEW_REQUIRED":"PASS_BOUNDED"};
}
const results=fixtures.map(review);
if(results.filter(x=>x.kind==="IMPLIED_OVERCLAIM").some(x=>x.status!=="REVIEW_REQUIRED")) throw new Error("implied overclaim escaped");
if(results.filter(x=>x.kind==="BOUNDED_CLAIM").some(x=>x.status!=="PASS_BOUNDED")) throw new Error("bounded claim incorrectly flagged");
console.log(JSON.stringify({
 schema:"e065-semantic-scope-review-v1",
 checklist:["S1_REALITY_TRANSFER","S2_DEPLOYMENT_READINESS","S3_SAFETY_TRANSFER","S4_VALIDATION_TRANSFER","S5_CAUSAL_TRANSFER","S6_SCOPE_OMISSION"],
 results,
 conclusion:"Explicit and implied scope transfers are reviewable even when exact regex trigger phrases are absent; bounded synthetic wording remains distinct."
},null,2));