import test from "node:test";
import assert from "node:assert/strict";
import {MockVideoProvider} from "./mock-provider.mjs";
import {simulateStageJob} from "./integration-demo.mjs";

test("mock output cannot masquerade as verified media",async()=>{
 const result=await new MockVideoProvider().generate({durationSeconds:30},{id:"j",attempt:1,budgetRemainingCad:1});
 assert.equal(result.ok,true);
 assert.equal(result.artifact.verified,false);
 assert.equal(result.artifact.simulated,true);
 assert.notEqual(result.artifact.kind,"mp4");
});

test("end-to-end simulation retains unverified status",async()=>{
 const result=await simulateStageJob();
 assert.equal(result.status,"SIMULATED_COMPLETE");
 assert.equal(result.artifact.verified,false);
 assert.equal(result.artifact.simulated,true);
});

test("mock budget rejection is not a verified video",async()=>{
 const result=await new MockVideoProvider({billedCad:2}).generate({durationSeconds:30},{id:"j",attempt:1,budgetRemainingCad:1});
 assert.equal(result.ok,false);
 assert.equal(result.artifact,undefined);
});
