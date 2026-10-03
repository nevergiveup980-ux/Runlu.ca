#!/usr/bin/env node
const edges=[
 ["EXP_A","IMPL_A"],["EXP_A","SIM_A"],["IMPL_A","LIB_A"],["SIM_A","GEN_A"],["LIB_A","FORMULA_ROOT"],["GEN_A","SOURCE_A"],
 ["EXP_B","IMPL_B"],["EXP_B","SIM_B"],["IMPL_B","LIB_B"],["SIM_B","GEN_B"],["LIB_B","FORMULA_ROOT"],["GEN_B","SOURCE_B"],
 ["EXP_C","IMPL_C"],["EXP_C","SIM_C"],["IMPL_C","LIB_C"],["SIM_C","GEN_C"],["LIB_C","FORMULA_C"],["GEN_C","SOURCE_C"],
 ["EXP_D","IMPL_D"],["EXP_D","FORMULA_ROOT"]
];
const critical=new Set(["FORMULA_ROOT","FORMULA_C","SOURCE_A","SOURCE_B","SOURCE_C"]);
const parents=new Map();
for(const [a,b] of edges){if(!parents.has(a))parents.set(a,[]);parents.get(a).push(b)}
function closure(start){
 const seen=new Set(),stack=[...(parents.get(start)||[])];
 while(stack.length){const x=stack.pop();if(seen.has(x))continue;seen.add(x);for(const y of parents.get(x)||[])stack.push(y)}
 return seen;
}
function direct(start){return new Set(parents.get(start)||[])}
function pair(a,b){
 const ca=closure(a),cb=closure(b),da=direct(a),db=direct(b);
 const directShared=[...da].filter(x=>db.has(x)&&critical.has(x));
 const sharedCritical=[...ca].filter(x=>cb.has(x)&&critical.has(x));
 let status=directShared.length?"DIRECT_SHARED":sharedCritical.length?"HIDDEN_COMMON_ANCESTOR":"NO_DECLARED_COMMON_ROOT";
 return {a,b,status,directShared,sharedCritical};
}
const pairs=[pair("EXP_A","EXP_B"),pair("EXP_A","EXP_C"),pair("EXP_A","EXP_D")];
const get=(a,b)=>pairs.find(x=>x.a===a&&x.b===b);
if(get("EXP_A","EXP_B").status!=="HIDDEN_COMMON_ANCESTOR")throw new Error("hidden");
if(get("EXP_A","EXP_C").status!=="NO_DECLARED_COMMON_ROOT")throw new Error("none");
if(get("EXP_A","EXP_D").status!=="HIDDEN_COMMON_ANCESTOR")throw new Error("transitive");
console.log(JSON.stringify({schema:"e085-transitive-provenance-v1",edges,pairs,
 warning:"NO_DECLARED_COMMON_ROOT means none was found in the declared graph; incomplete provenance can hide dependencies.",
 conclusion:"Direct provenance comparison can miss shared upstream roots; transitive closure exposes hidden common ancestors and correlated failure paths."},null,2));