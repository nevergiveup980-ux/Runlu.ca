#!/usr/bin/env node
const profile={0:5,1:4,2:2,3:1}, threshold=3;
const records=[
 {id:"D_ARCH",depth:2,basis:"ARCHITECTURE",precommitted:true,auditable:true,truncated:false},
 {id:"D_CAUSAL",depth:2,basis:"CAUSAL_MECHANISM",precommitted:true,auditable:true,truncated:false},
 {id:"D_CONVENTION",depth:1,basis:"CONVENTION",precommitted:true,auditable:true,truncated:false},
 {id:"D_AVAILABILITY",depth:1,basis:"DATA_AVAILABILITY",precommitted:true,auditable:true,truncated:true},
 {id:"D_POSTHOC",depth:1,basis:"POST_HOC_RESULT",precommitted:false,auditable:true,truncated:false},
 {id:"D_UNKNOWN",depth:2,basis:"UNKNOWN",precommitted:false,auditable:false,truncated:false}
];
function classify(r){
 if(!r.auditable||r.basis==="UNKNOWN")return "DEPTH_SELECTION_UNRESOLVED";
 if(r.basis==="POST_HOC_RESULT"||!r.precommitted)return "POST_HOC_DEPTH_SELECTION";
 if(r.truncated||r.basis==="DATA_AVAILABILITY")return "AVAILABILITY_LIMITED_BOUNDARY";
 if(r.basis==="ARCHITECTURE"||r.basis==="CAUSAL_MECHANISM")return "MECHANISM_JUSTIFIED_BOUNDARY";
 return "CONVENTION_JUSTIFIED_BOUNDARY";
}
const results=records.map(r=>{
 const families=profile[r.depth], verdict=families>=threshold?"DIVERSITY_THRESHOLD_MET":"DIVERSITY_THRESHOLD_NOT_MET";
 const adjacent=[r.depth-1,r.depth+1].filter(d=>profile[d]!=null).map(d=>({depth:d,families:profile[d],verdict:profile[d]>=threshold?"DIVERSITY_THRESHOLD_MET":"DIVERSITY_THRESHOLD_NOT_MET"}));
 return {...r,families,verdict,selection_status:classify(r),adjacent,adjacent_flip:adjacent.some(x=>x.verdict!==verdict)};
});
const g=id=>results.find(x=>x.id===id);
if(g("D_ARCH").selection_status!=="MECHANISM_JUSTIFIED_BOUNDARY")throw new Error("arch");
if(g("D_POSTHOC").selection_status!=="POST_HOC_DEPTH_SELECTION")throw new Error("posthoc");
if(g("D_AVAILABILITY").selection_status!=="AVAILABILITY_LIMITED_BOUNDARY")throw new Error("availability");
if(g("D_UNKNOWN").selection_status!=="DEPTH_SELECTION_UNRESOLVED")throw new Error("unknown");
if(!g("D_POSTHOC").adjacent_flip)throw new Error("flip");
console.log(JSON.stringify({
 schema:"e103-depth-selection-provenance-v1",threshold,profile,results,
 conclusion:"Depth sensitivity does not justify a primary depth. The boundary requires auditable selection provenance, and post-hoc result-preserving selection is distinguishable from mechanism-based selection."
},null,2));