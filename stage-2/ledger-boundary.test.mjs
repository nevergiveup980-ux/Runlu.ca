import test from "node:test";
import assert from "node:assert/strict";
import {BudgetLedger} from "./ledger.mjs";
test("max-safe-integer budget cannot be exceeded",()=>{
 const l=new BudgetLedger();l.create("max",Number.MAX_SAFE_INTEGER);
 l.reserve("max","first",Number.MAX_SAFE_INTEGER-1);
 assert.throws(()=>l.reserve("max","second",2),/Budget exceeded/);
 assert.equal(l.snapshot("max").reservedCents,Number.MAX_SAFE_INTEGER-1);
});
test("exact remaining budget is allowed",()=>{
 const l=new BudgetLedger();l.create("job",100);
 l.reserve("job","first",60);l.reserve("job","second",40);
 assert.equal(l.snapshot("job").reservedCents,100);
});
test("settled spending still counts toward remaining budget",()=>{
 const l=new BudgetLedger();l.create("job",100);
 l.reserve("job","first",60);l.settle("job","first",55);
 assert.throws(()=>l.reserve("job","second",46),/Budget exceeded/);
 l.reserve("job","second",45);
 assert.equal(l.snapshot("job").spentCents+l.snapshot("job").reservedCents,100);
});
