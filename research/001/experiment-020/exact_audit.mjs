// RUNLU R001 / E020 — exact E004 audit, no Monte Carlo.
// State: hidden priority p, private signals a,b. P(p)=1/2;
// each signal independently reports its agent-priority truth with accuracy q.
// A deterministic table is a 4-bit mask: A(s=0),A(s=1),B(s=0),B(s=1).
function action(mask,agent,signal){const idx=(agent===0?0:2)+(signal?1:0);return(mask>>idx)&1;}
function states(q){
 const out=[];
 for(const p of [0,1])for(const a of [0,1])for(const b of [0,1]){
  const at=p===0,bt=p===1;
  const pa=(a===Number(at))?q:1-q,pb=(b===Number(bt))?q:1-q;
  out.push({p,a,b,w:.5*pa*pb});
 }
 return out;
}
function evalMask(mask,q){let c=0,d=0,k=0;
 for(const x of states(q)){const a=action(mask,0,x.a),b=action(mask,1,x.b);
  c+=x.w*(a&&b); d+=x.w*(!a&&!b);
  k+=x.w*((x.p===0&&a&&!b)||(x.p===1&&b&&!a));
 }
 return{collision:c,deadlock:d,correct:k,progress:1-c-d};
}
function mix(x,y){return{collision:(x.collision+y.collision)/2,deadlock:(x.deadlock+y.deadlock)/2,correct:(x.correct+y.correct)/2,progress:(x.progress+y.progress)/2};}
const key=m=>[m.collision,m.deadlock,m.correct].map(v=>v.toFixed(12)).join("|");
export function audit(q=.72){
 const det=Array.from({length:16},(_,mask)=>({mask,metrics:evalMask(mask,q)}));
 const detKeys=new Set(det.map(x=>key(x.metrics)));
 const mixes=[];
 let novelDiscrete=0;
 for(let i=0;i<16;i++)for(let j=0;j<16;j++){const metrics=mix(det[i].metrics,det[j].metrics);if(!detKeys.has(key(metrics)))novelDiscrete++;mixes.push({policy:[i,j],metrics});}
 // By construction every shared-bit policy is a 50/50 convex combination
 // of two deterministic policies, so none can lie outside the full randomized-classical convex hull.
 return{experiment:"RUNLU-R001-E020",accuracy:q,deterministicPolicies:16,sharedBitPolicies:256,
   sharedBitOutsideRandomizedClassicalHull:0,
   sharedBitPointsNotEqualToSingleDeterministicPoint:novelDiscrete,
   conclusion:"No correlation-specific advantage demonstrated in this policy class."};
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("exact_audit.mjs"))console.log(JSON.stringify(audit(),null,2));
