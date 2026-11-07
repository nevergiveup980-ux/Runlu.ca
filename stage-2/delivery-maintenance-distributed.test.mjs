import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryMaintenanceDistributed} from "./delivery-maintenance-distributed.mjs";
function mockPool(query){
 const released=[];
 return {released,pool:{connect:async()=>({query,release:destroy=>released.push(Boolean(destroy))})}};
}
test("failed lock acquisition discards ambiguous connection",async()=>{
 const {pool,released}=mockPool(async()=>{throw Error("connection lost during acquire");});
 await assert.rejects(runDeliveryMaintenanceDistributed({pool}),/connection lost/);
 assert.deepEqual(released,[true]);
});
test("invalid lock result discards ambiguous connection",async()=>{
 const {pool,released}=mockPool(async()=>({rows:[{acquired:"yes"}]}));
 await assert.rejects(runDeliveryMaintenanceDistributed({pool}),/Invalid advisory lock result/);
 assert.deepEqual(released,[true]);
});
test("failed advisory unlock destroys session rather than pooling a held lock",async()=>{
 const {pool,released}=mockPool(async request=>{
  const sql=typeof request==="string"?request:request.text;
  if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
  if(sql.includes("pg_advisory_unlock"))throw Error("connection lost during unlock");
  return {rows:[]};
 });
 await assert.rejects(runDeliveryMaintenanceDistributed({pool,maxAttempts:1}),/connection lost during unlock/);
 assert.deepEqual(released,[true]);
});
test("unexpected unlock result destroys session",async()=>{
 const {pool,released}=mockPool(async request=>{
  const sql=typeof request==="string"?request:request.text;
  if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
  if(sql.includes("pg_advisory_unlock"))return {rows:[{released:false}]};
  return {rows:[]};
 });
 await assert.rejects(runDeliveryMaintenanceDistributed({pool,maxAttempts:1}),/Failed to release/);
 assert.deepEqual(released,[true]);
});
test("successful unlock returns clean session to pool",async()=>{
 const {pool,released}=mockPool(async request=>{
  const sql=typeof request==="string"?request:request.text;
  if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
  if(sql.includes("pg_advisory_unlock"))return {rows:[{released:true}]};
  return {rows:[]};
 });
 const result=await runDeliveryMaintenanceDistributed({pool,maxAttempts:1});
 assert.equal(result.ok,true);
 assert.deepEqual(released,[false]);
});
