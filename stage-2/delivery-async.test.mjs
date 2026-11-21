import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {verifyRevocableDeliveryTicket,verifyRevocableDeliveryTicketAsync} from "./delivery-revocation.mjs";
const secret="this-is-a-test-only-strong-signing-secret",sha256="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now:100000,ttlSeconds:120});
const args=revocations=>({ticket,secret,requesterId:"owner-1",now:110000,revocations});
test("async SQL revocation check allows explicitly false result",async()=>{
 assert.equal((await verifyRevocableDeliveryTicketAsync(args({isRevoked:async()=>false}))).assetId,asset.id);
});
test("async SQL revocation check rejects revoked result",async()=>{
 await assert.rejects(verifyRevocableDeliveryTicketAsync(args({isRevoked:async()=>true})),/revoked/);
});
test("async SQL revocation check rejects database outage",async()=>{
 await assert.rejects(verifyRevocableDeliveryTicketAsync(args({isRevoked:async()=>{throw Error("database offline");}})),/database offline/);
});
test("sync verifier cannot accidentally accept an async adapter",()=>{
 assert.throws(()=>verifyRevocableDeliveryTicket(args({isRevoked:async()=>false})),/Async revocation store/);
});
test("undefined status is denied by async verifier",async()=>{
 await assert.rejects(verifyRevocableDeliveryTicketAsync(args({isRevoked:async()=>undefined})),/status unknown/);
});
test("undefined status is denied by sync verifier",()=>{
 assert.throws(()=>verifyRevocableDeliveryTicket(args({isRevoked:()=>undefined})),/status unknown/);
});
