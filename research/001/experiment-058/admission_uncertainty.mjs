#!/usr/bin/env node
// Declared action at one synthetic parameter point from the E056 family comparison.
const core=[
 {id:"ROLLING_WINDOW",status:"ADMITTED",action:"A"},
 {id:"EXPONENTIAL_DECAY",status:"ADMITTED",action:"A"},
 {id:"LINEAR_TO_ZERO",status:"ADMITTED",action:"A"}
];
// Two candidates whose admission judgments are deliberately unresolved.
// Their actions are inspected only for the completion audit; unresolved status is not converted to a vote.
const unresolved=[
 {id:"BOUNDED_HYPERBOLIC_DECAY",status:"UNRESOLVED",action:"B",
  ledger:{G1:"PASS",G2:"PASS",G3:"PASS",G4:"UNRESOLVED",G5:"PASS",G6:"PASS",G7:"PASS"}},
 {id:"TWO_STAGE_RECENCY",status:"UNRESOLVED",action:"A",
  ledger:{G1:"PASS",G2:"PASS",G3:"PASS",G4:"PASS",G5:"UNRESOLVED",G6:"PASS",G7:"PASS"}}
];
function subsets(xs){
 const out=[];
 for(let mask=0;mask<(1<<xs.length);mask++) out.push(xs.filter((_,i)=>mask&(1<<i)));
 return out;
}
function outcome(models){
 const counts={A:0,B:0,TIE:0};
 for(const m of models) counts[m.action]++;
 const max=Math.max(...Object.values(counts));
 const winners=Object.entries(counts).filter(([,v])=>v===max).map(([k])=>k);
 let consensus="NO_DIRECTIONAL_CONSENSUS";
 if(winners.length===1 && winners[0]!=="TIE") consensus=winners[0];
 return {counts,total:models.length,consensus,depth:max};
}
const completions=subsets(unresolved).map(add=>{
 const models=[...core,...add];
 return {admitted_unresolved:add.map(x=>x.id),...outcome(models)};
});
const conclusions=[...new Set(completions.map(x=>x.consensus))];
const robustness=conclusions.length===1 && conclusions[0]!=="NO_DIRECTIONAL_CONSENSUS"?"SET_ROBUST":
 conclusions.length>1?"SET_SENSITIVE":"NO_DIRECTIONAL_CONSENSUS";

if(completions.length!==4) throw new Error("expected 4 completions");
if(robustness!=="SET_ROBUST") throw new Error("declared fixture should remain A across completions");

console.log(JSON.stringify({
 schema:"e058-admission-uncertainty-v1",
 core,
 unresolved,
 completions,
 robustness,
 stable_consensus:robustness==="SET_ROBUST"?conclusions[0]:null,
 conclusion:"At this declared fixture, A remains the directional consensus under every admissible completion, although vote depth changes."
},null,2));