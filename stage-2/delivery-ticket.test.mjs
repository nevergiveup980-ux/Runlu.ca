import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket,verifyDeliveryTicket} from "./delivery-ticket.mjs";
const secret="a-strong-test-secret-that-is-long-enough-1234",sha256="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const issue=(overrides={})=>issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now:100000,ttlSeconds:120,...overrides});
test("valid ticket verifies for authenticated owner",()=>{
 const ticket=issue();
 assert.equal(verifyDeliveryTicket({ticket,secret,requesterId:"owner-1",now:110000}).assetId,asset.id);
});
test("ticket cannot be used by another owner",()=>assert.throws(()=>verifyDeliveryTicket({ticket:issue(),secret,requesterId:"owner-2",now:110000}),/not authorized/));
test("expired ticket rejected",()=>assert.throws(()=>verifyDeliveryTicket({ticket:issue(),secret,requesterId:"owner-1",now:220000}),/expired/));
test("tampered ticket rejected",()=>{
 const ticket=issue(),[body,sig]=ticket.split(".");
 assert.throws(()=>verifyDeliveryTicket({ticket:body+"."+sig.slice(0,-1)+"A",secret,requesterId:"owner-1",now:110000}),/signature|Invalid ticket/);
});
test("wrong signing secret rejected",()=>assert.throws(()=>verifyDeliveryTicket({ticket:issue(),secret:"another-strong-secret-that-is-long-enough",requesterId:"owner-1",now:110000}),/signature/));
test("unverified asset cannot issue ticket",()=>assert.throws(()=>issue({asset:{...asset,state:"INGESTING"}}),/not ready/));
test("TTL above five minutes rejected",()=>assert.throws(()=>issue({ttlSeconds:301}),/TTL/));
test("weak signing secret rejected",()=>assert.throws(()=>issue({secret:"weak"}),/Strong signing secret/));
