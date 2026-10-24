import test from "node:test";
import assert from "node:assert/strict";
import {createProductionDeliveryNodeHandler} from "./delivery-production.mjs";
const handleDelivery=async()=>({status:200,headers:{},body:{ok:true}});
test("production fails closed without mandatory trusted rate limiter",()=>{
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca"}),/Production trusted rate limiter required/);
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter:{allow:()=>true}}),/Production trusted rate limiter required/);
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",getTrustedRateKey:async()=>"trusted"}),/Production trusted rate limiter required/);
});
test("production accepts trusted limiter and key resolver",()=>{
 assert.equal(typeof createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter:{allow:()=>true},getTrustedRateKey:async()=>"trusted"}),"function");
});
