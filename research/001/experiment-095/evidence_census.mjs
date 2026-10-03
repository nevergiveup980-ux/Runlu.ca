#!/usr/bin/env node
const N=20;
const observers=Array.from({length:N},(_,i)=>"O"+String(i+1).padStart(2,"0"));
function rootsFromSizes(sizes){
 if(sizes.reduce((a,b)=>a+b,0)!==N)throw new Error("partition");
 const map={};let k=0;
 sizes.forEach((n,r)=>{for(let j=0;j<n;j++)map[observers[k++]]="R"+(r+1)});
 return map;
}
const partitions=[
 {id:"P20",sizes:Array(20).fill(1)},
 {id:"P3",sizes:[10,7,3]},
 {id:"P2",sizes:[17,3]},
 {id:"P1",sizes:[20]}
];
function audit(p){
 const assignment=rootsFromSizes(p.sizes),roots=new Set(Object.values(assignment));
 const raw=N,unique=roots.size,compression=raw/unique;
 return {id:p.id,clusterSizes:p.sizes,rawObserverCount:raw,uniqueCriticalRootCount:unique,observerPerRootRatio:compression,assignment};
}
const results=partitions.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.P20.uniqueCriticalRootCount!==20)throw new Error("P20");
if(m.P3.uniqueCriticalRootCount!==3)throw new Error("P3");
if(m.P2.uniqueCriticalRootCount!==2)throw new Error("P2");
if(m.P1.uniqueCriticalRootCount!==1)throw new Error("P1");
const range={min:Math.min(...results.map(x=>x.uniqueCriticalRootCount)),max:Math.max(...results.map(x=>x.uniqueCriticalRootCount))};
console.log(JSON.stringify({schema:"e095-evidence-census-v1",results,rootCountSensitivityRange:range,
 warning:"UNIQUE_CRITICAL_ROOT_COUNT is a provenance census, not an effective statistical sample size and not evidence strength.",
 conclusion:"The apparent multiplicity of 20 observers can collapse to 3, 2, or 1 declared provenance roots depending on the justified dependency partition; raw observer count must not be treated as independent confirmation count."},null,2));