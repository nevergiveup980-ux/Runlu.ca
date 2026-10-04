#!/usr/bin/env node
const observers={
 A:{CALIBRATION:"C1",SOFTWARE:"S1",LABEL_SOURCE:"L1"},
 B:{CALIBRATION:"C2",SOFTWARE:"S1",LABEL_SOURCE:"L2"},
 C:{CALIBRATION:"C2",SOFTWARE:"S2",LABEL_SOURCE:"L3"},
 D:{CALIBRATION:"C3",SOFTWARE:"S3",LABEL_SOURCE:"L3"}
};
const modes={SCALE_BIAS:["CALIBRATION"],TRANSFORM_BUG:["SOFTWARE"],LABEL_LEAKAGE:["LABEL_SOURCE"],GLOBAL:["CALIBRATION","SOFTWARE","LABEL_SOURCE"]};
const ids=Object.keys(observers);
function graph(layers){
 const adj=Object.fromEntries(ids.map(x=>[x,new Set()]));
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  if(layers.some(k=>observers[ids[i]][k]===observers[ids[j]][k])){
   adj[ids[i]].add(ids[j]);adj[ids[j]].add(ids[i]);
  }
 }
 return adj;
}
function connected(adj,a,b){
 const q=[a],seen=new Set([a]);
 while(q.length){const x=q.shift();if(x===b)return true;for(const y of adj[x])if(!seen.has(y)){seen.add(y);q.push(y)}}
 return false;
}
const pairs=[["A","B"],["B","C"],["C","D"],["A","D"]];
const results=[];
for(const [mode,layers] of Object.entries(modes)){
 const adj=graph(layers);
 for(const [a,b] of pairs)results.push({mode,a,b,connected:connected(adj,a,b),layers});
}
const get=(mode,a,b)=>results.find(x=>x.mode===mode&&x.a===a&&x.b===b).connected;
if(!get("GLOBAL","A","D"))throw new Error("global bridge");
if(get("SCALE_BIAS","A","B"))throw new Error("AB scale should separate");
if(!get("TRANSFORM_BUG","A","B"))throw new Error("AB software");
if(!get("SCALE_BIAS","B","C"))throw new Error("BC calibration");
if(!get("LABEL_LEAKAGE","C","D"))throw new Error("CD labels");
if(get("TRANSFORM_BUG","A","D"))throw new Error("AD transform should separate");
console.log(JSON.stringify({schema:"e097-failure-mode-graph-v1",observers,modes,results,
 conclusion:"The same observer pair can be dependent for one failure mode and separated for another. Global provenance connectivity must not be treated as universal failure dependence."},null,2));