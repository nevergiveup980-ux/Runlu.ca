/* Smart Carpet Cut Planner V1 — isolated, read-only, conservative proposal.
   Linear cuts only: one full-width strip per cut. Rotation, seaming,
   side-by-side nesting, pattern repeat and physical execution are NOT certified. */
(function(root){
"use strict";
const val=x=>String(x??"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const finite=x=>Number.isFinite(Number(x))&&Number(x)>0?Number(x):0;
function plan({style,colour,dyelot="",cuts=[],rolls=[],allowMultipleLots=false,cutAllowanceFt=0}={}){
 const name=val(style),color=val(colour),lot=val(dyelot),allowance=Number(cutAllowanceFt);
 if(!name||!color||!Array.isArray(cuts)||!cuts.length||!Number.isFinite(allowance)||allowance<0)
   return {ok:false,code:"INVALID_REQUEST",plans:[]};
 const pieces=[];
 for(let i=0;i<cuts.length;i++){
   const p=cuts[i],width=finite(p.widthFt),length=finite(p.lengthFt),count=Number(p.count??1);
   if(!width||!length||!Number.isInteger(count)||count<1||count>50)
     return {ok:false,code:"INVALID_CUT_DIMENSIONS",index:i,plans:[]};
   for(let j=0;j<count;j++)pieces.push({id:String(p.id??i+1)+(count>1?'-'+(j+1):''),widthFt:width,lengthFt:length+allowance,requestedLengthFt:length});
 }
 if(pieces.length>100)return {ok:false,code:"TOO_MANY_CUTS",plans:[]};
 const candidates=rolls.filter(r=>r.kind==="Carpet Roll"&&val(r.name)===name&&val(r.colour)===color&&r.selectable===true&&r.hold?.known===true&&finite(r.available)>0&&finite(r.widthFt)>0&&val(r.lot)&&(!lot||val(r.lot)===lot));
 const groups=new Map();
 for(const r of candidates){const k=val(r.lot);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)}
 const plans=[];
 for(const [key,stock] of groups){
  const remain=stock.map(r=>({id:String(r.id),roll:String(r.roll||r.id),lot:String(r.lot),widthFt:Number(r.widthFt),remainingLF:Number(r.available),startingLF:Number(r.available),cuts:[]}));
  const missing=[];
  for(const piece of [...pieces].sort((a,b)=>b.lengthFt-a.lengthFt||b.widthFt-a.widthFt)){
   const fitting=remain.filter(r=>r.widthFt+1e-8>=piece.widthFt&&r.remainingLF+1e-8>=piece.lengthFt);
   fitting.sort((a,b)=>a.remainingLF-piece.lengthFt-(b.remainingLF-piece.lengthFt)||a.startingLF-b.startingLF||a.roll.localeCompare(b.roll));
   const chosen=fitting[0];
   if(!chosen){missing.push(piece.id);continue}
   chosen.cuts.push(piece);chosen.remainingLF-=piece.lengthFt;
  }
  if(missing.length)continue;
  const used=remain.filter(r=>r.cuts.length);
  plans.push({dyelot:stock[0].lot,rolls:used.map(r=>({roll:r.roll,rollId:r.id,widthFt:r.widthFt,cutList:r.cuts.map(p=>({id:p.id,widthFt:p.widthFt,lengthFt:p.requestedLengthFt,allowanceFt:allowance})),cutLengthLF:r.startingLF-r.remainingLF,estimatedRemainingLF:r.remainingLF})),rollCount:used.length,remainingLF:used.reduce((a,r)=>a+r.remainingLF,0),verified:false});
 }
 plans.sort((a,b)=>a.rollCount-b.rollCount||a.remainingLF-b.remainingLF||a.dyelot.localeCompare(b.dyelot));
 return {ok:true,code:plans.length?"CUT_PROPOSALS_ONLY":"NO_VALID_SAME_LOT_PLAN",plans:plans.slice(0,6),disclaimer:"Warehouse must verify physical roll length, width, pile direction, pattern match, seams, actual holds and cut allowances. No stock reservation or deduction."};
}
const api=Object.freeze({version:"1.0-lab",readOnly:true,plan});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.RUNLUSmartCarpetCutPlannerV1=api;
})(typeof window!=="undefined"?window:null);
