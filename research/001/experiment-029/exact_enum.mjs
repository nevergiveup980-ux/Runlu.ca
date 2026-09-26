// E029 exact deterministic enumeration under uniform independent queue bits.
const act=(m,s)=>(m>>s)&1;
function evalPair(ma,mb){
 let conflict=0,dualYield=0,success=0,correct=0,unequal=.5;
 for(const x of [0,1])for(const y of [0,1]){
  const a=act(ma,x),b=act(mb,y),w=.25;
  if(a&&b) conflict+=w;
  else if(!a&&!b) dualYield+=w;
  else {
   success+=w;
   if((x===1&&y===0&&a)||(x===0&&y===1&&b)) correct+=w;
  }
 }
 return{conflictRequest:conflict,dualYield,allocationSuccess:success,highQueueCorrect:correct/unequal};
}
export function run(){
 const rows=[];
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)rows.push({policy:[a,b],metrics:evalPair(a,b)});
 return{experiment:"RUNLU-R001-E029",distribution:"uniform independent",deterministicPolicies:rows};
}
if(import.meta.url===new URL(process.argv[1],"file:").href)console.log(JSON.stringify(run(),null,2));
