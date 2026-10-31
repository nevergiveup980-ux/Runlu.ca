import test from "node:test";
import assert from "node:assert/strict";
import {decideRunwayRecovery} from "./runway-recovery.mjs";

test("never blindly retries an ambiguous paid submission",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"unknown"}).action,"HOLD_FOR_RECONCILIATION");
});
test("confirmed submission without task id is held",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"confirmed_submitted"}).action,"HOLD_FOR_RECONCILIATION");
});
test("polls an existing task instead of resubmitting",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"confirmed_submitted",taskId:"task-1",taskStatus:"RUNNING"}).action,"POLL");
});
test("successful provider task must be ingested",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"confirmed_submitted",taskId:"task-1",taskStatus:"SUCCEEDED"}).action,"INGEST");
});
test("failed task requires billing reconciliation",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"confirmed_submitted",taskId:"task-1",taskStatus:"FAILED"}).action,"RECONCILE");
});
test("unsubmitted task can be submitted",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"not_submitted"}).action,"SUBMIT");
});
test("invalid submission outcome is rejected",()=>{
 assert.throws(()=>decideRunwayRecovery({submissionOutcome:"maybe"}));
});

test("unknown provider status fails closed",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"confirmed_submitted",taskId:"task-1",taskStatus:"UNRECOGNIZED"}).action,"HOLD_FOR_RECONCILIATION");
});
test("contradictory unsubmitted evidence fails closed",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"not_submitted",taskId:"task-1"}).action,"HOLD_FOR_RECONCILIATION");
});
test("unknown submission outcome ignores task status",()=>{
 assert.equal(decideRunwayRecovery({submissionOutcome:"unknown",taskId:"task-1",taskStatus:"FAILED"}).action,"HOLD_FOR_RECONCILIATION");
});
