// RUNLU R001 / E011 — one-bit channel fault model
// Exact enumeration over input states and channel fault branches where possible.

const levels=[0,1e-5,1e-4,1e-3,.01,.05,.10,.20,.30,.50];
function outcome(x,y,a,b){return{conflict:+(a&&b),deadlock:+(!a&&!b),progress:+(a!==b),priority:x===y?null:+(x?(a&&!b):(b&&!a))};}
function goodActionA(x){return x;} // E010 perfect A->B policy id [2,3]
function goodActionB(receivedX,y){return receivedX?0:1;} // fixed complement; sole urgency still prioritized
function fallbackB(kind,y){
 if(kind==="SAFE_HOLD")return 0;
 if(kind==="FIXED_ROLE")return 0; // A owns lane under outage
 if(kind==="LOCAL_URGENCY")return y;
 throw new Error("fallback");
}
function avg(rows){let c=0,d=0,p=0,q=0,n=0;for(const [w,o] of rows){c+=w*o.conflict;d+=w*o.deadlock;p+=w*o.progress;if(o.priority!==null){q+=w*o.priority;n+=w;}}return{conflict:c,deadlock:d,progress:p,urgent_priority:n?q/n:null};}
export function flip(prob){
 const rows=[];
 for(let x=0;x<2;x++)for(let y=0;y<2;y++){const a=goodActionA(x);rows.push([.25*(1-prob),outcome(x,y,a,goodActionB(x,y))]);rows.push([.25*prob,outcome(x,y,a,goodActionB(1-x,y))]);}
 return avg(rows);
}
export function unavailable(prob,fallback){
 const rows=[];
 for(let x=0;x<2;x++)for(let y=0;y<2;y++){const a=goodActionA(x);rows.push([.25*(1-prob),outcome(x,y,a,goodActionB(x,y))]);rows.push([.25*prob,outcome(x,y,a,fallbackB(fallback,y))]);}
 return avg(rows);
}
export function sweep(){return{experiment:"RUNLU-R001-E011",levels,bit_flip:levels.map(p=>({p,...flip(p)})),packet_loss:Object.fromEntries(["SAFE_HOLD","FIXED_ROLE","LOCAL_URGENCY"].map(f=>[f,levels.map(p=>({p,...unavailable(p,f)}))])),note:"late messages use packet-loss model; stale-state requires temporal input model and is intentionally deferred rather than faked"};}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("channel_faults.js"))console.log(JSON.stringify(sweep(),null,2));
