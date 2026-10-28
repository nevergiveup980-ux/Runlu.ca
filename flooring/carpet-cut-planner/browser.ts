import {comparePlans} from "./scenarios";
import type {Roll,Piece} from "./engine";
type InputRoll={id:string;w:number;l:number;lot:string;stockType?:'FULL'|'SHORT'|'REMNANT'};
type InputPiece={id:string;w:number;l:number;lot:string;rotate:boolean};
export function calculateShared(rollInputs:InputRoll[],pieceInputs:InputPiece[],selected=0,shortRollFirst=false){
 const rolls:Roll[]=rollInputs.map(r=>({id:r.id,widthIn:r.w*12,lengthIn:r.l*12,dyeLot:r.lot}));
 const pieces:Piece[]=pieceInputs.map(p=>({id:p.id,widthIn:p.w*12,lengthIn:p.l*12,dyeLot:p.lot||undefined,allowRotate:p.rotate}));
 // Optional inventory preference: shorter rolls are offered to the greedy engine first.
 // This is a heuristic, not a guarantee of minimum material consumption.
 const orderedRolls=shortRollFirst?[...rolls].sort((a,b)=>a.lengthIn-b.lengthIn):rolls;
 const scenarios=comparePlans(orderedRolls,pieces);
 if(!scenarios.length)throw Error("No candidate plans");
 if(!Number.isInteger(selected)||selected<0||selected>=scenarios.length)throw Error("Invalid scenario selection");
 const best=scenarios[selected].plan;
 const used=Object.fromEntries(Object.entries(best.usedLengthByRoll).map(([id,v])=>[id,v/12]));
 const placed=best.placements.map(p=>({id:p.pieceId,roll:p.rollId,x:p.xIn/12,y:p.yIn/12,w:p.widthIn/12,h:p.lengthIn/12}));
 const remaining=rollInputs.reduce((sum,r)=>sum+r.w*(r.l-used[r.id]),0);
 const rollSummary=rollInputs.map(r=>({id:r.id,stockType:r.stockType||'FULL',widthFt:r.w,availableLF:r.l,usedLF:used[r.id]||0,remainingLF:r.l-(used[r.id]||0),remainingSF:r.w*(r.l-(used[r.id]||0))}));
 return {placed,unplaced:best.unplaced,used,net:best.usedAreaSF,allocated:best.allocatedAreaSF,waste:best.wasteAreaSF,remaining,rollSummary,rate:best.wastePercent,scenarios:scenarios.map(s=>({name:s.name,feasible:s.feasible,unplaced:s.plan.unplaced.length,unplacedAreaSF:s.unplacedAreaSF,allocatedSF:s.plan.allocatedAreaSF})),selected};
}
declare global {interface Window {runluCalculateShared?:typeof calculateShared}}
if(typeof window!=='undefined')window.runluCalculateShared=calculateShared;
