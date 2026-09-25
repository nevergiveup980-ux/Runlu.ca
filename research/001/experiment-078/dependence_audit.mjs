#!/usr/bin/env node
const D=(w,e,h)=>w*e+(1-w)*h;
const grid=(lo,hi,n)=>Array.from({length:n},(_,i)=>lo+(hi-lo)*i/(n-1));
const W=grid(.46,.54,81), E=grid(.16,.24,81), H=grid(-.24,-.16,81);
function audit(id,accept,justified){
 let min=Infinity,max=-Infinity,n=0,argmin=null,argmax=null;
 for(const w of W)for(const e of E)for(const h of H){
  if(!accept(w,e,h))continue;
  const d=D(w,e,h); n++;
  if(d<min){min=d;argmin={w,e,h,d}}
  if(d>max){max=d;argmax={w,e,h,d}}
 }
 if(!n)throw new Error("empty feasible set");
 const sign=min>0?"ROBUST_A":max<0?"ROBUST_B":min===0&&max===0?"EXACT_TIE_ONLY":"SIGN_UNRESOLVED";
 return {id,justified,n,min,max,sign,argmin,argmax};
}
const results=[
 audit("CARTESIAN_BOX",()=>true,true),
 // preregistered toy structural relation: effect contrast moves with composition;
 // tolerance is grid resolution, and this is explicitly synthetic rather than empirical.
 audit("JUSTIFIED_SYNTHETIC_RELATION",(w,e,h)=>Math.abs(e-(.20+(w-.50)))<=.00051 && Math.abs(h-(-.20+(w-.50)))<=.00051,true),
 // deliberately invalid research practice: retain only points with desired positive headline.
 audit("POST_HOC_POSITIVE_FILTER",(w,e,h)=>D(w,e,h)>0,false)
];
const by=id=>results.find(x=>x.id===id);
if(by("CARTESIAN_BOX").sign!=="SIGN_UNRESOLVED")throw new Error("box");
if(by("POST_HOC_POSITIVE_FILTER").sign!=="ROBUST_A")throw new Error("filter should demonstrate manufactured robustness");
const publication=results.map(r=>({...r,decision:!r.justified?"REJECT_CONSTRAINT":r.sign}));
if(publication.find(x=>x.id==="POST_HOC_POSITIVE_FILTER").decision!=="REJECT_CONSTRAINT")throw new Error("unjustified filter not rejected");
console.log(JSON.stringify({schema:"e078-dependence-aware-v1",results,publication,
 conclusion:"Dependence constraints can alter the feasible uncertainty set, but unsupported post-hoc constraints can manufacture robustness and must be rejected."},null,2));