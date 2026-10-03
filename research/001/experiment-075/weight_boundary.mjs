#!/usr/bin/env node
const rates={EASY:{A:.9,B:.7},HARD:{A:.3,B:.5}};
const dEasy=rates.EASY.A-rates.EASY.B;
const dHard=rates.HARD.A-rates.HARD.B;
const wStar=-dHard/(dEasy-dHard);
function evalAt(w){
 const A=w*rates.EASY.A+(1-w)*rates.HARD.A;
 const B=w*rates.EASY.B+(1-w)*rates.HARD.B;
 const D=A-B;
 return {wEasy:w,wHard:1-w,A,B,difference:D,direction:Math.abs(D)<1e-12?"TIE":D>0?"A>B":"A<B"};
}
const points=[0,.25,.49,.5,.51,.75,1].map(evalAt);
if(Math.abs(wStar-.5)>1e-12)throw new Error("unexpected boundary");
if(evalAt(.49).direction!=="A<B")throw new Error("below boundary");
if(evalAt(.5).direction!=="TIE")throw new Error("boundary tie");
if(evalAt(.51).direction!=="A>B")throw new Error("above boundary");
console.log(JSON.stringify({
 schema:"e075-target-weight-boundary-v1",rates,dEasy,dHard,wStar,points,
 conclusion:"With opposite stratum-specific effects, the standardized headline is target-population dependent; the exact direction flips at EASY weight 0.50 in this synthetic fixture."
},null,2));