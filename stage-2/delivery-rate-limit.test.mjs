import test from "node:test";
import assert from "node:assert/strict";
import {createDeliveryRateLimiter} from "./delivery-rate-limit.mjs";
test("permits quota then rejects repeated private requests",()=>{
 let time=1000;const limiter=createDeliveryRateLimiter({maxRequests:2,windowMs:1000,now:()=>time});
 assert.equal(limiter.allow("trusted-user-1"),true);
 assert.equal(limiter.allow("trusted-user-1"),true);
 assert.equal(limiter.allow("trusted-user-1"),false);
 assert.equal(limiter.allow("trusted-user-2"),true);
 time=2000;assert.equal(limiter.allow("trusted-user-1"),true);
});
test("does not trust empty or malformed rate keys",()=>{
 const limiter=createDeliveryRateLimiter();
 for(const key of ["","  ",null,1,"x".repeat(257)])assert.throws(()=>limiter.allow(key),/Trusted rate key/);
});
test("rejects invalid rate configuration",()=>{
 assert.throws(()=>createDeliveryRateLimiter({maxRequests:0}),/Invalid rate limit/);
 assert.throws(()=>createDeliveryRateLimiter({windowMs:0}),/Invalid rate window/);
});
test("clock rewind starts fresh window without permanently locking clients",()=>{
 let time=5000;const limiter=createDeliveryRateLimiter({maxRequests:1,windowMs:1000,now:()=>time});
 assert.equal(limiter.allow("a"),true);assert.equal(limiter.allow("a"),false);
 time=4000;assert.equal(limiter.allow("a"),true);
});
