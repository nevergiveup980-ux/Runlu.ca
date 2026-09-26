#!/usr/bin/env node
const actions={EXP10:"A",EXP20:"A",EXP30:"A",ROLL60:"B",LIN100:"B"};
const vocabularies={
 V1_COARSE:{
  EXP10:["SMOOTH","INFINITE_SUPPORT","EXPONENTIAL"],
  EXP20:["SMOOTH","INFINITE_SUPPORT","EXPONENTIAL"],
  EXP30:["SMOOTH","INFINITE_SUPPORT","EXPONENTIAL"],
  ROLL60:["CUTOFF","FINITE_SUPPORT","CUTOFF_SHAPE"],
  LIN100:["SMOOTH","FINITE_SUPPORT","LINEAR"]
 },
 V2_STRUCTURAL:{
  EXP10:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"],
  EXP20:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"],
  EXP30:["RECENCY_WEIGHTED","SMOOTH_DECAY","EXPONENTIAL_SHAPE"],
  ROLL60:["RECENCY_WEIGHTED","FINITE_SUPPORT","HARD_CUTOFF"],
  LIN100:["RECENCY_WEIGHTED","FINITE_SUPPORT","SMOOTH_DECAY","LINEAR_SHAPE"]
 },
 V3_MECHANISTIC:{
  EXP10:["GRADUAL_FORGETTING","NONZERO_TAIL","PROPORTIONAL_DECAY"],
  EXP20:["GRADUAL_FORGETTING","NONZERO_TAIL","PROPORTIONAL_DECAY"],
  EXP30:["GRADUAL_FORGETTING","NONZERO_TAIL","PROPORTIONAL_DECAY"],
  ROLL60:["ABRUPT_BOUNDARY","FINITE_EXTINCTION"],
  LIN100:["GRADUAL_FORGETTING","FINITE_EXTINCTION","CONSTANT_SLOPE"]
 }
};
function jac(a,b){const A=new Set(a),B=new Set(b);const i=[...A].filter(x=>B.has(x)).length;return i/new Set([...A,...B]).size;}
function neff(ids,v){const n=ids.length;let sum=0;for(const i of ids)for(const j of ids)sum+=jac(v[i],v[j]);return n*n/sum;}
const results={};
for(const [name,v] of Object.entries(vocabularies)){
 const A=Object.keys(actions).filter(id=>actions[id]==="A");
 const B=Object.keys(actions).filter(id=>actions[id]==="B");
 results[name]={A_neff:neff(A,v),B_neff:neff(B,v),
  exp_pair_similarity:jac(v.EXP10,v.EXP20)};
}
const robust=Object.values(results).every(r=>Math.abs(r.A_neff-1)<1e-12 && Math.abs(r.exp_pair_similarity-1)<1e-12);
if(!robust)throw new Error("declared narrow redundancy claim should survive all vocabularies");
console.log(JSON.stringify({
 schema:"e061-vocabulary-sensitivity-v1",
 results,
 qualitative_claim:"The three exponential A-voters are redundant copies of one declared structural form.",
 classification:robust?"VOCABULARY_ROBUST":"VOCABULARY_SENSITIVE",
 conclusion:"The narrow exponential-redundancy conclusion survives all three preregistered vocabularies; B-side effective diversity varies with vocabulary and should be reported numerically, not treated as invariant."
},null,2));