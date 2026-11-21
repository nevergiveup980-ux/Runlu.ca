import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
test("retry predicate aborts after unrecoverable error",async()=>{
 let calls=0;
 const attempts=[];
 await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({
  pool:{query:async()=>{calls++;throw Error("unrecoverable");}},
  maxAttempts:3,
  shouldRetry:()=>false,
  onAttempt:event=>attempts.push(event)
 }),/unrecoverable/);
 assert.equal(calls,1);
 assert.deepEqual(attempts,[{attempt:1,ok:false}]);
});
test("retry predicate permits transient failure recovery",async()=>{
 let calls=0;
 const result=await runDeliveryRateLimitMaintenanceWithRetry({
  pool:{query:async()=>{calls++;if(calls===1)throw Error("transient");return {rows:[]};}},
  maxAttempts:3,
  shouldRetry:()=>true
 });
 assert.equal(result.attempts,2);
 assert.equal(calls,2);
});
test("retry predicate must be callable",async()=>{
 await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({shouldRetry:true}),/retry predicate/);
});
