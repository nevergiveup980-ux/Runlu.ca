#!/usr/bin/env node
const rank={ASSERTED:1,DOCUMENTED:2,MACHINE_VERIFIED:3,REPRODUCIBLE_PROPAGATION:4,EMPIRICAL_CANDIDATE:5};
const records=[
 {id:"B1",level:"ASSERTED",auditable:true,bound:true,fresh:true,relevant:true},
 {id:"B2",level:"DOCUMENTED",auditable:true,bound:true,fresh:true,relevant:true},
 {id:"B3",level:"MACHINE_VERIFIED",auditable:true,bound:true,fresh:true,relevant:true},
 {id:"B4",level:"REPRODUCIBLE_PROPAGATION",auditable:true,bound:true,fresh:true,relevant:true},
 {id:"B5",level:"EMPIRICAL_CANDIDATE",auditable:true,bound:true,fresh:true,relevant:true},
 {id:"B6",level:"MACHINE_VERIFIED",auditable:true,bound:false,fresh:true,relevant:true},
 {id:"B7",level:"REPRODUCIBLE_PROPAGATION",auditable:true,bound:true,fresh:false,relevant:true},
 {id:"B8",level:"EMPIRICAL_CANDIDATE",auditable:true,bound:true,fresh:true,relevant:false}
];
function status(r){
 if(!r.auditable)return "EVIDENCE_UNRESOLVED";
 if(!r.bound)return "ARTIFACT_BINDING_FAILED";
 if(!r.fresh)return "EVIDENCE_STALE";
 if(!r.relevant)return "MECHANISM_RELEVANCE_UNRESOLVED";
 return rank[r.level]>=4?"STRONG_BOUNDARY_SUPPORT":rank[r.level]>=2?"LIMITED_BOUNDARY_SUPPORT":"WEAK_BOUNDARY_SUPPORT";
}
const results=records.map(r=>({...r,rank:rank[r.level],status:status(r)}));
const g=id=>results.find(x=>x.id===id);
if(g("B1").status!=="WEAK_BOUNDARY_SUPPORT")throw new Error("B1");
if(g("B3").status!=="LIMITED_BOUNDARY_SUPPORT")throw new Error("B3");
if(g("B4").status!=="STRONG_BOUNDARY_SUPPORT")throw new Error("B4");
if(g("B6").status!=="ARTIFACT_BINDING_FAILED")throw new Error("B6");
if(g("B7").status!=="EVIDENCE_STALE")throw new Error("B7");
if(g("B8").status!=="MECHANISM_RELEVANCE_UNRESOLVED")throw new Error("B8");
console.log(JSON.stringify({
 schema:"e104-boundary-evidence-strength-v1",rank,results,
 conclusion:"Traceable rationale and evidential strength are separate. Strong evidence also requires correct artifact binding, freshness, and failure-mechanism relevance."
},null,2));