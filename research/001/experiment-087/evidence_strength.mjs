#!/usr/bin/env node
const rank={INFERRED:0,HUMAN_DECLARED:1,MACHINE_DECLARED:2,VERIFIED_ARTIFACT:3};
const paths=[
 {id:"P_VERIFIED",edges:["VERIFIED_ARTIFACT","VERIFIED_ARTIFACT","VERIFIED_ARTIFACT"]},
 {id:"P_MACHINE",edges:["VERIFIED_ARTIFACT","MACHINE_DECLARED","VERIFIED_ARTIFACT"]},
 {id:"P_HUMAN",edges:["VERIFIED_ARTIFACT","HUMAN_DECLARED","VERIFIED_ARTIFACT"]},
 {id:"P_INFERRED",edges:["VERIFIED_ARTIFACT","INFERRED","VERIFIED_ARTIFACT"]}
];
function audit(p){
 const min=Math.min(...p.edges.map(x=>rank[x]));
 const weakest=Object.keys(rank).find(k=>rank[k]===min);
 const status=min===3?"VERIFIED_PATH":min===2?"MACHINE_SUPPORTED_PATH":min===1?"DECLARED_PATH":"WEAKLY_INFERRED_PATH";
 return {...p,weakest,status};
}
const results=paths.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.P_VERIFIED.status!=="VERIFIED_PATH")throw new Error("verified");
if(m.P_MACHINE.status!=="MACHINE_SUPPORTED_PATH")throw new Error("machine");
if(m.P_HUMAN.status!=="DECLARED_PATH")throw new Error("human");
if(m.P_INFERRED.status!=="WEAKLY_INFERRED_PATH")throw new Error("inferred");

function replicationDecision(pathStatus,noCommonRoot=true,complete=true){
 if(!complete)return "PROVENANCE_INCOMPLETE";
 if(!noCommonRoot)return "DEPENDENCY_DETECTED";
 if(pathStatus==="VERIFIED_PATH")return "INDEPENDENCE_CANDIDATE_VERIFIED_PROVENANCE";
 if(pathStatus==="MACHINE_SUPPORTED_PATH")return "INDEPENDENCE_CANDIDATE_MACHINE_PROVENANCE";
 return "REPLICATION_INDEPENDENCE_UNRESOLVED";
}
const decisions=results.map(r=>({id:r.id,decision:replicationDecision(r.status)}));
if(decisions.find(x=>x.id==="P_HUMAN").decision!=="REPLICATION_INDEPENDENCE_UNRESOLVED")throw new Error("human downgrade");
console.log(JSON.stringify({schema:"e087-provenance-strength-v1",rank,results,decisions,
 conclusion:"A complete provenance graph can still be evidentially weak; critical-path replication language must be bounded by the weakest supported edge."},null,2));