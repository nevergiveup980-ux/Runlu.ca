import test from "node:test";
import assert from "node:assert/strict";
import {issueDeliveryTicket} from "./delivery-ticket.mjs";
import {authorizePrivateDownload} from "./private-download.mjs";
const secret="this-is-a-test-only-strong-signing-secret",sha256="a".repeat(64);
const job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now:100000,ttlSeconds:120});
const args=(changes={})=>({ticket,secret,requesterId:"owner-1",now:110000,revocations:{isRevoked:async()=>false},loadAssetAndJob:async()=>({asset,job}),...changes});
test("authorized download returns private backend key",async()=>{
 const result=await authorizePrivateDownload(args());
 assert.equal(result.storageKey,asset.storageKey);
});
test("revoked ticket cannot reach asset loader",async()=>{
 let loaded=false;
 await assert.rejects(authorizePrivateDownload(args({revocations:{isRevoked:async()=>true},loadAssetAndJob:async()=>{loaded=true;return {asset,job};}})),/revoked/);
 assert.equal(loaded,false);
});
test("another owner cannot use ticket",async()=>await assert.rejects(authorizePrivateDownload(args({requesterId:"owner-2"})),/not authorized/));
test("asset downgraded after ticket issuance is denied",async()=>await assert.rejects(authorizePrivateDownload(args({loadAssetAndJob:async()=>({asset:{...asset,state:"QUARANTINED"},job})})),/not ready/));
test("job changed after ticket issuance is denied",async()=>await assert.rejects(authorizePrivateDownload(args({loadAssetAndJob:async()=>({asset,job:{...job,status:"FAILED"}})})),/not ready/));
test("storage key swapped after ticket issuance is denied",async()=>await assert.rejects(authorizePrivateDownload(args({loadAssetAndJob:async()=>({asset:{...asset,storageKey:"stage/private/STAGE-100/"+"b".repeat(64)+".mp4",sha256:"b".repeat(64)},job})})),/scope no longer matches/));
test("database outage fails closed",async()=>await assert.rejects(authorizePrivateDownload(args({revocations:{isRevoked:async()=>{throw Error("database unavailable");}}})),/database unavailable/));
test("missing trusted asset loader denied",async()=>await assert.rejects(authorizePrivateDownload(args({loadAssetAndJob:null})),/loader required/));
