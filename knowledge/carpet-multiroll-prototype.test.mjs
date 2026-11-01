import test from "node:test";
import assert from "node:assert/strict";
import { allocateFullWidthCuts } from "./carpet-multiroll-prototype.mjs";

const roll=(id,lot,width,length)=>({id,dyeLot:lot,usableWidthFt:width,remainingLengthFt:length});
const room=(id,width,length,extra={})=>({id,widthFt:width,lengthFt:length,...extra});

test("two rooms can consume a single roll sequentially",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,25)],rooms:[room("1",10,10),room("2",9,12)]});
  assert.equal(r.complete,true);
  assert.equal(r.rolls[0].remainingLengthFt,3);
  assert.equal(r.assigned.length,2);
});

test("total area is not enough when cumulative length exceeds roll",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,15)],rooms:[room("1",6,10),room("2",6,10)]});
  assert.equal(r.complete,false);
  assert.equal(r.unassigned.length,1);
});

test("separate rolls with same dye lot are eligible",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,10),roll("B","D1",12,10)],rooms:[room("1",11,10),room("2",11,10)]});
  assert.equal(r.complete,true);
  assert.deepEqual(r.assigned.map(x=>x.rollId),["A","B"]);
});

test("mixed dye lots blocked by default",()=>{
  const rolls=[roll("A","D1",12,10),roll("B","D2",12,10)];
  const rooms=[room("1",11,10),room("2",11,10)];
  assert.equal(allocateFullWidthCuts({rolls,rooms}).complete,false);
  assert.equal(allocateFullWidthCuts({rolls,rooms,allowMixedLots:true}).complete,true);
});

test("rotation cannot violate fixed pile orientation",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,20)],rooms:[room("1",15,10)]});
  assert.equal(r.complete,false);
});

test("pattern matching needs product-specific planning",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,20)],rooms:[room("1",10,10,{patternMatchRequired:true})]});
  assert.equal(r.complete,false);
  assert.equal(r.unassigned[0].reason,"needs-pattern-plan");
});

test("allowance consumes actual additional length",()=>{
  const r=allocateFullWidthCuts({rolls:[roll("A","D1",12,10)],rooms:[room("1",10,9,{lengthAllowanceFt:2})]});
  assert.equal(r.complete,false);
});

test("reject duplicate IDs and invalid dimensions",()=>{
  assert.throws(()=>allocateFullWidthCuts({rolls:[roll("A","D1",12,10),roll("A","D1",12,10)],rooms:[room("1",10,5)]}),TypeError);
  assert.throws(()=>allocateFullWidthCuts({rolls:[roll("A","D1",12,10)],rooms:[room("1",-1,5)]}),RangeError);
});
