import {planCuts,type Roll,type Piece} from './engine';
import {comparePlans} from './scenarios';
// Synthetic dimensions in feet, fixed input order, lot A, rotation disabled.
export const materialFixtures=[
 {name:'small-first-win',sizes:[[11,10],[2,6],[8,10],[4,16],[6,16],[5,16]]},
 {name:'equal-material',sizes:[[6,10],[6,10]]},
 {name:'small-first-regression',sizes:[[6,10],[6,5]]},
 {name:'impossible-width',sizes:[[13,10]]}
];
export function measureMaterial(rolls:Roll[],pieces:Piece[]){
 // Full pre-small-first candidate set: includes roll ordering and priority fallback.
 const legacy=comparePlans(rolls,pieces,{includeSmallAreaFirst:false,includeSpaceSearch:false})[0];
 const expanded=comparePlans(rolls,pieces)[0];
 const small=planCuts(rolls,pieces,'area-asc');
 const metrics=(plan:typeof small)=>({complete:plan.unplaced.length===0,allocatedSF:plan.allocatedAreaSF,allocatedSYD:plan.allocatedAreaSF/9,wasteSF:plan.wasteAreaSF,wastePercent:plan.wastePercent,placed:plan.placements.length});
 return {legacy:metrics(legacy.plan),small:metrics(small),expanded:metrics(expanded.plan),
  // Partial jobs cannot establish material savings for the complete order.
  savingsSF:legacy.feasible&&expanded.feasible?legacy.plan.allocatedAreaSF-expanded.plan.allocatedAreaSF:null};
}
export function fixtureInput(sizes:number[][]){
 return {rolls:[{id:'R',widthIn:144,lengthIn:1200,dyeLot:'A'}],pieces:sizes.map(([w,l],i)=>({id:`P${i+1}`,widthIn:w*12,lengthIn:l*12,dyeLot:'A',allowRotate:false}))};
}
