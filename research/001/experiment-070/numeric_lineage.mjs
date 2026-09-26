#!/usr/bin/env node
const sources={
 R:{id:"R",version:1,value:0.0961840629},
 A:{id:"A",version:2,value:0.1946250383},
 B:{id:"B",version:1,value:0.0984409754}
};
const claims=[
 {id:"PERCENT",sources:[["R",1]],op:"PERCENT",displayed:9.62,tolerance:0.005},
 {id:"ROUND",sources:[["R",1]],op:"ROUND",digits:4,displayed:0.0962,tolerance:0.00005},
 {id:"DIFF",sources:[["A",2],["B",1]],op:"DIFFERENCE",displayed:0.0961840629,tolerance:1e-10},
 {id:"RATIO",sources:[["B",1],["A",2]],op:"RATIO",displayed:0.5058,tolerance:0.00005},
 {id:"BAD_VALUE",sources:[["R",1]],op:"PERCENT",displayed:10.0,tolerance:0.005},
 {id:"STALE_SOURCE",sources:[["A",1]],op:"IDENTITY",displayed:0.1946250383,tolerance:1e-10}
];
function raw(c){
 const vals=c.sources.map(([id])=>sources[id].value);
 switch(c.op){
  case"IDENTITY":return vals[0];
  case"PERCENT":return vals[0]*100;
  case"ROUND":return Number(vals[0].toFixed(c.digits));
  case"DIFFERENCE":return vals[0]-vals[1];
  case"RATIO":return vals[0]/vals[1];
  case"NORMALIZE":return (vals[0]-c.min)/(c.max-c.min);
  default:throw new Error("unknown op");
 }
}
function audit(c){
 const stale=c.sources.filter(([id,v])=>sources[id].version!==v).map(([id,v])=>({id,claimed:v,current:sources[id].version}));
 const computed=raw(c),error=Math.abs(computed-c.displayed);
 const reasons=[];
 if(stale.length)reasons.push("STALE_SOURCE_VERSION");
 if(error>c.tolerance)reasons.push("NUMERIC_MISMATCH");
 return {...c,computed,error,stale,reasons,status:reasons.length?"NUMERIC_REVIEW":"PASS_NUMERIC_LINEAGE"};
}
const results=claims.map(audit), get=id=>results.find(x=>x.id===id);
if(get("PERCENT").status!=="PASS_NUMERIC_LINEAGE")throw new Error("percent failed");
if(get("DIFF").status!=="PASS_NUMERIC_LINEAGE")throw new Error("difference failed");
if(!get("BAD_VALUE").reasons.includes("NUMERIC_MISMATCH"))throw new Error("bad value missed");
if(!get("STALE_SOURCE").reasons.includes("STALE_SOURCE_VERSION"))throw new Error("stale source missed");
console.log(JSON.stringify({schema:"e070-numeric-lineage-v1",sources,results,
 conclusion:"Published numbers can be audited as versioned source values plus explicit reproducible transformations."},null,2));