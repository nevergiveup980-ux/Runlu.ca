#!/usr/bin/env node
const W=Array.from({length:1601},(_,i)=>.46+.08*i/1600);
const e0=w=>.10+.20*(w-.50), h0=w=>.02+.10*(w-.50);
const D=(w,e,h)=>w*e+(1-w)*h;
function minNom(){return Math.min(...W.map(w=>D(w,e0(w),h0(w))))}
const nominalMin=minNom();
function critAdd(which){
 let best=Infinity,arg=null;
 for(const w of W){
  const n=D(w,e0(w),h0(w));
  const coeff=which==="COMMON"?1:which==="EASY"?w:(1-w);
  const c=n/coeff;
  if(c<best){best=c;arg=w}
 }
 return {critical:best,argminW:arg};
}
function critRelative(){
 let best=Infinity,arg=null;
 for(const w of W){
  const n=D(w,e0(w),h0(w));
  // nominal effects are positive; worst relative perturbation is both multiplied by (1-rho)
  const scale=w*e0(w)+(1-w)*h0(w);
  const c=n/scale;
  if(c<best){best=c;arg=w}
 }
 return {critical:best,argminW:arg};
}
const results={
 COMMON_ADDITIVE:critAdd("COMMON"),
 EASY_ONLY_ADDITIVE:critAdd("EASY"),
 HARD_ONLY_ADDITIVE:critAdd("HARD"),
 RELATIVE_MULTIPLICATIVE:critRelative()
};
if(!(results.COMMON_ADDITIVE.critical>0))throw new Error("common");
if(!(results.EASY_ONLY_ADDITIVE.critical>results.COMMON_ADDITIVE.critical))throw new Error("easy geometry should need larger raw epsilon");
if(!(results.HARD_ONLY_ADDITIVE.critical>results.COMMON_ADDITIVE.critical))throw new Error("hard geometry should need larger raw epsilon");
if(Math.abs(results.RELATIVE_MULTIPLICATIVE.critical-1)>1e-10)throw new Error("relative threshold");
console.log(JSON.stringify({schema:"e080-misspecification-geometry-v1",nominalMin,results,
 conclusion:"Critical robustness margins differ by perturbation geometry and parameter units; no single epsilon-star is geometry-free."},null,2));