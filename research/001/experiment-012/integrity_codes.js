// RUNLU R001 / E012 — exact integrity-code comparison
export const levels=[1e-6,1e-5,1e-4,1e-3,.01,.05,.10,.20];

function probs(code,e){
 if(code==="C0") return {correct:1-e,invalid:0,wrong:e,bits:1};
 if(code==="C1"||code==="C3"){
   return {correct:(1-e)**2,invalid:2*e*(1-e),wrong:e**2,bits:2};
 }
 if(code==="C2"){
   const correct=(1-e)**3+3*e*(1-e)**2;
   const wrong=3*e*e*(1-e)+e**3;
   return {correct,invalid:0,wrong,bits:3};
 }
 throw new Error("code");
}
// E011 mapping for frozen A->B protocol:
// correct -> perfect; invalid -> SAFE-HOLD branch;
// silent wrong -> flipped-message branch.
// Averaged over uniform urgency inputs.
function operational(p){
 return {
  conflict:p.wrong/2,
  deadlock:p.invalid/2+p.wrong/2,
  progress:p.correct+p.invalid/2,
  urgent_priority:p.correct+p.invalid/2
 };
}
export function row(code,e){const p=probs(code,e);return{code,e,...p,...operational(p)};}
export function run(){return{experiment:"RUNLU-R001-E012",rows:["C0","C1","C2","C3"].flatMap(c=>levels.map(e=>row(c,e)))};}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("integrity_codes.js"))console.log(JSON.stringify(run(),null,2));
