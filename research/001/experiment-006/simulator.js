// RUNLU R001 / Experiment 006 — CHSH sanity benchmark
// Standard classical enumeration + ideal quantum probability benchmark.

function classicalWin(f,g){
 let wins=0;
 for(let x=0;x<2;x++)for(let y=0;y<2;y++){
  const a=(f>>x)&1,b=(g>>y)&1;
  if((a^b)===(x&y))wins++;
 }
 return wins/4;
}
export function classicalMaximum(){
 let best=0,strategies=[];
 for(let f=0;f<4;f++)for(let g=0;g<4;g++){
  const w=classicalWin(f,g);
  if(w>best){best=w;strategies=[[f,g]];} else if(w===best)strategies.push([f,g]);
 }
 return {best,strategies};
}
export function theoretical(){
 return {
  classical_local_bound:0.75,
  ideal_quantum_win_probability:Math.cos(Math.PI/8)**2,
  tsirelson_CHSH_S:2*Math.SQRT2
 };
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("simulator.js")){
 console.log(JSON.stringify({experiment:"RUNLU-R001-E006",classical:classicalMaximum(),theory:theoretical()},null,2));
}
