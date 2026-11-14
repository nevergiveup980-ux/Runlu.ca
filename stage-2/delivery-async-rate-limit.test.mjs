import test from "node:test";
import assert from "node:assert/strict";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
function request(){
 return {method:"POST",url:"/stage/private/download",headers:{"content-type":"application/json"},async *[Symbol.asyncIterator](){yield Buffer.from("{}");}};
}
function response(){
 return {status:0,body:null,writeHead(status){this.status=status;},end(body){this.body=JSON.parse(body);}};
}
test("async shared limiter denial blocks delivery before body parsing",async()=>{
 let called=0;
 const handler=createDeliveryNodeHandler({
  handleDelivery:async()=>{called++;return {status:200,headers:{},body:{ok:true}};},
  rateLimiter:{distributed:true,allow:async()=>false},
  getTrustedRateKey:async()=>"trusted-owner"
 });
 const res=response();
 await handler(request(),res);
 assert.equal(res.status,429);
 assert.deepEqual(res.body,{error:"rate_limited"});
 assert.equal(called,0);
});
test("async shared limiter backend error never permits delivery",async()=>{
 let called=0;
 const handler=createDeliveryNodeHandler({
  handleDelivery:async()=>{called++;return {status:200,headers:{},body:{ok:true}};},
  rateLimiter:{distributed:true,allow:async()=>{throw Error("database offline");}},
  getTrustedRateKey:async()=>"trusted-owner"
 });
 const res=response();
 await handler(request(),res);
 assert.notEqual(res.status,200);
 assert.equal(called,0);
});
