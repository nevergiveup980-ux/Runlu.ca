#!/usr/bin/env node
const parents={
 SPEC_A:["FRAMEWORK_X"],SPEC_B:["FRAMEWORK_X"],SPEC_C:["FRAMEWORK_Y"],
 SPEC_D:["FRAMEWORK_Z"],SPEC_E:["FRAMEWORK_W"],
 FRAMEWORK_X:["ASSUMPTION_ROOT"],FRAMEWORK_Y:["ASSUMPTION_ROOT"],
 FRAMEWORK_Z:["LOSS_ROOT"],FRAMEWORK_W:["LOSS_ROOT"],
 ASSUMPTION_ROOT:[],LOSS_ROOT:[]
};
const specs=["SPEC_A","SPEC_B","SPEC_C","SPEC_D","SPEC_E"];
function closure(start){
 const seen=new Set(), stack=[...(parents[start]||[])];
 while(stack.length){const n=stack.pop();if(seen.has(n))continue;seen.add(n);stack.push(...(parents[n]||[]));}
 return [...seen].sort();
}
const closures=Object.fromEntries(specs.map(s=>[s,closure(s)]));
const pairs=[];
for(let i=0;i<specs.length;i++)for(let j=i+1;j<specs.length;j++){
 const a=specs[i],b=specs[j],common=closures[a].filter(x=>closures[b].includes(x));
 pairs.push({a,b,common,status:common.length?"TRANSITIVE_COMMON_ANCESTOR":"NO_DECLARED_COMMON_ANCESTOR"});
}
const get=(a,b)=>pairs.find(x=>x.a===a&&x.b===b);
if(!get("SPEC_A","SPEC_B").common.includes("FRAMEWORK_X"))throw new Error("AB framework");
if(!get("SPEC_A","SPEC_C").common.includes("ASSUMPTION_ROOT"))throw new Error("AC assumption");
if(!get("SPEC_D","SPEC_E").common.includes("LOSS_ROOT"))throw new Error("DE loss");
if(get("SPEC_A","SPEC_D").common.length)throw new Error("AD should separate");
const deepestClusters={
 ASSUMPTION_ROOT:specs.filter(s=>closures[s].includes("ASSUMPTION_ROOT")),
 LOSS_ROOT:specs.filter(s=>closures[s].includes("LOSS_ROOT"))
};
console.log(JSON.stringify({
 schema:"e101-transitive-model-ancestry-v1",parents,closures,pairs,deepestClusters,
 conclusion:"Five immediate specification roots collapse into two declared deep-ancestry families in this fixture. Immediate-root diversity does not guarantee transitive provenance diversity."
},null,2));