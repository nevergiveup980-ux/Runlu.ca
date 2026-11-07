import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {authorizeAuditedDownload} from "./download-audit.mjs";
const secret="test-only-audit-secret-at-least-32-bytes",sha256="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now:100000,ttlSeconds:120});
const base=()=>({ticket,secret,requesterId:"owner-1",now:110000,revocations:{isRevoked:async()=>false},loadAssetAndJob:async()=>({asset,job})});
test("confirmed audit is recorded before granting private key",async()=>{
 const events=[];
 const grant=await authorizeAuditedDownload({...base(),audit:{record:async event=>{events.push(event);return true;}}});
 assert.equal(grant.storageKey,asset.storageKey);
 assert.deepEqual(events.map(e=>e.event),["STAGE_DELIVERY_AUTHORIZED"]);
 assert.equal(events[0].ownerId,"owner-1");
 assert.equal(events[0].assetId,asset.id);
 assert.ok(!JSON.stringify(events).includes(ticket),"audit must not log bearer ticket");
});
test("missing audit sink denies download",async()=>await assert.rejects(authorizeAuditedDownload(base()),/audit sink required/));
test("audit write failure denies download",async()=>await assert.rejects(authorizeAuditedDownload({...base(),audit:{record:async()=>{throw Error("audit database offline");}}}),/audit database offline/));
test("unconfirmed audit denies download",async()=>await assert.rejects(authorizeAuditedDownload({...base(),audit:{record:async()=>undefined}}),/not confirmed/));
test("unauthorized owner never produces authorized audit event",async()=>{
 const events=[];
 await assert.rejects(authorizeAuditedDownload({...base(),requesterId:"owner-2",audit:{record:async event=>{events.push(event);return true;}}}),/not authorized/);
 assert.equal(events.length,0);
});
