import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryMaintenanceDistributed} from "./delivery-maintenance-distributed.mjs";
test("maintenance query timeout fails closed and discards locked connection",async()=>{
 let released,cleanupCalls=0,unlockCalls=0;
 const client={
  query:async request=>{
   const sql=typeof request==="string"?request:request.text;
   if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
   if(sql.includes("pg_advisory_unlock")){unlockCalls++;return {rows:[{released:true}]};}
   cleanupCalls++;
   assert.equal(request.query_timeout,150);
   const error=Error("Query read timeout");error.code="57014";throw error;
  },
  release:destroy=>released=destroy
 };
 await assert.rejects(runDeliveryMaintenanceDistributed({pool:{connect:async()=>client},maxAttempts:3,queryTimeoutMs:150}),/Query read timeout/);
 assert.equal(cleanupCalls,1);
 assert.equal(unlockCalls,0);
 assert.equal(released,true);
});
test("maintenance validates bounded query timeout",async()=>{
 for(const queryTimeoutMs of [0,99,30001,1.5,"5000"]){
  await assert.rejects(runDeliveryMaintenanceDistributed({queryTimeoutMs}),/Invalid maintenance query timeout/);
 }
});
