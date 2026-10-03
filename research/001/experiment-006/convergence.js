// RUNLU R001 / E006 — finite-sample CHSH convergence
function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
const Q=Math.cos(Math.PI/8)**2;
function trial(r,p){return r()<p?1:0;}
export function finite({trials=100000,seeds=[20260921,20260922,20260923,20260924,20260925]}={}){
 const rows=[];
 for(const seed of seeds){
  const r=rng(seed);let cw=0,qw=0;
  for(let i=0;i<trials;i++){cw+=trial(r,.75);qw+=trial(r,Q);}
  rows.push({seed,classical:cw/trials,ideal_quantum:qw/trials});
 }
 const mean=k=>rows.reduce((s,x)=>s+x[k],0)/rows.length;
 return{experiment:"RUNLU-R001-E006-CONVERGENCE",trials,seeds,expected:{classical:.75,ideal_quantum:Q},mean:{classical:mean("classical"),ideal_quantum:mean("ideal_quantum")},rows};
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("convergence.js"))console.log(JSON.stringify(finite(),null,2));
