#!/usr/bin/env node
const rows=[
 {stratum:"EASY",A:{success:9,total:10},B:{success:80,total:100}},
 {stratum:"HARD",A:{success:30,total:100},B:{success:2,total:10}}
];
const rate=x=>x.success/x.total;
const subgroup=rows.map(r=>({
 stratum:r.stratum,
 A_rate:rate(r.A),B_rate:rate(r.B),
 direction:rate(r.A)>rate(r.B)?"A>B":rate(r.A)<rate(r.B)?"A<B":"TIE"
}));
function pool(side){
 const success=rows.reduce((s,r)=>s+r[side].success,0);
 const total=rows.reduce((s,r)=>s+r[side].total,0);
 return {success,total,rate:success/total,
  weights:Object.fromEntries(rows.map(r=>[r.stratum,r[side].total/total]))};
}
const A=pool("A"),B=pool("B");
const pooledDirection=A.rate>B.rate?"A>B":A.rate<B.rate?"A<B":"TIE";
const allSubgroupA=subgroup.every(x=>x.direction==="A>B");
const reversal=allSubgroupA&&pooledDirection==="A<B";
if(!reversal)throw new Error("fixture must exhibit aggregation reversal");
console.log(JSON.stringify({
 schema:"e073-aggregation-reversal-v1",
 subgroup,pooled:{A,B,direction:pooledDirection},
 reversal,
 aggregation_rule:"raw pooled successes / raw pooled trials",
 conclusion:"A is higher within both strata, yet lower after raw pooling because A and B have very different stratum weights."
},null,2));