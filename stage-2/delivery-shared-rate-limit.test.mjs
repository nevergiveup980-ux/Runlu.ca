import test from "node:test";
import assert from "node:assert/strict";
import {createSharedDeliveryRateLimiter} from "./delivery-shared-rate-limit.mjs";
import {createProductionDeliveryNodeHandler} from "./delivery-production.mjs";
const handleDelivery=async()=>({status:200,headers:{},body:{ok:true}});
const getTrustedRateKey=async()=>"trusted-user";
test("shared limiter propagates backend decisions and errors without granting access",async()=>{
 const limiter=createSharedDeliveryRateLimiter({consume:async key=>key==="allowed"});
 assert.equal(limiter.distributed,true);
 assert.equal(await limiter.allow("allowed"),true);
 assert.equal(await limiter.allow("denied"),false);
 await assert.rejects(createSharedDeliveryRateLimiter({consume:async()=>{throw Error("backend unavailable");}}).allow("owner"),/backend unavailable/);
 await assert.rejects(createSharedDeliveryRateLimiter({consume:async()=>1}).allow("owner"),/boolean/);
});
test("production refuses ordinary single-process limiter",()=>{
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter:{allow:()=>true},getTrustedRateKey}),/shared trusted rate limiter/);
});
test("production accepts explicit shared limiter adapter",()=>{
 const rateLimiter=createSharedDeliveryRateLimiter({consume:async()=>true});
 assert.equal(typeof createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter,getTrustedRateKey}),"function");
});
