#!/usr/bin/env node
const W=Array.from({length:801},(_,i)=>.46+.08*i/800);
const dE0=w=>.10+.20*(w-.50);
const dH0=w=>.02+.10*(w-.50);
const nominal=w=>w*dE0(w)+(1-w)*dH0(w);
let minNom=Infinity,arg=null;
for(const w of W){const d=nominal(w);if(d<minNom){minNom=d;arg=w}}
const epsilonStar=minNom; // common +/- epsilon shifts weighted contrast by +/- epsilon because w+(1-w)=1
function bounds(eps){
 let min=Infinity,max=-Infinity;
 for(const w of W){
  const lo=nominal(w)-eps,hi=nominal(w)+eps;
  if(lo<min)min=lo;if(hi>max)max=hi;
 }
 return {epsilon:eps,min,max,status:min>1e-12?"ROBUST_A":min>=-1e-12?"BOUNDARY_TOUCHING":"SIGN_UNRESOLVED"};
}
const probes=[0,epsilonStar/2,epsilonStar,epsilonStar+0.005].map(bounds);
if(!(epsilonStar>0))throw new Error("margin must be positive");
if(probes[0].status!=="ROBUST_A")throw new Error("nominal");
if(probes[1].status!=="ROBUST_A")throw new Error("half");
if(probes[2].status!=="BOUNDARY_TOUCHING")throw new Error("boundary");
if(probes[3].status!=="SIGN_UNRESOLVED")throw new Error("relaxed");
console.log(JSON.stringify({schema:"e079-fragility-margin-v1",minNominalContrast:minNom,argminW:arg,epsilonStar,probes,
 conclusion:"The dependence-based positive conclusion has a finite misspecification margin; once the common effect-band relaxation reaches epsilon*, the feasible set touches zero and larger relaxation makes the sign unresolved."},null,2));