// RUNLU R001 / E009 — information-value enumerator
const A={YIELD:0,ENTER:1};
function out(uA,uB,a,b){
 const conflict=a&&b,deadlock=!a&&!b,progress=a!==b;
 const priority=uA===uB?null:(uA?(a&&!b):(b&&!a));
 return {conflict:+conflict,deadlock:+deadlock,progress:+progress,priority};
}
function metrics(rows){
 let c=0,d=0,p=0,q=0,n=0;
 for(const r of rows){c+=r.conflict;d+=r.deadlock;p+=r.progress;if(r.priority!==null){n++;q+=r.priority;}}
 return {conflict:c/rows.length,deadlock:d/rows.length,progress:p/rows.length,urgent_priority:q/n};
}
// local mask: A0,A1,B0,B1
function local(mask,agent,u){return(mask>>((agent?2:0)+u))&1;}
export function deterministic(){
 const all=[];
 for(let m=0;m<16;m++){const rows=[];for(let x=0;x<2;x++)for(let y=0;y<2;y++)rows.push(out(x,y,local(m,0,x),local(m,1,y)));all.push({id:m,...metrics(rows)});}
 return all;
}
// Shared random bit selects between any two deterministic policies.
// Expected metrics are exact 50/50 convex averages, avoiding Monte Carlo noise.
export function sharedRandom(){
 const d=deterministic(),all=[];
 for(const x of d)for(const y of d)all.push({id:[x.id,y.id],conflict:(x.conflict+y.conflict)/2,deadlock:(x.deadlock+y.deadlock)/2,progress:(x.progress+y.progress)/2,urgent_priority:(x.urgent_priority+y.urgent_priority)/2});
 return all;
}
// One-way 1-bit reference: A sends uA. A action depends on uA (4 functions).
// B action depends on received uA and own uB (16 functions).
export function oneBit(){
 const all=[];
 for(let fa=0;fa<4;fa++)for(let fb=0;fb<16;fb++){
  const rows=[];
  for(let x=0;x<2;x++)for(let y=0;y<2;y++){
   const a=(fa>>x)&1,b=(fb>>(2*x+y))&1;
   rows.push(out(x,y,a,b));
  }
  all.push({id:[fa,fb],...metrics(rows)});
 }
 return all;
}
function dominates(a,b){
 return a.conflict<=b.conflict&&a.deadlock<=b.deadlock&&a.progress>=b.progress&&a.urgent_priority>=b.urgent_priority&&
 (a.conflict<b.conflict||a.deadlock<b.deadlock||a.progress>b.progress||a.urgent_priority>b.urgent_priority);
}
export function frontier(xs){return xs.filter((x,i)=>!xs.some((y,j)=>i!==j&&dominates(y,x)));}
export function run(){const d=deterministic(),r=sharedRandom(),b=oneBit();return{experiment:"RUNLU-R001-E009",counts:{deterministic:d.length,shared_random:r.length,one_bit:b.length},frontiers:{deterministic:frontier(d),shared_random:frontier(r),one_bit:frontier(b)}};}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("information_value.js"))console.log(JSON.stringify(run(),null,2));
