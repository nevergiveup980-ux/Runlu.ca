#!/usr/bin/env node
const events=[{age:50,d:+8},{age:5,d:-3}];
const HSTAR=45/(Math.log(8/3)/Math.log(2));
const action=(x,eps=1e-10)=>x>eps?"B":x<-eps?"A":"TIE";
const rDebt=W=>events.filter(e=>e.age<=W).reduce((s,e)=>s+e.d,0);
const eDebt=H=>events.reduce((s,e)=>s+e.d*Math.pow(2,-e.age/H),0);
const classify=(W,H)=>{const r=action(rDebt(W)),e=action(eDebt(H));return r===e?"CONSENSUS_"+r:"DISAGREE";};
const rDist=W=>Math.min(Math.abs(W-5),Math.abs(W-50));
const hDist=H=>Math.abs(H-HSTAR);
const WGRID=[1,4,5,10,25,49,50,75], HGRID=[5,20,30,HSTAR,40,100];
const grid=[];
for(const W of WGRID) for(const H of HGRID) grid.push({W,H,rolling:action(rDebt(W)),exponential:action(eDebt(H)),class:classify(W,H),distance_to_rolling_flip:rDist(W),distance_to_exponential_flip:hDist(H)});
console.log(JSON.stringify({
 schema:"e055-model-consensus-v1",H_star:HSTAR,grid,
 analytic_regions:[
  {W:"0<=W<5",H:"0<H<H*",class:"DISAGREE"},
  {W:"0<=W<5",H:"H>H*",class:"DISAGREE"},
  {W:"5<=W<50",H:"0<H<H*",class:"CONSENSUS_A"},
  {W:"5<=W<50",H:"H>H*",class:"DISAGREE"},
  {W:"W>=50",H:"0<H<H*",class:"DISAGREE"},
  {W:"W>=50",H:"H>H*",class:"CONSENSUS_B"}
 ],
 examples:{
  robust_A:{W:25,H:20,class:classify(25,20),distances:{rolling:rDist(25),exponential:hDist(20)}},
  structural_disagreement:{W:25,H:40,class:classify(25,40)},
  robust_B:{W:75,H:100,class:classify(75,100),distances:{rolling:rDist(75),exponential:hDist(100)}}
 },
 conclusion:"Agreement across model forms exists only in explicit regions; outside them the action is structurally model-sensitive."
},null,2));