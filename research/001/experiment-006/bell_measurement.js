// RUNLU R001 / E006-D — explicit ideal Bell-pair CHSH measurement simulation.
// Simulates joint outcomes from measurement-angle correlations; does NOT sample target win rate.

function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}

// CHSH-optimal settings for |Phi+> with binary outputs.
// Alice: alpha0=0, alpha1=pi/4. Bob: beta0=pi/8, beta1=-pi/8.
// For |Phi+>, equal-outcome probability is cos^2(alpha-beta).
const A=[0,Math.PI/4], B=[Math.PI/8,-Math.PI/8];

function measurePair(x,y,r){
  const pEqual=Math.cos(A[x]-B[y])**2;
  const equal=r()<pEqual;
  const a=r()<0.5?0:1; // unbiased local marginal
  const b=equal?a:1-a;
  return {a,b};
}

export function runBell({trials=500000,seed=20260921}={}){
  const r=rng(seed);
  let wins=0;
  const counts=Array.from({length:2},()=>Array.from({length:2},()=>({n:0,productSum:0,wins:0})));
  for(let i=0;i<trials;i++){
    const x=r()<.5?0:1,y=r()<.5?0:1;
    const {a,b}=measurePair(x,y,r);
    const win=(a^b)===(x&y);
    wins+=win;
    const c=counts[x][y]; c.n++; c.wins+=win;
    // map bit 0 -> +1, bit 1 -> -1
    c.productSum+=(a? -1:1)*(b? -1:1);
  }
  const E=counts.map(row=>row.map(c=>c.productSum/c.n));
  const S=E[0][0]+E[0][1]+E[1][0]-E[1][1];
  return {
    experiment:"RUNLU-R001-E006-D",
    model:"ideal |Phi+> joint-outcome simulation",
    trials,seed,
    win_rate:wins/trials,
    CHSH_S:S,
    correlators:E,
    theory:{win_rate:Math.cos(Math.PI/8)**2,S:2*Math.SQRT2}
  };
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("bell_measurement.js")) console.log(JSON.stringify(runBell(),null,2));
