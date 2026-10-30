import {describe,it,expect} from "vitest";
import {calculateShared} from "./browser";

describe("browser adapter",()=>{
 const rolls=[{id:"R1",w:12,l:30,lot:"A"}];
 const pieces=[{id:"P1",w:6,l:10,lot:"A",rotate:false},{id:"P2",w:6,l:10,lot:"A",rotate:false}];
 it("converts feet to inches and reports SF",()=>{
  const p=calculateShared(rolls,pieces);
  expect(p.net).toBe(120);
  expect(p.unplaced).toEqual([]);
  expect(p.used.R1).toBe(10);
  expect(p.remaining).toBe(240);
 });
 it("allows selecting each returned candidate",()=>{
  const first=calculateShared(rolls,pieces);
  for(let i=0;i<first.scenarios.length;i++){
   const p=calculateShared(rolls,pieces,i);
   expect(p.selected).toBe(i);
   expect(p.placed).toHaveLength(2);
  }
 });
 it("supports optional short-roll preference without changing required area",()=>{
  const inventory=[{id:"LONG",w:12,l:30,lot:"A"},{id:"SHORT",w:12,l:10,lot:"A"}];
  const result=calculateShared(inventory,[{id:"P1",w:6,l:10,lot:"A",rotate:false}],0,true);
  expect(result.unplaced).toEqual([]);
  expect(result.net).toBe(60);
  expect(result.placed[0].roll).toBe("SHORT");
 });
 it("reports remaining inventory for each classified roll",()=>{
  const inventory=[{id:"F",w:12,l:30,lot:"A",stockType:"FULL" as const},{id:"S",w:12,l:10,lot:"A",stockType:"SHORT" as const}];
  const result=calculateShared(inventory,[{id:"P",w:6,l:10,lot:"A",rotate:false}],0,true);
  expect(result.rollSummary.find(r=>r.id==="S")?.stockType).toBe("SHORT");
  expect(result.rollSummary.find(r=>r.id==="S")?.remainingLF).toBe(0);
  expect(result.rollSummary.find(r=>r.id==="F")?.remainingLF).toBe(30);
 });
 it("prioritizes compatible remnants ahead of full stock",()=>{
  const inventory=[
   {id:"FULL",w:12,l:10,lot:"A",stockType:"FULL" as const},
   {id:"REM",w:12,l:20,lot:"A",stockType:"REMNANT" as const}
  ];
  const p=calculateShared(inventory,[{id:"P",w:6,l:10,lot:"A",rotate:false}],0,true);
  expect(p.unplaced).toEqual([]);
  expect(p.placed[0].roll).toBe("REM");
 });
 it("does not override dye lot matching for remnants",()=>{
  const inventory=[
   {id:"REM",w:12,l:20,lot:"B",stockType:"REMNANT" as const},
   {id:"FULL",w:12,l:20,lot:"A",stockType:"FULL" as const}
  ];
  const p=calculateShared(inventory,[{id:"P",w:6,l:10,lot:"A",rotate:false}],0,true);
  expect(p.placed[0].roll).toBe("FULL");
 });
 it("reports used roll counts and length for candidate comparison",()=>{
  const stock=[{id:"REM",w:12,l:10,lot:"A",stockType:"REMNANT" as const},{id:"FULL",w:12,l:30,lot:"A",stockType:"FULL" as const}];
  const p=calculateShared(stock,[{id:"P",w:6,l:10,lot:"A",rotate:false}],0,true);
  expect(p.scenarios[0].rollCount).toBe(1);
  expect(p.scenarios[0].remnantCount).toBe(1);
  expect(p.scenarios[0].usedRolls[0]).toMatchObject({id:"REM",usedLF:10,usedSF:120});
  expect(p.scenarios[0].wasteSF).toBe(60);
 });
 it("reports mixed-width roll usage separately instead of summing LF",()=>{
  const inventory=[
   {id:"A12",w:12,l:20,lot:"A",stockType:"FULL" as const},
   {id:"B10",w:10,l:10,lot:"B",stockType:"SHORT" as const},
   {id:"A8",w:8,l:10,lot:"A",stockType:"REMNANT" as const}
  ];
  const cuts=[
   {id:"A-wide",w:11,l:10,lot:"A",rotate:false},
   {id:"B-only",w:9,l:10,lot:"B",rotate:false},
   {id:"A-small",w:7,l:10,lot:"A",rotate:false}
  ];
  const result=calculateShared(inventory,cuts,0,true);
  expect(result.unplaced).toEqual([]);
  expect(result.used).toEqual({A12:10,B10:10,A8:10});
  expect(result.net).toBe(270);
  expect(result.allocated).toBe(300);
  expect(result.rollSummary.find(r=>r.id==="A12")?.remainingLF).toBe(10);
 });
 it("rejects out-of-range scenario index",()=>{
  expect(()=>calculateShared(rolls,pieces,999)).toThrow("Invalid scenario selection");
 });
 it("rejects invalid roll measurements",()=>{
  expect(()=>calculateShared([{id:"R1",w:-1,l:30,lot:"A"}],pieces)).toThrow();
 });
});
