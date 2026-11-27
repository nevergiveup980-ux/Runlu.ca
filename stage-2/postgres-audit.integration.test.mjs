// Real PostgreSQL audit integration, executed only in disposable CI database.
import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFile} from "node:fs/promises";
import {PgDeliveryAudit} from "./pg-delivery-audit.mjs";
const url=process.env.STAGE_TEST_DATABASE_URL;
test("real PostgreSQL: delivery audit persists across adapter instances",{skip:!url?"Set STAGE_TEST_DATABASE_URL":false},async()=>{
 const {Pool}=createRequire(import.meta.url)("pg");
 const pool=new Pool({connectionString:url,max:2});
 try{
  await pool.query(await readFile(new URL("./004_delivery_audit.sql",import.meta.url),"utf8"));
  const audit=new PgDeliveryAudit(pool);
  const event={event:"STAGE_DELIVERY_AUTHORIZED",assetId:"asset_98765",ownerId:"audit-integration-owner",occurredAt:new Date().toISOString()};
  assert.equal(await audit.record(event),true);
  const result=await pool.query("SELECT event,asset_id,owner_id,occurred_at FROM stage_delivery_audit WHERE owner_id=$1 AND asset_id=$2 ORDER BY id DESC LIMIT 1",[event.ownerId,event.assetId]);
  assert.equal(result.rows.length,1);
  assert.equal(result.rows[0].event,event.event);
  assert.equal(result.rows[0].owner_id,event.ownerId);
  assert.equal(result.rows[0].asset_id,event.assetId);
 }finally{await pool.end();}
});
