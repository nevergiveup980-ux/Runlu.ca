import test from "node:test";
import assert from "node:assert/strict";
import {createServer,request as httpRequest} from "node:http";
import {once} from "node:events";
import {createDeliveryNodeHandler} from "./delivery-node-handler.mjs";
test("live HTTP stalled upload is stopped before delivery service runs",async()=>{
 let calls=0;
 const handler=createDeliveryNodeHandler({handleDelivery:async()=>{calls++;return {status:200,headers:{},body:{ok:true}};}});
 const server=createServer((req,res)=>{void handler(req,res).catch(()=>{if(!res.destroyed)res.destroy();});});
 server.listen(0,"127.0.0.1");await once(server,"listening");
 try{
  const outcome=await Promise.race([
   new Promise((resolve,reject)=>{
    const req=httpRequest({hostname:"127.0.0.1",port:server.address().port,path:"/stage/private/download",method:"POST",headers:{"content-type":"application/json","transfer-encoding":"chunked"}},res=>{
     res.resume();res.on("end",()=>resolve("response"));res.on("error",()=>resolve("closed"));
    });
    req.on("error",()=>resolve("closed"));
    req.write('{"ticket":"partial');
   }),
   new Promise((_,reject)=>setTimeout(()=>reject(Error("stalled upload never closed")),7000))
  ]);
  assert.ok(["closed","response"].includes(outcome));
  assert.equal(calls,0);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
