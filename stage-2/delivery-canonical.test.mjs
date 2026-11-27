import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import {issueDeliveryTicket,verifyDeliveryTicket} from "./delivery-ticket.mjs";
const secret="canonical-test-signing-secret-strong-123";
const sha256="a".repeat(64),job={id:"STAGE-100",ownerId:"owner-1",status:"COMPLETED"};
const asset={id:"asset_12345",jobId:job.id,ownerId:job.ownerId,state:"VERIFIED",sha256,storageKey:"stage/private/STAGE-100/"+sha256+".mp4"};
const now=100000;
const ticket=issueDeliveryTicket({asset,job,requesterId:"owner-1",secret,now,ttlSeconds:120});
const sign=body=>body+"."+createHmac("sha256",secret).update(body).digest("base64url");
test("canonical ticket payload and signature accepted",()=>{
 assert.equal(verifyDeliveryTicket({ticket,secret,requesterId:"owner-1",now}).assetId,asset.id);
});
test("alternate base64url payload representation rejected even with valid MAC",()=>{
 const [original]=ticket.split(".");
 // A one-byte JSON whitespace suffix changes encoded length to force unused
 // padding bits; replacing the last base64url character preserves decoded bytes.
 let bytes=Buffer.from(original,"base64url");
 while(bytes.length%3===0)bytes=Buffer.concat([bytes,Buffer.from(" ")]);
 const canonical=bytes.toString("base64url");
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
 const last=canonical.at(-1),idx=alphabet.indexOf(last);
 const mask=bytes.length%3===1?15:3;
 const alternate=canonical.slice(0,-1)+alphabet[(idx&~mask)|((idx+1)&mask)];
 assert.notEqual(alternate,canonical);
 assert.deepEqual(Buffer.from(alternate,"base64url"),Buffer.from(canonical,"base64url"));
 assert.throws(()=>verifyDeliveryTicket({ticket:sign(alternate),secret,requesterId:"owner-1",now}),/Invalid ticket payload/);
});
