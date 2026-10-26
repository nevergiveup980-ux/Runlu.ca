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
});
