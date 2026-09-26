// RUNLU Research 001 / Experiment 003
// Complementary-action coordination under communication failure.
// Success requires exactly one GO and one YIELD.

function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
function make(n,seed,accuracy=.72){
 const r=rng(seed),xs=[];
 for(let i=0;i<n;i++){
  // true priority: A or B should GO
  const priority=r()<.5?"A":"B";
  // each agent privately observes whether IT has priority, with noise
  const aTruth=priority==="A", bTruth=priority==="B";
  const aObs=r()<accuracy?aTruth:!aTruth;
  const bObs=r()<accuracy?bTruth:!bTruth;
  const sharedBit=r()<.5?0:1;
  const ra=r(),rb=r();
  xs.push({priority,aObs,bObs,sharedBit,ra,rb});
 }
 return xs;
}
function act(kind,obs,x,who){
 if(kind==="independent") return obs?"GO":"YIELD";
 if(kind==="fixed-role") return who==="A"?"GO":"YIELD";
 if(kind==="correlated-tiebreak"){
   // Use local evidence normally. When observations are symmetric (unknown locally),
   // the pre-shared bit defines complementary roles without communication.
   // Each agent can compute its role from the same bit.
   const designated=x.sharedBit===0?"A":"B";
   if(obs) return "GO";
   return who===designated?"GO":"YIELD";
 }
}
function score(x,a,b){
 const complementary=a!==b;
 const collision=a==="GO"&&b==="GO";
 const deadlock=a==="YIELD"&&b==="YIELD";
 const correct=(x.priority==="A"&&a==="GO"&&b==="YIELD")||(x.priority==="B"&&b==="GO"&&a==="YIELD");
 return{complementary,collision,deadlock,correct};
}
export function run({trials=100000,seed=20260921,accuracy=.72}={}){
 const xs=make(trials,seed,accuracy),out={};
 for(const kind of ["independent","fixed-role","correlated-tiebreak"]){
  const m={complementary:0,collision:0,deadlock:0,correct:0};
  for(const x of xs){const a=act(kind,x.aObs,x,"A"),b=act(kind,x.bObs,x,"B"),s=score(x,a,b);for(const k in m)m[k]+=s[k];}
  out[kind]=Object.fromEntries(Object.entries(m).map(([k,v])=>[k,+(v/trials).toFixed(6)]));
 }
 return{experiment:"RUNLU-R001-E003",design:"complementary-action",seed,trials,accuracy,results:out};
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("simulator.js"))console.log(JSON.stringify(run(),null,2));
