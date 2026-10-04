#!/usr/bin/env node
const cases=[
 {id:"CLEAN",cal:true,time:true,label:true,missing:true,representative:true},
 {id:"UNCALIBRATED",cal:false,time:true,label:true,missing:true,representative:true},
 {id:"TIME_SHIFT",cal:true,time:false,label:true,missing:true,representative:true},
 {id:"LABEL_LEAK",cal:true,time:true,label:false,missing:true,representative:true},
 {id:"SELECTIVE_MISSING",cal:true,time:true,label:true,missing:false,representative:true},
 {id:"WRONG_SCOPE",cal:true,time:true,label:true,missing:true,representative:false}
];
function audit(x){
 const failed=[];
 if(!x.cal)failed.push("CALIBRATION_VALID");
 if(!x.time)failed.push("TEMPORALLY_ALIGNED");
 if(!x.label)failed.push("LABEL_INDEPENDENT");
 if(!x.missing)failed.push("MISSINGNESS_ACCEPTABLE");
 if(!x.representative)failed.push("REPRESENTATIVE_FOR_SCOPE");
 return {...x,failed,status:failed.length?"GROUND_TRUTH_NOT_ESTABLISHED":"EMPIRICAL_ORACLE_CANDIDATE"};
}
const results=cases.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.CLEAN.status!=="EMPIRICAL_ORACLE_CANDIDATE")throw new Error("clean");
for(const id of ["UNCALIBRATED","TIME_SHIFT","LABEL_LEAK","SELECTIVE_MISSING","WRONG_SCOPE"])
 if(m[id].status!=="GROUND_TRUTH_NOT_ESTABLISHED")throw new Error(id);
console.log(JSON.stringify({schema:"e092-measurement-chain-v1",results,
 conclusion:"Noncircular empirical provenance is insufficient by itself: calibration, timing, label independence, missingness, and scope representativeness can each prevent an empirical oracle from qualifying as ground truth."},null,2));