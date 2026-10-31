import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {revokeAuthenticatedDeliveryTicket} from "./revoke-delivery.mjs";
const secret="test-only-authenticated-revocation-secret-32";
const sha256="a".repeat(64),job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const now=100000,ticket=issueDeliveryTicket({asset,job,requesterId:job.ownerId,secret,now,ttlSeconds:120});
test("revocation derives owner asset and expiry from signed ticket",async()=>{
 const calls=[],revocations={revoke:async(t,metadata)=>calls.push({t,metadata})};
 const result=await revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:"owner-1",now:now+1000,revocations});
 assert.deepEqual(result,{revoked:true,assetId:asset.id});
 assert.equal(calls[0].t,ticket);
 assert.deepEqual(calls[0].metadata,{ownerId:job.ownerId,assetId:asset.id,untilMs:now+120000,now:now+1000});
});
test("other user cannot revoke",async()=>{
 let called=false;
 await assert.rejects(revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:"owner-2",now,revocations:{revoke:async()=>{called=true;}}}),/not authorized/);
 assert.equal(called,false);
});
test("tampered ticket cannot revoke",async()=>{
 const [body,sig]=ticket.split(".");
 const bad=body+"."+(sig[0]==="A"?"B":"A")+sig.slice(1);
 await assert.rejects(revokeAuthenticatedDeliveryTicket({ticket:bad,secret,requesterId:"owner-1",now,revocations:{revoke:async()=>{throw Error("must not reach");}}}),/signature/);
});
test("expired ticket cannot revoke",async()=>{
 await assert.rejects(revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:"owner-1",now:now+120000,revocations:{revoke:async()=>true}}),/expired/);
});
test("missing durable revocation store denies",async()=>{
 await assert.rejects(revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:"owner-1",now}),/store required/);
});
test("revocation database outage fails closed",async()=>{
 await assert.rejects(revokeAuthenticatedDeliveryTicket({ticket,secret,requesterId:"owner-1",now,revocations:{revoke:async()=>{throw Error("database offline");}}}),/database offline/);
});
