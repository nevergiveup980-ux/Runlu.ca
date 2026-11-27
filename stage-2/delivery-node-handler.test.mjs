import test from "node:test";
import assert from "node:assert/strict";
import {createServer,request as httpRequest} from "node:http";
import {once} from "node:events";
import {Readable} from "node:stream";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
import {createDeliveryHttpHandler} from "./delivery-http.mjs";
async function serve(handler,fn){
 const server=createServer((req,res)=>{void handler(req,res).catch(()=>res.destroy());});
 server.listen(0,"127.0.0.1");await once(server,"listening");
 try{await fn(server.address().port);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
function post(port,path,payload,headers={}){
 return new Promise((resolve,reject)=>{
  const req=httpRequest({hostname:"127.0.0.1",port,path,method:"POST",headers:{"content-type":"application/json",...headers}},res=>{
   const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>resolve({status:res.statusCode,body:Buffer.concat(chunks)}));res.on("error",reject);
  });req.on("error",reject);req.end(payload);
 });
}
const ticket="synthetic-ticket-1234567890";
test("Node HTTP integration sends bounded ticket to authenticated service",async()=>{
 const calls=[];
 const service={openDownload:async args=>{calls.push(args);return Readable.from([Buffer.from("private-bytes")]);},revokeDownload:async()=>({revoked:true})};
 const handleDelivery=createDeliveryHttpHandler({service,authenticate:async()=>"trusted-owner"});
 await serve(createDeliveryNodeHandler({handleDelivery}),async port=>{
  const response=await post(port,"/stage/private/download",JSON.stringify({ticket,ownerId:"attacker",storageKey:"fake"}));
  assert.equal(response.status,200);assert.equal(response.body.toString(),"private-bytes");
  assert.equal(calls[0].sessionOwnerId,"trusted-owner");
  assert.equal(calls[0].ticket,ticket);
 });
});
test("oversized body denied before authentication and storage",async()=>{
 let calls=0;
 const handleDelivery=async()=>{calls++;throw Error("should not run");};
 await serve(createDeliveryNodeHandler({handleDelivery,maxBodyBytes:256}),async port=>{
  const response=await post(port,"/stage/private/download",JSON.stringify({ticket,padding:"x".repeat(2000)}));
  assert.equal(response.status,400);assert.equal(calls,0);
 });
});
test("malformed JSON and wrong route denied without service call",async()=>{
 let calls=0;const handleDelivery=async()=>{calls++;throw Error("should not run");};
 await serve(createDeliveryNodeHandler({handleDelivery}),async port=>{
  assert.equal((await post(port,"/stage/private/download","{bad")).status,400);
  assert.equal((await post(port,"/unknown",JSON.stringify({ticket}))).status,404);
  assert.equal(calls,0);
 });
});
