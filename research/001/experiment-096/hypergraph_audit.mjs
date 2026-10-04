#!/usr/bin/env node
const observers={
 A:["CAL:C1","SW:S1","LABEL:L1"],
 B:["CAL:C2","SW:S1","LABEL:L2"],
 C:["CAL:C2","SW:S2","LABEL:L3"],
 D:["CAL:C3","SW:S3","LABEL:L3"],
 E:["CAL:C4","SW:S4","LABEL:L4"],
 F:["CAL:C5","SW:S5","LABEL:L5"]
};
const ids=Object.keys(observers);
function components(filterPrefix=null){
 const adj=Object.fromEntries(ids.map(x=>[x,new Set()]));
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=observers[ids[i]].filter(r=>!filterPrefix||r.startsWith(filterPrefix));
  const b=new Set(observers[ids[j]].filter(r=>!filterPrefix||r.startsWith(filterPrefix)));
  if(a.some(x=>b.has(x))){adj[ids[i]].add(ids[j]);adj[ids[j]].add(ids[i]);}
 }
 const seen=new Set(),out=[];
 for(const s of ids)if(!seen.has(s)){const q=[s],c=[];seen.add(s);while(q.length){const x=q.shift();c.push(x);for(const y of adj[x])if(!seen.has(y)){seen.add(y);q.push(y)}}out.push(c.sort())}
 return out.sort((a,b)=>a[0].localeCompare(b[0]));
}
const byLayer={
 calibration:components("CAL:"),
 software:components("SW:"),
 labels:components("LABEL:"),
 allCriticalLayers:components()
};
const bridgePaths={
 A_to_D:"A --SW:S1-- B --CAL:C2-- C --LABEL:L3-- D",
 E_to_F:"none declared"
};
if(byLayer.allCriticalLayers.length!==3)throw new Error("all components");
if(JSON.stringify(byLayer.allCriticalLayers[0])!==JSON.stringify(["A","B","C","D"]))throw new Error("bridge component");
if(byLayer.calibration.length!==5)throw new Error("calibration");
if(byLayer.software.length!==5)throw new Error("software");
if(byLayer.labels.length!==5)throw new Error("labels");
console.log(JSON.stringify({schema:"e096-hypergraph-v1",observers,byLayer,bridgePaths,
 conclusion:"Single-layer clustering can hide cross-layer bridges. A, B, C, and D appear mostly separate within individual layers but form one connected provenance component when calibration, software, and label dependencies are combined."},null,2));