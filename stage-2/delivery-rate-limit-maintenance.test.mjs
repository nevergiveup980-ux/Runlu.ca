import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryRateLimitMaintenance} from "./delivery-rate-limit-maintenance.mjs";
test("maintenance reports bounded deletion metrics without rate keys",async()=>{
 const events=[];
 const pool={query:async()=>({rows:[{rate_key:"secret-1"},{rate_key:"secret-2"}]})};
 const result=await runDeliveryRateLimitMaintenance({pool,now:10000,windowMs:1000,batchSize:2,logger:event=>events.push(event)});
 assert.equal(result.deleted,2);
 assert.equal(result.moreMayRemain,true);
 assert.equal(events.length,1);
 assert.equal(events[0].event,"stage_delivery_rate_limit_cleanup");
 assert.equal(JSON.stringify(events).includes("secret-"),false);
});
test("maintenance propagates backend failures without exposing sensitive identifiers",async()=>{
 const events=[];
 await assert.rejects(runDeliveryRateLimitMaintenance({pool:{query:async()=>{throw Error("database offline");}},logger:event=>events.push(event)}),/database offline/);
 assert.equal(events[0].ok,false);
 assert.equal(events[0].deleted,0);
});
test("maintenance rejects invalid logger",async()=>{
 await assert.rejects(runDeliveryRateLimitMaintenance({pool:{query:async()=>({rows:[]})},logger:"console"}),/logger/);
});
