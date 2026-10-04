#!/usr/bin/env node
const models=[
 {id:"EXP_HALF_LIFE_10",family:"SMOOTH_RECENCY",action:"A"},
 {id:"EXP_HALF_LIFE_20",family:"SMOOTH_RECENCY",action:"A"},
 {id:"EXP_HALF_LIFE_30",family:"SMOOTH_RECENCY",action:"A"},
 {id:"ROLLING_60",family:"HARD_CUTOFF",action:"B"},
 {id:"LINEAR_100",family:"PIECEWISE_RECENCY",action:"B"}
];
function counts(actions){
 const c={A:0,B:0,TIE:0,SPLIT:0};
 for(const a of actions)c[a]=(c[a]||0)+1;
 return c;
}
function directionalWinner(c){
 if(c.A>c.B && c.A>c.TIE)return "A";
 if(c.B>c.A && c.B>c.TIE)return "B";
 return "NO_DIRECTIONAL_CONSENSUS";
}
const raw=counts(models.map(m=>m.action));
const famMap={};
for(const m of models)(famMap[m.family]??=[]).push(m);
const families=Object.entries(famMap).map(([family,members])=>{
 const acts=[...new Set(members.map(m=>m.action))];
 return {family,members:members.map(m=>m.id),action:acts.length===1?acts[0]:"SPLIT"};
});
const familyCounts=counts(families.map(f=>f.action));
const rawWinner=directionalWinner(raw);
const familyWinner=directionalWinner(familyCounts);
if(rawWinner!=="A") throw new Error("fixture raw model count should favor A");
if(familyWinner!=="B") throw new Error("fixture family count should favor B");
console.log(JSON.stringify({
 schema:"e059-family-dependence-v1",
 models,
 raw_model_count:{counts:raw,winner:rawWinner},
 assumption_families:families,
 family_count:{counts:familyCounts,winner:familyWinner},
 conclusion:"Raw model counting favors A, while preregistered assumption-family counting favors B. Model multiplicity is not independent evidence."
},null,2));