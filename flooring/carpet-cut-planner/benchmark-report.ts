/** Reproduce with: npm run benchmark -- /absolute/path/report.json */
import {writeFileSync} from 'node:fs';
import {comparePlans} from './scenarios';
import type {Plan} from './engine';
let seed=980;
const random=(n:number)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
const metrics=(p:Plan)=>({placed:p.placements.length,allocatedSF:p.allocatedAreaSF,allocatedSYD:p.allocatedAreaSF/9,wasteSF:p.wasteAreaSF,wastePercent:p.wastePercent});
const rows=[];
let wins=0,ties=0,completionGains=0,oldPlaced=0,newPlaced=0,oldArea=0,newArea=0,oldWaste=0,newWaste=0;
for(let i=0;i<1000;i++){
 const rolls=Array.from({length:1+random(3)},(_,j)=>({id:`R${j}`,widthIn:12*(8+random(5)),lengthIn:12*(20+random(61)),dyeLot:j===2?'B':'A',priority:random(3)}));
 const pieces=Array.from({length:3+random(6)},(_,j)=>({id:`P${j}`,widthIn:12*(2+random(11)),lengthIn:12*(3+random(14)),dyeLot:random(4)===0?'B':'A',allowRotate:random(4)===0}));
 const before=comparePlans(rolls,pieces,{includeSpaceSearch:false})[0],after=comparePlans(rolls,pieces)[0];
 const comparable=before.feasible&&after.feasible;
 if(before.feasible&&(!after.feasible||after.score>before.score))throw Error(`Regression in order ${i}`);
 if(!before.feasible&&after.feasible)completionGains++;
 if(comparable){oldPlaced+=before.plan.placements.length;newPlaced+=after.plan.placements.length;oldArea+=before.score;newArea+=after.score;oldWaste+=before.plan.wasteAreaSF;newWaste+=after.plan.wasteAreaSF;if(after.score<before.score)wins++;else ties++;}
 rows.push({order:i,rolls,pieces,before:{strategy:before.name,complete:before.feasible,...metrics(before.plan)},after:{strategy:after.name,complete:after.feasible,...metrics(after.plan)},savingsSF:comparable?before.score-after.score:null});
}
const summary={seed:980,orders:1000,baseline:'5108217 candidate search including small-first',comparableOrders:wins+ties,wins,ties,incomparableOrders:1000-wins-ties,completionGains,before:{placed:oldPlaced,allocatedSF:oldArea,allocatedSYD:oldArea/9,wasteSF:oldWaste,wastePercent:oldWaste/oldArea*100},after:{placed:newPlaced,allocatedSF:newArea,allocatedSYD:newArea/9,wasteSF:newWaste,wastePercent:newWaste/newArea*100},savingsSF:oldArea-newArea};
console.log(JSON.stringify(summary,null,2));
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify({summary,rows},null,2)+'\n');
