// RUNLU Research 001 / Experiment 002
// Matched-action-budget control: correlation vs ordinary independent thinning.

function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
function scenarios(n,seed,accuracy){
 const r=rng(seed),xs=[];
 for(let i=0;i<n;i++){const safe=r()<.65;xs.push({safe,a:r()<accuracy?safe:!safe,b:r()<accuracy?safe:!safe,gate:r()<.70,ra:r(),rb:r()});}
 return xs;
}
function score(x,a,b){return{disagreement:a!==b,unsafe:!x.safe&&(a==="GO"||b==="GO"),success:x.safe&&a==="GO"&&b==="GO",deadlock:x.safe&&a==="STOP"&&b==="STOP",go:(a==="GO")+(b==="GO")};}
function act(kind,obs,x,who){
 if(!obs)return"STOP";
 if(kind==="correlation")return x.gate?"GO":"STOP";
 // Matched marginal GO probability, but each agent thins independently.
 return (who==="A"?x.ra:x.rb)<.70?"GO":"STOP";
}
export function run({trials=100000,seed=20260920,accuracy=.72}={}){
 const xs=scenarios(trials,seed,accuracy),out={};
 for(const kind of ["matched-independent","correlation"]){
  const m={trials:0,disagreement:0,unsafe:0,success:0,deadlock:0,go:0};
  for(const x of xs){const a=act(kind,x.a,x,"A"),b=act(kind,x.b,x,"B"),s=score(x,a,b);m.trials++;for(const k of ["disagreement","unsafe","success","deadlock","go"])m[k]+=s[k];}
  out[kind]={trials:m.trials,disagreement:+(m.disagreement/trials).toFixed(6),unsafe:+(m.unsafe/trials).toFixed(6),success:+(m.success/trials).toFixed(6),deadlock:+(m.deadlock/trials).toFixed(6),go_rate:+(m.go/(2*trials)).toFixed(6)};
 }
 return{experiment:"RUNLU-R001-E002",design:"matched-marginal-action-budget",seed,trials,accuracy,results:out};
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("simulator.js"))console.log(JSON.stringify(run(),null,2));
