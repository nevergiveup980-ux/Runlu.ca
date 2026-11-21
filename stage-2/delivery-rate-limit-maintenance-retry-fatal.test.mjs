import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryRateLimitMaintenanceWithRetry} from "./delivery-rate-limit-maintenance-retry.mjs";
test("fatal retry predicate stops immediately after first failed attempt",async()=>{
 let calls=0;
 const pool={query:async()=>{calls++;throw Error("session lost");}};
 await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({pool,maxAttempts:3,shouldRetry:()=>false}),/session lost/);
 assert.equal(calls,1);
});
test("recoverable retry predicate allows a second attempt",async()=>{
 let calls=0;
 const pool={query:async()=>{calls++;if(calls===1)throw Error("transient");return {rows:[]};}};
 const result=await runDeliveryRateLimitMaintenanceWithRetry({pool,maxAttempts:3,shouldRetry:()=>true});
 assert.equal(result.ok,true);assert.equal(result.attempts,2);
});
test("retry predicate must be a function",async()=>{
 await assert.rejects(runDeliveryRateLimitMaintenanceWithRetry({shouldRetry:false}),/retry predicate/);
});
