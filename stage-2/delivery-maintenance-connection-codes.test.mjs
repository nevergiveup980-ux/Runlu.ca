import test from "node:test";
import assert from "node:assert/strict";
import {runDeliveryMaintenanceDistributed} from "./delivery-maintenance-distributed.mjs";
for(const code of ["08006","08003","ECONNRESET","EPIPE","ETIMEDOUT"]){
 test("maintenance never retries a lost advisory-lock session: "+code,async()=>{
  let queries=0,discarded;
  const client={
   async query(q){
    const sql=typeof q==="string"?q:q.text;
    if(sql.includes("pg_try_advisory_lock"))return {rows:[{acquired:true}]};
    if(sql.includes("pg_advisory_unlock"))throw Error("must not unlock lost session");
    queries++;
    const error=Error("connection failure");error.code=code;throw error;
   },
   release(destroy){discarded=destroy;}
  };
  await assert.rejects(runDeliveryMaintenanceDistributed({pool:{connect:async()=>client},maxAttempts:3}),/connection failure/);
  assert.equal(queries,1,"must stop retries after connection loss");
  assert.equal(discarded,true,"must discard session that may no longer own lock");
 });
}
