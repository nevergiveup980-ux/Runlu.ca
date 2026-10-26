import test from "node:test";
import assert from "node:assert/strict";
import {EventEmitter} from "node:events";
import {runDeliveryMaintenanceDistributed} from "./delivery-maintenance-distributed.mjs";
test("connection loss during cleanup stops database operations and discards session",async()=>{
 const client=new EventEmitter();
 let calls=0,discarded;
 client.release=destroy=>{discarded=destroy;};
 client.query=async sql=>{
  if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
  if(sql.includes("pg_advisory_unlock"))throw Error("must not unlock dead session");
  calls++;
  client.emit("error",Error("socket closed"));
  return {rows:[]};
 };
 await assert.rejects(runDeliveryMaintenanceDistributed({pool:{connect:async()=>client},maxAttempts:2}),/connection lost/);
 assert.equal(calls,1,"must not retry queries on lost lock session");
 assert.equal(discarded,true);
});
