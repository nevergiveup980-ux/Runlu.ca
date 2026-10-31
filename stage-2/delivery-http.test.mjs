import test from "node:test";
import assert from "node:assert/strict";
import {Readable} from "node:stream";
import {createDeliveryHttpHandler} from "./delivery-http.mjs";
const request=(path,body={ticket:"signed-test-ticket"})=>({method:"POST",path,body,headers:{"x-client-owner-id":"attacker"}});
function setup({identity="owner-from-session",fail=false}={}){
 const calls=[],service={
  openDownload:async args=>{calls.push(["download",args]);if(fail)throw Error("sensitive storage key");return Readable.from([Buffer.from("video")]);},
  revokeDownload:async args=>{calls.push(["revoke",args]);if(fail)throw Error("database offline");return {revoked:true};}
 };
 return {calls,handle:createDeliveryHttpHandler({service,authenticate:async()=>identity})};
}
test("HTTP download uses only authenticated session identity",async()=>{
 const {handle,calls}=setup();
 const response=await handle(request("/stage/private/download"));
 assert.equal(response.status,200);assert.equal(response.headers["content-type"],"video/mp4");
 assert.equal(calls[0][1].sessionOwnerId,"owner-from-session");
 assert.equal("body" in response,false);
});
test("HTTP revoke uses authenticated session and no owner from JSON",async()=>{
 const {handle,calls}=setup();
 const response=await handle(request("/stage/private/revoke",{ticket:"signed-test-ticket",ownerId:"attacker"}));
 assert.deepEqual(response.body,{revoked:true});
 assert.equal(calls[0][1].sessionOwnerId,"owner-from-session");
});
test("missing login returns 401 without calling delivery service",async()=>{
 const {handle,calls}=setup({identity:null});
 assert.equal((await handle(request("/stage/private/download"))).status,401);
 assert.equal(calls.length,0);
});
test("invalid ticket rejected before service",async()=>{
 const {handle,calls}=setup();
 assert.equal((await handle(request("/stage/private/download",{ticket:"x"}))).status,400);
 assert.equal(calls.length,0);
});
test("wrong method and route rejected",async()=>{
 const {handle,calls}=setup();
 assert.equal((await handle({...request("/stage/private/download"),method:"GET"})).status,405);
 assert.equal((await handle(request("/other"))).status,404);
 assert.equal(calls.length,0);
});
test("storage and DB errors never reveal private internals",async()=>{
 const {handle}=setup({fail:true});
 const result=await handle(request("/stage/private/download"));
 assert.equal(result.status,403);
 assert.equal(JSON.stringify(result).includes("sensitive"),false);
 assert.equal((await handle(request("/stage/private/revoke"))).status,403);
});
test("invalid private stream fails closed",async()=>{
 const service={openDownload:async()=>({storageKey:"secret"}),revokeDownload:async()=>true};
 const handle=createDeliveryHttpHandler({service,authenticate:async()=>"owner"});
 assert.equal((await handle(request("/stage/private/download"))).status,403);
});
