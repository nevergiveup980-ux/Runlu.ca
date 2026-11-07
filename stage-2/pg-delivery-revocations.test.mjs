import test from "node:test";
import assert from "node:assert/strict";
import {PgDeliveryRevocations} from "./pg-delivery-revocations.mjs";
import {ticketFingerprint} from "./delivery-revocation.mjs";
const ticket="example.ticket";
test("PostgreSQL revocation insert uses fingerprint, not bearer token",async()=>{
 const calls=[],pool={query:async(sql,params)=>{calls.push({sql,params});return {rows:[]};}};
 const store=new PgDeliveryRevocations(pool);
 await store.revoke(ticket,{ownerId:"owner-1",assetId:"asset_12345",untilMs:200000,now:100000});
 assert.equal(calls[0].params[0],ticketFingerprint(ticket));
 assert.ok(!calls[0].params.includes(ticket));
 assert.match(calls[0].sql,/ON CONFLICT/);
});
test("PostgreSQL revocation lookup detects active fingerprint",async()=>{
 const pool={query:async(sql,params)=>({rows:[{exists:1}]})};
 assert.equal(await new PgDeliveryRevocations(pool).isRevoked(ticket,{now:100000}),true);
});
test("PostgreSQL revocation lookup treats no rows as not revoked",async()=>{
 const pool={query:async()=>({rows:[]})};
 assert.equal(await new PgDeliveryRevocations(pool).isRevoked(ticket,{now:100000}),false);
});
test("PostgreSQL failure propagates rather than authorizing",async()=>{
 const pool={query:async()=>{throw Error("DB unavailable");}};
 await assert.rejects(new PgDeliveryRevocations(pool).isRevoked(ticket,{now:100000}),/DB unavailable/);
});
test("PostgreSQL adapter rejects invalid revocation expiry",async()=>{
 const store=new PgDeliveryRevocations({query:async()=>({rows:[]})});
 await assert.rejects(store.revoke(ticket,{ownerId:"owner-1",assetId:"asset_12345",untilMs:100000,now:100000}),/expiry/);
});
