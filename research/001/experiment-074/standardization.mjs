#!/usr/bin/env node
const rates={EASY:{A:.9,B:.8},HARD:{A:.3,B:.2}};
const targets={
 A_OBSERVED:{EASY:10/110,HARD:100/110},
 B_OBSERVED:{EASY:100/110,HARD:10/110},
 BALANCED:{EASY:.5,HARD:.5},
 OPERATIONAL_EXAMPLE:{EASY:.3,HARD:.7}
};
function std(side,w){return w.EASY*rates.EASY[side]+w.HARD*rates.HARD[side];}
const results=Object.entries(targets).map(([target,w])=>{
 const A=std("A",w),B=std("B",w),difference=A-B;
 return {target,weights:w,A,B,difference,direction:difference>0?"A>B":difference<0?"A<B":"TIE"};
});
if(!results.every(r=>Math.abs(r.difference-.1)<1e-12))throw new Error("constant stratum difference should preserve .10");
if(new Set(results.map(r=>r.A.toFixed(12))).size<2)throw new Error("absolute standardized A should vary by target");
console.log(JSON.stringify({
 schema:"e074-standardization-target-v1",rates,results,
 conclusion:"Target population changes standardized absolute rates, but in this fixture it cannot reverse A>B because A exceeds B by the same 0.10 in every stratum."
},null,2));