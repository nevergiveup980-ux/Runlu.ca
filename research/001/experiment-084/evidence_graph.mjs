#!/usr/bin/env node
const exps=[
 {id:"A",scenario:"S1",sim:"SIM1",random:"SEEDSET1",prep:"P1",assumption:"M1",origin:"SYN1",impl:"I1"},
 {id:"B",scenario:"S1",sim:"SIM1",random:"SEEDSET1",prep:"P1",assumption:"M1",origin:"SYN1",impl:"I1"},
 {id:"C",scenario:"S2",sim:"SIM1",random:"SEEDSET2",prep:"P1",assumption:"M1",origin:"SYN2",impl:"I1"},
 {id:"D",scenario:"S3",sim:"SIM2",random:"ENUM",prep:"P2",assumption:"M2",origin:"SYN3",impl:"I2"},
 {id:"E",scenario:"S4",sim:"SIM3",random:"ENUM2",prep:"P3",assumption:"M3",origin:"OBS1",impl:"I3"}
];
const keys=["scenario","sim","random","prep","assumption","origin","impl"];
function pair(a,b){
 const shared=keys.filter(k=>a[k]===b[k]), changed=keys.filter(k=>a[k]!==b[k]);
 let relation;
 if(shared.length===keys.length)relation="REANALYSIS";
 else if(shared.includes("origin")||shared.includes("sim")||shared.includes("assumption"))relation="PARTIAL_REPLICATION";
 else relation="INDEPENDENT_REPLICATION_CANDIDATE";
 return {a:a.id,b:b.id,shared,changed,relation};
}
const edges=[];
for(let i=0;i<exps.length;i++)for(let j=i+1;j<exps.length;j++)edges.push(pair(exps[i],exps[j]));
const get=(a,b)=>edges.find(x=>x.a===a&&x.b===b);
if(get("A","B").relation!=="REANALYSIS")throw new Error("rean");
if(get("A","C").relation!=="PARTIAL_REPLICATION")throw new Error("partial");
if(get("D","E").relation!=="INDEPENDENT_REPLICATION_CANDIDATE")throw new Error("candidate");
console.log(JSON.stringify({schema:"e084-evidence-independence-v1",experiments:exps,edges,
 warning:"INDEPENDENT_REPLICATION_CANDIDATE means no critical dependency is declared in this fixture; it is not proof of true independence.",
 conclusion:"Repeated analyses sharing scenarios, simulator, assumptions, preprocessing, or data origin must not be counted mechanically as independent replications."},null,2));