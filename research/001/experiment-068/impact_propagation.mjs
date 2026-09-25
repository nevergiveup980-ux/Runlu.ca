#!/usr/bin/env node
const claims=[
 {id:"ROOT",parent:null,depends:["metric_direction","numeric_value","scope"]},
 {id:"ABSTRACT",parent:"ROOT",depends:["metric_direction","scope"]},
 {id:"EXEC",parent:"ABSTRACT",depends:["metric_direction"]},
 {id:"WEBSITE",parent:"EXEC",depends:["metric_direction"]},
 {id:"TABLE",parent:"ROOT",depends:["numeric_value"]},
 {id:"METHOD_NOTE",parent:"ROOT",depends:["method_definition"]}
];
const changes={
 NARROWED_SCOPE:{affected:["scope"],severity:"RE_REVIEW"},
 NUMERIC_CORRECTION:{affected:["numeric_value"],severity:"RE_REVIEW"},
 CONCLUSION_REVERSED:{affected:["metric_direction"],severity:"BLOCK"},
 RETRACTED:{affected:["metric_direction","numeric_value","scope","method_definition"],severity:"BLOCK"}
};
function descendants(root){
 const out=[]; const q=[root];
 while(q.length){const p=q.shift();for(const c of claims.filter(x=>x.parent===p)){out.push(c.id);q.push(c.id);}}
 return out;
}
function directOrInheritedDependency(id,affected){
 let c=claims.find(x=>x.id===id);
 while(c){
   if(c.depends.some(d=>affected.includes(d))) return true;
   c=claims.find(x=>x.id===c.parent);
 }
 return false;
}
function propagate(kind){
 const ch=changes[kind], ds=descendants("ROOT");
 return ds.map(id=>{
  const impacted=directOrInheritedDependency(id,ch.affected);
  return {id,action:impacted?ch.severity:"UNAFFECTED"};
 });
}
const narrowed=propagate("NARROWED_SCOPE");
const numeric=propagate("NUMERIC_CORRECTION");
const reversed=propagate("CONCLUSION_REVERSED");
const retracted=propagate("RETRACTED");
const get=(arr,id)=>arr.find(x=>x.id===id).action;
if(get(reversed,"WEBSITE")!=="BLOCK")throw new Error("transitive website dependency must block");
if(get(numeric,"TABLE")!=="RE_REVIEW")throw new Error("numeric table must re-review");
if(get(numeric,"METHOD_NOTE")!=="UNAFFECTED")throw new Error("method note should be unaffected by numeric correction");
if(retracted.some(x=>x.action!=="BLOCK"))throw new Error("retraction must block all fixture descendants");
console.log(JSON.stringify({
 schema:"e068-impact-propagation-v1",
 descendants:descendants("ROOT"),
 scenarios:{NARROWED_SCOPE:narrowed,NUMERIC_CORRECTION:numeric,CONCLUSION_REVERSED:reversed,RETRACTED:retracted},
 conclusion:"Source changes propagate transitively. Action depends on which proposition changed and what each descendant relies on."
},null,2));