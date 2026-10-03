#!/usr/bin/env node
const heterogeneous=[
 {channel:"ARCHITECTURE",depth:2,failure:"SOFTWARE_FAULT",timescale:"SHORT",regime:"NORMAL"},
 {channel:"REPRODUCIBLE_PROPAGATION",depth:3,failure:"CALIBRATION_DRIFT",timescale:"LONG",regime:"NORMAL"},
 {channel:"EMPIRICAL_CANDIDATE",depth:1,failure:"SOFTWARE_FAULT",timescale:"SHORT",regime:"SURGE"}
];
const trueConflict=[
 {channel:"ARCHITECTURE",depth:2,failure:"SOFTWARE_FAULT",timescale:"SHORT",regime:"NORMAL"},
 {channel:"REPRODUCIBLE_PROPAGATION",depth:1,failure:"SOFTWARE_FAULT",timescale:"SHORT",regime:"NORMAL"}
];
const key=x=>[x.failure,x.timescale,x.regime].join("|");
function audit(xs){
 const pooled=[...new Set(xs.map(x=>x.depth))];
 const groups={}; for(const x of xs)(groups[key(x)]??=[]).push(x);
 const conditioned=Object.entries(groups).map(([context,items])=>({context,depths:[...new Set(items.map(x=>x.depth))],channels:items.map(x=>x.channel)}));
 const within=conditioned.filter(g=>g.depths.length>1);
 return {
  pooled_status:pooled.length>1?"POOLED_CONFLICT":"POOLED_CONVERGENCE",
  conditioned_status:within.length?"WITHIN_CONTEXT_CONFLICT":"CONTEXT_EXPLAINS_APPARENT_CONFLICT",
  conditioned,within_conflicts:within
 };
}
const result={heterogeneous:audit(heterogeneous),trueConflict:audit(trueConflict)};
if(result.heterogeneous.pooled_status!=="POOLED_CONFLICT"||result.heterogeneous.conditioned_status!=="CONTEXT_EXPLAINS_APPARENT_CONFLICT")throw new Error("heterogeneous");
if(result.trueConflict.conditioned_status!=="WITHIN_CONTEXT_CONFLICT")throw new Error("true conflict");
console.log(JSON.stringify({
 schema:"e106-conflict-decomposition-v1",
 conditioning:["failure","timescale","regime"],
 fixtures:{heterogeneous,trueConflict},result,
 conclusion:"Pooled boundary disagreement can disappear after justified context conditioning, while disagreement inside an identical context remains a genuine unresolved conflict."
},null,2));