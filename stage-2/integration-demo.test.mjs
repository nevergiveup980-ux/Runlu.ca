import test from "node:test";
import assert from "node:assert/strict";
import {simulateStageJob} from "./integration-demo.mjs";
import {MockVideoProvider} from "./mock-provider.mjs";
test("full simulation settles actual cost and releases unused budget",async()=>{
 const r=await simulateStageJob();
 assert.equal(r.status,"SIMULATED_COMPLETE");
 assert.equal(r.ledger.spentCents,200);
 assert.equal(r.ledger.reservedCents,0);
 assert.equal(r.artifact.kind,"mock-video");
});
test("provider error keeps budget reserved for reconciliation",async()=>{
 const r=await simulateStageJob({provider:{generate:async()=>{throw Error("timeout")}}});
 assert.equal(r.status,"RECONCILIATION_REQUIRED");
 assert.equal(r.ledger.reservedCents,500);
});
test("overbilling quarantines rather than settling",async()=>{
 const r=await simulateStageJob({provider:{generate:async()=>({ok:true,billedCad:6})}});
 assert.equal(r.status,"RECONCILIATION_REQUIRED");
 assert.equal(r.ledger.spentCents,0);
});
test("provider failure with known bill is settled",async()=>{
 const r=await simulateStageJob({provider:new MockVideoProvider({failFirst:true,billedCad:1})});
 assert.equal(r.status,"SIMULATED_FAILED");
 assert.equal(r.ledger.spentCents,100);
});
test("invalid request rejected before reservation",async()=>{
 await assert.rejects(simulateStageJob({brief:{durationSeconds:4000,quality:"standard",format:"cinematic"}}));
});
