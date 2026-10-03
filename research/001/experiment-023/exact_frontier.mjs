// E023 exact enumeration for N2 under uniform independent private inputs.
const acts=(mask,s)=>(mask>>s)&1;
function metric(ma,mb){
 let conflict=0,deadlock=0,progress=0;
 for(const x of [0,1])for(const y of [0,1]){
  const a=acts(ma,x),b=acts(mb,y),w=.25;
  if(a&&b)conflict+=w;
  else if(!a&&!b)deadlock+=w;
  else progress+=w;
 }
 return{conflict,deadlock,progress};
}
const key=m=>[m.conflict,m.deadlock,m.progress].join("|");
export function run(){
 const policies=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)policies.push({policy:[a,b],metrics:metric(a,b)});
 const unique=[...new Map(policies.map(p=>[key(p.metrics),p.metrics])).values()];
 return{
  experiment:"RUNLU-R001-E023",
  assumptions:{inputDistribution:"uniform independent",communicationBits:0},
  deterministicPolicies:policies.length,
  uniqueMetricPoints:unique,
  identity:"progress = 1 - conflict - deadlock",
  classicalRandomizedSet:"convex hull of deterministic metric points"
 };
}
if(import.meta.url===new URL(process.argv[1],"file:").href)console.log(JSON.stringify(run(),null,2));
