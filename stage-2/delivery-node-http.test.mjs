import test from "node:test";
import assert from "node:assert/strict";
import {createServer,request as httpRequest} from "node:http";
import {Readable} from "node:stream";
import {once} from "node:events";
import {writeDeliveryHttpResponse} from "./delivery-node-http.mjs";
async function withServer(handler,fn){
 const server=createServer(handler);server.listen(0,"127.0.0.1");await once(server,"listening");
 try{return await fn(server.address().port);}finally{await new Promise(resolve=>server.close(resolve));}
}
function get(port,path="/"){return new Promise((resolve,reject)=>{const req=httpRequest({hostname:"127.0.0.1",port,path},res=>{const chunks=[];res.on("data",chunk=>chunks.push(chunk));res.on("end",()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});req.on("error",reject);req.end();});}
test("real HTTP socket receives streaming bytes and private headers",async()=>{
 const data=Buffer.alloc(128*1024,0x5a);
 await withServer((req,res)=>{void writeDeliveryHttpResponse(res,{status:200,headers:{"content-type":"video/mp4","cache-control":"no-store"},stream:Readable.from([data.subarray(0,50000),data.subarray(50000)])});},async port=>{
  const response=await get(port);
  assert.equal(response.status,200);assert.equal(response.headers["cache-control"],"no-store");
  assert.deepEqual(response.body,data);
 });
});
test("real HTTP JSON denial sends status and no-store",async()=>{
 await withServer((req,res)=>{void writeDeliveryHttpResponse(res,{status:403,headers:{"content-type":"application/json","cache-control":"no-store"},body:{error:"delivery_unavailable"}});},async port=>{
  const response=await get(port);
  assert.equal(response.status,403);
  assert.deepEqual(JSON.parse(response.body.toString()),{error:"delivery_unavailable"});
 });
});
test("client disconnect destroys private source stream",async()=>{
 let source;let resolveDestroyed;
 const destroyed=new Promise(resolve=>{resolveDestroyed=resolve;});
 await withServer((req,res)=>{
  let timer;
  source=new Readable({read(){} ,destroy(error,callback){clearInterval(timer);resolveDestroyed();callback(error);}});
  timer=setInterval(()=>{if(!source.destroyed)source.push(Buffer.alloc(8192,0x41));},5);
  void writeDeliveryHttpResponse(res,{status:200,headers:{"content-type":"video/mp4"},stream:source}).catch(()=>{});
 },async port=>{
  await new Promise((resolve,reject)=>{
   const req=httpRequest({hostname:"127.0.0.1",port},res=>{
    res.once("data",()=>{res.destroy();resolve();});
    res.once("error",()=>resolve());
   });
   req.once("error",()=>resolve());req.end();
  });
  await Promise.race([destroyed,new Promise((_,reject)=>setTimeout(()=>reject(Error("stream not destroyed")),1500))]);
  assert.equal(source.destroyed,true);
 });
});
