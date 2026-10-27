import {planCuts,type Roll,type Piece,type Plan} from "./engine";
export type Scenario={name:string;plan:Plan;feasible:boolean;score:number;unplacedAreaSF:number};
const signature=(p:Plan)=>p.placements.map(x=>[x.pieceId,x.rollId,x.xIn,x.yIn,x.widthIn,x.lengthIn].join(":")).sort().join("|")+";"+p.unplaced.slice().sort().join(",");
/** Candidate comparison, not proof of global optimality. Never call an infeasible plan optimal. */
export function comparePlans(rolls:Roll[],pieces:Piece[]):Scenario[]{
 const candidates:{name:string;order:"area"|"length"|"width"|"input"}[]=[
  {name:"Largest area first",order:"area"},
  {name:"Longest first",order:"length"},
  {name:"Widest first",order:"width"},
  {name:"Original order",order:"input"}
 ];
 const seen=new Set<string>(),results:Scenario[]=[];
 for(const c of candidates){
  const plan=planCuts(rolls,pieces,c.order),key=signature(plan);
  if(seen.has(key))continue;seen.add(key);
  const feasible=plan.unplaced.length===0;
  const missing=new Set(plan.unplaced);const unplacedAreaSF=pieces.reduce((sum,p)=>sum+(missing.has(p.id)?p.widthIn*p.lengthIn/144:0),0);
  results.push({name:c.name,plan,feasible,score:plan.allocatedAreaSF,unplacedAreaSF});
 }
 return results.sort((a,b)=>Number(b.feasible)-Number(a.feasible)||a.plan.unplaced.length-b.plan.unplaced.length||a.unplacedAreaSF-b.unplacedAreaSF||a.score-b.score);
}
