#!/usr/bin/env node
const obs=[
 {id:"O1",family:"SOFTWARE",subtype:"TIMEOUT",timescale:"SHORT",regime:"NORMAL",depth:2},
 {id:"O2",family:"SOFTWARE",subtype:"TIMEOUT",timescale:"SHORT",regime:"SURGE",depth:1},
 {id:"O3",family:"SOFTWARE",subtype:"TRANSFORM",timescale:"SHORT",regime:"NORMAL",depth:2},
 {id:"O4",family:"SOFTWARE",subtype:"TRANSFORM",timescale:"SHORT",regime:"SURGE",depth:2}
];
const specs=[
 {id:"G0",fields:["family"],admitted:true},
 {id:"G1",fields:["subtype","timescale"],admitted:true},
 {id:"G2",fields:["subtype","timescale","regime"],admitted:true},
 {id:"G3",fields:["subtype","timescale","regime","id"],admitted:false}
];
function audit(spec){
 const groups={};
 for(const o of obs){const k=spec.fields.map(f=>o[f]).join("|");(groups[k]??=[]).push(o);}
 const detail=Object.entries(groups).map(([context,xs])=>({context,n:xs.length,depths:[...new Set(xs.map(x=>x.depth))]}));
 const conflicts=detail.filter(x=>x.depths.length>1);
 return {...spec,context_count:detail.length,detail,status:conflicts.length?"CONFLICT_PRESENT":"NO_WITHIN_CONTEXT_CONFLICT",singleton_fraction:detail.filter(x=>x.n===1).length/detail.length};
}
const audits=specs.map(audit), admitted=audits.filter(x=>x.admitted);
const statuses=[...new Set(admitted.map(x=>x.status))];
const family_status=statuses.length>1?"GRANULARITY_SENSITIVE":"GRANULARITY_ROBUST";
const g=id=>audits.find(x=>x.id===id);
if(g("G0").status!=="CONFLICT_PRESENT")throw new Error("G0");
if(g("G1").status!=="CONFLICT_PRESENT")throw new Error("G1");
if(g("G2").status!=="NO_WITHIN_CONTEXT_CONFLICT")throw new Error("G2");
if(g("G3").admitted)throw new Error("G3");
if(family_status!=="GRANULARITY_SENSITIVE")throw new Error("family");
console.log(JSON.stringify({
 schema:"e107-conditioning-granularity-v1",obs,audits,family_status,
 conclusion:"Conflict classification changes across admissible context resolutions. The finest partition is not automatically the most valid, and observation-identity slicing is rejected as overfit."
},null,2));