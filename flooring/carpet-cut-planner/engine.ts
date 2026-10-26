/** RUNLU Carpet Cut & Waste Planner — deterministic MVP engine.
 * All internal dimensions are inches; all areas are square inches.
 * Rectangular cut pieces only. No seams or pattern matching in this phase.
 */
export type Roll = { id:string; widthIn:number; lengthIn:number; dyeLot:string };
export type Piece = { id:string; widthIn:number; lengthIn:number; dyeLot?:string; allowRotate?:boolean };
export type Placement = { pieceId:string; rollId:string; xIn:number; yIn:number; widthIn:number; lengthIn:number };
export type Plan = { placements:Placement[]; unplaced:string[]; usedAreaSF:number; allocatedAreaSF:number; wasteAreaSF:number; wastePercent:number; usedLengthByRoll:Record<string,number> };
export const sfToSyd=(sf:number)=>sf/9;
export const inchesToFeet=(inch:number)=>inch/12;
export const areaSF=(wIn:number,lIn:number)=>wIn*lIn/144;
type Space={rollId:string;x:number;y:number;w:number;h:number;dyeLot:string};
export function planCuts(rolls:Roll[],pieces:Piece[]):Plan {
  const rollIds=new Set<string>(),pieceIds=new Set<string>();
  for(const r of rolls){
    if(!r.id?.trim()||rollIds.has(r.id))throw Error("Duplicate or empty roll ID");
    rollIds.add(r.id);
    if(!Number.isFinite(r.widthIn)||!Number.isFinite(r.lengthIn)||r.widthIn<=0||r.lengthIn<=0||!r.dyeLot?.trim())throw Error("Invalid roll");
  }
  for(const p of pieces){
    if(!p.id?.trim()||pieceIds.has(p.id))throw Error("Duplicate or empty piece ID");
    pieceIds.add(p.id);
    if(!Number.isFinite(p.widthIn)||!Number.isFinite(p.lengthIn)||p.widthIn<=0||p.lengthIn<=0)throw Error("Invalid piece");
  }
  if(!rolls.length||!pieces.length)throw Error("At least one roll and one piece are required");
  const spaces:Space[]=rolls.map(r=>({rollId:r.id,x:0,y:0,w:r.widthIn,h:r.lengthIn,dyeLot:r.dyeLot}));
  const placements:Placement[]=[]; const unplaced:string[]=[];
  const ordered=[...pieces].sort((a,b)=>b.widthIn*b.lengthIn-a.widthIn*a.lengthIn);
  for(const p of ordered){
    let best:{i:number;w:number;h:number;score:number}|undefined;
    for(let i=0;i<spaces.length;i++){
      const s=spaces[i]; if(p.dyeLot&&p.dyeLot!==s.dyeLot)continue;
      const orientations=[[p.widthIn,p.lengthIn],...(p.allowRotate?[[p.lengthIn,p.widthIn]]:[])];
      for(const [w,h] of orientations) if(w<=s.w&&h<=s.h){
        const score=s.w*s.h-w*h;
        if(!best||score<best.score)best={i,w,h,score};
      }
    }
    if(!best){unplaced.push(p.id);continue;}
    const s=spaces.splice(best.i,1)[0];const {w,h}=best;
    placements.push({pieceId:p.id,rollId:s.rollId,xIn:s.x,yIn:s.y,widthIn:w,lengthIn:h});
    // Guillotine split: right strip of cut height; lower strip of full width.
    if(s.w>w)spaces.push({...s,x:s.x+w,w:s.w-w,h});
    if(s.h>h)spaces.push({...s,y:s.y+h,h:s.h-h});
  }
  const usedLengthByRoll:Record<string,number>={};
  for(const r of rolls)usedLengthByRoll[r.id]=0;
  for(const p of placements)usedLengthByRoll[p.rollId]=Math.max(usedLengthByRoll[p.rollId],p.yIn+p.lengthIn);
  const usedAreaSF=placements.reduce((a,p)=>a+areaSF(p.widthIn,p.lengthIn),0);
  const allocatedAreaSF=rolls.reduce((a,r)=>a+areaSF(r.widthIn,usedLengthByRoll[r.id]),0);
  const wasteAreaSF=Math.max(0,allocatedAreaSF-usedAreaSF);
  return {placements,unplaced,usedAreaSF,allocatedAreaSF,wasteAreaSF,wastePercent:allocatedAreaSF?100*wasteAreaSF/allocatedAreaSF:0,usedLengthByRoll};
}
