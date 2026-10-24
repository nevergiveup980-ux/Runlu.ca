import test from "node:test";
import assert from "node:assert/strict";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
import {createProductionDeliveryNodeHandler} from "./delivery-production.mjs";
const handleDelivery=async()=>({status:200,headers:{},body:{ok:true}});
const rateLimiter={allow:()=>true};
const getTrustedRateKey=async()=>"trusted-session";
test("Node delivery boundary rejects invalid timeout configuration",()=>{
 for(const bodyTimeoutMs of [0,-1,30001,1.5,"5000",null]){
  assert.throws(()=>createDeliveryNodeHandler({handleDelivery,bodyTimeoutMs}),/Invalid body timeout/);
 }
});
test("production boundary forwards and validates timeout configuration",()=>{
 assert.throws(()=>createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter,getTrustedRateKey,bodyTimeoutMs:0}),/Invalid body timeout/);
 assert.equal(typeof createProductionDeliveryNodeHandler({handleDelivery,allowedOrigin:"https://runlu.ca",rateLimiter,getTrustedRateKey,bodyTimeoutMs:50}),"function");
});
