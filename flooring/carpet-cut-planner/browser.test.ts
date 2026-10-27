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
 it("rejects out-of-range scenario index",()=>{
  expect(()=>calculateShared(rolls,pieces,999)).toThrow("Invalid scenario selection");
 });
 it("rejects invalid roll measurements",()=>{
  expect(()=>calculateShared([{id:"R1",w:-1,l:30,lot:"A"}],pieces)).toThrow();
 });
});
