#!/usr/bin/env node
const nodes={
 EXP_A:{critical:true,up:["IMPL_A","DATA_A"]},IMPL_A:{critical:true,up:["ROOT_CODE_A"]},DATA_A:{critical:true,up:["ROOT_DATA_A"]},
 ROOT_CODE_A:{critical:true,root:true,up:[]},ROOT_DATA_A:{critical:true,root:true,up:[]},

 EXP_B:{critical:true,up:["IMPL_B","DATA_B"]},IMPL_B:{critical:true,up:["UNKNOWN_LIB_B"]},DATA_B:{critical:true,up:["ROOT_DATA_B"]},
 UNKNOWN_LIB_B:{critical:true,unknown:true,up:[]},ROOT_DATA_B:{critical:true,root:true,up:[]},

 EXP_C:{critical:true,up:["IMPL_C","OPTIONAL_NOTE"]},IMPL_C:{critical:true,up:["ROOT_CODE_C"]},ROOT_CODE_C:{critical:true,root:true,up:[]},
 OPTIONAL_NOTE:{critical:false,up:["MISSING_NOTE_SOURCE"]},

 EXP_D:{critical:true,up:["MISSING_CRITICAL_IMPL"]}
};
function audit(start){
 const stack=[{id:start,path:[start],criticalPath:true}],knownRoots=[],unknownCritical=[],unresolvedCritical=[],secondaryMissing=[];
 const seen=new Set();
 while(stack.length){
  const cur=stack.pop(),key=cur.id+"|"+cur.criticalPath;if(seen.has(key))continue;seen.add(key);
  const n=nodes[cur.id];
  if(!n){(cur.criticalPath?unresolvedCritical:secondaryMissing).push(cur.path);continue}
  const cp=cur.criticalPath && n.critical!==false;
  if(n.unknown){if(cp)unknownCritical.push(cur.path);continue}
  if(n.root){knownRoots.push(cur.path);continue}
  for(const u of n.up)stack.push({id:u,path:[...cur.path,u],criticalPath:cp});
 }
 let status;
 if(unknownCritical.length||unresolvedCritical.length)status="UNKNOWN_CRITICAL_PATH";
 else if(secondaryMissing.length)status="PARTIAL_PROVENANCE";
 else status="COMPLETE_DECLARED_PATHS";
 return {experiment:start,status,knownRoots,unknownCritical,unresolvedCritical,secondaryMissing};
}
const results=["EXP_A","EXP_B","EXP_C","EXP_D"].map(audit),m=Object.fromEntries(results.map(x=>[x.experiment,x]));
if(m.EXP_A.status!=="COMPLETE_DECLARED_PATHS")throw new Error("A");
if(m.EXP_B.status!=="UNKNOWN_CRITICAL_PATH")throw new Error("B");
if(m.EXP_C.status!=="PARTIAL_PROVENANCE")throw new Error("C");
if(m.EXP_D.status!=="UNKNOWN_CRITICAL_PATH")throw new Error("D");
function replicationLanguage(a,b,noCommonRoot=true){
 const x=m[a],y=m[b];
 if(!noCommonRoot)return "DEPENDENCY_DETECTED";
 if(x.status==="UNKNOWN_CRITICAL_PATH"||y.status==="UNKNOWN_CRITICAL_PATH")return "REPLICATION_INDEPENDENCE_UNRESOLVED";
 if(x.status==="PARTIAL_PROVENANCE"||y.status==="PARTIAL_PROVENANCE")return "INDEPENDENCE_CANDIDATE_WITH_PROVENANCE_CAVEAT";
 return "INDEPENDENCE_CANDIDATE";
}
const pairDecisions=[
 {pair:["EXP_A","EXP_B"],decision:replicationLanguage("EXP_A","EXP_B")},
 {pair:["EXP_A","EXP_C"],decision:replicationLanguage("EXP_A","EXP_C")}
];
if(pairDecisions[0].decision!=="REPLICATION_INDEPENDENCE_UNRESOLVED")throw new Error("downgrade");
console.log(JSON.stringify({schema:"e086-provenance-completeness-v1",results,pairDecisions,
 conclusion:"Failure to find a common ancestor is interpretable only relative to provenance coverage; unknown critical paths prevent an independence claim."},null,2));