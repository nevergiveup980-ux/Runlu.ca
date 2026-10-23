import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {InMemoryDeliveryRevocations} from "./delivery-revocation.mjs";
import {createPrivateDeliveryService} from "./private-delivery-service.mjs";
const secret="private-service-test-secret-long-enough-123";
const now=100000,sha256="a".repeat(64),job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now});
function setup({audit,openPrivateObject,loadAssetAndJob}={}){
 const events=[],opens=[],revocations=new InMemoryDeliveryRevocations();
 const service=createPrivateDeliveryService({secret,revocations,audit??{record:async e=>{events.push(e);return true;}},loadAssetAndJob:loadAssetAndJob??(async()=>({asset,job})),openPrivateObject:openPrivateObject??(async scope=>{opens.push(scope);return {kind:"private-stream-handle"};})});
 return {service,events,opens,revocations};
}
test("authenticated download is audited before private storage opens",async()=>{
 const {service,events,opens}=setup();
 assert.deepEqual(await service.openDownload({ticket,sessionOwnerId:"owner-1",now:now+1000}),{kind:"private-stream-handle"});
 assert.equal(events.length,1);assert.equal(opens.length,1);
 assert.equal(opens[0].storageKey,asset.storageKey);
});
test("unauthenticated session never opens private storage",async()=>{
 const {service,opens,events}=setup();
 await assert.rejects(service.openDownload({ticket,sessionOwnerId:"",now}),/Authenticated session/);
 assert.equal(opens.length,0);assert.equal(events.length,0);
});
test("wrong owner cannot download or create success audit",async()=>{
 const {service,opens,events}=setup();
 await assert.rejects(service.openDownload({ticket,sessionOwnerId:"other-owner",now}),/not authorized/);
 assert.equal(opens.length,0);assert.equal(events.length,0);
});
test("audit outage prevents private storage access",async()=>{
 let opened=false;
 const {service}=setup({audit:{record:async()=>{throw Error("audit down");}},openPrivateObject:async()=>{opened=true;}});
 await assert.rejects(service.openDownload({ticket,sessionOwnerId:"owner-1",now}),/audit down/);
 assert.equal(opened,false);
});
test("revoked ticket cannot open private storage",async()=>{
 const {service,opens,events}=setup();
 assert.deepEqual(await service.revokeDownload({ticket,sessionOwnerId:"owner-1",now:now+1000}),{revoked:true,assetId:asset.id});
 await assert.rejects(service.openDownload({ticket,sessionOwnerId:"owner-1",now:now+1000}),/revoked/);
 assert.equal(opens.length,0);assert.equal(events.length,0);
});
test("revocation denied to another owner",async()=>{
 const {service}=setup();
 await assert.rejects(service.revokeDownload({ticket,sessionOwnerId:"other-owner",now}),/not authorized/);
});
test("missing trusted adapters rejected at startup",()=>{
 assert.throws(()=>createPrivateDeliveryService({secret}),/Durable revocations/);
});
