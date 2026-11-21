import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {InMemoryDeliveryRevocations,verifyRevocableDeliveryTicket,ticketFingerprint} from "./delivery-revocation.mjs";
const secret="this-is-a-test-only-strong-signing-secret",sha256="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now:100000,ttlSeconds:120});
const check=(revocations,now=110000)=>verifyRevocableDeliveryTicket({ticket,secret,requesterId:"owner-1",now,revocations});
test("valid ticket works when revocation store is available",()=>assert.equal(check(new InMemoryDeliveryRevocations()).assetId,asset.id));
test("revoked ticket is immediately rejected",()=>{
 const store=new InMemoryDeliveryRevocations();
 store.revoke(ticket,{untilMs:220000,now:105000});
 assert.throws(()=>check(store),/revoked/);
});
test("missing revocation store fails closed",()=>assert.throws(()=>check(null),/Revocation store required/));
test("fingerprint never exposes ticket contents",()=>assert.match(ticketFingerprint(ticket),/^[a-f0-9]{64}$/));
test("invalid revocation expiry rejected",()=>assert.throws(()=>new InMemoryDeliveryRevocations().revoke(ticket,{untilMs:100000,now:100000}),/expiry/));
test("expired ticket cannot be revived by revocation expiry",()=>{
 const store=new InMemoryDeliveryRevocations();
 store.revoke(ticket,{untilMs:120000,now:105000});
 assert.throws(()=>check(store,230000),/expired/);
});
