#!/usr/bin/env node
const conflict=[
 {channel:"ARCHITECTURE",depth:2,strong:true,bound:true,fresh:true,relevant:true},
 {channel:"REPRODUCIBLE_PROPAGATION",depth:3,strong:true,bound:true,fresh:true,relevant:true},
 {channel:"EMPIRICAL_CANDIDATE",depth:1,strong:true,bound:true,fresh:true,relevant:true}
];
const convergent=[
 {channel:"ARCHITECTURE",depth:2,strong:true,bound:true,fresh:true,relevant:true},
 {channel:"REPRODUCIBLE_PROPAGATION",depth:2,strong:true,bound:true,fresh:true,relevant:true},
 {channel:"EMPIRICAL_CANDIDATE",depth:2,strong:true,bound:true,fresh:true,relevant:true}
];
const incomplete=[
 {channel:"ARCHITECTURE",depth:2,strong:true,bound:true,fresh:true,relevant:true},
 {channel:"EMPIRICAL_CANDIDATE",depth:1,strong:true,bound:false,fresh:true,relevant:true}
];
function audit(xs){
 const eligible=xs.filter(x=>x.strong&&x.bound&&x.fresh&&x.relevant);
 if(eligible.length!==xs.length||eligible.length<2)return {status:"BOUNDARY_EVIDENCE_INCOMPLETE",eligible};
 const depths=[...new Set(eligible.map(x=>x.depth))];
 return {status:depths.length===1?"BOUNDARY_CONVERGENT":"BOUNDARY_CONFLICT",eligible,depths};
}
const result={conflict:audit(conflict),convergent:audit(convergent),incomplete:audit(incomplete)};
if(result.conflict.status!=="BOUNDARY_CONFLICT")throw new Error("conflict");
if(result.convergent.status!=="BOUNDARY_CONVERGENT")throw new Error("convergent");
if(result.incomplete.status!=="BOUNDARY_EVIDENCE_INCOMPLETE")throw new Error("incomplete");
console.log(JSON.stringify({
 schema:"e105-conflicting-boundary-evidence-v1",fixtures:{conflict,convergent,incomplete},result,
 conclusion:"Strong admissible evidence channels can support different ancestry boundaries. Disagreement must be preserved rather than averaged away."
},null,2));