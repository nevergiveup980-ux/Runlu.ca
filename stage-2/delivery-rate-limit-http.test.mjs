import test from "node:test";
import assert from "node:assert/strict";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
import {createDeliveryRateLimiter} from "./delivery-rate-limit.mjs";
test("rate limiting occurs before body parsing and private service",async()=>{
 let calls=0;
 const handler=createDeliveryNodeHandler({handleDelivery:async()=>{calls++;return {status:200,headers:{},body:{ok:true}};},rateLimiter:createDeliveryRateLimiter({maxRequests:1}),getTrustedRateKey:async()=>"trusted-connection"});
 const responses=[];
 for(let i=0;i<2;i++){
  const req={method:"POST",url:"/stage/private/download",headers:{"content-type":"application/json"},async *[Symbol.asyncIterator](){yield Buffer.from('{"ticket":"valid-looking-ticket"}');}};
  const res={writeHead(status){this.status=status;},end(body){responses.push({status:this.status,body:JSON.parse(body)});}};
  await handler(req,res);
 }
 assert.equal(responses[0].status,400);
 assert.equal(responses[1].status,429);
 assert.equal(calls,0);
});
test("rejects rate limiter without trusted key resolver",()=>{
 assert.throws(()=>createDeliveryNodeHandler({handleDelivery:async()=>{},rateLimiter:createDeliveryRateLimiter()}),/Trusted rate limiter/);
});
