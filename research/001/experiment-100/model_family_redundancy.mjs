#!/usr/bin/env node
const models=[
 {id:"M1",root:"SPEC_A",variant:"base",verdict:"DEPENDENT"},
 {id:"M2",root:"SPEC_A",variant:"threshold-low",verdict:"DEPENDENT"},
 {id:"M3",root:"SPEC_A",variant:"threshold-mid",verdict:"DEPENDENT"},
 {id:"M4",root:"SPEC_A",variant:"threshold-high",verdict:"DEPENDENT"},
 {id:"M5",root:"SPEC_B",variant:"base",verdict:"SEPARATE"},
 {id:"M6",root:"SPEC_B",variant:"reparameterized",verdict:"SEPARATE"},
 {id:"M7",root:"SPEC_B",variant:"nested",verdict:"SEPARATE"},
 {id:"M8",root:"SPEC_C",variant:"base",verdict:"DEPENDENT"},
 {id:"M9",root:"SPEC_D",variant:"base",verdict:"SEPARATE"},
 {id:"M10",root:"SPEC_E",variant:"base",verdict:"DEPENDENT"}
];
const roots={};
for(const m of models)(roots[m.root]??=[]).push(m);
const clusters=Object.entries(roots).map(([root,xs])=>{
 const verdicts=[...new Set(xs.map(x=>x.verdict))];
 return {root,model_ids:xs.map(x=>x.id),raw_count:xs.length,verdicts,
  status:verdicts.length===1?"ROOT_VERDICT_CONSISTENT":"ROOT_VERDICT_MIXED"};
});
const raw={count:models.length,dependent:models.filter(x=>x.verdict==="DEPENDENT").length,separate:models.filter(x=>x.verdict==="SEPARATE").length};
const rootLevel={
 count:clusters.length,
 dependent_roots:clusters.filter(x=>x.verdicts.length===1&&x.verdicts[0]==="DEPENDENT").map(x=>x.root),
 separate_roots:clusters.filter(x=>x.verdicts.length===1&&x.verdicts[0]==="SEPARATE").map(x=>x.root),
 mixed_roots:clusters.filter(x=>x.verdicts.length>1).map(x=>x.root)
};
if(raw.count!==10||rootLevel.count!==5)throw new Error("counts");
if(clusters.find(x=>x.root==="SPEC_A").raw_count!==4)throw new Error("SPEC_A");
if(clusters.find(x=>x.root==="SPEC_B").raw_count!==3)throw new Error("SPEC_B");
if(rootLevel.dependent_roots.length!==3||rootLevel.separate_roots.length!==2)throw new Error("root verdicts");
console.log(JSON.stringify({
 schema:"e100-model-family-redundancy-v1",raw,clusters,rootLevel,
 conclusion:"Ten admitted model instances collapse to five declared specification-root families. Raw model count therefore overstates declared model-provenance diversity."
},null,2));