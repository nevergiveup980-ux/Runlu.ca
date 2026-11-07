import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {prunePgDeliveryRateLimits} from "./pg-delivery-rate-limit-cleanup.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL cleanup removes only expired counters in bounded batches",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:2});
 const prefix="cleanup-"+randomUUID()+"-";
 try{
  await pool.query(await readFile(new URL("./005_delivery_rate_limits.sql",import.meta.url),"utf8"));
  for(let i=0;i<4;i++)await pool.query(
   "INSERT INTO stage_delivery_rate_limits(rate_key,window_start_ms,request_count) VALUES($1,$2,1)",
   [prefix+i,i<3?1000:9999]
  );
  const first=await prunePgDeliveryRateLimits({pool,now:10000,windowMs:1000,batchSize:2});
  assert.equal(first,2);
  const second=await prunePgDeliveryRateLimits({pool,now:10000,windowMs:1000,batchSize:2});
  assert.equal(second,1);
  const rows=(await pool.query("SELECT rate_key FROM stage_delivery_rate_limits WHERE rate_key LIKE $1",[prefix+"%"])).rows;
  assert.deepEqual(rows.map(r=>r.rate_key),[prefix+"3"]);
 }finally{
  await pool.query("DELETE FROM stage_delivery_rate_limits WHERE rate_key LIKE $1",[prefix+"%"]);
  await pool.end();
 }
});
