import { describe,it,expect } from "vitest";
import { planCuts,areaSF,sfToSyd } from "./engine";
describe("carpet planner engine",()=>{
 it("converts area correctly",()=>{expect(areaSF(144,144)).toBe(144);expect(sfToSyd(90)).toBe(10)});
 it("places two cuts in a 12ft roll without overlap",()=>{
  const p=planCuts([{id:"R1",widthIn:144,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:72,lengthIn:120},{id:"P2",widthIn:72,lengthIn:120}]);
  expect(p.unplaced).toEqual([]);expect(p.placements).toHaveLength(2);expect(p.usedAreaSF).toBe(120);expect(p.wasteAreaSF).toBe(0);
 });
 it("rejects mismatched dye lots",()=>{
  const p=planCuts([{id:"R1",widthIn:144,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:72,lengthIn:120,dyeLot:"B"}]);
  expect(p.unplaced).toEqual(["P1"]);
 });
 it("does not rotate directional pieces by default",()=>{
  const p=planCuts([{id:"R1",widthIn:120,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:144,lengthIn:100}]);
  expect(p.unplaced).toEqual(["P1"]);
 });

 it("rejects duplicate roll IDs",()=>{expect(()=>planCuts([{id:"R1",widthIn:144,lengthIn:240,dyeLot:"A"},{id:"R1",widthIn:144,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:72,lengthIn:120}])).toThrow()});
 it("rejects nonfinite dimensions",()=>{expect(()=>planCuts([{id:"R1",widthIn:Infinity,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:72,lengthIn:120}])).toThrow()});
 it("keeps mixed widths and dye lots isolated",()=>{
  const stock=[
   {id:"A12",widthIn:144,lengthIn:240,dyeLot:"A",priority:2},
   {id:"B10",widthIn:120,lengthIn:120,dyeLot:"B",priority:0},
   {id:"A8",widthIn:96,lengthIn:120,dyeLot:"A",priority:0}
  ];
  const pieces=[
   {id:"A-wide",widthIn:130,lengthIn:120,dyeLot:"A"},
   {id:"B-only",widthIn:100,lengthIn:120,dyeLot:"B"},
   {id:"A-small",widthIn:90,lengthIn:120,dyeLot:"A"}
  ];
  const plan=planCuts(stock,pieces);
  expect(plan.unplaced).toEqual([]);
  expect(Object.fromEntries(plan.placements.map(p=>[p.pieceId,p.rollId]))).toEqual({"A-wide":"A12","B-only":"B10","A-small":"A8"});
  expect(plan.usedLengthByRoll).toEqual({A12:120,B10:120,A8:120});
  expect(plan.usedAreaSF).toBeCloseTo((130+100+90)*120/144);
  expect(plan.allocatedAreaSF).toBe(300);
 });
 it("allows rotation when requested",()=>{const p=planCuts([{id:"R1",widthIn:120,lengthIn:240,dyeLot:"A"}],[{id:"P1",widthIn:144,lengthIn:100,allowRotate:true}]);expect(p.unplaced).toEqual([])});
});
