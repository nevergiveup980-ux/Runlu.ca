import test from "node:test";
import assert from "node:assert/strict";
import {createServer,request as httpRequest} from "node:http";
import {Readable} from "node:stream";
import {once} from "node:events";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {InMemoryDeliveryRevocations} from "./delivery-revocation.mjs";
import {createPrivateDeliveryService} from "./private-delivery-service.mjs";
import {createDeliveryHttpHandler} from "./delivery-http.mjs";
import {writeDeliveryHttpResponse} from "./delivery-node-http.mjs";
const secret="stage-real-http-e2e-test-secret-123456";
const now=100000,hash="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256:hash,storageKey:"stage/private/STAGE-100/"+hash+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now,ttlSeconds:120});
test("real HTTP: authorized bytes, revocation, subsequent denial",async()=>{
 const events=[],revocations=new InMemoryDeliveryRevocations();
 const service=createPrivateDeliveryService({secret,revocations,audit:{record:async event=>{events.push(event);return true;}},loadAssetAndJob:async()=>({asset,job}),openPrivateObject:async()=>Readable.from([Buffer.from("synthetic-video-bytes")])});
 const handler=createDeliveryHttpHandler({service,authenticate:async request=>request.headers["x-test-session"]==="owner"?"owner-1":null});
 const server=createServer(async(req,res)=>{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{body={};}
  const descriptor=await handler({method:req.method,path:req.url,body,headers:req.headers});
  await writeDeliveryHttpResponse(res,descriptor);
 });
 server.listen(0,"127.0.0.1");await once(server,"listening");
 async function post(path,session="owner"){
  return new Promise((resolve,reject)=>{
   const req=httpRequest({hostname:"127.0.0.1",port:server.address().port,path,method:"POST",headers:{"content-type":"application/json","x-test-session":session}},res=>{
    const chunks=[];res.on("data",c=>chunks.push(c));res.on("end",()=>resolve({status:res.statusCode,body:Buffer.concat(chunks)}));res.on("error",reject);
   });
   req.on("error",reject);req.end(JSON.stringify({ticket,ownerId:"attacker"}));
  });
 }
 try{
  const unauthorized=await post("/stage/private/download","no-session");
  assert.equal(unauthorized.status,401);
  const downloaded=await post("/stage/private/download");
  assert.equal(downloaded.status,200);
  assert.equal(downloaded.body.toString(),"synthetic-video-bytes");
  assert.equal(events.length,1);
  const revoked=await post("/stage/private/revoke");
  assert.equal(revoked.status,200);
  const denied=await post("/stage/private/download");
  assert.equal(denied.status,403);
  assert.equal(events.length,1);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
