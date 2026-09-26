#!/usr/bin/env node
const events=[{age:50,d:+8},{age:5,d:-3}];
const HSTAR=45/(Math.log(8/3)/Math.log(2));
const LSTAR=77;
const action=(x,eps=1e-10)=>x>eps?"B":x<-eps?"A":"TIE";
const rolling=W=>events.filter(e=>e.age<=W).reduce((s,e)=>s+e.d,0);
const expo=H=>events.reduce((s,e)=>s+e.d*Math.pow(2,-e.age/H),0);
const linear=L=>events.reduce((s,e)=>s+e.d*Math.max(0,1-e.age/L),0);
function classify(W,H,L){
 const actions={rolling:action(rolling(W)),exponential:action(expo(H)),linear:action(linear(L))};
 const counts={A:0,B:0,TIE:0};
 for(const a of Object.values(actions)) counts[a]++;
 const entries=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 const [winner,depth]=entries[0];
 return {actions,counts,consensus_depth:depth,consensus_action:depth>=2?winner:"NONE",unanimous:depth===3};
}
const examples={
 unanimous_A:{W:25,H:20,L:60},
 two_of_three_A:{W:25,H:20,L:100},
 unanimous_B:{W:75,H:100,L:100},
 two_of_three_B:{W:75,H:20,L:100}
};
for(const k of Object.keys(examples)) examples[k]={...examples[k],...classify(examples[k].W,examples[k].H,examples[k].L)};
console.log(JSON.stringify({
 schema:"e056-three-model-consensus-v1",
 H_star:HSTAR,
 L_star:LSTAR,
 linear_regions:[
  {L:"0<L<=5",decision:"TIE"},
  {L:"5<L<50",decision:"A"},
  {L:"50<=L<77",decision:"A"},
  {L:"L=77",decision:"TIE"},
  {L:"L>77",decision:"B"}
 ],
 examples,
 conclusion:"Two-model agreement can survive or break when a third plausible memory family is admitted; consensus depth is descriptive, not probabilistic."
},null,2));