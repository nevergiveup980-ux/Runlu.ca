// E024 exact deterministic enumeration, uniform independent stopping-margin bits.
const act=(m,s)=>(m>>s)&1;
function evalPair(ma,mb){
 let conflict=0,deadlock=0,progress=0,tightCorrect=0,tightCases=0;
 for(const x of [0,1])for(const y of [0,1]){
  const a=act(ma,x),b=act(mb,y),w=.25;
  if(a&&b) conflict+=w; else if(!a&&!b) deadlock+=w; else progress+=w;
  if(x!==y){tightCases+=w; if((x===1&&a&&!b)||(y===1&&b&&!a))tightCorrect+=w;}
 }
 return{conflict,deadlock,progress,tightPriority:tightCorrect/tightCases};
}
function dominates(a,b){
 const eps=1e-12;
 const weak=a.conflict<=b.conflict+eps&&a.deadlock<=b.deadlock+eps&&a.tightPriority+eps>=b.tightPriority;
 const strict=a.conflict<b.conflict-eps||a.deadlock<b.deadlock-eps||a.tightPriority>b.tightPriority+eps;
 return weak&&strict;
}
export function run(){
 const rows=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)rows.push({policy:[a,b],metrics:evalPair(a,b)});
 const frontier=rows.filter((r,i)=>!rows.some((q,j)=>i!==j&&dominates(q.metrics,r.metrics)));
 return{experiment:"RUNLU-R001-E024",distribution:"uniform independent",policies:rows,deterministicParetoFrontier:frontier};
}
if(import.meta.url===new URL(process.argv[1],"file:").href)console.log(JSON.stringify(run(),null,2));
