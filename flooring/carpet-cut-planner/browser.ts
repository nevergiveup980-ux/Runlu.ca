import {comparePlans} from "./scenarios";
import type {Roll,Piece} from "./engine";
type InputRoll={id:string;w:number;l:number;lot:string};
type InputPiece={id:string;w:number;l:number;lot:string;rotate:boolean};
export function calculateShared(rollInputs:InputRoll[],pieceInputs:InputPiece[]){
 const rolls:Roll[]=rollInputs.map(r=>({id:r.id,widthIn:r.w*12,lengthIn:r.l*12,dyeLot:r.lot}));
 const pieces:Piece[]=pieceInputs.map(p=>({id:p.id,widthIn:p.w*12,lengthIn:p.l*12,dyeLot:p.lot||undefined,allowRotate:p.rotate}));
 const scenarios=comparePlans(rolls,pieces);
 if(!scenarios.length)throw Error("No candidate plans");
 const best=scenarios[0].plan;
 const used=Object.fromEntries(Object.entries(best.usedLengthByRoll).map(([id,v])=>[id,v/12]));
 const placed=best.placements.map(p=>({id:p.pieceId,roll:p.rollId,x:p.xIn/12,y:p.yIn/12,w:p.widthIn/12,h:p.lengthIn/12}));
 const remaining=rollInputs.reduce((sum,r)=>sum+r.w*(r.l-used[r.id]),0);
 return {placed,unplaced:best.unplaced,used,net:best.usedAreaSF,allocated:best.allocatedAreaSF,waste:best.wasteAreaSF,remaining,rate:best.wastePercent,scenarios:scenarios.map(s=>({name:s.name,feasible:s.feasible,unplaced:s.plan.unplaced.length,unplacedAreaSF:s.unplacedAreaSF,allocatedSF:s.plan.allocatedAreaSF}))};
}
declare global {interface Window {runluCalculateShared?:typeof calculateShared}}
window.runluCalculateShared=calculateShared;
