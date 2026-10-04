// RUNLU Research 001 / Experiment 004
// Exhaustive deterministic tables vs one-bit shared-correlation mixtures.

function rng(seed){let s=seed>>>0;return()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
function make(n,seed,accuracy){const r=rng(seed),xs=[];for(let i=0;i<n;i++){const p=r()<.5?0:1;const at=p===0,bt=p===1;xs.push({p,a:r()<accuracy?at:!at,b:r()<accuracy?bt:!bt,z:r()<.5?0:1});}return xs;}
function action(mask,agent,signal){const idx=(agent===0?0:2)+(signal?1:0);return (mask>>idx)&1;} // 1=GO
function evalPolicy(xs,m0,m1=null){let collision=0,deadlock=0,correct=0,complementary=0;for(const x of xs){const m=m1===null?m0:(x.z?m1:m0);const a=action(m,0,x.a),b=action(m,1,x.b);collision+=a&&b;deadlock+=!a&&!b;complementary+=a!==b;correct+=(x.p===0&&a&&!b)||(x.p===1&&b&&!a);}const n=xs.length;return{collision:collision/n,deadlock:deadlock/n,correct:correct/n,complementary:complementary/n};}
function dominates(a,b){return a.collision<=b.collision&&a.deadlock<=b.deadlock&&a.correct>=b.correct&&(a.collision<b.collision||a.deadlock<b.deadlock||a.correct>b.correct);}
function frontier(rows){return rows.filter((x,i)=>!rows.some((y,j)=>i!==j&&dominates(y.metrics,x.metrics)));}
export function run({trials=100000,seed=20260921,accuracy=.72}={}){const xs=make(trials,seed,accuracy);const deterministic=[];for(let m=0;m<16;m++)deterministic.push({policy:[m],metrics:evalPolicy(xs,m)});const correlated=[];for(let a=0;a<16;a++)for(let b=0;b<16;b++)correlated.push({policy:[a,b],metrics:evalPolicy(xs,a,b)});return{experiment:"RUNLU-R001-E004",trials,seed,accuracy,deterministic_frontier:frontier(deterministic),correlated_frontier:frontier(correlated)};}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("simulator.js"))console.log(JSON.stringify(run(),null,2));
