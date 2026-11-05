import {describe,it,expect} from "vitest";
import {planCuts,type Roll,type Piece} from "./engine";
import {comparePlans} from "./scenarios";

/** Synthetic warehouse examples, NOT verified customer jobs or field acceptance. Inches internally. */
describe("synthetic warehouse order acceptance fixtures",()=>{
 it("two 6×10 ft cuts fit side by side on a 12 ft roll with zero allocated waste",()=>{
  const rolls:Roll[]=[{id:"12FT-A",widthIn:144,lengthIn:360,dyeLot:"A"}];
  const pieces:Piece[]=[{id:"ROOM-1",widthIn:72,lengthIn:120,dyeLot:"A"},{id:"ROOM-2",widthIn:72,lengthIn:120,dyeLot:"A"}];
  const plan=comparePlans(rolls,pieces)[0].plan;
  expect(plan.unplaced).toEqual([]);
  expect(plan.placements).toHaveLength(2);
  expect(plan.usedAreaSF).toBe(120);
  expect(plan.allocatedAreaSF).toBe(120);
  expect(plan.wasteAreaSF).toBe(0);
  expect(plan.usedLengthByRoll["12FT-A"]).toBe(120);
 });
 it("identical-size cuts with different dye lots stay on separate rolls",()=>{
  const rolls:Roll[]=[{id:"LOT-A",widthIn:144,lengthIn:240,dyeLot:"A"},{id:"LOT-B",widthIn:144,lengthIn:240,dyeLot:"B"}];
  const pieces:Piece[]=[{id:"A-CUT",widthIn:144,lengthIn:120,dyeLot:"A"},{id:"B-CUT",widthIn:144,lengthIn:120,dyeLot:"B"}];
  const plan=comparePlans(rolls,pieces)[0].plan;
  expect(plan.unplaced).toEqual([]);
  expect(plan.placements.find(p=>p.pieceId==="A-CUT")?.rollId).toBe("LOT-A");
  expect(plan.placements.find(p=>p.pieceId==="B-CUT")?.rollId).toBe("LOT-B");
  expect(plan.usedAreaSF).toBe(240);
  expect(plan.allocatedAreaSF).toBe(240);
  expect(plan.wasteAreaSF).toBe(0);
 });
 it("insufficient stock is reported as incomplete rather than silently overallocated",()=>{
  const rolls:Roll[]=[{id:"ONLY-ROLL",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const pieces:Piece[]=[{id:"FIRST",widthIn:144,lengthIn:120,dyeLot:"A"},{id:"SECOND",widthIn:144,lengthIn:120,dyeLot:"A"}];
  const plans=comparePlans(rolls,pieces);
  expect(plans[0].feasible).toBe(false);
  expect(plans[0].plan.placements).toHaveLength(1);
  expect(plans[0].plan.unplaced).toHaveLength(1);
  expect(plans[0].unplacedAreaSF).toBe(120);
  expect(plans[0].plan.allocatedAreaSF).toBe(120);
  expect(planCuts(rolls,pieces).unplaced).toHaveLength(1);
 });
});
