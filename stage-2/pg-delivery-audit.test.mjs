import test from "node:test";
import assert from "node:assert/strict";
import {PgDeliveryAudit} from "./pg-delivery-audit.mjs";
const event={event:"STAGE_DELIVERY_AUTHORIZED",assetId:"asset_12345",ownerId:"owner-1",occurredAt:"2026-10-22T00:00:00.000Z"};
test("SQL audit adapter persists only safe event fields",async()=>{
 const calls=[],pool={query:async(sql,params)=>{calls.push({sql,params});return {rows:[{id:"1"}]};}};
 assert.equal(await new PgDeliveryAudit(pool).record(event),true);
 assert.deepEqual(calls[0].params,[event.event,event.assetId,event.ownerId,event.occurredAt]);
 assert.match(calls[0].sql,/INSERT INTO stage_delivery_audit/);
});
test("audit insert without RETURNING confirmation fails closed",async()=>{
 const pool={query:async()=>({rows:[]})};
 assert.equal(await new PgDeliveryAudit(pool).record(event),false);
});
test("audit database outage propagates",async()=>{
 const pool={query:async()=>{throw Error("audit database unavailable");}};
 await assert.rejects(new PgDeliveryAudit(pool).record(event),/database unavailable/);
});
test("invalid event cannot reach database",async()=>{
 let touched=false;const pool={query:async()=>{touched=true;return {rows:[]};}};
 await assert.rejects(new PgDeliveryAudit(pool).record({...event,event:"DOWNLOAD"}),/Invalid delivery audit/);
 assert.equal(touched,false);
});
test("invalid audit timestamp rejected",async()=>{
 const pool={query:async()=>({rows:[]})};
 await assert.rejects(new PgDeliveryAudit(pool).record({...event,occurredAt:"not a date"}),/timestamp/);
});
