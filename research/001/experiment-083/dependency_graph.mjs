#!/usr/bin/env node
const nodes=[
 {id:"MEAN_LOSS",family:"EFFICIENCY_LOSS",role:"DISTRIBUTION_SUMMARY"},
 {id:"TAIL95_LOSS",family:"EFFICIENCY_LOSS",role:"DISTRIBUTION_SUMMARY"},
 {id:"WORST_LOSS",family:"EFFICIENCY_LOSS",role:"DISTRIBUTION_SUMMARY"},
 {id:"FAIRNESS_GAP",family:"FAIRNESS",role:"DISTINCT_OBJECTIVE"},
 {id:"SAFETY_ENVELOPE_VIOLATION",family:"SAFETY",role:"PROTECTED_CONSTRAINT"}
];
const edges=[
 ["MEAN_LOSS","TAIL95_LOSS","SAME_SOURCE"],
 ["MEAN_LOSS","WORST_LOSS","SAME_SOURCE"],
 ["TAIL95_LOSS","WORST_LOSS","SAME_SOURCE"],
 ["TAIL95_LOSS","WORST_LOSS","MATHEMATICALLY_ORDERED"]
];
const fixtures=[
 {id:"ALL_PASS",pass:["MEAN_LOSS","TAIL95_LOSS","WORST_LOSS","FAIRNESS_GAP","SAFETY_ENVELOPE_VIOLATION"]},
 {id:"EFFICIENCY_ONLY_PASS",pass:["MEAN_LOSS","TAIL95_LOSS","WORST_LOSS"]},
 {id:"SAFETY_FAIL",pass:["MEAN_LOSS","TAIL95_LOSS","WORST_LOSS","FAIRNESS_GAP"]}
];
function audit(f){
 const families=new Set(f.pass.map(id=>nodes.find(n=>n.id===id).family));
 const efficiencyPassCount=f.pass.filter(id=>nodes.find(n=>n.id===id).family==="EFFICIENCY_LOSS").length;
 const independentEfficiencyConfirmations=efficiencyPassCount?1:0;
 const safetyPassed=f.pass.includes("SAFETY_ENVELOPE_VIOLATION");
 return {id:f.id,rawPassCount:f.pass.length,familyPassCount:families.size,
  efficiencyPassCount,independentEfficiencyConfirmations,safetyPassed,
  status:!safetyPassed?"PROTECTED_FAIL":families.has("EFFICIENCY_LOSS")&&families.has("FAIRNESS")?"MULTI_OBJECTIVE_PASS":"PARTIAL"};
}
const results=fixtures.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.ALL_PASS.efficiencyPassCount!==3||m.ALL_PASS.independentEfficiencyConfirmations!==1)throw new Error("pseudo replication");
if(m.SAFETY_FAIL.status!=="PROTECTED_FAIL")throw new Error("safety");
console.log(JSON.stringify({schema:"e083-metric-dependency-v1",nodes,edges,results,
 conclusion:"Three passing summaries of one efficiency-loss distribution are not three independent confirmations; objective families and protected constraints must be reported separately."},null,2));