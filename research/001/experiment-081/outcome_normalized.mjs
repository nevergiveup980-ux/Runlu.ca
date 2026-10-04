#!/usr/bin/env node
const W=Array.from({length:1601},(_,i)=>.46+.08*i/1600);
const e0=w=>.10+.20*(w-.50), h0=w=>.02+.10*(w-.50);
const D0=w=>w*e0(w)+(1-w)*h0(w);
let nominalMin=Infinity,argmin=null;
for(const w of W){const d=D0(w);if(d<nominalMin){nominalMin=d;argmin=w}}
const budgets=[nominalMin/2,nominalMin,nominalMin*1.25];
function status(x){return x>1e-12?"ROBUST_A":x>=-1e-12?"BOUNDARY_TOUCHING":"SIGN_UNRESOLVED"}
function calibrate(b){
 // Native parameters that create an outcome reduction b at the nominal worst-case w.
 const w=argmin, base=D0(w);
 const params={
  COMMON_ADDITIVE:{name:"epsilon",value:b},
  EASY_ONLY_ADDITIVE:{name:"epsilon_E",value:b/w},
  HARD_ONLY_ADDITIVE:{name:"epsilon_H",value:b/(1-w)},
  RELATIVE_MULTIPLICATIVE:{name:"rho",value:b/base}
 };
 const worst=nominalMin-b;
 return {impactBudget:b,worstContrast:worst,status:status(worst),nativeParameters:params};
}
const results=budgets.map(calibrate);
if(results[0].status!=="ROBUST_A")throw new Error("half");
if(results[1].status!=="BOUNDARY_TOUCHING")throw new Error("touch");
if(results[2].status!=="SIGN_UNRESOLVED")throw new Error("over");
const first=results[0].nativeParameters;
if(first.COMMON_ADDITIVE.value===first.EASY_ONLY_ADDITIVE.value)throw new Error("native params should differ");
console.log(JSON.stringify({schema:"e081-outcome-normalized-v1",nominalMin,argminW:argmin,results,
 conclusion:"Different perturbation geometries can be compared on a common outcome-impact scale while retaining their distinct native parameter values."},null,2));