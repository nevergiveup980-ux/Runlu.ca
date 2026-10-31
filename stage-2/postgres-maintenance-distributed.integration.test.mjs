import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {runDeliveryMaintenanceDistributed} from "./delivery-maintenance-distributed.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL advisory lock skips overlapping maintenance across connections",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:4});
 try{
  await pool.query(await readFile(new URL("./005_delivery_rate_limits.sql",import.meta.url),"utf8"));
  let release,started;
  const gate=new Promise(resolve=>release=resolve);
  const entered=new Promise(resolve=>started=resolve);
  const first=runDeliveryMaintenanceDistributed({pool,maxAttempts:1,logger:async()=>{},batchSize:1});
  // Hold a separate session's advisory lock explicitly to test contention
  // without relying on cleanup timing.
  await first;
  const holder=await pool.connect();
  try{
   await holder.query("SELECT pg_advisory_lock($1,$2)",[0x53544732,0x52415445]);
   const second=await runDeliveryMaintenanceDistributed({pool,maxAttempts:1});
   assert.deepEqual(second,{ok:false,skipped:true,reason:"already_running_elsewhere"});
  }finally{
   await holder.query("SELECT pg_advisory_unlock($1,$2)",[0x53544732,0x52415445]);
   holder.release();
  }
  const after=await runDeliveryMaintenanceDistributed({pool,maxAttempts:1});
  assert.equal(after.ok,true);
 }finally{await pool.end();}
});
