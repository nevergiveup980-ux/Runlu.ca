import test from "node:test";
import assert from "node:assert/strict";
import {createServer,request as httpRequest} from "node:http";
import {once} from "node:events";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
test("cross-origin request rejected before private handler invocation",async()=>{
 let calls=0;
 const handler=createDeliveryNodeHandler({allowedOrigin:"https://runlu.ca",handleDelivery:async()=>{calls++;return {status:200,headers:{},body:{ok:true}};}});
 const server=createServer((req,res)=>{void handler(req,res);});
 server.listen(0,"127.0.0.1");await once(server,"listening");
 async function post(origin){
  return new Promise((resolve,reject)=>{
   const req=httpRequest({hostname:"127.0.0.1",port:server.address().port,path:"/stage/private/revoke",method:"POST",headers:{"content-type":"application/json","origin":origin}},res=>{
    const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>resolve({status:res.statusCode,body:Buffer.concat(chunks).toString()}));
   });req.on("error",reject);req.end(JSON.stringify({ticket:"signed-ticket-1234567890"}));
  });
 }
 try{
  const denied=await post("https://attacker.example");
  assert.equal(denied.status,403);assert.equal(calls,0);
  const allowed=await post("https://runlu.ca");
  assert.equal(allowed.status,200);assert.equal(calls,1);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
