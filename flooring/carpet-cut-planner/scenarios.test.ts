import {describe,it,expect} from "vitest";
import {comparePlans} from "./scenarios";
import {planCuts} from "./engine";
import type {Roll,Piece} from "./engine";
describe("candidate scenario comparison",()=>{
 const rolls:Roll[]=[{id:"A",widthIn:144,lengthIn:360,dyeLot:"D1"}];
 it("returns feasible candidate when pieces fit",()=>{
  const pieces:Piece[]=[{id:"1",widthIn:72,lengthIn:120,dyeLot:"D1"},{id:"2",widthIn:72,lengthIn:120,dyeLot:"D1"}];
  const plans=comparePlans(rolls,pieces);
  expect(plans.length).toBeGreaterThan(0);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.unplaced).toHaveLength(0);
 });
 it("marks impossible jobs as infeasible",()=>{
  const plans=comparePlans(rolls,[{id:"wide",widthIn:180,lengthIn:100}]);
  expect(plans.every(p=>!p.feasible)).toBe(true);
 });
 it("does not combine mismatched dye lots",()=>{
  const plans=comparePlans(rolls,[{id:"other",widthIn:72,lengthIn:100,dyeLot:"D2"}]);
  expect(plans[0].plan.unplaced).toEqual(["other"]);
 });

 it("reports missing area for incomplete plans",()=>{
  const plans=comparePlans(rolls,[{id:"too-wide",widthIn:180,lengthIn:144}]);
  expect(plans[0].feasible).toBe(false);
  expect(plans[0].unplacedAreaSF).toBe(180);
 });
 it("offers an unrestricted fallback when priority can strand a large piece",()=>{
  const stock:Roll[]=[
   {id:"REM",widthIn:72,lengthIn:120,dyeLot:"A",priority:0},
   {id:"FULL",widthIn:144,lengthIn:120,dyeLot:"A",priority:2}
  ];
  const cuts:Piece[]=[
   {id:"small",widthIn:72,lengthIn:120,dyeLot:"A"},
   {id:"wide",widthIn:144,lengthIn:120,dyeLot:"A"}
  ];
  const plans=comparePlans(stock,cuts);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.unplaced).toEqual([]);
 });
 it("deduplicates identical candidate layouts",()=>{
  const plans=comparePlans(rolls,[{id:"one",widthIn:72,lengthIn:120}]);
  expect(plans).toHaveLength(1);
 });
 it("ranks a complete plan ahead of incomplete alternatives",()=>{
  const stock:Roll[]=[{id:"SHORT",widthIn:72,lengthIn:120,dyeLot:"A",priority:0},{id:"FULL",widthIn:144,lengthIn:120,dyeLot:"A",priority:2}];
  const cuts:Piece[]=[{id:"small",widthIn:72,lengthIn:120,dyeLot:"A"},{id:"wide",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const plans=comparePlans(stock,cuts);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.unplaced).toEqual([]);
  expect(plans[0].plan.usedAreaSF+plans[0].plan.wasteAreaSF).toBeCloseTo(plans[0].plan.allocatedAreaSF);
 });
 it("compares roll-length orderings without claiming optimality",()=>{
  const stock:Roll[]=[{id:"LONG",widthIn:144,lengthIn:360,dyeLot:"A"},{id:"SHORT",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const cuts:Piece[]=[{id:"one",widthIn:72,lengthIn:120,dyeLot:"A"}];
  const plans=comparePlans(stock,cuts);
  expect(plans.length).toBeGreaterThan(0);
  expect(new Set(plans.map(p=>p.plan.placements.map(x=>[x.pieceId,x.rollId,x.xIn,x.yIn].join(":")).join("|"))).size).toBe(plans.length);
  expect(plans.every(p=>p.feasible)).toBe(true);
  expect(plans[0].plan.allocatedAreaSF).toBeLessThanOrEqual(Math.max(...plans.map(p=>p.plan.allocatedAreaSF)));
 });
 it("calculates equal allocated material for equal-width rolls despite different stock lengths",()=>{
  const stock:Roll[]=[{id:"LONG",widthIn:144,lengthIn:360,dyeLot:"A"},{id:"SHORT",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const cuts:Piece[]=[{id:"P",widthIn:72,lengthIn:120,dyeLot:"A"}];
  const plans=comparePlans(stock,cuts);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.allocatedAreaSF).toBe(120);
  expect(plans[0].plan.usedAreaSF).toBe(60);
  expect(plans[0].plan.wasteAreaSF).toBe(60);
 });
 it("does not trade away a required wide cut to use a preferred remnant",()=>{
  const stock:Roll[]=[{id:"REM",widthIn:72,lengthIn:120,dyeLot:"A",priority:0},{id:"FULL",widthIn:144,lengthIn:120,dyeLot:"A",priority:2}];
  const cuts:Piece[]=[{id:"small",widthIn:72,lengthIn:120,dyeLot:"A"},{id:"wide",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const plans=comparePlans(stock,cuts);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.placements).toHaveLength(2);
  expect(plans[0].plan.allocatedAreaSF).toBe(180);
  expect(plans[0].plan.wasteAreaSF).toBe(0);
 });
 it("includes small-area-first candidate when it produces a distinct layout",()=>{
  const stock:Roll[]=[{id:"R",widthIn:144,lengthIn:360,dyeLot:"A"}];
  const cuts:Piece[]=[{id:"SMALL",widthIn:36,lengthIn:60},{id:"LARGE",widthIn:120,lengthIn:120}];
  const plans=comparePlans(stock,cuts);
  expect(plans.some(p=>p.name==="Smallest area first")).toBe(true);
  expect(plans[0].feasible).toBe(true);
  expect(plans[0].plan.unplaced).toEqual([]);
  expect(plans[0].score).toBe(Math.min(...plans.filter(p=>p.feasible).map(p=>p.score)));
 });
 it("never selects more allocated material than the best feasible legacy ordering",()=>{
  const cases:{rolls:Roll[];pieces:Piece[]}[]=[
   {rolls:[{id:"R1",widthIn:144,lengthIn:360,dyeLot:"A"}],pieces:[{id:"A",widthIn:120,lengthIn:120},{id:"B",widthIn:36,lengthIn:60}]},
   {rolls:[{id:"R1",widthIn:144,lengthIn:360,dyeLot:"A"}],pieces:[{id:"A",widthIn:72,lengthIn:120},{id:"B",widthIn:72,lengthIn:120},{id:"C",widthIn:48,lengthIn:72}]},
   {rolls:[{id:"SHORT",widthIn:72,lengthIn:120,dyeLot:"A",priority:0},{id:"FULL",widthIn:144,lengthIn:240,dyeLot:"A",priority:2}],pieces:[{id:"small",widthIn:72,lengthIn:120,dyeLot:"A"},{id:"wide",widthIn:144,lengthIn:120,dyeLot:"A"}]}
  ];
  for(const {rolls,pieces} of cases){
   const legacy=(["area","length","width","input"] as const).map(order=>planCuts(rolls,pieces,order)).filter(plan=>plan.unplaced.length===0);
   if(!legacy.length)continue;
   const bestLegacy=Math.min(...legacy.map(plan=>plan.allocatedAreaSF));
   const selected=comparePlans(rolls,pieces)[0];
   expect(selected.feasible).toBe(true);
   expect(selected.plan.allocatedAreaSF).toBeLessThanOrEqual(bestLegacy+1e-8);
   expect(selected.plan.usedAreaSF+selected.plan.wasteAreaSF).toBeCloseTo(selected.plan.allocatedAreaSF,8);
  }
 });
});

describe('incremental material and free-space search',()=>{
 it('reduces consumed full-width area against the current small-first baseline',()=>{
  const rolls:Roll[]=[{id:'R0',widthIn:144,lengthIn:912,dyeLot:'A',priority:2},{id:'R1',widthIn:96,lengthIn:300,dyeLot:'A',priority:0}];
  const pieces:Piece[]=[{id:'P0',widthIn:132,lengthIn:60,dyeLot:'A',allowRotate:true},{id:'P1',widthIn:120,lengthIn:132,dyeLot:'A',allowRotate:true},{id:'P2',widthIn:72,lengthIn:36,dyeLot:'A',allowRotate:true}];
  expect(comparePlans(rolls,pieces,{includeSpaceSearch:false})[0].score).toBe(220);
  const best=comparePlans(rolls,pieces)[0];
  expect(best.feasible).toBe(true);expect(best.score).toBe(204);expect(best.plan.wasteAreaSF).toBe(21);
 });
 it('vertical split retains a full-height side strip without overlapping the lower strip',()=>{
  const plan=planCuts([{id:'R',widthIn:120,lengthIn:120,dyeLot:'A'}],[{id:'wide',widthIn:60,lengthIn:60},{id:'tall',widthIn:60,lengthIn:120}],'input',{split:'vertical'});
  expect(plan.unplaced).toEqual([]);
  expect(plan.placements.map(p=>[p.xIn,p.yIn,p.widthIn,p.lengthIn])).toEqual([[0,0,60,60],[60,0,60,120]]);
  expect(plan.allocatedAreaSF).toBe(100);expect(plan.wasteAreaSF).toBe(25);
 });
});
