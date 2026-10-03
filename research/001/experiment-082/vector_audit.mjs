#!/usr/bin/env node
const bounds={MEAN_LOSS:.05,WORST_LOSS:.15,TAIL95_LOSS:.10,FAIRNESS_GAP:.08};
const scenarios=[
 {id:"BALANCED_STRESS",MEAN_LOSS:.03,WORST_LOSS:.10,TAIL95_LOSS:.07,FAIRNESS_GAP:.05},
 {id:"TAIL_MASKED",MEAN_LOSS:.04,WORST_LOSS:.14,TAIL95_LOSS:.13,FAIRNESS_GAP:.06},
 {id:"FAIRNESS_MASKED",MEAN_LOSS:.03,WORST_LOSS:.12,TAIL95_LOSS:.08,FAIRNESS_GAP:.11},
 {id:"MULTIPLE_FAILURES",MEAN_LOSS:.06,WORST_LOSS:.18,TAIL95_LOSS:.14,FAIRNESS_GAP:.10}
];
function audit(s){
 const checks=Object.fromEntries(Object.entries(bounds).map(([k,b])=>[k,{value:s[k],bound:b,pass:s[k]<=b}]));
 const failed=Object.entries(checks).filter(([,v])=>!v.pass).map(([k])=>k);
 let status;
 if(!failed.length)status="VECTOR_ROBUST";
 else if(checks.MEAN_LOSS.pass)status="SCALAR_MASKING";
 else status="MULTI_METRIC_FAIL";
 return {id:s.id,checks,failed,status};
}
const results=scenarios.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.BALANCED_STRESS.status!=="VECTOR_ROBUST")throw new Error("balanced");
if(m.TAIL_MASKED.status!=="SCALAR_MASKING"||!m.TAIL_MASKED.failed.includes("TAIL95_LOSS"))throw new Error("tail");
if(m.FAIRNESS_MASKED.status!=="SCALAR_MASKING"||!m.FAIRNESS_MASKED.failed.includes("FAIRNESS_GAP"))throw new Error("fairness");
if(m.MULTIPLE_FAILURES.status!=="MULTI_METRIC_FAIL")throw new Error("multi");
console.log(JSON.stringify({schema:"e082-multi-metric-v1",bounds,results,
 conclusion:"Passing a mean-loss bound does not establish vector robustness; tail, worst-case, and fairness outcomes must retain their own preregistered constraints."},null,2));