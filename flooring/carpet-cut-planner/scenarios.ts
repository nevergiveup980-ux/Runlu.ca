import {planCuts,type Roll,type Piece,type Plan} from "./engine";
export type Scenario={name:string;plan:Plan;feasible:boolean;score:number};
const signature=(p:Plan)=>p.placements.map(x=>[x.pieceId,x.rollId,x.xIn,x.yIn,x.widthIn,x.lengthIn].join(":")).sort().join("|")+";"+p.unplaced.slice().sort().join(",");
/** Candidate comparison, not proof of global optimality. Never call an infeasible plan optimal. */
export function comparePlans(rolls:Roll[],pieces:Piece[]):Scenario[]{
 const candidates:{name:string;pieces:Piece[]}[]=[
  {name:"Largest area first",pieces:[...pieces].sort((a,b)=>b.widthIn*b.lengthIn-a.widthIn*a.lengthIn)},
  {name:"Longest first",pieces:[...pieces].sort((a,b)=>b.lengthIn-a.lengthIn)},
  {name:"Widest first",pieces:[...pieces].sort((a,b)=>b.widthIn-a.widthIn)},
  {name:"Original order",pieces:[...pieces]}
 ];
 const seen=new Set<string>(),results:Scenario[]=[];
 for(const c of candidates){
  // planCuts currently always sorts by area, so these candidates are intentionally
  // equivalent until the engine supports a configurable placement order.
  const plan=planCuts(rolls,c.pieces),key=signature(plan);
  if(seen.has(key))continue;seen.add(key);
  const feasible=plan.unplaced.length===0;
  results.push({name:c.name,plan,feasible,score:feasible?plan.allocatedAreaSF:Number.POSITIVE_INFINITY});
 }
 return results.sort((a,b)=>Number(b.feasible)-Number(a.feasible)||a.score-b.score);
}
