#!/usr/bin/env node
const events=[
  {age:50,d:+8,label:"old A-favoring imbalance"},
  {age:5,d:-3,label:"recent B-favoring imbalance"}
];

function action(x,eps=1e-10){return x>eps?"B":x<-eps?"A":"TIE";}
function rollingDebt(W){return events.filter(e=>e.age<=W).reduce((s,e)=>s+e.d,0);}
function decayDebt(H){return events.reduce((s,e)=>s+e.d*Math.pow(2,-e.age/H),0);}

const ages=[...new Set(events.map(e=>e.age))].sort((a,b)=>a-b);
const rolling=[];
let left=0;
for(const a of ages){
  const probe=(left+a)/2;
  rolling.push({from:left,to:a,closure:"[from,to)",debt:rollingDebt(probe),decision:action(rollingDebt(probe))});
  left=a;
}
rolling.push({from:left,to:null,closure:"[from,infinity)",debt:rollingDebt(left+1),decision:action(rollingDebt(left+1))});

// Log-spaced sweep for positive H.
const sweep=[];
const minH=0.25,maxH=500,steps=4000;
let prevH=minH,prevD=decayDebt(prevH);
sweep.push({H:prevH,debt:prevD,decision:action(prevD)});
const brackets=[];
for(let i=1;i<=steps;i++){
  const H=minH*Math.pow(maxH/minH,i/steps);
  const D=decayDebt(H);
  if(prevD===0 || D===0 || prevD*D<0) brackets.push([prevH,H]);
  sweep.push({H,debt:D,decision:action(D)});
  prevH=H; prevD=D;
}
function bisect(lo,hi){
  let flo=decayDebt(lo);
  for(let i=0;i<100;i++){
    const mid=(lo+hi)/2, fm=decayDebt(mid);
    if(Math.abs(fm)<1e-14) return mid;
    if(flo*fm<=0){hi=mid;} else {lo=mid;flo=fm;}
  }
  return (lo+hi)/2;
}
const roots=[];
for(const [lo,hi] of brackets){
  const r=bisect(lo,hi);
  if(!roots.some(x=>Math.abs(x-r)<1e-7)) roots.push(r);
}
const bounds=[0,...roots,Infinity];
const decayIntervals=[];
for(let i=0;i<bounds.length-1;i++){
  const lo=bounds[i],hi=bounds[i+1];
  const probe=hi===Infinity?Math.max(roots.at(-1)*2,1000):(lo===0?hi/2:(lo+hi)/2);
  decayIntervals.push({from_exclusive:lo,to_exclusive:Number.isFinite(hi)?hi:null,decision:action(decayDebt(probe))});
}

console.log(JSON.stringify({
 schema:"e054-horizon-robustness-v1",
 history:events,
 rolling_intervals:rolling,
 exponential_roots:roots,
 exponential_intervals:decayIntervals,
 checks:{
   H5:{debt:decayDebt(5),decision:action(decayDebt(5))},
   H100:{debt:decayDebt(100),decision:action(decayDebt(100))}
 },
 note:"Intervals describe decision robustness for this declared synthetic history only."
},null,2));
