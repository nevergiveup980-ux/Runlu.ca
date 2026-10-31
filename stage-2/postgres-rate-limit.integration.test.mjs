import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {createPgDeliveryRateLimiter} from "./pg-delivery-rate-limit.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL atomically limits simultaneous requests across instances",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:8});
 try{
  await pool.query(await readFile(new URL("./005_delivery_rate_limits.sql",import.meta.url),"utf8"));
  let now=100000;
  const config={pool,maxRequests:3,windowMs:1000,now:()=>now};
  const a=createPgDeliveryRateLimiter(config),b=createPgDeliveryRateLimiter(config);
  const key="integration-"+randomUUID();
  const results=await Promise.all(Array.from({length:12},(_,i)=>(i%2?a:b).allow(key)));
  assert.equal(results.filter(Boolean).length,3);
  assert.equal(results.filter(x=>!x).length,9);
  assert.equal(await a.allow(key),false);
  now=101000;
  assert.equal(await b.allow(key),true);
  assert.equal(await a.allow(key),true);
  assert.equal(await b.allow(key),true);
  assert.equal(await a.allow(key),false);
 }finally{await pool.end();}
});
