// RUNLU R001 / E013 — deterministic fault-injection skeleton
const enc={
 M0:(u,e)=>[u],
 M1:(u,e)=>[u,u],
 M2:(u,e)=>[u,1-u],
 M3:(u,e)=>[e,u,e^u]
};
function dec(name,bits,expectedEpoch){
 if(name==="M0")return{valid:true,u:bits[0]};
 if(name==="M1")return bits[0]===bits[1]?{valid:true,u:bits[0]}:{valid:false};
 if(name==="M2")return bits[1]===1-bits[0]?{valid:true,u:bits[0]}:{valid:false};
 if(name==="M3"){
   const [e,u,p]=bits;
   if((e^u)!==p||e!==expectedEpoch)return{valid:false};
   return{valid:true,u};
 }
}
const flipAll=a=>a.map(x=>1-x);
const stuck=(a,v)=>a.map(()=>v);
function bursts(a){const z=[];for(let i=0;i+1<a.length;i++){let b=[...a];b[i]^=1;b[i+1]^=1;z.push(b);}return z;}
export function inject(name,u,epoch=0){
 const tx=enc[name](u,epoch),cases=[];
 const add=(fault,b)=>cases.push({fault,tx,rx:b,decoded:dec(name,b,epoch)});
 add("clean",tx); add("common_invert",flipAll(tx)); add("stuck0",stuck(tx,0)); add("stuck1",stuck(tx,1));
 for(const [i,b] of bursts(tx).entries())add("burst2_"+i,b);
 if(name==="M3"){
   const oldEpoch=1-epoch, replay=enc.M3(u,oldEpoch);
   add("stale_epoch",replay);
 }
 return cases;
}
export function matrix(){return["M0","M1","M2","M3"].flatMap(m=>[0,1].flatMap(u=>inject(m,u)));}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("fault_injection.js"))console.log(JSON.stringify(matrix(),null,2));
