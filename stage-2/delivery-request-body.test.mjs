import test from "node:test";
import assert from "node:assert/strict";
import {Readable} from "node:stream";
import {readDeliveryJsonBody} from "./delivery-request-body.mjs";
const req=(body,headers={})=>Object.assign(Readable.from([Buffer.from(body)]),{headers:{"content-type":"application/json",...headers}});
const ticket="signed-ticket-123456";
test("accepts bounded JSON ticket and strips untrusted owner fields",async()=>{
 const body=await readDeliveryJsonBody(req(JSON.stringify({ticket,ownerId:"attacker",storageKey:"public"})));
 assert.deepEqual(body,{ticket});
 assert.equal(Object.isFrozen(body),true);
});
test("rejects oversized streaming body without content length",async()=>{
 await assert.rejects(readDeliveryJsonBody(req(JSON.stringify({ticket,padding:"x".repeat(5000)}))),/too large/);
});
test("rejects oversized declared content length before reading",async()=>{
 await assert.rejects(readDeliveryJsonBody(req(JSON.stringify({ticket}),{"content-length":"999999"})),/too large/);
});
test("rejects wrong content type",async()=>{
 await assert.rejects(readDeliveryJsonBody(req(JSON.stringify({ticket}),{"content-type":"text/plain"})),/content type/);
});
test("rejects malformed JSON, arrays and missing ticket",async()=>{
 await assert.rejects(readDeliveryJsonBody(req("{")),/Invalid JSON/);
 await assert.rejects(readDeliveryJsonBody(req("[]")),/object required/);
 await assert.rejects(readDeliveryJsonBody(req("{}")),/Invalid ticket/);
});
test("rejects invalid configured limit",async()=>{
 await assert.rejects(readDeliveryJsonBody(req(JSON.stringify({ticket})),{maxBytes:0}),/Invalid body limit/);
});
