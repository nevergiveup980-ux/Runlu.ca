import test from "node:test";
import assert from "node:assert/strict";
import {
  squareFeetToSquareYards, squareYardsToSquareFeet,
  checkSingleCut, checkDyeLotCompatibility
} from "./carpet-rules-prototype.mjs";

test("area conversion is exact", () => {
  assert.equal(squareFeetToSquareYards(90), 10);
  assert.equal(squareYardsToSquareFeet(9), 81);
  assert.equal(squareFeetToSquareYards(0), 0);
});

test("reject invalid measurements", () => {
  assert.throws(() => squareFeetToSquareYards(-1), RangeError);
  assert.throws(() => checkSingleCut({usableWidthFt:0,remainingLengthFt:10,pieceWidthFt:2,pieceLengthFt:2}), RangeError);
});

test("use actual width rather than nominal width", () => {
  const r = checkSingleCut({usableWidthFt:11.8,remainingLengthFt:20,pieceWidthFt:11.9,pieceLengthFt:10});
  assert.equal(r.feasible, false);
});

test("reject cuts that exceed remaining length", () => {
  assert.equal(checkSingleCut({usableWidthFt:12,remainingLengthFt:8,pieceWidthFt:10,pieceLengthFt:9}).feasible, false);
});

test("do not rotate when pile direction fixes orientation", () => {
  const args={usableWidthFt:12,remainingLengthFt:20,pieceWidthFt:15,pieceLengthFt:10};
  assert.equal(checkSingleCut({...args,orientation:"fixed"}).feasible,false);
  assert.equal(checkSingleCut({...args,orientation:"rotation-allowed"}).rotated,true);
});

test("missing required pattern repeat is not silently zero", () => {
  assert.deepEqual(checkSingleCut({usableWidthFt:12,remainingLengthFt:20,pieceWidthFt:10,pieceLengthFt:10,patternMatchRequired:true}),
    {feasible:null,reason:"needs-product-pattern-repeat"});
});

test("incompatible dye lots require explicit override", () => {
  assert.equal(checkDyeLotCompatibility(["A","B"]).compatible,false);
  assert.equal(checkDyeLotCompatibility(["A","B"],{allowMixedLots:true}).compatible,true);
  assert.equal(checkDyeLotCompatibility(["A","A"]).compatible,true);
});

test("explicit allowance can make otherwise fitting cut infeasible", () => {
  assert.equal(checkSingleCut({usableWidthFt:12,remainingLengthFt:20,pieceWidthFt:12,pieceLengthFt:10,widthAllowanceFt:0.25}).feasible,false);
});
