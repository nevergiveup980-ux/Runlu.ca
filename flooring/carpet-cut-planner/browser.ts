import {comparePlans} from "./scenarios";
import type {Roll,Piece} from "./engine";
type InputRoll={id:string;w:number;l:number;lot:string;stockType?:'FULL'|'SHORT'|'REMNANT'};
type InputPiece={id:string;w:number;l:number;lot:string;rotate:boolean};
export function calculateShared(rollInputs:InputRoll[],pieceInputs:InputPiece[],selected=0,shortRollFirst=false,allowance={widthIn:0,lengthIn:0},patternRepeatIn=0){
 if(!Number.isFinite(patternRepeatIn)||patternRepeatIn<0)throw Error('Pattern repeat must be finite nonnegative inches');
 if(!Number.isFinite(allowance.widthIn)||!Number.isFinite(allowance.lengthIn)||allowance.widthIn<0||allowance.lengthIn<0)throw Error('Cut allowances must be finite nonnegative inches');
 const rolls:Roll[]=rollInputs.map(r=>({id:r.id,widthIn:r.w*12,lengthIn:r.l*12,dyeLot:r.lot,priority:shortRollFirst?({REMNANT:0,SHORT:1,FULL:2}[r.stockType||'FULL']):0}));
 const pieces:Piece[]=pieceInputs.map(p=>({id:p.id,widthIn:p.w*12+allowance.widthIn,lengthIn:patternRepeatIn>0?Math.ceil((p.l*12+allowance.lengthIn)/patternRepeatIn-1e-10)*patternRepeatIn:p.l*12+allowance.lengthIn,dyeLot:p.lot||undefined,allowRotate:p.rotate}));
 // Optional inventory preference: shorter rolls are offered to the greedy engine first.
 // This is a heuristic, not a guarantee of minimum material consumption.
 const orderedRolls=shortRollFirst?[...rolls].sort((a,b)=>(a.priority??0)-(b.priority??0)||a.lengthIn-b.lengthIn):rolls;
 const scenarios=comparePlans(orderedRolls,pieces);
 if(!scenarios.length)throw Error("No candidate plans");
 if(!Number.isInteger(selected)||selected<0||selected>=scenarios.length)throw Error("Invalid scenario selection");
 const summaries=scenarios.map(s=>{const usedRolls=rollInputs.map(r=>({id:r.id,stockType:r.stockType||'FULL',usedLF:(s.plan.usedLengthByRoll[r.id]||0)/12,usedSF:r.w*(s.plan.usedLengthByRoll[r.id]||0)/12})).filter(r=>r.usedLF>0);return {...s,usedRolls,rollCount:usedRolls.length,remnantCount:usedRolls.filter(r=>r.stockType==='REMNANT').length,shortCount:usedRolls.filter(r=>r.stockType==='SHORT').length,wasteSF:s.plan.wasteAreaSF};});
 const best=scenarios[selected].plan;
 const used=Object.fromEntries(Object.entries(best.usedLengthByRoll).map(([id,v])=>[id,v/12]));
 const placed=best.placements.map(p=>({id:p.pieceId,roll:p.rollId,x:p.xIn/12,y:p.yIn/12,w:p.widthIn/12,h:p.lengthIn/12}));
 const roomAreaSF=pieceInputs.reduce((sum,p)=>sum+p.w*p.l,0);
 const patternAdjustmentSF=pieces.reduce((sum,p,i)=>sum+p.widthIn*(p.lengthIn-(pieceInputs[i].l*12+allowance.lengthIn))/144,0);
 const allowanceAreaSF=pieceInputs.reduce((sum,p)=>sum+((p.w*12+allowance.widthIn)*(p.l*12+allowance.lengthIn)-p.w*12*p.l*12)/144,0);
 const installationChecks=[...(patternRepeatIn>0?['Pattern repeat rounding is an allowance estimate; verify pattern phase and seam matching on site.']:[]),...(pieceInputs.some(p=>p.rotate)?['Rotation is enabled for at least one piece; confirm pile/nap direction and pattern orientation.']:[]),...(pieceInputs.some(p=>!p.lot?.trim())?['One or more pieces have no specified dye lot; confirm dye-lot consistency before cutting.']:[]),'Confirm seam placement, edge trimming, site obstacles and installer approval before final cutting.'];
 const requiresInstallerReview=true;
 const remaining=rollInputs.reduce((sum,r)=>sum+r.w*(r.l-used[r.id]),0);
 const rollSummary=rollInputs.map(r=>({id:r.id,stockType:r.stockType||'FULL',widthFt:r.w,availableLF:r.l,usedLF:used[r.id]||0,remainingLF:r.l-(used[r.id]||0),remainingSF:r.w*(r.l-(used[r.id]||0))}));
 return {roomAreaSF,allowanceAreaSF,patternAdjustmentSF,patternRepeatIn,allowance,installationChecks,requiresInstallerReview,placed,unplaced:best.unplaced,used,net:best.usedAreaSF,allocated:best.allocatedAreaSF,waste:best.wasteAreaSF,remaining,rollSummary,rate:best.wastePercent,scenarios:summaries.map(s=>({name:s.name,feasible:s.feasible,unplaced:s.plan.unplaced.length,unplacedAreaSF:s.unplacedAreaSF,allocatedSF:s.plan.allocatedAreaSF,wasteSF:s.wasteSF,rollCount:s.rollCount,remnantCount:s.remnantCount,shortCount:s.shortCount,usedRolls:s.usedRolls})),selected};
}
declare global {interface Window {runluCalculateShared?:typeof calculateShared}}
if(typeof window!=='undefined')window.runluCalculateShared=calculateShared;
