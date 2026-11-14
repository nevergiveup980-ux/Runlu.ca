import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
test("maintenance retries transient database failure then succeeds",async()=>{
 let calls=0;const attempts=[];
 const pool={query:async()=>{calls++;if(calls===1)throw Error("transient database outage");return {rows:[{rate_key:"sensitive"}]};}};
 const result=await runDeliveryRateLimitMaintenanceWithRetry({pool,maxAttempts:2,onAttempt:event=>attempts.push(event)});
 assert.equal(result.ok,true);assert.equal(result.attempts,2);assert.equal(calls,2);
 assert.deepEqual(attempts,[{attempt:1,ok:false},{attempt:2,ok:true}]);
 assert.equal(JSON.stringify(attempts).includes("sensitive"),false);
});
test("maintenance gives up after bounded failed attempts",async()=>{
 let calls=0;const attempts=[];
 await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({pool:{query:async()=>{calls++;throw Error("db unavailable");}},maxAttempts:3,onAttempt:e=>attempts.push(e)}),/db unavailable/);
 assert.equal(calls,3);assert.equal(attempts.length,3);assert.ok(attempts.every(x=>x.ok===false));
});
test("maintenance rejects unbounded retry configuration",async()=>{
 for(const maxAttempts of [0,4,-1,1.5,"2"]){
  await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({maxAttempts}),/Invalid maintenance retry limit/);
 }
});
