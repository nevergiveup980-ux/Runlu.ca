#!/usr/bin/env node
const truth=100;
const groups=[
 {id:"INDEPENDENT_NOISE",obs:[
  {id:"A",root:"R1",value:99.8},{id:"B",root:"R2",value:100.2},{id:"C",root:"R3",value:100.0}]},
 {id:"SHARED_OFFSET",obs:[
  {id:"A",root:"SHORT_RULER",value:99.0},{id:"B",root:"SHORT_RULER",value:99.0},{id:"C",root:"SHORT_RULER",value:99.0}]},
 {id:"MIXED_BIAS",obs:[
  {id:"A",root:"SHORT_RULER",value:99.0},{id:"B",root:"SHORT_RULER",value:99.1},{id:"C",root:"R3",value:100.1}]},
 {id:"SEPARATE_BUT_WRONG",obs:[
  {id:"A",root:"R1",value:99.0},{id:"B",root:"R2",value:99.0},{id:"C",root:"R3",value:99.0}]}
];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const sd=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
function audit(g){
 const vals=g.obs.map(o=>o.value),roots=g.obs.map(o=>o.root),unique=new Set(roots);
 const rootCounts=Object.fromEntries([...unique].map(r=>[r,roots.filter(x=>x===r).length]));
 const shared=[...unique].filter(r=>rootCounts[r]>1);
 const agreementSd=sd(vals),bias=mean(vals)-truth;
 let provenance=shared.length===0?"SEPARATE_ROOTS":unique.size===1?"SHARED_CALIBRATION_ROOT":"MIXED_DEPENDENCE";
 let evidence=shared.length?"CORRELATED_EVIDENCE":"NO_DECLARED_SHARED_ROOT";
 return {...g,mean:mean(vals),agreementSd,bias,sharedRoots:shared,provenance,evidence};
}
const results=groups.map(audit),m=Object.fromEntries(results.map(x=>[x.id,x]));
if(m.SHARED_OFFSET.agreementSd!==0)throw new Error("agreement");
if(m.SHARED_OFFSET.provenance!=="SHARED_CALIBRATION_ROOT")throw new Error("shared");
if(m.MIXED_BIAS.provenance!=="MIXED_DEPENDENCE")throw new Error("mixed");
if(m.INDEPENDENT_NOISE.provenance!=="SEPARATE_ROOTS")throw new Error("separate");
if(m.SEPARATE_BUT_WRONG.evidence!=="NO_DECLARED_SHARED_ROOT")throw new Error("wrong-separate");
console.log(JSON.stringify({schema:"e094-shared-bias-v1",truth,results,
 conclusion:"High inter-observer agreement can be produced by a shared systematic-bias root. Separate roots remove that particular dependence but do not by themselves establish correctness."},null,2));