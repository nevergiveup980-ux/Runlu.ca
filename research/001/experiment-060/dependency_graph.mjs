#!/usr/bin/env node
const models=[
 {id:"EXP10",action:"A",assumptions:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"]},
 {id:"EXP20",action:"A",assumptions:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"]},
 {id:"EXP30",action:"A",assumptions:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"]},
 {id:"ROLL60",action:"B",assumptions:["RECENCY_WEIGHTED","FINITE_SUPPORT","HARD_CUTOFF"]},
 {id:"LIN100",action:"B",assumptions:["RECENCY_WEIGHTED","FINITE_SUPPORT","SMOOTH_DECAY","LINEAR_SHAPE"]}
];
function jac(a,b){
 const A=new Set(a),B=new Set(b);
 const inter=[...A].filter(x=>B.has(x)).length;
 const union=new Set([...A,...B]).size;
 return union?inter/union:0;
}
function matrix(ms){return ms.map(a=>ms.map(b=>jac(a.assumptions,b.assumptions)));}
function neff(ms){
 if(!ms.length)return 0;
 const S=matrix(ms);
 const sum=S.flat().reduce((a,b)=>a+b,0);
 return ms.length*ms.length/sum;
}
const S=matrix(models);
const byAction={};
for(const a of ["A","B"]) {
 const ms=models.filter(m=>m.action===a);
 byAction[a]={raw_count:ms.length,effective_diversity:neff(ms),models:ms.map(m=>m.id)};
}
const total=neff(models);
if(Math.abs(byAction.A.effective_diversity-1)>1e-12) throw new Error("identical exponential variants should have Neff=1");
if(!(byAction.B.effective_diversity>1 && byAction.B.effective_diversity<=2)) throw new Error("B diversity should be between 1 and 2");
console.log(JSON.stringify({
 schema:"e060-dependency-diversity-v1",
 models,
 similarity_matrix:S,
 total_effective_diversity:total,
 action_support:byAction,
 raw_vote:{A:3,B:2},
 conclusion:"A has more raw model instances, but its three supporters collapse to one effective structural variant under the declared assumption graph; B is supported by two partially distinct structures."
},null,2));