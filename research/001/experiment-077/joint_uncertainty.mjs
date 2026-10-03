#!/usr/bin/env node
const boxes=[
 {id:"ROBUST_A_BOX",dE:[.18,.22],dH:[.02,.06],w:[.45,.55]},
 {id:"ROBUST_B_BOX",dE:[-.08,-.03],dH:[-.22,-.18],w:[.45,.55]},
 {id:"MIXED_BOX",dE:[.16,.24],dH:[-.24,-.16],w:[.46,.54]},
 {id:"TARGET_ONLY_LOOKS_A",dE:[.08,.12],dH:[-.12,-.08],w:[.54,.58]},
 {id:"TIE_BOX",dE:[0,0],dH:[0,0],w:[.4,.6]}
];
const D=(w,e,h)=>w*e+(1-w)*h;
function audit(b){
 const vals=[];
 for(const e of b.dE)for(const h of b.dH)for(const w of b.w)vals.push({e,h,w,D:D(w,e,h)});
 const min=Math.min(...vals.map(x=>x.D)),max=Math.max(...vals.map(x=>x.D));
 let status;
 if(min>0)status="ROBUST_A";
 else if(max<0)status="ROBUST_B";
 else if(min===0&&max===0)status="EXACT_TIE_ONLY";
 else status="SIGN_UNRESOLVED";
 return {...b,min,max,status,corners:vals};
}
const results=boxes.map(audit),get=id=>results.find(x=>x.id===id);
if(get("ROBUST_A_BOX").status!=="ROBUST_A")throw new Error("A");
if(get("ROBUST_B_BOX").status!=="ROBUST_B")throw new Error("B");
if(get("MIXED_BOX").status!=="SIGN_UNRESOLVED")throw new Error("mixed");
if(get("TARGET_ONLY_LOOKS_A").status!=="SIGN_UNRESOLVED")throw new Error("combined uncertainty should break apparent A direction");
if(get("TIE_BOX").status!=="EXACT_TIE_ONLY")throw new Error("tie");
console.log(JSON.stringify({schema:"e077-joint-uncertainty-v1",results,
 conclusion:"Joint uncertainty must be audited over the full declared box; modest uncertainty in subgroup effects and target composition can make the overall sign unresolved."},null,2));