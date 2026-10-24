import test from "node:test";
import assert from "node:assert/strict";
import {Readable} from "node:stream";
import {readDeliveryJsonBody} from "./delivery-request-body.mjs";
test("stalled private delivery request is interrupted by absolute deadline",async()=>{
 const stalled=new Readable({read(){}});
 stalled.headers={"content-type":"application/json"};
 const started=Date.now();
 await assert.rejects(readDeliveryJsonBody(stalled,{timeoutMs:40}),/timeout/);
 assert.equal(stalled.destroyed,true);
 assert.ok(Date.now()-started<2000);
});
test("rejects invalid request-body timeout configuration",async()=>{
 const req=Readable.from([Buffer.from("{}")]);req.headers={"content-type":"application/json"};
 await assert.rejects(readDeliveryJsonBody(req,{timeoutMs:0}),/Invalid body timeout/);
});
