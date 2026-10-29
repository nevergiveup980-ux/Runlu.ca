import {describe,it,expect} from "vitest";
import {comparePlans} from "./scenarios";
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
});
