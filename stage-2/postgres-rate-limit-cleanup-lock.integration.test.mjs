import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {prunePgDeliveryRateLimits} from "./pg-delivery-rate-limit-cleanup.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL cleanup skips locked counters being updated by another connection",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:3});
 const key="locked-cleanup-"+randomUUID();
 const client=await pool.connect();
 try{
  await pool.query(await readFile(new URL("./005_delivery_rate_limits.sql",import.meta.url),"utf8"));
  await pool.query("INSERT INTO stage_delivery_rate_limits(rate_key,window_start_ms,request_count) VALUES($1,1000,1)",[key]);
  await client.query("BEGIN");
  await client.query("SELECT rate_key FROM stage_delivery_rate_limits WHERE rate_key=$1 FOR UPDATE",[key]);
  const deleted=await Promise.race([
   prunePgDeliveryRateLimits({pool,now:10000,windowMs:1000,batchSize:10}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error("cleanup blocked on locked row")),2000))
  ]);
  assert.equal(deleted,0);
  await client.query("UPDATE stage_delivery_rate_limits SET window_start_ms=9999 WHERE rate_key=$1",[key]);
  await client.query("COMMIT");
  const after=await prunePgDeliveryRateLimits({pool,now:10000,windowMs:1000,batchSize:10});
  assert.equal(after,0);
  const rows=await pool.query("SELECT window_start_ms FROM stage_delivery_rate_limits WHERE rate_key=$1",[key]);
  assert.equal(Number(rows.rows[0].window_start_ms),9999);
 }finally{
  try{await client.query("ROLLBACK");}catch{}
  client.release();
  await pool.query("DELETE FROM stage_delivery_rate_limits WHERE rate_key=$1",[key]);
  await pool.end();
 }
});
